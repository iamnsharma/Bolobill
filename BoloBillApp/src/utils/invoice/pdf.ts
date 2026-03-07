import {generatePDF} from 'react-native-html-to-pdf';
import {Platform} from 'react-native';
import ReactNativeBlobUtil from 'react-native-blob-util';
import {AuthUser} from '../../services/api/types/auth.types';
import {CreateInvoiceFromVoiceResponse} from '../../services/api/types/invoice.types';

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');

export const generateInvoicePdf = async (
  invoice: CreateInvoiceFromVoiceResponse,
  user?: AuthUser,
) => {
  const createdDate = new Date(invoice.createdAt).toLocaleString('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
  const accountName = user?.name?.trim() || 'BoloBill User';
  const accountPhone = user?.phone?.trim() || 'Not available';

  const itemRows = invoice.items
    .map(
      (item, index) => `
        <tr>
          <td>${index + 1}</td>
          <td>${escapeHtml(item.name)}</td>
          <td>${escapeHtml(item.quantity)}</td>
          <td class="right">Rs ${item.totalPrice}</td>
        </tr>
      `,
    )
    .join('');

  const transcript = invoice.voiceTranscript?.trim()
    ? escapeHtml(invoice.voiceTranscript).replace(/\n/g, '<br />')
    : 'No transcript available';

  const html = `
    <html>
      <head>
        <meta charset="utf-8" />
        <style>
          body { font-family: Arial, sans-serif; color: #111827; padding: 22px; }
          .header { margin-bottom: 14px; }
          .title { font-size: 26px; font-weight: 700; margin-bottom: 4px; }
          .subtitle { color: #374151; margin: 2px 0; font-size: 12px; }
          table { width: 100%; border-collapse: collapse; margin-top: 14px; }
          th, td { border: 1px solid #d1d5db; padding: 8px; font-size: 12px; }
          th { background: #f3f4f6; text-align: left; }
          .right { text-align: right; }
          .total { margin-top: 12px; text-align: right; font-size: 16px; font-weight: 700; }
          .transcript-title { margin-top: 18px; font-size: 13px; font-weight: 700; }
          .transcript { margin-top: 6px; border: 1px solid #d1d5db; padding: 10px; border-radius: 6px; font-size: 12px; line-height: 1.5; }
          .footer { margin-top: 26px; border-top: 1px solid #e5e7eb; padding-top: 12px; display: flex; justify-content: space-between; align-items: flex-end; }
          .account { font-size: 12px; color: #1f2937; line-height: 1.5; }
          .stamp-wrap { text-align: center; }
          .stamp {
            width: 110px; height: 110px; border-radius: 55px;
            border: 4px solid #1d4ed8; color: #1d4ed8;
            display: flex; align-items: center; justify-content: center;
            font-size: 15px; font-weight: 700; transform: rotate(-14deg);
            letter-spacing: 1px;
          }
          .stamp-meta { margin-top: 6px; font-size: 10px; color: #1d4ed8; }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="title">BoloBill Invoice</div>
          <div class="subtitle">Invoice ID: ${escapeHtml(invoice.invoiceId)}</div>
          <div class="subtitle">Created: ${escapeHtml(createdDate)}</div>
        </div>

        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Item</th>
              <th>Quantity</th>
              <th class="right">Price</th>
            </tr>
          </thead>
          <tbody>
            ${itemRows}
          </tbody>
        </table>

        <div class="total">Total: Rs ${invoice.total}</div>

        <div class="transcript-title">Spoken Text</div>
        <div class="transcript">${transcript}</div>

        <div class="footer">
          <div class="account">
            <div><b>Account:</b> ${escapeHtml(accountName)}</div>
            <div><b>Phone:</b> ${escapeHtml(accountPhone)}</div>
          </div>
          <div class="stamp-wrap">
            <div class="stamp">CREATED</div>
            <div class="stamp-meta">BoloBill</div>
          </div>
        </div>
      </body>
    </html>
  `;

  const fileName = `bolobill-${invoice.invoiceId}`;
  const result = await generatePDF({
    html,
    fileName,
    directory: 'Documents',
  });

  if (Platform.OS !== 'android' || !result.filePath) {
    return result.filePath;
  }

  try {
    const mediaUri = await ReactNativeBlobUtil.MediaCollection.copyToMediaStore(
      {
        name: `${fileName}.pdf`,
        mimeType: 'application/pdf',
      } as never,
      'Download',
      result.filePath,
    );
    return mediaUri;
  } catch (_error) {
    return result.filePath;
  }
};
