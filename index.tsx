import React, { useState, useEffect, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import { 
  FileSpreadsheet, 
  Download, 
  Trash2, 
  Plus, 
  Settings as SettingsIcon, 
  Printer, 
  LayoutTemplate, 
  Layers, 
  X, 
  Upload, 
  RotateCcw 
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import JsBarcode from 'jsbarcode';
import JSZip from 'jszip';
import * as XLSX from 'xlsx';

// --- TYPES & CONSTANTS ---
const MM = 2.83465; // Points per Millimeter

interface LabelData {
  id: string;
  Title: string;
  ColorLine?: string;
  Model: string;
  SizeInch?: string;
  SizeMM?: string;
  BarcodeText: string;
  Email?: string;
}

interface AppSettings {
  logoLeft: string | null;
  logoRight: string | null;
  email: string;
}

interface LayoutConfig {
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

const DEFAULT_LAYOUT: LayoutConfig = {
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

const PRESET_58X40: LayoutConfig = {
  pageWidth: 58 * MM,
  pageHeight: 40 * MM,
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

const LOGO_LEFT_DEFAULT = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAzMDAgMTUwIj48cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjE1MCIgZmlsbD0iYmxhY2siLz48dGV4dCB4PSIxMCIgeT0iNjAiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC13ZWlnaHQ9ImJvbGQiIGZvbnQtc2l6ZT0iNDAiIGZpbGw9IndoaXRlIj5NQURFIElOPC90ZXh0Pjx0ZXh0IHg9IjEwIiB5PSIxMDAiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC13ZWlnaHQ9ImJvbGQiIGZvbnQtc2l6ZT0iNDAiIGZpbGw9IndoaXRlIj5FVVJPUEU8L3RleHQ+PGcgZmlsbD0id2hpdGUiIHRyYW5zZm9ybT0idHJhbnNsYXRlKDIyMCwgNzUpIj48ZyB0cmFuc2Zvcm09InNjYWxlKDAuOSkiPjxwb2x5Z29uIHBvaW50cz0iMCwtMzUgMiwtMzAgOCwtMzAgMywtMjYgNSwtMjAgMCwtMjQgLTUsLTMwIDIsLTMwIi8+PHBvbHlnb24gcG9pbnRzPSIwLC0zNSAyLC0zMCA4LC0zMCAzLC0yNiA1LC0yMCAwLC0yNCAtNSwtMjAgLTMsLTI2IC04LC0zMCAtMiwtMzAiIHRyYW5zZm9ybT0icm90YXRlKDMwKSIvPjxwb2x5Z29uIHBvaW50cz0iMCwtMzUgMiwtMzAgOCwtMzAgMywtMjYgNSwtMjAgMCwtMjQgLTUsLTMwIDIsLTMwIiB0cmFuc2Zvcm09InJvdGF0ZSg2MCkiLz48cG9seWdvbiBwb2ludHM9IjAsLTM1IDIsLTMwIDgsLTMwIDMsLTI2IDUsLTIwIDAsLTI0IC01LC0yMCAtMywtMjYgLTgsLTMwIDMsLTMwIiB0cmFuc2Zvcm09InJvdGF0ZSg5MCkiLz48cG9seWdvbiBwb2ludHM9IjAsLTM1IDIsLTMwIDgsLTMwIDMsLTI2IDUsLTIwIDAsLTI0IC01LC0yMCAtMywtMjYgLTgsLTMwIDIsLTMwIiB0cmFuc2Zvcm09InJvdGF0ZSgxMjApIi8+PHBvbHlnb24gcG9pbnRzPSIwLC0zNSAyLC0zMCA4LC0zMCAzLC0yNiA1LC0yMCAwLC0yNCAtNSwtMjAgLTMsLTI2IC04LC0zMCAtMiwtMzAiIHRyYW5zZm9ybT0icm90YXRlKDE1MCIpIi8+PHBvbHlnb24gcG9pbnRzPSIwLC0zNSAyLC0zMCA4LC0zMCAzLC0yNiA1LC0yMCAwLC0yNCAtNSwtMjAgLTMsLTI2IC04LC0zMCAtMiwtMzAiIHRyYW5zZm9ybT0icm90YXRlKDE4MCkiLz48cG9seWdvbiBwb2ludHM9IjAsLTM1IDIsLTMwIDgsLTMwIDMsLTI2IDUsLTIwIDAsLTI0IC01LC0yMCAtMywtMjYgLTgsLTMwIDIsLTMwIiB0cmFuc2Zvcm09InJvdGF0ZSgyMTAki8+PHBvbHlnb24gcG9pbnRzPSIwLC0zNSAyLC0zMCA4LC0zMCAzLC0yNiA1LC0yMCAwLC0yNCAtNSwtMjAgLTMsLTI2IC04LC0zMCAtMiwtMzAiIHRyYW5zZm9ybT0icm90YXRlKDI0MCkiLz48cG9seWdvbiBwb2ludHM9IjAsLTM1IDIsLTMwIDgsLTMwIDMsLTI2IDUsLTIwIDAsLTI0IC01LC0yMCAtMywtMjYgLTgsLTMwIDIsLTMwIiB0cmFuc2Zvcm09InJvdGF0ZSgyNzApIi8+PHBvbHlnb24gcG9pbnRzPSIwLC0zNSAyLC0zMCA4LC0zMCAzLC0yNiA1LC0yMCAwLC0yNCAtNSwtMjAgLTMsLTI2IC04LC0zMCAtMiwtMzAiIHRyYW5zZm9ybT0icm90YXRlKDMwMCkiLz48cG9seWdvbiBwb2ludHM9IjAsLTM1IDIsLTMwIDgsLTMwIDMsLTI2IDUsLTIwIDAsLTI0IC01LC0yMCAtMywtMjYgLTgsLTMwIDIsLTMwIiB0cmFuc2Zvcm09InJvdGF0ZSgzMzApIi8+PC9nPjwvZz48L3N2Zz4=";
const LOGO_RIGHT_DEFAULT = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAzMDAgMTUwIj48dGV4dCB4PSIxMCIgeT0iNzAiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC13ZWlnaHQ9ImJvbGQiIGZvbnQtc2l6ZT0iODAiIGZpbGw9ImJsYWNrIj5SRVBBPC90ZXh0Pjx0ZXh0IHg9IjEwIiB5PSIxMjUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC13ZWlnaHQ9ImJvbGQiIGZvbnQtc2l6ZT0iNDUiIGZpbGw9ImJsYWNrIiBsZXR0ZXItc3BhY2luZz0iNSI+TUFSS0VUPC90ZXh0Pjwvc3ZnPg==";

// --- SERVICES ---

const parseExcelFile = async (file: File): Promise<LabelData[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(sheet);
        const mappedData: LabelData[] = jsonData.map((row: any, index: number) => ({
          id: `excel-${index}-${Date.now()}`,
          Title: row.Title ? String(row.Title).trim() : 'Unknown Product',
          ColorLine: row.ColorLine ? String(row.ColorLine).trim() : '',
          Model: row.Model ? String(row.Model).trim() : '',
          SizeInch: row.SizeInch ? String(row.SizeInch).trim() : '',
          SizeMM: row.SizeMM ? String(row.SizeMM).trim() : '',
          BarcodeText: row.BarcodeText ? String(row.BarcodeText).trim() : '',
          Email: row.Email ? String(row.Email).trim() : '',
        }));
        resolve(mappedData);
      } catch (error) { reject(error); }
    };
    reader.onerror = (error) => reject(error);
    reader.readAsBinaryString(file);
  });
};

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
  try {
    JsBarcode(canvas, text, {
      format: "CODE128",
      displayValue: false,
      margin: 0,
      width: 2,
      height: 100
    });
    return canvas.toDataURL("image/png");
  } catch (e) {
    console.error("Barcode generation failed", e);
    return "";
  }
};

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
      doc.addImage(leftLogoImg, 'PNG', layout.logoMargin, layout.logoTopY, newW, layout.logoHeight);
    }
    // Right Logo
    if (rightLogoImg) {
      const ratio2 = layout.logoHeight / rightLogoImg.height;
      const rightLogoW = rightLogoImg.width * ratio2;
      doc.addImage(rightLogoImg, 'PNG', layout.pageWidth - rightLogoW - layout.logoMargin, layout.logoTopY, rightLogoW, layout.logoHeight);
    }
    // Email
    const emailToUse = label.Email || globalEmail;
    doc.setFont("Helvetica", "normal");
    doc.setFontSize(layout.emailFontSize);
    doc.setTextColor(0, 0, 0);
    doc.text(emailToUse, layout.pageWidth - layout.logoMargin, layout.emailTopY, { align: 'right', baseline: 'top' });
    // Title
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(layout.titleFontSize);
    doc.text(label.Title, layout.titleLeftMargin, layout.titleTopY, { baseline: 'top' });
    // Color Line
    if (label.ColorLine) {
        doc.setFont("Helvetica", "normal");
        doc.setFontSize(layout.colorLineFontSize);
        doc.text(label.ColorLine, layout.colorLineLeftMargin, layout.colorLineTopY, { baseline: 'top' });
    }
    // Barcode
    if (label.BarcodeText) {
        const barcodeBase64 = generateBarcodeBase64(label.BarcodeText);
        if (barcodeBase64) {
          const bx = (layout.pageWidth - layout.barcodeWidth) / 2;
          doc.addImage(barcodeBase64, 'PNG', bx, layout.barcodeTopY, layout.barcodeWidth, layout.barcodeHeight);
          doc.setFont("Helvetica", "normal");
          doc.setFontSize(layout.barcodeTextFontSize);
          doc.text(label.BarcodeText, layout.pageWidth / 2, layout.barcodeTopY + layout.barcodeHeight + 2, { align: 'center', baseline: 'top' });
        }
    }
    // Model
    if (label.Model) {
        doc.setFont("Helvetica", "bold");
        doc.setFontSize(layout.modelFontSize);
        doc.text(label.Model, layout.modelLeftMargin, layout.modelTopY, { baseline: 'top' });
    }
    // Sizes
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(layout.sizeFontSize);
    if (label.SizeInch) doc.text(label.SizeInch, layout.pageWidth - layout.sizeRightMargin, layout.sizeInchTopY, { align: 'right', baseline: 'top' });
    if (label.SizeMM) doc.text(label.SizeMM, layout.pageWidth - layout.sizeRightMargin, layout.sizeMmTopY, { align: 'right', baseline: 'top' });
};

