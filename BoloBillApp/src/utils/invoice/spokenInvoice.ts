import {CreateInvoiceFromVoiceResponse, InvoiceItem} from '../../services/api/types/invoice.types';

const PRICE_AT_END_REGEX = /(\d+(?:\.\d+)?)\s*(?:rs|rupees|inr|₹)?\s*$/i;
const QUANTITY_NAME_REGEX =
  /^(\d+(?:\.\d+)?\s*(?:kg|kilo|killo|gram|g|ltr|liter|packet|packets|pc|pcs|bottle|bottles)?)\s+(.+)$/i;

const normalizeName = (rawName: string) =>
  rawName
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\b\w/g, char => char.toUpperCase());

const parseLineToItem = (line: string): InvoiceItem | null => {
  const cleaned = line.trim();
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

  const body = cleaned.slice(0, priceMatch.index).trim();
  if (!body) {
    return null;
  }

  const quantityAndName = body.match(QUANTITY_NAME_REGEX);
  if (!quantityAndName) {
    return {
      name: normalizeName(body),
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

export const parseSpokenInvoiceText = (
  spokenText: string,
): CreateInvoiceFromVoiceResponse | null => {
  const lines = spokenText
    .split(/\r?\n/)
    .map(line => line.trim())
    .filter(Boolean);

  const items = lines
    .map(parseLineToItem)
    .filter((item): item is InvoiceItem => item !== null);

  if (!items.length) {
    return null;
  }

  const total = items.reduce((sum, item) => sum + item.totalPrice, 0);

  return {
    invoiceId: `VOICE-${Date.now()}`,
    items,
    total,
    voiceTranscript: spokenText.trim(),
    pdfUrl: '',
    isVerified: false,
    createdAt: new Date().toISOString(),
  };
};
