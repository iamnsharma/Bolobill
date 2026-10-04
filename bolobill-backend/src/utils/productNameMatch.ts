const normalizeProductName = (name: string) => name.trim().toLowerCase();

export type ExistingProductRef = {
  _id: string;
  name: string;
  nameNormalized?: string;
};

/** Strip punctuation and collapse whitespace for loose comparison. */
export const looseNormalizeProductName = (name: string): string => {
  return name
    .trim()
    .toLowerCase()
    .replace(/[-_/\\.,]+/g, ' ')
    .replace(/\s+/g, ' ')
    .replace(/[^\p{L}\p{N}\s]/gu, '')
    .trim();
};

const levenshteinDistance = (a: string, b: string): number => {
  if (a === b) return 0;
  if (!a.length) return b.length;
  if (!b.length) return a.length;
  const row = new Array<number>(b.length + 1);
  for (let j = 0; j <= b.length; j++) row[j] = j;
  for (let i = 1; i <= a.length; i++) {
    let prev = i - 1;
    row[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const temp = row[j];
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      row[j] = Math.min(row[j] + 1, row[j - 1] + 1, prev + cost);
      prev = temp;
    }
  }
  return row[b.length];
};

export const similarityRatio = (a: string, b: string): number => {
  const maxLen = Math.max(a.length, b.length);
  if (maxLen === 0) return 1;
  return 1 - levenshteinDistance(a, b) / maxLen;
};

const tokenSetKey = (s: string): string => {
  const tokens = looseNormalizeProductName(s).split(' ').filter(Boolean).sort();
  return tokens.join(' ');
};

const FUZZY_THRESHOLD = 0.88;

export type ProductMatchResult = {
  matched: boolean;
  productId?: string;
  productName?: string;
  matchKind?: 'exact' | 'loose' | 'fuzzy' | 'tokens';
};

export const findBestExistingProductMatch = (
  candidateName: string,
  existing: ExistingProductRef[],
): ProductMatchResult => {
  const trimmed = candidateName.trim();
  if (!trimmed || !existing.length) {
    return {matched: false};
  }

  const exactNorm = normalizeProductName(trimmed);
  const looseCand = looseNormalizeProductName(trimmed);
  const tokenCand = tokenSetKey(trimmed);

  let bestFuzzy: {id: string; name: string; ratio: number} | null = null;

  for (const p of existing) {
    const pNorm = p.nameNormalized ?? normalizeProductName(p.name);
    if (pNorm === exactNorm) {
      return {matched: true, productId: p._id, productName: p.name, matchKind: 'exact'};
    }

    const looseExisting = looseNormalizeProductName(p.name);
    if (looseCand && looseCand === looseExisting) {
      return {matched: true, productId: p._id, productName: p.name, matchKind: 'loose'};
    }

    if (tokenCand.length > 0 && tokenCand === tokenSetKey(p.name)) {
      return {matched: true, productId: p._id, productName: p.name, matchKind: 'tokens'};
    }

    if (looseCand.length >= 4 && looseExisting.length >= 4) {
      const ratio = similarityRatio(looseCand, looseExisting);
      if (ratio >= FUZZY_THRESHOLD && (!bestFuzzy || ratio > bestFuzzy.ratio)) {
        bestFuzzy = {id: p._id, name: p.name, ratio};
      }
    }
  }

  if (bestFuzzy) {
    return {
      matched: true,
      productId: bestFuzzy.id,
      productName: bestFuzzy.name,
      matchKind: 'fuzzy',
    };
  }

  return {matched: false};
};