// --- COMPONENTS ---

const LabelPreview: React.FC<{ data: LabelData; settings: AppSettings; layout: LayoutConfig }> = ({ data, settings, layout }) => {
  const barcodeRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (data.BarcodeText && barcodeRef.current) {
      try {
        JsBarcode(barcodeRef.current, data.BarcodeText, {
          format: "CODE128", displayValue: false, height: 50, width: 2, margin: 0, background: 'transparent'
        });
      } catch (e) { console.error("Invalid barcode", e); }
    }
  }, [data.BarcodeText]);

  const PREVIEW_SCALE = 1.5; 
  const widthPx = layout.pageWidth * PREVIEW_SCALE;
  const heightPx = layout.pageHeight * PREVIEW_SCALE;
  const s = (val: number) => val * PREVIEW_SCALE;
  const emailToDisplay = data.Email || settings.email;

  return (
    <div className="bg-white text-black shadow-2xl relative overflow-hidden border border-slate-200 box-border rounded-sm" style={{ width: widthPx, height: heightPx }}>
      <div style={{ position: 'absolute', top: s(layout.logoTopY), left: s(layout.logoMargin), height: s(layout.logoHeight) }}>
         {settings.logoLeft && <img src={settings.logoLeft} alt="L" className="h-full w-auto object-contain" />}
      </div>
      <div style={{ position: 'absolute', top: s(layout.logoTopY), right: s(layout.logoMargin), height: s(layout.logoHeight) }}>
         {settings.logoRight && <img src={settings.logoRight} alt="R" className="h-full w-auto object-contain" />}
      </div>
      <div style={{ position: 'absolute', top: s(layout.emailTopY), right: s(layout.logoMargin), fontSize: s(layout.emailFontSize), textAlign: 'right' }}>{emailToDisplay}</div>
      <div className="truncate font-bold" style={{ position: 'absolute', top: s(layout.titleTopY), left: s(layout.titleLeftMargin), width: widthPx - s(layout.titleLeftMargin * 2), fontSize: s(layout.titleFontSize) }}>{data.Title}</div>
      {data.ColorLine && <div className="truncate" style={{ position: 'absolute', top: s(layout.colorLineTopY), left: s(layout.colorLineLeftMargin), fontSize: s(layout.colorLineFontSize) }}>{data.ColorLine}</div>}
      {data.BarcodeText && (
        <div style={{ position: 'absolute', top: s(layout.barcodeTopY), left: (widthPx - s(layout.barcodeWidth)) / 2, width: s(layout.barcodeWidth), height: s(layout.barcodeHeight) }}>
           <svg ref={barcodeRef} className="w-full h-full" preserveAspectRatio="none" />
        </div>
      )}
      {data.BarcodeText && <div style={{ position: 'absolute', top: s(layout.barcodeTopY + layout.barcodeHeight + 2), width: '100%', textAlign: 'center', fontSize: s(layout.barcodeTextFontSize) }}>{data.BarcodeText}</div>}
      <div className="font-bold" style={{ position: 'absolute', top: s(layout.modelTopY), left: s(layout.modelLeftMargin), fontSize: s(layout.modelFontSize) }}>{data.Model}</div>
      <div className="font-bold text-right" style={{ position: 'absolute', top: s(layout.sizeInchTopY), right: s(layout.sizeRightMargin), fontSize: s(layout.sizeFontSize) }}>{data.SizeInch}</div>
      <div className="font-bold text-right" style={{ position: 'absolute', top: s(layout.sizeMmTopY), right: s(layout.sizeRightMargin), fontSize: s(layout.sizeFontSize) }}>{data.SizeMM}</div>
    </div>
  );
};

