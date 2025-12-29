
export interface LabelData {
  id: string;
  Title: string;
  ColorLine?: string;
  Model: string;
  SizeInch?: string;
  SizeMM?: string;
  BarcodeText: string;
  Email?: string;
}

export interface AppSettings {
  logoLeft: string | null;
  logoRight: string | null;
  email: string;
}

export interface LayoutConfig {
  pageWidth: number;
  pageHeight: number;
  logoTopY: number;
  logoHeight: number;
  logoMargin: number;
  emailTopY: number;
  emailFontSize: number;
  titleTopY: number;
  titleFontSize: number;
  titleLeftMargin: number;
  colorLineTopY: number;
  colorLineFontSize: number;
  colorLineLeftMargin: number;
  barcodeTopY: number;
  barcodeHeight: number;
  barcodeWidth: number;
  barcodeTextFontSize: number;
  modelTopY: number;
  modelFontSize: number;
  modelLeftMargin: number;
  sizeInchTopY: number;
  sizeMmTopY: number;
  sizeFontSize: number;
  sizeRightMargin: number;
}

export const MM = 2.83465;

export const DEFAULT_LAYOUT: LayoutConfig = {
  pageWidth: 255,
  pageHeight: 255,
  logoTopY: 15,
  logoHeight: 45,
  logoMargin: 15,
  emailTopY: 70,
  emailFontSize: 10,
  titleTopY: 85,
  titleFontSize: 16,
  titleLeftMargin: 15,
  colorLineTopY: 105,
  colorLineFontSize: 12,
  colorLineLeftMargin: 15,
  barcodeTopY: 142,
  barcodeHeight: 55,
  barcodeWidth: 150,
  barcodeTextFontSize: 7,
  modelTopY: 215,
  modelFontSize: 24,
  modelLeftMargin: 15,
  sizeInchTopY: 210,
  sizeMmTopY: 225,
  sizeFontSize: 12,
  sizeRightMargin: 15
};

export const PRESET_58X40: LayoutConfig = {
  pageWidth: 58 * MM,  // 164.4
  pageHeight: 40 * MM, // 113.4
  logoTopY: 3,
  logoHeight: 20,
  logoMargin: 3,
  emailTopY: 26, 
  emailFontSize: 4.8,
  titleTopY: 32,
  titleFontSize: 14,
  titleLeftMargin: 3,
  colorLineTopY: 46, 
  colorLineFontSize: 6,
  colorLineLeftMargin: 3,
  barcodeTopY: 65,
  barcodeHeight: 25,
  barcodeWidth: 100,
  barcodeTextFontSize: 4.3,
  modelTopY: 96,
  modelFontSize: 14,
  modelLeftMargin: 3,
  sizeInchTopY: 88,
  sizeMmTopY: 98,
  sizeFontSize: 7,
  sizeRightMargin: 3
};
