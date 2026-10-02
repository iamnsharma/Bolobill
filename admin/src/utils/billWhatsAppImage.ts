async function loadImageFromBlob(blob: Blob): Promise<HTMLImageElement> {
  const url = URL.createObjectURL(blob);
  try {
    const img = new Image();
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = () => reject(new Error("Could not load QR image"));
      img.src = url;
    });
    return img;
  } finally {
    URL.revokeObjectURL(url);
  }
}

/** Single PNG: bill lines + payment QR (for WhatsApp Web paste / attach). */
export async function renderBillWithQrPng(
  messageText: string,
  qrBlob: Blob,
): Promise<Blob> {
  const qrImg = await loadImageFromBlob(qrBlob);
  const padding = 28;
  const lineHeight = 22;
  const maxWidth = 520;
  const lines = messageText.split("\n");
  const textBlockHeight = lines.length * lineHeight;
  const qrSize = Math.min(220, maxWidth - padding * 2);
  const height = padding + textBlockHeight + padding + qrSize + 36;

  const canvas = document.createElement("canvas");
  canvas.width = maxWidth;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Could not create bill image");

  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, maxWidth, height);

  ctx.fillStyle = "#111827";
  ctx.font = "15px system-ui, -apple-system, Segoe UI, sans-serif";
  ctx.textAlign = "left";
  lines.forEach((line, i) => {
    ctx.fillText(line, padding, padding + (i + 1) * lineHeight - 4);
  });

  const qrX = (maxWidth - qrSize) / 2;
  const qrY = padding + textBlockHeight + padding;
  ctx.drawImage(qrImg, qrX, qrY, qrSize, qrSize);

  ctx.fillStyle = "#6b7280";
  ctx.font = "13px system-ui, -apple-system, Segoe UI, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("Scan to pay", maxWidth / 2, qrY + qrSize + 22);

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error("Could not export bill image"))),
      "image/png",
    );
  });
}

export async function copyImageBlobToClipboard(blob: Blob): Promise<boolean> {
  if (typeof ClipboardItem === "undefined" || !navigator.clipboard?.write) {
    return false;
  }
  try {
    const type = blob.type || "image/png";
    await navigator.clipboard.write([new ClipboardItem({ [type]: blob })]);
    return true;
  } catch {
    return false;
  }
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.rel = "noopener noreferrer";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export type WhatsAppWebShareResult = {
  /** Bill + QR PNG saved to Downloads */
  downloaded: boolean;
  /** Image on clipboard — paste in WhatsApp Web message box */
  copiedToClipboard: boolean;
};
