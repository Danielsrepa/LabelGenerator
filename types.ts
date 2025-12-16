export interface LabelData {
  id: string;
  Title: string;
  ColorLine?: string;
  Model: string;
  SizeInch?: string;
  SizeMM?: string;
  BarcodeText: string;
}

export interface AppSettings {
  logoLeft: string | null; // Made in Europe
  logoRight: string | null; // Repa Icon
}

export interface LayoutConfig {
  pageWidth: number;
  pageHeight: number;
  
  // Header
  logoTopY: number;
  logoHeight: number;
  logoMargin: number; // Side margin for logos

  emailTopY: number;
  emailFontSize: number;

  // Content
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

  // Footer
  modelTopY: number;
  modelFontSize: number;
  modelLeftMargin: number;

  sizeInchTopY: number;
  sizeMmTopY: number;
  sizeFontSize: number;
  sizeRightMargin: number;
}

export const PAGE_WIDTH = 255;
export const PAGE_HEIGHT = 255;

export const DEFAULT_LAYOUT: LayoutConfig = {
  pageWidth: 255,
  pageHeight: 255,
  
  logoTopY: 15,
  logoHeight: 45,
  logoMargin: 15,

  emailTopY: 70, // 15 + 45 + 10
  emailFontSize: 10,

  titleTopY: 80, // Approx top based on previous baseline 95
  titleFontSize: 16,
  titleLeftMargin: 15,

  colorLineTopY: 105, // Approx top based on previous baseline 117
  colorLineFontSize: 12,
  colorLineLeftMargin: 15,

  barcodeTopY: 142,
  barcodeHeight: 55,
  barcodeWidth: 150,
  barcodeTextFontSize: 7,

  modelTopY: 215, // Approx top based on previous baseline 236
  modelFontSize: 24,
  modelLeftMargin: 15,

  sizeInchTopY: 210, // Approx top based on previous baseline 221
  sizeMmTopY: 225,   // Approx top based on previous baseline 235
  sizeFontSize: 12,
  sizeRightMargin: 15
};
