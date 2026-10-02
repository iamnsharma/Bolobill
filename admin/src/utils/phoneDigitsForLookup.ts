/** Last 10 digits for address-book lookup (India). */
export function phoneDigitsForLookup(value: string): string | null {
  const digits = value.replace(/\D/g, "");
  if (digits.length < 10) return null;
  return digits.slice(-10);
}