const SettingsModal: React.FC<{ isOpen: boolean; onClose: () => void; settings: AppSettings; onUpdate: (s: AppSettings) => void }> = ({ isOpen, onClose, settings, onUpdate }) => {
  if (!isOpen) return null;
  const handleUpload = (key: keyof AppSettings) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => onUpdate({ ...settings, [key]: ev.target?.result as string });
      reader.readAsDataURL(file);
    }
  };
  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="flex justify-between items-center p-5 border-b bg-slate-50">
          <h2 className="text-lg font-bold text-slate-800">Label Assets & Config</h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition"><X size={20} /></button>
        </div>
        <div className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-tight">Support Email</label>
            <input type="email" value={settings.email} onChange={e => onUpdate({ ...settings, email: e.target.value })} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-100 outline-none transition" />
          </div>
          {['logoLeft', 'logoRight'].map((key) => (
            <div key={key}>
              <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-tight">{key === 'logoLeft' ? 'Left' : 'Right'} Logo</label>
              <div className="flex items-center gap-4">
                <div className="h-20 w-20 bg-slate-100 border border-slate-200 rounded-xl flex items-center justify-center overflow-hidden">
                  {settings[key as keyof AppSettings] ? <img src={settings[key as keyof AppSettings] as string} className="h-full w-full object-contain p-1" /> : <span className="text-[10px] text-slate-400">NONE</span>}
                </div>
                <label className="flex-1 cursor-pointer bg-slate-50 border-2 border-dashed border-slate-300 hover:border-indigo-400 hover:bg-indigo-50 px-4 py-3 rounded-xl text-center transition group">
                  <Upload size={18} className="mx-auto mb-1 text-slate-400 group-hover:text-indigo-500" />
                  <span className="text-xs font-bold text-slate-600">Select Image</span>
                  <input type="file" accept="image/*" className="hidden" onChange={handleUpload(key as keyof AppSettings)} />
                </label>
              </div>
            </div>
          ))}
        </div>
        <div className="p-5 border-t bg-slate-50 flex justify-end">
          <button onClick={onClose} className="bg-slate-800 text-white px-8 py-2.5 rounded-xl font-bold hover:bg-slate-900 transition active:scale-95">Save Changes</button>
        </div>
      </div>
    </div>
  );
};

