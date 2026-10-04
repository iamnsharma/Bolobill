import {
  findBestExistingProductMatch,
  looseNormalizeProductName,
} from '../src/utils/productNameMatch';

const existing = [{ _id: '1', name: 'Coca Cola 500ml', nameNormalized: 'coca cola 500ml' }];

const cases = [
  { candidate: 'Coca-Cola 500 ML', expectMatch: true },
  { candidate: 'Pepsi 500ml', expectMatch: false },
  { candidate: 'coca cola 500ml', expectMatch: true },
];

let failed = 0;
for (const { candidate, expectMatch } of cases) {
  const result = findBestExistingProductMatch(candidate, existing);
  const ok = result.matched === expectMatch;
  if (!ok) {
    console.error('FAIL', candidate, result);
    failed += 1;
  } else {
    console.log('OK', candidate, result.matchKind ?? 'no match');
  }
}

console.log('loose normalize:', looseNormalizeProductName('Coca-Cola 500 ML'));
process.exit(failed > 0 ? 1 : 0);
