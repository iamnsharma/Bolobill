import { pdf } from "@react-pdf/renderer";
import { InvoicePdfDocument, type InvoicePdfDocumentProps } from "../components/InvoicePdfDocument";

/**
 * Generate invoice PDF using @react-pdf/renderer and trigger download.
 * Uses the same Image component for QR so the uploaded image renders correctly.
 */
export async function exportInvoiceWithReactPdf(
  params: InvoicePdfDocumentProps
): Promise<void> {
  const blob = await pdf(
    <InvoicePdfDocument
      invoiceId={params.invoiceId}
      customerName={params.customerName}
      createdBy={params.createdBy}
      items={params.items}
      total={params.total}
      createdAt={params.createdAt}
      source={params.source}
      qrImageSrc={params.qrImageSrc}
    />
  ).toBlob();

  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `invoice-${params.invoiceId}.pdf`;
  a.rel = "noopener noreferrer";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
