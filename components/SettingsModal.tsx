import React from 'react';
import { X, Upload } from 'lucide-react';
import { AppSettings } from '../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onUpdate: (newSettings: AppSettings) => void;
}

const SettingsModal: React.FC<Props> = ({ isOpen, onClose, settings, onUpdate }) => {
  if (!isOpen) return null;

  const handleImageUpload = (key: keyof AppSettings) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        onUpdate({ ...settings, [key]: ev.target?.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onUpdate({ ...settings, email: e.target.value });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-lg font-semibold">Label Configuration</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
            <X size={20} />
          </button>
        </div>
        <div className="p-4 space-y-6">
          
          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Contact Email</label>
            <input 
              type="email" 
              value={settings.email}
              onChange={handleEmailChange}
              placeholder="order@example.com"
              className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-indigo-500 outline-none transition"
            />
          </div>

          {/* Left Logo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Left Logo (Made In Europe)</label>
            <div className="flex items-center space-x-4">
              <div className="h-16 w-16 bg-gray-100 border rounded flex items-center justify-center overflow-hidden">
                {settings.logoLeft ? <img src={settings.logoLeft} alt="Preview" className="h-full object-contain"/> : <span className="text-xs text-gray-400">Empty</span>}
              </div>
              <label className="cursor-pointer bg-blue-50 text-blue-600 px-4 py-2 rounded text-sm font-medium hover:bg-blue-100 transition flex items-center">
                <Upload size={16} className="mr-2" /> Upload
                <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload('logoLeft')} />
              </label>
            </div>
          </div>

          {/* Right Logo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Right Logo (Brand/Repa)</label>
            <div className="flex items-center space-x-4">
              <div className="h-16 w-16 bg-gray-100 border rounded flex items-center justify-center overflow-hidden">
                {settings.logoRight ? <img src={settings.logoRight} alt="Preview" className="h-full object-contain"/> : <span className="text-xs text-gray-400">Empty</span>}
              </div>
              <label className="cursor-pointer bg-blue-50 text-blue-600 px-4 py-2 rounded text-sm font-medium hover:bg-blue-100 transition flex items-center">
                 <Upload size={16} className="mr-2" /> Upload
                <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload('logoRight')} />
              </label>
            </div>
          </div>

          <div className="text-xs text-gray-500 bg-yellow-50 p-3 rounded">
            Note: These settings will be applied to the generated PDF. Use transparent PNGs for best results.
          </div>

        </div>
        <div className="p-4 border-t bg-gray-50 flex justify-end">
          <button onClick={onClose} className="bg-gray-800 text-white px-4 py-2 rounded text-sm font-medium hover:bg-gray-900">
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;