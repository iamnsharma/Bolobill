import fs from 'fs';
import path from 'path';
import PDFDocument from 'pdfkit';
import {InvoiceItemInput} from './transcriptParser.service';
import {env} from '../config/env';

type GeneratePdfInput = {
  invoiceId: string;
  customerName: string;
  customerPhone: string;
  items: InvoiceItemInput[];
  total: number;
  transcript?: string;
};

const pdfDir = path.join(process.cwd(), 'storage/pdfs');
if (!fs.existsSync(pdfDir)) {
  fs.mkdirSync(pdfDir, {recursive: true});
}

export const generateInvoicePdf = async (
  input: GeneratePdfInput,
): Promise<{pdfPath: string; pdfUrl: string}> => {
  const fileName = `invoice-${input.invoiceId}.pdf`;
  const absPath = path.join(pdfDir, fileName);

  await new Promise<void>((resolve, reject) => {
    const doc = new PDFDocument({size: 'A4', margin: 40});
    const stream = fs.createWriteStream(absPath);
    doc.pipe(stream);

    doc.fontSize(24).text('BoloBill Invoice', {align: 'left'});
    doc.moveDown(0.3);
    doc.fontSize(11).text(`Invoice ID: ${input.invoiceId}`);
    doc.text(`Created: ${new Date().toLocaleString('en-IN')}`);
    doc.moveDown(0.8);

    doc.fontSize(11).text(`Account: ${input.customerName}`);
    doc.text(`Phone: ${input.customerPhone}`);
    doc.moveDown(0.8);

    doc.fontSize(12).text('Items', {underline: true});
    doc.moveDown(0.4);

    input.items.forEach((item, index) => {
      doc
        .fontSize(11)
        .text(
          `${index + 1}. ${item.name} | ${item.quantity} | Rs ${item.totalPrice}`,
        );
    });

    doc.moveDown(0.8);
    doc.fontSize(14).text(`Total: Rs ${input.total}`, {align: 'right'});
    doc.moveDown(1.2);

    if (input.transcript?.trim()) {
      doc.fontSize(11).text('Voice Transcript', {underline: true});
      doc.moveDown(0.3);
      doc.fontSize(10).text(input.transcript.trim());
      doc.moveDown(1);
    }

    doc
      .lineWidth(2)
      .circle(500, 700, 45)
      .strokeColor('#1d4ed8')
      .stroke();
    doc
      .fillColor('#1d4ed8')
      .fontSize(12)
      .text('CREATED', 467, 695, {width: 65, align: 'center'});
    doc.fillColor('#000000');

    doc.end();

    stream.on('finish', () => resolve());
    stream.on('error', reject);
  });

  return {
    pdfPath: absPath,
    pdfUrl: `${env.BASE_URL}/api/files/pdfs/${fileName}`,
  };
};
