import React, { useState } from 'react';
import { FileSpreadsheet, Download, Trash2, Plus, Settings as SettingsIcon, Printer, LayoutTemplate, Layers } from 'lucide-react';
import { LabelData, AppSettings, LayoutConfig, DEFAULT_LAYOUT, PRESET_58X40, PRESET_70X40, MM } from './types';
import { parseExcelFile } from './services/excelService';
import { generatePDF } from './services/pdfService';
import LabelPreview from './components/LabelPreview';
import SettingsModal from './components/SettingsModal';
import LayoutSettings from './components/LayoutSettings';

const initialLabel: LabelData = {
  id: '1',
  Title: 'Example Product',
  ColorLine: 'Premium Series',
  Model: 'XY-2000',
  SizeInch: '10"',
  SizeMM: '254mm',
  BarcodeText: '123456789',
  Email: ''
};

const LOGO_LEFT_DEFAULT = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAzMDAgMTUwIj48cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjE1MCIgZmlsbD0iYmxhY2siLz48dGV4dCB4PSIxMCIgeT0iNjAiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC13ZWlnaHQ9ImJvbGQiIGZvbnQtc2l6ZT0iNDAiIGZpbGw9IndoaXRlIj5NQURFIElOPC90ZXh0Pjx0ZXh0IHg9IjEwIiB5PSIxMDAiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC13ZWlnaHQ9ImJvbGQiIGZvbnQtc2l6ZT0iNDAiIGZpbGw9IndoaXRlIj5FVVJPUEU8L3RleHQ+PGcgZmlsbD0id2hpdGUiIHRyYW5zZm9ybT0idHJhbnNsYXRlKDIyMCwgNzUpIj48ZyB0cmFuc2Zvcm09InNjYWxlKDAuOSkiPjxwb2x5Z29uIHBvaW50cz0iMCwtMzUgMiwtMzAgOCwtMzAgMywtMjYgNSwtMjAgMCwtMjQgLTUsLTMwIDIsLTMwIi8+PHBvbHlnb24gcG9pbnRzPSIwLC0zNSAyLC0zMCA4LC0zMCAzLC0yNiA1LC0yMCAwLC0yNCAtNSwtMjAgLTMsLTI2IC04LC0zMCAtMiwtMzAiIHRyYW5zZm9ybT0icm90YXRlKDMwKSIvPjxwb2x5Z29uIHBvaW50cz0iMCwtMzUgMiwtMzAgOCwtMzAgMywtMjYgNSwtMjAgMCwtMjQgLTUsLTMwIDIsLTMwIiB0cmFuc2Zvcm09InJvdGF0ZSg2MCkiLz48cG9seWdvbiBwb2ludHM9IjAsLTM1IDIsLTMwIDgsLTMwIDMsLTI2IDUsLTIwIDAsLTI0IC01LC0yMCAtMywtMjYgLTgsLTMwIDMsLTMwIiB0cmFuc2Zvcm09InJvdGF0ZSg5MCkiLz48cG9seWdvbiBwb2ludHM9IjAsLTM1IDIsLTMwIDgsLTMwIDMsLTI2IDUsLTIwIDAsLTI0IC01LC0yMCAtMywtMjYgLTgsLTMwIDIsLTMwIiB0cmFuc2Zvcm09InJvdGF0ZSgxMjApIi8+PHBvbHlnb24gcG9pbnRzPSIwLC0zNSAyLC0zMCA4LC0zMCAzLC0yNiA1LC0yMCAwLC0yNCAtNSwtMjAgLTMsLTI2IC04LC0zMCAtMiwtMzAiIHRyYW5zZm9ybT0icm90YXRlKDE1MCIpIi8+PHBvbHlnb24gcG9pbnRzPSIwLC0zNSAyLC0zMCA4LC0zMCAzLC0yNiA1LC0yMCAwLC0yNCAtNSwtMjAgLTMsLTI2IC04LC0zMCAtMiwtMzAiIHRyYW5zZm9ybT0icm90YXRlKDE4MCkiLz48cG9seWdvbiBwb2ludHM9IjAsLTM1IDIsLTMwIDgsLTMwIDMsLTI2IDUsLTIwIDAsLTI0IC01LC0yMCAtMywtMjYgLTgsLTMwIDIsLTMwIiB0cmFuc2Zvcm09InJvdGF0ZSgyMTAki8+PHBvbHlnb24gcG9pbnRzPSIwLC0zNSAyLC0zMCA4LC0zMCAzLC0yNiA1LC0yMCAwLC0yNCAtNSwtMjAgLTMsLTI2IC04LC0zMCAtMiwtMzAiIHRyYW5zZm9ybT0icm90YXRlKDI0MCkiLz48cG9seWdvbiBwb2ludHM9IjAsLTM1IDIsLTMwIDgsLTMwIDMsLTI2IDUsLTIwIDAsLTI0IC01LC0yMCAtMywtMjYgLTgsLTMwIDIsLTMwIiB0cmFuc2Zvcm09InJvdGF0ZSgyNzApIi8+PHBvbHlnb24gcG9pbnRzPSIwLC0zNSAyLC0zMCA4LC0zMCAzLC0yNiA1LC0yMCAwLC0yNCAtNSwtMjAgLTMsLTI2IC04LC0zMCAtMiwtMzAiIHRyYW5zZm9ybT0icm90YXRlKDMwMCkiLz48cG9seWdvbiBwb2ludHM9IjAsLTM1IDIsLTMwIDgsLTMwIDMsLTI2IDUsLTIwIDAsLTI0IC01LC0yMCAtMywtMjYgLTgsLTMwIDIsLTMwIiB0cmFuc2Zvcm09InJvdGF0ZSgzMzApIi8+PC9nPjwvZz48L3N2Zz4=";
const LOGO_RIGHT_DEFAULT = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAzMDAgMTUwIj48dGV4dCB4PSIxMCIgeT0iNzAiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC13ZWlnaHQ9ImJvbGQiIGZvbnQtc2l6ZT0iODAiIGZpbGw9ImJsYWNrIj5SRVBBPC90ZXh0Pjx0ZXh0IHg9IjEwIiB5PSIxMjUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC13ZWlnaHQ9ImJvbGQiIGZvbnQtc2l6ZT0iNDUiIGZpbGw9ImJsYWNrIiBsZXR0ZXItc3BhY2luZz0iNSI+TUFSS0VUPC90ZXh0Pjwvc3ZnPg==";

