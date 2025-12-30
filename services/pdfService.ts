import { jsPDF } from "jspdf";
import JsBarcode from "jsbarcode";
import JSZip from "jszip";
import { LabelData, AppSettings, LayoutConfig } from "../types";

// Helper to load image for PDF
const loadImage = (url: string): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = url;
    img.crossOrigin = "Anonymous";
    img.onload = () => resolve(img);
    img.onerror = (err) => reject(err);
  });
};

const generateBarcodeBase64 = (text: string): string => {
  const canvas = document.createElement("canvas");
  JsBarcode(canvas, text, {
    format: "CODE128",
    displayValue: false, // We draw text manually
    margin: 0,
    width: 2,
    height: 100,
  });
  return canvas.toDataURL("image/png");
};

// Helper to render a single label to a doc
const renderLabelToDoc = (
  doc: jsPDF,
  label: LabelData,
  layout: LayoutConfig,
  leftLogoImg: HTMLImageElement | null,
  rightLogoImg: HTMLImageElement | null,
  globalEmail: string
) => {
  // Left Logo
  if (leftLogoImg) {
    const ratio = layout.logoHeight / leftLogoImg.height;
    const newW = leftLogoImg.width * ratio;
    doc.addImage(
      leftLogoImg,
      "PNG",
      layout.logoMargin,
      layout.logoTopY,
      newW,
      layout.logoHeight
    );
  } else {
    doc.setFillColor(200, 200, 200);
    doc.rect(layout.logoMargin, layout.logoTopY, 45, layout.logoHeight, "F");
    doc.setFontSize(8);
    doc.setTextColor(100);
    doc.text("Logo L", layout.logoMargin + 5, layout.logoTopY + 25);
  }

  // Right Logo
  let rightLogoW = 45;
  if (rightLogoImg) {
    const ratio2 = layout.logoHeight / rightLogoImg.height;
    rightLogoW = rightLogoImg.width * ratio2;
    doc.addImage(
      rightLogoImg,
      "PNG",
      layout.pageWidth - rightLogoW - layout.logoMargin,
      layout.logoTopY,
      rightLogoW,
      layout.logoHeight
    );
  } else {
    doc.setFillColor(200, 200, 200);
    doc.rect(
      layout.pageWidth - 45 - layout.logoMargin,
      layout.logoTopY,
      45,
      layout.logoHeight,
      "F"
    );
    doc.setFontSize(8);
    doc.setTextColor(100);
    doc.text("Logo R", layout.pageWidth - 40, layout.logoTopY + 25);
  }

  // Email (Label-specific or Global)
  const emailToUse = label.Email || globalEmail;
  doc.setFont("Helvetica", "normal");
  doc.setFontSize(layout.emailFontSize);
  doc.setTextColor(0, 0, 0);
  doc.text(emailToUse, layout.pageWidth - layout.logoMargin, layout.emailTopY, {
    align: "right",
    baseline: "top",
  });

  // Title
  doc.setFont("Helvetica", "bold");
  doc.setFontSize(layout.titleFontSize);
  doc.text(label.Title, layout.titleLeftMargin, layout.titleTopY, {
    baseline: "top",
  });

  // Color Line
  if (label.ColorLine) {
    doc.setFont("Helvetica", "normal");
    doc.setFontSize(layout.colorLineFontSize);
    doc.text(label.ColorLine, layout.colorLineLeftMargin, layout.colorLineTopY, {
      baseline: "top",
    });
  }

  // Barcode
  if (label.BarcodeText) {
    const barcodeBase64 = generateBarcodeBase64(label.BarcodeText);
    const bx = (layout.pageWidth - layout.barcodeWidth) / 2;
    doc.addImage(
      barcodeBase64,
      "PNG",
      bx,
      layout.barcodeTopY,
      layout.barcodeWidth,
      layout.barcodeHeight
    );

    doc.setFont("Helvetica", "normal");
    doc.setFontSize(layout.barcodeTextFontSize);
    doc.text(
      label.BarcodeText,
      layout.pageWidth / 2,
      layout.barcodeTopY + layout.barcodeHeight + 2,
      { align: "center", baseline: "top" }
    );
  }

  // Model
  if (label.Model) {
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(layout.modelFontSize);
    doc.text(label.Model, layout.modelLeftMargin, layout.modelTopY, {
      baseline: "top",
    });
  }

  // Sizes
  doc.setFont("Helvetica", "bold");
  doc.setFontSize(layout.sizeFontSize);

  if (label.SizeInch) {
    doc.text(
      label.SizeInch,
      layout.pageWidth - layout.sizeRightMargin,
      layout.sizeInchTopY,
      { align: "right", baseline: "top" }
    );
  }
  if (label.SizeMM) {
    doc.text(
      label.SizeMM,
      layout.pageWidth - layout.sizeRightMargin,
      layout.sizeMmTopY,
      { align: "right", baseline: "top" }
    );
  }
};

export const generatePDF = async (
  labels: LabelData[],
  settings: AppSettings,
  layout: LayoutConfig
) => {
  // Load Logos if available
  let leftLogoImg: HTMLImageElement | null = null;
  let rightLogoImg: HTMLImageElement | null = null;

  try {
    if (settings.logoLeft) leftLogoImg = await loadImage(settings.logoLeft);
    if (settings.logoRight) rightLogoImg = await loadImage(settings.logoRight);
  } catch (e) {
    console.warn("Could not load logo images", e);
  }

  // ✅ IMPORTANT: choose orientation based on label dimensions
  const orientation =
    layout.pageWidth > layout.pageHeight ? "landscape" : "portrait";

  const filenameMap = new Map<string, number>();
  const getFilename = (model: string) => {
    const base = (model || "Label").trim().replace(/[^a-z0-9\-_]/gi, "_");
    const count = filenameMap.get(base) || 0;
    filenameMap.set(base, count + 1);
    return count === 0 ? `${base}.pdf` : `${base}_${count}.pdf`;
  };

  if (labels.length === 1) {
    const doc = new jsPDF({
      orientation,
      unit: "pt",
      format: [layout.pageWidth, layout.pageHeight],
    });

    const label = labels[0];
    renderLabelToDoc(doc, label, layout, leftLogoImg, rightLogoImg, settings.email);
    doc.save(getFilename(label.Model));
  } else {
    const zip = new JSZip();

    for (const label of labels) {
      const doc = new jsPDF({
        orientation,
        unit: "pt",
        format: [layout.pageWidth, layout.pageHeight],
      });

      renderLabelToDoc(doc, label, layout, leftLogoImg, rightLogoImg, settings.email);

      const blob = doc.output("blob");
      zip.file(getFilename(label.Model), blob);
    }

    const content = await zip.generateAsync({ type: "blob" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(content);
    link.download = `labels_${Date.now()}.zip`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};
