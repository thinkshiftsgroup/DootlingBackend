import bwipjs from "bwip-js";

export interface BarcodeOptions {
  text: string;
  type?: string;
  width?: number;
  height?: number;
  includetext?: boolean;
}

export async function generateBarcode(options: BarcodeOptions): Promise<Buffer> {
  const {
    text,
    type = "code128",
    width = 2,
    height = 50,
    includetext = true,
  } = options;

  try {
    const png = await bwipjs.toBuffer({
      bcid: type,
      text: text,
      scale: width,
      height: height,
      includetext: includetext,
      textxalign: "center",
    });

    return png;
  } catch (error) {
    throw new Error(`Failed to generate barcode: ${error}`);
  }
}

export async function generateBarcodeDataURL(options: BarcodeOptions): Promise<string> {
  const buffer = await generateBarcode(options);
  return `data:image/png;base64,${buffer.toString("base64")}`;
}