const LayoutSettings: React.FC<{ isOpen: boolean; onClose: () => void; config: LayoutConfig; onUpdate: (c: LayoutConfig) => void }> = ({ isOpen, onClose, config, onUpdate }) => {
  if (!isOpen) return null;
  const handleChange = (key: keyof LayoutConfig, val: string) => {
    const num = parseFloat(val);
    if (!isNaN(num)) onUpdate({ ...config, [key]: num });
  };
  const Input = ({ label, k }: { label: string, k: keyof LayoutConfig }) => (
    <div className="flex flex-col">
      <label className="text-[10px] font-bold text-slate-500 mb-1 uppercase tracking-tight">{label}</label>
      <input type="number" value={config[k]} onChange={e => handleChange(k, e.target.value)} className="border border-slate-200 rounded-lg px-3 py-1.5 text-sm w-full focus:ring-2 focus:ring-indigo-500 outline-none" />
    </div>
  );
  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-[2px] flex justify-end z-50">
      <div className="bg-white w-full max-w-md h-full shadow-2xl flex flex-col animate-slide-in-right border-l">
        <div className="flex justify-between items-center p-5 border-b bg-slate-50">
          <h2 className="text-xl font-black text-slate-800 uppercase italic">Layout Finetune</h2>
          <div className="flex gap-2">
            <button onClick={() => confirm("Reset to standard defaults?") && onUpdate(DEFAULT_LAYOUT)} className="p-2 text-slate-400 hover:text-red-500 transition"><RotateCcw size={20} /></button>
            <button onClick={onClose} className="p-2 text-slate-400 hover:bg-slate-100 rounded-full transition"><X size={24} /></button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          <section>
            <h3 className="text-xs font-black text-indigo-600 uppercase mb-4 tracking-widest border-b pb-1">Header & Contact</h3>
            <div className="grid grid-cols-2 gap-4"><Input label="Logo Top" k="logoTopY" /><Input label="Logo Height" k="logoHeight" /><Input label="Side Margin" k="logoMargin" /><Input label="Email Top" k="emailTopY" /><Input label="Email Size" k="emailFontSize" /></div>
          </section>
          <section>
            <h3 className="text-xs font-black text-indigo-600 uppercase mb-4 tracking-widest border-b pb-1">Product Info</h3>
            <div className="grid grid-cols-2 gap-4"><Input label="Title Top" k="titleTopY" /><Input label="Title Size" k="titleFontSize" /><Input label="Title Left" k="titleLeftMargin" /><Input label="Line Top" k="colorLineTopY" /><Input label="Line Size" k="colorLineFontSize" /></div>
          </section>
          <section>
            <h3 className="text-xs font-black text-indigo-600 uppercase mb-4 tracking-widest border-b pb-1">Barcode</h3>
            <div className="grid grid-cols-2 gap-4"><Input label="Top Y" k="barcodeTopY" /><Input label="Width" k="barcodeWidth" /><Input label="Height" k="barcodeHeight" /><Input label="Text Size" k="barcodeTextFontSize" /></div>
          </section>
          <section>
            <h3 className="text-xs font-black text-indigo-600 uppercase mb-4 tracking-widest border-b pb-1">Footer & Sizes</h3>
            <div className="grid grid-cols-2 gap-4"><Input label="Model Top" k="modelTopY" /><Input label="Model Size" k="modelFontSize" /><Input label="Inch Top" k="sizeInchTopY" /><Input label="MM Top" k="sizeMmTopY" /><Input label="Size Font" k="sizeFontSize" /></div>
          </section>
        </div>
        <div className="p-6 border-t bg-slate-50"><button onClick={onClose} className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition active:scale-95">Apply & Close</button></div>
      </div>
    </div>
  );
};

