import { jsPDF } from 'jspdf';

type InvoiceItem = { name: string; quantity: string; totalPrice: number };

export function exportInvoiceAsPdf(params: {
  invoiceId: string;
  customerName: string;
  items: InvoiceItem[];
  total: number;
  createdAt: string;
  source?: string;
}) {
  const doc = new jsPDF();
  const margin = 14;
  let y = margin;

  doc.setFontSize(16);
  doc.text('Invoice', margin, y);
  y += 10;

  doc.setFontSize(10);
  doc.text(`ID: ${params.invoiceId}`, margin, y);
  y += 6;
  doc.text(`Customer: ${params.customerName}`, margin, y);
  y += 6;
  doc.text(`Date: ${params.createdAt ? new Date(params.createdAt).toLocaleString() : '—'}`, margin, y);
  y += 6;
  if (params.source) {
    doc.text(`Source: ${params.source}`, margin, y);
    y += 8;
  } else {
    y += 4;
  }

  doc.setFontSize(11);
  doc.text('Items', margin, y);
  y += 8;

  doc.setFontSize(9);
  doc.setDrawColor(200, 200, 200);
  doc.line(margin, y, 200 - margin, y);
  y += 6;
  doc.text('Item', margin, y);
  doc.text('Qty', 90, y);
  doc.text('Price', 130, y);
  doc.text('Total', 170, y);
  y += 6;
  doc.line(margin, y, 200 - margin, y);
  y += 4;

  for (const item of params.items) {
    if (y > 270) {
      doc.addPage();
      y = margin;
    }
    doc.text(item.name.substring(0, 35), margin, y);
    doc.text(String(item.quantity), 90, y);
    doc.text(`₹${item.totalPrice}`, 130, y);
    doc.text(`₹${item.totalPrice}`, 170, y);
    y += 6;
  }

  y += 4;
  doc.line(margin, y, 200 - margin, y);
  y += 8;
  doc.setFontSize(11);
  doc.text('Total', margin, y);
  doc.text(`₹${params.total}`, 170, y);

  doc.save(`invoice-${params.invoiceId}.pdf`);
}
