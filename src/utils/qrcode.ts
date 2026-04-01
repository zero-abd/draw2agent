/**
 * draw2agent — QR code generator utility
 * Generates QR codes as base64 PNG and terminal-printable ASCII.
 */
import QRCode from 'qrcode';

export interface QRResult {
  /** Base64-encoded PNG data URL */
  dataUrl: string;
  /** Terminal-printable ASCII representation */
  ascii: string;
}

export async function generateQR(url: string): Promise<QRResult> {
  const [dataUrl, ascii] = await Promise.all([
    QRCode.toDataURL(url, {
      type: 'image/png',
      width: 400,
      margin: 2,
      color: { dark: '#000000', light: '#ffffff' },
    }),
    QRCode.toString(url, { type: 'terminal', small: true }),
  ]);

  return { dataUrl, ascii };
}