// --- MAIN APP ---

const initialLabel: LabelData = {
  id: '1', Title: 'Example Product', ColorLine: 'Premium Series', Model: 'XY-2000', SizeInch: '10"', SizeMM: '254mm', BarcodeText: '123456789', Email: ''
};

const App: React.FC = () => {
  const [labels, setLabels] = useState<LabelData[]>([initialLabel]);
  const [selectedId, setSelectedId] = useState(initialLabel.id);
  const [isSettingsOpen, setSettingsOpen] = useState(false);
  const [isLayoutOpen, setLayoutOpen] = useState(false);
  const [preset, setPreset] = useState('Standard');
  const [settings, setSettings] = useState<AppSettings>({ logoLeft: LOGO_LEFT_DEFAULT, logoRight: LOGO_RIGHT_DEFAULT, email: 'order@repamarket.eu' });
  const [layout, setLayout] = useState<LayoutConfig>(DEFAULT_LAYOUT);

  const active = labels.find(l => l.id === selectedId) || labels[0];

  const handleExcel = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const parsed = await parseExcelFile(file);
        if (parsed.length) { setLabels(parsed); setSelectedId(parsed[0].id); }
      } catch (err) { alert("Excel import failed."); }
    }
  };

  const handleDownload = async () => {
    let leftImg: HTMLImageElement | null = null;
    let rightImg: HTMLImageElement | null = null;
    try {
      if (settings.logoLeft) leftImg = await loadImage(settings.logoLeft);
      if (settings.logoRight) rightImg = await loadImage(settings.logoRight);
    } catch (e) {}

    const createDoc = (l: LabelData) => {
      const doc = new jsPDF({ orientation: 'portrait', unit: 'pt', format: [layout.pageWidth, layout.pageHeight] });
      renderLabelToDoc(doc, l, layout, leftImg, rightImg, settings.email);
      return doc;
    };

    if (labels.length === 1) {
      createDoc(labels[0]).save(`${labels[0].Model || 'label'}.pdf`);
    } else {
      const zip = new JSZip();
      const nameMap = new Map<string, number>();
      for (const l of labels) {
        const base = (l.Model || 'label').replace(/[^a-z0-9]/gi, '_');
        const count = nameMap.get(base) || 0;
        nameMap.set(base, count + 1);
        const name = count === 0 ? `${base}.pdf` : `${base}_${count}.pdf`;
        zip.file(name, createDoc(l).output('blob'));
      }
      const content = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(content);
      const link = document.createElement('a');
      link.href = url; link.download = `labels_${Date.now()}.zip`;
      link.click();
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white/80 backdrop-blur-md border-b sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 h-18 flex items-center justify-between">
          <div className="flex items-center gap-3 text-indigo-600">
            <div className="bg-indigo-600 text-white p-2 rounded-xl shadow-lg shadow-indigo-200"><Printer size={24} /></div>
            <h1 className="text-2xl font-black italic tracking-tighter">REPA<span className="text-slate-800">GEN</span></h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200">
              <Layers size={16} className="text-slate-400 mr-2" />
              <select className="bg-transparent text-sm font-bold focus:outline-none" value={preset} onChange={e => {
                setPreset(e.target.value);
                setLayout(e.target.value === 'Small' ? PRESET_58X40 : DEFAULT_LAYOUT);
              }}>
                <option value="Standard">Standard (90x90mm)</option>
                <option value="Small">Small (58x40mm)</option>
              </select>
            </div>
            <button onClick={() => setLayoutOpen(true)} className="p-2.5 text-slate-500 hover:bg-slate-100 rounded-xl transition"><LayoutTemplate size={22} /></button>
            <button onClick={() => setSettingsOpen(true)} className="p-2.5 text-slate-500 hover:bg-slate-100 rounded-xl transition"><SettingsIcon size={22} /></button>
            <button onClick={handleDownload} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-bold shadow-xl shadow-indigo-100 transition active:scale-95">
              <Download size={18} /><span>Generate {labels.length > 1 ? 'ZIP' : 'PDF'}</span>
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col md:flex-row max-w-7xl mx-auto w-full p-6 gap-8">
        <div className="w-full md:w-[380px] flex flex-col gap-6">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <label className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-200 rounded-2xl cursor-pointer hover:border-indigo-400 hover:bg-indigo-50 transition group">
                <FileSpreadsheet className="text-slate-300 group-hover:text-indigo-500 mb-2" size={28} />
                <span className="text-xs font-black uppercase tracking-widest text-slate-400">Excel</span>
                <input type="file" className="hidden" accept=".xlsx, .xls" onChange={handleExcel} />
              </label>
              <button onClick={() => { const id = Date.now().toString(); setLabels([...labels, { ...initialLabel, id, Model: 'NEW-' + labels.length }]); setSelectedId(id); }}
                className="flex flex-col items-center justify-center border-2 border-slate-200 rounded-2xl hover:bg-slate-50 transition group">
                <Plus className="text-slate-300 group-hover:text-indigo-500 mb-2" size={28} />
                <span className="text-xs font-black uppercase tracking-widest text-slate-400">Manual</span>
              </button>
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm flex-1 flex flex-col overflow-hidden min-h-[400px]">
            <div className="px-5 py-4 bg-slate-50 border-b flex justify-between items-center"><span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{labels.length} Items</span></div>
            <div className="flex-1 overflow-y-auto">
              {labels.map(l => (
                <div key={l.id} onClick={() => setSelectedId(l.id)} className={`p-4 border-b flex justify-between items-center cursor-pointer transition ${selectedId === l.id ? 'bg-indigo-50 border-l-4 border-indigo-500' : 'hover:bg-slate-50 border-l-4 border-transparent'}`}>
                  <div className="truncate"><div className="font-bold text-sm text-slate-800">{l.Model || 'Unnamed'}</div><div className="text-[10px] text-slate-400 truncate uppercase font-bold">{l.Title}</div></div>
                  <button onClick={e => { e.stopPropagation(); const f = labels.filter(i => i.id !== l.id); setLabels(f); if (f.length) setSelectedId(f[0].id); }} className="text-slate-300 hover:text-red-500 transition"><Trash2 size={16} /></button>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex-1 flex flex-col gap-8">
          <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
            <h2 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-8">Metadata Editor</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="text-[10px] font-black uppercase text-slate-400 block mb-2">Product Title</label>
                <input type="text" className="w-full border-2 border-slate-100 p-3 rounded-xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-400 outline-none transition font-medium" value={active.Title} onChange={e => setLabels(prev => prev.map(l => l.id === active.id ? { ...l, Title: e.target.value } : l))} />
              </div>
              <div>
                <label className="text-[10px] font-black uppercase text-slate-400 block mb-2">Color / Line</label>
                <input type="text" className="w-full border-2 border-slate-100 p-3 rounded-xl focus:border-indigo-400 outline-none transition" value={active.ColorLine || ''} onChange={e => setLabels(prev => prev.map(l => l.id === active.id ? { ...l, ColorLine: e.target.value } : l))} />
              </div>
              <div>
                <label className="text-[10px] font-black uppercase text-slate-400 block mb-2">Model ID</label>
                <input type="text" className="w-full border-2 border-slate-100 p-3 rounded-xl focus:border-indigo-400 outline-none transition" value={active.Model} onChange={e => setLabels(prev => prev.map(l => l.id === active.id ? { ...l, Model: e.target.value } : l))} />
              </div>
              <div>
                <label className="text-[10px] font-black uppercase text-slate-400 block mb-2">Size (Inch)</label>
                <input type="text" className="w-full border-2 border-slate-100 p-3 rounded-xl focus:border-indigo-400 outline-none transition" value={active.SizeInch || ''} onChange={e => setLabels(prev => prev.map(l => l.id === active.id ? { ...l, SizeInch: e.target.value } : l))} />
              </div>
              <div>
                <label className="text-[10px] font-black uppercase text-slate-400 block mb-2">Size (MM)</label>
                <input type="text" className="w-full border-2 border-slate-100 p-3 rounded-xl focus:border-indigo-400 outline-none transition" value={active.SizeMM || ''} onChange={e => setLabels(prev => prev.map(l => l.id === active.id ? { ...l, SizeMM: e.target.value } : l))} />
              </div>
              <div className="md:col-span-2">
                <label className="text-[10px] font-black uppercase text-slate-400 block mb-2">Barcode Value</label>
                <input type="text" className="w-full border-2 border-slate-100 p-3 rounded-xl font-mono focus:border-indigo-400 outline-none transition" value={active.BarcodeText} onChange={e => setLabels(prev => prev.map(l => l.id === active.id ? { ...l, BarcodeText: e.target.value } : l))} />
              </div>
            </div>
          </div>

          <div className="bg-slate-200/50 p-12 rounded-3xl flex items-center justify-center min-h-[500px] shadow-inner relative overflow-hidden border border-slate-200">
            <div className="absolute top-6 left-6 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">LIVE PREVIEW • {preset}</span>
            </div>
            <LabelPreview data={active} settings={settings} layout={layout} />
          </div>
        </div>
      </main>

      <SettingsModal isOpen={isSettingsOpen} onClose={() => setSettingsOpen(false)} settings={settings} onUpdate={setSettings} />
      <LayoutSettings isOpen={isLayoutOpen} onClose={() => setLayoutOpen(false)} config={layout} onUpdate={setLayout} />
    </div>
  );
};

createRoot(document.getElementById('root')!).render(<App />);