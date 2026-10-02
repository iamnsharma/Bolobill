import { adminApi } from "../api/admin";
import { api } from "../api/client";

function qrFilenameFromUrl(url: string): string | null {
  const match = url.match(/\/files\/qr\/([^/?#]+)/);
  return match ? decodeURIComponent(match[1]) : null;
}

/** Load merchant QR image bytes (uses admin API + auth, works with Vite proxy). */
export async function loadMerchantQrBlob(): Promise<Blob> {
  let url: string | null = null;
  try {
    ({ url } = await adminApi.getQrCode());
  } catch {
    throw new Error("Could not load QR settings. Check your connection.");
  }
  if (!url) {
    throw new Error(
      "No payment QR found for your account. Open QR Code in the menu and upload an image.",
    );
  }
  const filename = qrFilenameFromUrl(url);
  if (!filename) {
    throw new Error("Invalid QR URL from server. Try re-uploading on the QR code page.");
  }
  try {
    const res = await api.get(`/files/qr/${filename}`, { responseType: "blob" });
    const blob = res.data as Blob;
    if (!blob?.size) {
      throw new Error("Empty QR file");
    }
    return blob;
  } catch {
    throw new Error(
      "Your QR is saved but the image could not be loaded. Re-upload it on the QR code page.",
    );
  }
}

/** Data URL for PDF export and previews. */
export async function loadMerchantQrDataUrl(): Promise<string | undefined> {
  try {
    const blob = await loadMerchantQrBlob();
    return await new Promise<string>((resolve, reject) => {
      const r = new FileReader();
      r.onload = () => resolve(r.result as string);
      r.onerror = reject;
      r.readAsDataURL(blob);
    });
  } catch {
    return undefined;
  }
}
