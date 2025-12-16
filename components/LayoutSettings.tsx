import React from 'react';
import { X, RotateCcw } from 'lucide-react';
import { LayoutConfig, DEFAULT_LAYOUT } from '../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  config: LayoutConfig;
  onUpdate: (newConfig: LayoutConfig) => void;
}

const LayoutSettings: React.FC<Props> = ({ isOpen, onClose, config, onUpdate }) => {
  if (!isOpen) return null;

  const handleChange = (key: keyof LayoutConfig, value: string) => {
    const num = parseFloat(value);
    if (!isNaN(num)) {
      onUpdate({ ...config, [key]: num });
    }
  };

  const handleReset = () => {
    if (confirm("Reset all layout settings to default?")) {
      onUpdate(DEFAULT_LAYOUT);
    }
  };

  const InputGroup = ({ label, objKey }: { label: string, objKey: keyof LayoutConfig }) => (
    <div className="flex flex-col">
      <label className="text-xs font-medium text-gray-500 mb-1">{label}</label>
      <input 
        type="number" 
        value={config[objKey]} 
        onChange={(e) => handleChange(objKey, e.target.value)}
        className="border border-gray-300 rounded px-2 py-1 text-sm w-full"
      />
    </div>
  );

  const Section = ({ title, children }: { title: string, children?: React.ReactNode }) => (
    <div className="mb-6">
      <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wide border-b pb-1 mb-3">{title}</h3>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {children}
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/50 flex justify-end z-50">
      <div className="bg-white w-full max-w-lg h-full shadow-2xl flex flex-col animate-slide-in-right">
        <div className="flex justify-between items-center p-4 border-b bg-gray-50">
          <h2 className="text-lg font-semibold">Layout Editor</h2>
          <div className="flex items-center space-x-2">
            <button onClick={handleReset} className="text-gray-500 hover:text-red-600 p-2 rounded" title="Reset Defaults">
                <RotateCcw size={18} />
            </button>
            <button onClick={onClose} className="text-gray-500 hover:bg-gray-200 p-2 rounded">
                <X size={20} />
            </button>
          </div>
        </div>
        
        <div className="overflow-y-auto flex-grow p-6">
            
            <Section title="Header (Logos)">
                <InputGroup label="Top Y" objKey="logoTopY" />
                <InputGroup label="Height" objKey="logoHeight" />
                <InputGroup label="Side Margins" objKey="logoMargin" />
                <InputGroup label="Email Top Y" objKey="emailTopY" />
                <InputGroup label="Email Font Size" objKey="emailFontSize" />
            </Section>

            <Section title="Product Info">
                <InputGroup label="Title Top Y" objKey="titleTopY" />
                <InputGroup label="Title Font Size" objKey="titleFontSize" />
                <InputGroup label="Title Left Margin" objKey="titleLeftMargin" />
                
                <InputGroup label="Color/Line Top Y" objKey="colorLineTopY" />
                <InputGroup label="Color/Line Size" objKey="colorLineFontSize" />
                <InputGroup label="Color Left Margin" objKey="colorLineLeftMargin" />
            </Section>

            <Section title="Barcode">
                <InputGroup label="Top Y" objKey="barcodeTopY" />
                <InputGroup label="Width" objKey="barcodeWidth" />
                <InputGroup label="Height" objKey="barcodeHeight" />
                <InputGroup label="Text Size" objKey="barcodeTextFontSize" />
            </Section>

            <Section title="Footer">
                <InputGroup label="Model Top Y" objKey="modelTopY" />
                <InputGroup label="Model Font Size" objKey="modelFontSize" />
                <InputGroup label="Model Left Margin" objKey="modelLeftMargin" />
                
                <InputGroup label="Size (Inch) Top Y" objKey="sizeInchTopY" />
                <InputGroup label="Size (MM) Top Y" objKey="sizeMmTopY" />
                <InputGroup label="Size Font Size" objKey="sizeFontSize" />
                <InputGroup label="Size Right Margin" objKey="sizeRightMargin" />
            </Section>

            <Section title="Page">
                <InputGroup label="Width (pt)" objKey="pageWidth" />
                <InputGroup label="Height (pt)" objKey="pageHeight" />
            </Section>
        </div>
        
        <div className="p-4 border-t bg-gray-50 text-right">
             <button onClick={onClose} className="bg-indigo-600 text-white px-6 py-2 rounded shadow hover:bg-indigo-700 transition">
                 Close
             </button>
        </div>
      </div>
    </div>
  );
};

export default LayoutSettings;