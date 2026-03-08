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
  billToName?: string;
  billToPhone?: string;
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
  const createdAt = new Date().toLocaleString('en-IN');
  const businessName = input.customerName || 'Business Account';
  const businessPhone = input.customerPhone || '-';
  const billToName = input.billToName || 'Walk-in Customer';
  const billToPhone = input.billToPhone || '-';

  await new Promise<void>((resolve, reject) => {
    const doc = new PDFDocument({size: 'A4', margin: 40});
    const stream = fs.createWriteStream(absPath);
    doc.pipe(stream);

    const pageWidth = doc.page.width;
    const contentLeft = 40;
    const contentWidth = pageWidth - contentLeft * 2;

    doc.fontSize(24).fillColor('#0f172a').text('TAX INVOICE', contentLeft, 42, {align: 'left'});
    doc
      .fontSize(11)
      .fillColor('#334155')
      .text(`Invoice ID: ${input.invoiceId}`, contentLeft, 76)
      .text(`Date: ${createdAt}`, contentLeft, 92);

    const fromToTop = 126;
    const boxGap = 12;
    const boxWidth = (contentWidth - boxGap) / 2;
    const boxHeight = 82;
    const toLeft = contentLeft + boxWidth + boxGap;

    doc
      .lineWidth(1)
      .strokeColor('#cbd5e1')
      .rect(contentLeft, fromToTop, boxWidth, boxHeight)
      .stroke();
    doc
      .rect(toLeft, fromToTop, boxWidth, boxHeight)
      .stroke();

    doc
      .fontSize(11)
      .fillColor('#1e3a8a')
      .text('FROM', contentLeft + 10, fromToTop + 10)
      .fillColor('#0f172a')
      .fontSize(12)
      .text(businessName, contentLeft + 10, fromToTop + 28)
      .fontSize(10)
      .fillColor('#475569')
      .text(`Phone: ${businessPhone}`, contentLeft + 10, fromToTop + 48, {
        width: boxWidth - 20,
      });

    doc
      .fontSize(11)
      .fillColor('#1e3a8a')
      .text('TO', toLeft + 10, fromToTop + 10)
      .fillColor('#0f172a')
      .fontSize(12)
      .text(billToName, toLeft + 10, fromToTop + 28)
      .fontSize(10)
      .fillColor('#475569')
      .text(`Phone: ${billToPhone}`, toLeft + 10, fromToTop + 48, {
        width: boxWidth - 20,
      });

    const tableTop = fromToTop + boxHeight + 22;
    const rowHeight = 28;
    const colSno = 40;
    const colItem = 250;
    const colQty = 120;
    const colAmt = contentWidth - (colSno + colItem + colQty);
    const tableX = contentLeft;

    doc.rect(tableX, tableTop, contentWidth, rowHeight).fill('#eff6ff');
    doc
      .fillColor('#1e293b')
      .fontSize(10)
      .text('S.No', tableX + 8, tableTop + 9, {width: colSno - 16, align: 'left'})
      .text('Item Name', tableX + colSno + 8, tableTop + 9, {width: colItem - 16, align: 'left'})
      .text('Quantity', tableX + colSno + colItem + 8, tableTop + 9, {
        width: colQty - 16,
        align: 'left',
      })
      .text('Amount', tableX + colSno + colItem + colQty + 8, tableTop + 9, {
        width: colAmt - 16,
        align: 'right',
      });

    let y = tableTop + rowHeight;
    doc.fontSize(10).fillColor('#0f172a');

    input.items.forEach((item, index) => {
      doc
        .strokeColor('#e2e8f0')
        .lineWidth(1)
        .moveTo(tableX, y)
        .lineTo(tableX + contentWidth, y)
        .stroke();

      doc
        .text(String(index + 1), tableX + 8, y + 8, {width: colSno - 16, align: 'left'})
        .text(item.name, tableX + colSno + 8, y + 8, {width: colItem - 16, align: 'left'})
        .text(item.quantity, tableX + colSno + colItem + 8, y + 8, {
          width: colQty - 16,
          align: 'left',
        })
        .text(`Rs ${item.totalPrice.toFixed(2)}`, tableX + colSno + colItem + colQty + 8, y + 8, {
          width: colAmt - 16,
          align: 'right',
        });

      y += rowHeight;
    });

    doc
      .strokeColor('#94a3b8')
      .lineWidth(1)
      .moveTo(tableX, y)
      .lineTo(tableX + contentWidth, y)
      .stroke();

    const totalBoxTop = y + 12;
    const totalBoxWidth = 190;
    const totalBoxLeft = tableX + contentWidth - totalBoxWidth;
    doc.rect(totalBoxLeft, totalBoxTop, totalBoxWidth, 34).strokeColor('#cbd5e1').stroke();
    doc
      .fontSize(11)
      .fillColor('#0f172a')
      .text('Grand Total', totalBoxLeft + 10, totalBoxTop + 10, {width: 90})
      .fontSize(12)
      .fillColor('#1e3a8a')
      .text(`Rs ${input.total.toFixed(2)}`, totalBoxLeft + 98, totalBoxTop + 10, {
        width: 80,
        align: 'right',
      });

    if (input.transcript?.trim()) {
      const transcriptTop = totalBoxTop + 54;
      doc
        .fontSize(10)
        .fillColor('#334155')
        .text('Voice Notes:', tableX, transcriptTop)
        .fontSize(9)
        .fillColor('#475569')
        .text(input.transcript.trim(), tableX, transcriptTop + 14, {
          width: contentWidth - 140,
          height: 52,
        });
    }

    const stampCenterX = pageWidth - 95;
    const stampCenterY = doc.page.height - 92;
    const stampRadius = 56;

    doc
      .lineWidth(2.5)
      .strokeColor('#1d4ed8')
      .circle(stampCenterX, stampCenterY, stampRadius)
      .stroke()
      .lineWidth(1.5)
      .circle(stampCenterX, stampCenterY, stampRadius - 8)
      .stroke();

    doc
      .fillColor('#1d4ed8')
      .fontSize(9)
      .text('VERIFIED BUSINESS STAMP', stampCenterX - 44, stampCenterY - 24, {
        width: 88,
        align: 'center',
      })
      .fontSize(8)
      .text(businessName, stampCenterX - 44, stampCenterY - 2, {
        width: 88,
        align: 'center',
      })
      .text(businessPhone, stampCenterX - 44, stampCenterY + 13, {
        width: 88,
        align: 'center',
      });

    doc
      .fontSize(9)
      .fillColor('#64748b')
      .text('This is a computer-generated invoice.', contentLeft, doc.page.height - 44);

    doc.end();

    stream.on('finish', () => resolve());
    stream.on('error', reject);
  });

  return {
    pdfPath: absPath,
    pdfUrl: `${env.BASE_URL}/api/files/pdfs/${fileName}`,
  };
};
