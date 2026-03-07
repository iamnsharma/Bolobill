export type InvoiceItemInput = {
  name: string;
  quantity: string;
  totalPrice: number;
};

const PRICE_AT_END_REGEX = /(\d+(?:\.\d+)?)\s*(?:rs|rupees|inr|₹)?\s*$/i;
const QUANTITY_NAME_REGEX =
  /^(\d+(?:\.\d+)?\s*(?:kg|kilo|killo|gram|g|ltr|liter|packet|packets|pc|pcs|bottle|bottles)?)\s+(.+)$/i;

const normalizeName = (rawName: string) =>
  rawName
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\b\w/g, char => char.toUpperCase());

const parseChunkToItem = (chunk: string): InvoiceItemInput | null => {
  const cleaned = chunk.trim();
  if (!cleaned) {
    return null;
  }

  const priceMatch = cleaned.match(PRICE_AT_END_REGEX);
  if (!priceMatch) {
    return null;
  }

  const totalPrice = Number(priceMatch[1]);
  if (Number.isNaN(totalPrice)) {
    return null;
  }

  const withoutPrice = cleaned.slice(0, priceMatch.index).trim();
  if (!withoutPrice) {
    return null;
  }

  const quantityAndName = withoutPrice.match(QUANTITY_NAME_REGEX);
  if (!quantityAndName) {
    return {
      name: normalizeName(withoutPrice),
      quantity: '1',
      totalPrice,
    };
  }

  return {
    quantity: quantityAndName[1].trim(),
    name: normalizeName(quantityAndName[2]),
    totalPrice,
  };
};

const splitTranscript = (transcript: string) => {
  const rows = transcript
    .split(/\r?\n|,/)
    .map(part => part.trim())
    .filter(Boolean);

  if (rows.length > 1) {
    return rows;
  }

  return transcript
    .replace(/\s+/g, ' ')
    .trim()
    .split(
      /(?=\b\d+(?:\.\d+)?\s*(?:kg|kilo|killo|gram|g|ltr|liter|packet|packets|pc|pcs|bottle|bottles)\b)/i,
    )
    .map(part => part.trim())
    .filter(Boolean);
};

export const parseTranscriptToItems = (transcript: string) => {
  const chunks = splitTranscript(transcript);
  const items = chunks
    .map(parseChunkToItem)
    .filter((item): item is InvoiceItemInput => Boolean(item));
  const total = items.reduce((sum, item) => sum + item.totalPrice, 0);
  return {items, total};
};
