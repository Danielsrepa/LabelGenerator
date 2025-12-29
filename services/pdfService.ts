import { jsPDF } from 'jspdf';
import JsBarcode from 'jsbarcode';
import JSZip from 'jszip';
import { LabelData, AppSettings, LayoutConfig } from '../types';

// Helper to load image for PDF with robust path resolution
const loadImage = (url: string): Promise<HTMLImageElement | null> => {
  return new Promise((resolve) => {
    const img = new Image();
    
    // Resolve relative paths to absolute URLs for jsPDF
    let resolvedUrl = url;
    if (!url.startsWith('data:') && !url.startsWith('http')) {
      try {
        resolvedUrl = new URL(url, window.location.href).href;
      } catch (e) {
        console.warn("Could not resolve URL:", url);
      }
    }

    if (resolvedUrl.startsWith('http')) {
      img.crossOrigin = "Anonymous";
    }

    img.src = resolvedUrl;
    img.onload = () => resolve(img);
    img.onerror = () => {
      console.warn("Failed to load image for PDF:", resolvedUrl);
      resolve(null);
    };
  });
};

const generateBarcodeBase64 = (text: string): string => {
  const canvas = document.createElement("canvas");
  JsBarcode(canvas, text, {
    format: "CODE128",
    displayValue: false,
    margin: 0,
    width: 2,
    height: 100
  });
  return canvas.toDataURL("image/png");
};

const renderLabelToDoc = (
  doc: jsPDF, 
  label: LabelData, 
  layout: LayoutConfig, 
  leftLogoImg: HTMLImageElement | null, 
  rightLogoImg: HTMLImageElement | null
) => {
    if (leftLogoImg) {
      const ratio = layout.logoHeight / leftLogoImg.height;
      const newW = leftLogoImg.width * ratio;
      try {
        doc.addImage(leftLogoImg, 'PNG', layout.logoMargin, layout.logoTopY, newW, layout.logoHeight);
      } catch(e) {
        console.warn("Error adding left logo to PDF", e);
      }
    } else {
        doc.setFillColor(240, 240, 240);
        doc.rect(layout.logoMargin, layout.logoTopY, 45, layout.logoHeight, 'F');
    }

    let rightLogoW = 45; 
    if (rightLogoImg) {
      const ratio2 = layout.logoHeight / rightLogoImg.height;
      rightLogoW = rightLogoImg.width * ratio2;
      try {
        doc.addImage(rightLogoImg, 'PNG', layout.pageWidth - rightLogoW - layout.logoMargin, layout.logoTopY, rightLogoW, layout.logoHeight);
      } catch(e) {
        console.warn("Error adding right logo to PDF", e);
      }
    } else {
        doc.setFillColor(240, 240, 240);
        doc.rect(layout.pageWidth - 45 - layout.logoMargin, layout.logoTopY, 45, layout.logoHeight, 'F');
    }

    doc.setFont("Helvetica", "normal");
    doc.setFontSize(layout.emailFontSize);
    doc.setTextColor(0, 0, 0);
    doc.text("order@repamarket.eu", layout.pageWidth - layout.logoMargin, layout.emailTopY, { align: 'right', baseline: 'top' });

    doc.setFont("Helvetica", "bold");
    doc.setFontSize(layout.titleFontSize);
    doc.text(label.Title, layout.titleLeftMargin, layout.titleTopY, { baseline: 'top' });

    if (label.ColorLine) {
        doc.setFont("Helvetica", "normal");
        doc.setFontSize(layout.colorLineFontSize);
        doc.text(label.ColorLine, layout.colorLineLeftMargin, layout.colorLineTopY, { baseline: 'top' });
    }

    if (label.BarcodeText) {
        const barcodeBase64 = generateBarcodeBase64(label.BarcodeText);
        const bx = (layout.pageWidth - layout.barcodeWidth) / 2;
        doc.addImage(barcodeBase64, 'PNG', bx, layout.barcodeTopY, layout.barcodeWidth, layout.barcodeHeight);
        doc.setFontSize(layout.barcodeTextFontSize);
        doc.text(label.BarcodeText, layout.pageWidth / 2, layout.barcodeTopY + layout.barcodeHeight + 2, { align: 'center', baseline: 'top' });
    }

    if (label.Model) {
        doc.setFontSize(layout.modelFontSize);
        doc.text(label.Model, layout.modelLeftMargin, layout.modelTopY, { baseline: 'top' });
    }

    doc.setFontSize(layout.sizeFontSize);
    if (label.SizeInch) doc.text(label.SizeInch, layout.pageWidth - layout.sizeRightMargin, layout.sizeInchTopY, { align: 'right', baseline: 'top' });
    if (label.SizeMM) doc.text(label.SizeMM, layout.pageWidth - layout.sizeRightMargin, layout.sizeMmTopY, { align: 'right', baseline: 'top' });
};

export const generatePDF = async (labels: LabelData[], settings: AppSettings, layout: LayoutConfig) => {
  const [leftLogoImg, rightLogoImg] = await Promise.all([
    settings.logoLeft ? loadImage(settings.logoLeft) : Promise.resolve(null),
    settings.logoRight ? loadImage(settings.logoRight) : Promise.resolve(null)
  ]);

  const getFilename = (model: string) => (model || 'Label').trim().replace(/[^a-z0-9\-_]/gi, '_') + '.pdf';

  if (labels.length === 1) {
      const doc = new jsPDF({ unit: 'pt', format: [layout.pageWidth, layout.pageHeight] });
      renderLabelToDoc(doc, labels[0], layout, leftLogoImg, rightLogoImg);
      doc.save(getFilename(labels[0].Model));
  } else {
      const zip = new JSZip();
      for (const label of labels) {
          const doc = new jsPDF({ unit: 'pt', format: [layout.pageWidth, layout.pageHeight] });
          renderLabelToDoc(doc, label, layout, leftLogoImg, rightLogoImg);
          zip.file(getFilename(label.Model), doc.output('blob'));
      }
      const content = await zip.generateAsync({ type: 'blob' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(content);
      link.download = `labels_${Date.now()}.zip`;
      link.click();
  }
};