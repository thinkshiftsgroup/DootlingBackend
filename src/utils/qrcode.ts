import QRCode from "qrcode";

export interface QRCodeOptions {
  data: string;
  width?: number;
  errorCorrectionLevel?: "L" | "M" | "Q" | "H";
}

export async function generateQRCode(options: QRCodeOptions): Promise<Buffer> {
  const { data, width = 300, errorCorrectionLevel = "M" } = options;

  try {
    const buffer = await QRCode.toBuffer(data, {
      width,
      errorCorrectionLevel,
      type: "png",
      margin: 1,
    });

    return buffer;
  } catch (error) {
    throw new Error(`Failed to generate QR code: ${error}`);
  }
}

export async function generateQRCodeDataURL(
  options: QRCodeOptions
): Promise<string> {
  const { data, width = 300, errorCorrectionLevel = "M" } = options;

  try {
    const dataURL = await QRCode.toDataURL(data, {
      width,
      errorCorrectionLevel,
      margin: 1,
    });

    return dataURL;
  } catch (error) {
    throw new Error(`Failed to generate QR code: ${error}`);
  }
}