const App: React.FC = () => {
  const [labels, setLabels] = useState<LabelData[]>([initialLabel]);
  const [selectedLabelId, setSelectedLabelId] = useState<string>(initialLabel.id);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isLayoutOpen, setIsLayoutOpen] = useState(false);
  const [presetName, setPresetName] = useState('Standard');
  const [settings, setSettings] = useState<AppSettings>({
    logoLeft: LOGO_LEFT_DEFAULT,
    logoRight: LOGO_RIGHT_DEFAULT,
    email: 'order@repamarket.eu'
  });
  const [layout, setLayout] = useState<LayoutConfig>(DEFAULT_LAYOUT);

  const activeLabel = labels.find(l => l.id === selectedLabelId) || labels[0];

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const parsed = await parseExcelFile(file);
        if (parsed.length > 0) {
          setLabels(parsed);
          setSelectedLabelId(parsed[0].id);
        }
      } catch (err) {
        alert("Failed to parse Excel. Ensure columns: Title, Model, BarcodeText, SizeInch, SizeMM, etc.");
      }
    }
  };

  const handlePresetChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
  const val = e.target.value;
  setPresetName(val);

  if (val === 'Small') {
    setLayout(PRESET_58X40);
  } else if (val === 'Medium') {
    setLayout(PRESET_70X40);
  } else {
    setLayout(DEFAULT_LAYOUT);
  }
};

  const updateLabel = (id: string, field: keyof LabelData, value: string) => {
    setLabels(prev => prev.map(l => l.id === id ? { ...l, [field]: value } : l));
  };

  const addNewLabel = () => {
    const id = Date.now().toString();
    setLabels([...labels, { ...initialLabel, id, Model: 'NEW-' + labels.length }]);
    setSelectedLabelId(id);
  };

  const removeLabel = (id: string) => {
    const filtered = labels.filter(l => l.id !== id);
    setLabels(filtered);
    if (filtered.length > 0) setSelectedLabelId(filtered[0].id);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-100">
      <header className="bg-white border-b shadow-sm z-10 sticky top-0">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3 text-indigo-600 font-bold text-xl">
            <Printer />
            <span>LabelGen</span>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center bg-slate-50 border rounded-lg px-2">
              <Layers size={16} className="text-slate-400 mr-2" />
              <select 
  className="bg-transparent py-1.5 text-sm font-medium focus:outline-none"
  value={presetName}
  onChange={handlePresetChange}
>
  <option value="Standard">Standard (255pt)</option>
  <option value="Medium">Medium (70x40mm)</option>
  <option value="Small">Small (58x40mm)</option>
</select>
            </div>

            <button 
              onClick={() => setIsLayoutOpen(true)}
              className="flex items-center space-x-2 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 px-3 py-2 rounded-lg font-medium text-sm transition"
            >
              <LayoutTemplate size={18} />
              <span className="hidden sm:inline">Fine Tune Layout</span>
            </button>

            <button onClick={() => setIsSettingsOpen(true)} className="p-2 text-slate-400 hover:bg-slate-100 rounded-full transition">
              <SettingsIcon size={20} />
            </button>

            <button 
              onClick={() => generatePDF(labels, settings, layout)}
              className="flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-bold shadow-sm transition active:scale-95"
            >
              <Download size={18} />
              <span>Generate PDF</span>
            </button>
          </div>
        </div>
      </header>

      <main className="flex-grow flex flex-col md:flex-row max-w-7xl mx-auto w-full p-6 gap-8">
        {/* Sidebar: Data & List */}
        <div className="w-full md:w-1/3 flex flex-col gap-6">
          <div className="bg-white p-5 rounded-xl border shadow-sm space-y-4">
            <h2 className="text-xs font-bold uppercase text-slate-400 tracking-wider">Data Source</h2>
            <div className="grid grid-cols-1 gap-3">
              <label className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-slate-200 rounded-xl cursor-pointer hover:border-indigo-400 hover:bg-indigo-50/30 transition group">
                <FileSpreadsheet className="text-slate-300 group-hover:text-indigo-500 mb-2" size={24} />
                <span className="text-sm font-semibold text-slate-600">Import Excel</span>
                <input type="file" className="hidden" accept=".xlsx, .xls" onChange={handleFileUpload} />
              </label>
              <button 
                onClick={addNewLabel}
                className="flex items-center justify-center space-x-2 w-full py-2 bg-white border border-slate-200 rounded-lg text-slate-600 font-bold hover:bg-slate-50 transition"
              >
                <Plus size={18} />
                <span>Manual Entry</span>
              </button>
            </div>
          </div>

          <div className="bg-white rounded-xl border shadow-sm flex-grow flex flex-col overflow-hidden max-h-[600px]">
            <div className="p-4 bg-slate-50 border-b flex justify-between items-center">
              <span className="text-xs font-bold text-slate-500 uppercase">{labels.length} Items</span>
            </div>
            <div className="overflow-y-auto">
              {labels.map(l => (
                <div 
                  key={l.id} 
                  onClick={() => setSelectedLabelId(l.id)}
                  className={`p-4 border-b cursor-pointer flex justify-between items-center transition ${selectedLabelId === l.id ? 'bg-indigo-50 border-l-4 border-indigo-500' : 'hover:bg-slate-50 border-l-4 border-transparent'}`}
                >
                  <div className="truncate pr-4">
                    <div className="font-bold text-sm text-slate-800">{l.Model || 'Unnamed'}</div>
                    <div className="text-xs text-slate-400 truncate">{l.Title}</div>
                  </div>
                  <button onClick={(e) => { e.stopPropagation(); removeLabel(l.id); }} className="text-slate-300 hover:text-red-500 transition">
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Editor & Preview */}
        <div className="w-full md:w-2/3 flex flex-col gap-6">
          <div className="bg-white p-6 rounded-xl border shadow-sm space-y-6">
            <h2 className="text-lg font-bold text-slate-800 border-b pb-4">Label Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="md:col-span-2">
                <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Product Title</label>
                <input type="text" className="w-full border p-2.5 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition" value={activeLabel.Title} onChange={e => updateLabel(activeLabel.id, 'Title', e.target.value)} />
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Color / Line</label>
                <input type="text" className="w-full border p-2.5 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition" value={activeLabel.ColorLine || ''} onChange={e => updateLabel(activeLabel.id, 'ColorLine', e.target.value)} />
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Model ID</label>
                <input type="text" className="w-full border p-2.5 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition" value={activeLabel.Model} onChange={e => updateLabel(activeLabel.id, 'Model', e.target.value)} />
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Size (Inch)</label>
                <input type="text" className="w-full border p-2.5 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition" value={activeLabel.SizeInch || ''} onChange={e => updateLabel(activeLabel.id, 'SizeInch', e.target.value)} />
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Size (MM)</label>
                <input type="text" className="w-full border p-2.5 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition" value={activeLabel.SizeMM || ''} onChange={e => updateLabel(activeLabel.id, 'SizeMM', e.target.value)} />
              </div>
              <div className="md:col-span-2">
                <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Barcode Value</label>
                <input type="text" className="w-full border p-2.5 rounded-lg font-mono focus:ring-2 focus:ring-indigo-500 outline-none transition" value={activeLabel.BarcodeText} onChange={e => updateLabel(activeLabel.id, 'BarcodeText', e.target.value)} />
              </div>
              <div className="md:col-span-2">
                <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Custom Email Override (Optional)</label>
                <input type="email" placeholder={settings.email} className="w-full border p-2.5 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition" value={activeLabel.Email || ''} onChange={e => updateLabel(activeLabel.id, 'Email', e.target.value)} />
              </div>
            </div>
          </div>

          <div className="bg-slate-200 p-10 rounded-xl flex items-center justify-center min-h-[450px] shadow-inner relative overflow-hidden border">
            <div className="absolute top-4 left-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Preview Mode: {presetName} ({Math.round(layout.pageWidth/MM)}x{Math.round(layout.pageHeight/MM)}mm)</div>
            <LabelPreview data={activeLabel} settings={settings} layout={layout} />
          </div>
        </div>
      </main>

      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} settings={settings} onUpdate={setSettings} />
      <LayoutSettings isOpen={isLayoutOpen} onClose={() => setIsLayoutOpen(false)} config={layout} onUpdate={setLayout} />
    </div>
  );
};

export default App;
