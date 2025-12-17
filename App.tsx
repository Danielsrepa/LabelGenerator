import React, { useState } from 'react';
import { FileSpreadsheet, Download, Trash2, Plus, Settings as SettingsIcon, Printer, FileUp, LayoutTemplate } from 'lucide-react';
import { LabelData, AppSettings, LayoutConfig, DEFAULT_LAYOUT } from './types';
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
  BarcodeText: '123456789'
};

// Default Logos (PNG Files)
// Ensure 'logo-left.png' and 'logo-right.png' exist in your public/root folder.
const LOGO_LEFT_DEFAULT = "./logo-left.png";
const LOGO_RIGHT_DEFAULT = "./logo-right.png";

const App: React.FC = () => {
  const [labels, setLabels] = useState<LabelData[]>([initialLabel]);
  const [selectedLabelId, setSelectedLabelId] = useState<string>(initialLabel.id);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isLayoutOpen, setIsLayoutOpen] = useState(false);
  const [settings, setSettings] = useState<AppSettings>({
    logoLeft: LOGO_LEFT_DEFAULT,
    logoRight: LOGO_RIGHT_DEFAULT
  });
  const [layout, setLayout] = useState<LayoutConfig>(DEFAULT_LAYOUT);

  const activeLabel = labels.find(l => l.id === selectedLabelId) || labels[0];

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const parsedLabels = await parseExcelFile(file);
        setLabels(parsedLabels);
        if (parsedLabels.length > 0) setSelectedLabelId(parsedLabels[0].id);
      } catch (error) {
        alert("Error parsing Excel file. Ensure columns: Title, ColorLine, Model, SizeInch, SizeMM, BarcodeText.");
        console.error(error);
      }
    }
  };

  const updateLabel = (id: string, field: keyof LabelData, value: string) => {
    setLabels(prev => prev.map(l => l.id === id ? { ...l, [field]: value } : l));
  };

  const addNewLabel = () => {
    const newId = Date.now().toString();
    const newLabel = { ...initialLabel, id: newId, Title: 'New Item', Model: 'NEW-01' };
    setLabels([...labels, newLabel]);
    setSelectedLabelId(newId);
  };

  const removeLabel = (id: string) => {
    const newLabels = labels.filter(l => l.id !== id);
    setLabels(newLabels);
    if (newLabels.length > 0) setSelectedLabelId(newLabels[0].id);
  };

  const handleDownloadPDF = () => {
    generatePDF(labels, settings, layout);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-100">
      {/* Header */}
      <header className="bg-white border-b shadow-sm z-10 sticky top-0">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Printer className="text-indigo-600" />
            <h1 className="text-xl font-bold text-gray-900 tracking-tight">LabelGen <span className="text-gray-400 font-normal text-sm ml-2">Python Logic Replica</span></h1>
          </div>
          <div className="flex items-center space-x-3">
             <button 
              onClick={() => setIsLayoutOpen(true)}
              className="flex items-center space-x-2 bg-gray-100 text-gray-700 hover:bg-gray-200 px-3 py-2 rounded-lg transition font-medium text-sm"
              title="Edit Layout"
            >
              <LayoutTemplate size={18} />
              <span className="hidden sm:inline">Edit Layout</span>
            </button>
             <button 
              onClick={() => setIsSettingsOpen(true)}
              className="p-2 text-gray-500 hover:bg-gray-100 rounded-full transition"
              title="Configure Logos"
            >
              <SettingsIcon size={20} />
            </button>
            <button 
              onClick={handleDownloadPDF}
              className="flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium transition shadow-sm"
            >
              <Download size={18} />
              <span>Generate PDF</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow flex flex-col md:flex-row max-w-7xl mx-auto w-full p-4 gap-6">
        
        {/* Left Column: Data Management */}
        <div className="w-full md:w-1/3 flex flex-col gap-6">
            
            {/* Import / Actions */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
                <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Data Source</h2>
                <div className="flex flex-col gap-3">
                    <label className="flex items-center justify-center w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 hover:border-indigo-400 transition group">
                        <div className="flex flex-col items-center">
                            <div className="flex items-center space-x-2 text-gray-600 group-hover:text-indigo-600">
                                <FileSpreadsheet size={20} />
                                <span className="font-medium">Upload Excel</span>
                            </div>
                            <span className="text-xs text-gray-400 mt-1">.xlsx or .xls</span>
                        </div>
                        <input type="file" className="hidden" accept=".xlsx, .xls" onChange={handleFileUpload} />
                    </label>
                    
                    <button onClick={addNewLabel} className="flex items-center justify-center space-x-2 w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium transition">
                        <Plus size={16} />
                        <span>Add Manual Entry</span>
                    </button>
                </div>
            </div>

            {/* List of Labels */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 flex-grow flex flex-col overflow-hidden h-[500px]">
                <div className="p-3 border-b bg-gray-50 flex justify-between items-center">
                    <span className="font-medium text-gray-700">{labels.length} Labels</span>
                </div>
                <div className="overflow-y-auto flex-grow">
                    {labels.map((label) => (
                        <div 
                            key={label.id}
                            onClick={() => setSelectedLabelId(label.id)}
                            className={`p-3 border-b cursor-pointer flex justify-between items-center hover:bg-gray-50 transition ${selectedLabelId === label.id ? 'bg-indigo-50 border-l-4 border-l-indigo-500' : 'border-l-4 border-l-transparent'}`}
                        >
                            <div className="overflow-hidden">
                                <div className="font-medium text-gray-900 truncate">{label.Model || 'No Model'}</div>
                                <div className="text-xs text-gray-500 truncate">{label.Title}</div>
                            </div>
                            <button 
                                onClick={(e) => { e.stopPropagation(); removeLabel(label.id); }}
                                className="p-1 text-gray-300 hover:text-red-500 transition"
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </div>

        {/* Right Column: Editor & Preview */}
        <div className="w-full md:w-2/3 flex flex-col gap-6">
            
            {/* Editor Form */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center">
                    Edit Details
                    <span className="ml-2 px-2 py-0.5 bg-gray-100 text-gray-500 text-xs rounded-full font-mono">{activeLabel.id}</span>
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                        <label className="block text-xs font-medium text-gray-500 uppercase mb-1">Product Title</label>
                        <input 
                            type="text" 
                            className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-indigo-500 outline-none transition"
                            value={activeLabel.Title}
                            onChange={(e) => updateLabel(activeLabel.id, 'Title', e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-500 uppercase mb-1">Color / Line</label>
                        <input 
                            type="text" 
                            className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-indigo-500 outline-none transition"
                            value={activeLabel.ColorLine || ''}
                            onChange={(e) => updateLabel(activeLabel.id, 'ColorLine', e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-500 uppercase mb-1">Model (Main ID)</label>
                        <input 
                            type="text" 
                            className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-indigo-500 outline-none transition"
                            value={activeLabel.Model}
                            onChange={(e) => updateLabel(activeLabel.id, 'Model', e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-500 uppercase mb-1">Size Inch</label>
                        <input 
                            type="text" 
                            className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-indigo-500 outline-none transition"
                            value={activeLabel.SizeInch || ''}
                            onChange={(e) => updateLabel(activeLabel.id, 'SizeInch', e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-500 uppercase mb-1">Size MM</label>
                        <input 
                            type="text" 
                            className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-indigo-500 outline-none transition"
                            value={activeLabel.SizeMM || ''}
                            onChange={(e) => updateLabel(activeLabel.id, 'SizeMM', e.target.value)}
                        />
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-xs font-medium text-gray-500 uppercase mb-1">Barcode (Code128)</label>
                        <input 
                            type="text" 
                            className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-indigo-500 outline-none transition font-mono"
                            value={activeLabel.BarcodeText}
                            onChange={(e) => updateLabel(activeLabel.id, 'BarcodeText', e.target.value)}
                        />
                    </div>
                </div>
            </div>

            {/* Live Preview Area */}
            <div className="bg-gray-200 p-8 rounded-xl shadow-inner border border-gray-300 flex items-center justify-center relative min-h-[400px]">
                <div className="absolute top-4 left-4 text-xs font-bold text-gray-500 uppercase tracking-widest">Live Preview</div>
                <LabelPreview data={activeLabel} settings={settings} layout={layout} />
            </div>
        </div>
      </main>

      <SettingsModal 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)} 
        settings={settings}
        onUpdate={setSettings}
      />

      <LayoutSettings
        isOpen={isLayoutOpen}
        onClose={() => setIsLayoutOpen(false)}
        config={layout}
        onUpdate={setLayout}
      />
    </div>
  );
};

export default App;