import * as XLSX from 'xlsx';
import { LabelData } from '../types';

export const parseExcelFile = async (file: File): Promise<LabelData[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        
        // Parse raw data
        const jsonData = XLSX.utils.sheet_to_json(sheet);

        // Map and validate to LabelData structure
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
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = (error) => reject(error);
    reader.readAsBinaryString(file);
  });
};