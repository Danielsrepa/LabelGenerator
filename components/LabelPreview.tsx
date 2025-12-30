import React, { useEffect, useRef } from 'react';
import JsBarcode from 'jsbarcode';
import { LabelData, AppSettings, LayoutConfig } from '../types';

interface Props {
  data: LabelData;
  settings: AppSettings;
  layout: LayoutConfig;
}

const LabelPreview: React.FC<Props> = ({ data, settings, layout }) => {
  const barcodeRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (data.BarcodeText && barcodeRef.current) {
      try {
        JsBarcode(barcodeRef.current, data.BarcodeText, {
          format: "CODE128",
          displayValue: false,
          height: 50,
          width: 2,
          margin: 0,
          background: 'transparent'
        });
      } catch (e) {
        console.error("Invalid barcode", e);
      }
    }
  }, [data.BarcodeText]);

  const PT_TO_PX = 96 / 72;

  // Keep the same *visual* size you had before:
  // previously you used 1.5 while treating pt as px,
  // so compensate by dividing by PT_TO_PX.
  const PREVIEW_SCALE = 1.5 / PT_TO_PX;

  const scale = PT_TO_PX * PREVIEW_SCALE;

  const widthPx = layout.pageWidth * scale;
  const heightPx = layout.pageHeight * scale;
  const s = (val: number) => val * scale;

  const textStyle = {
    fontFamily: 'Helvetica, Arial, sans-serif',
    lineHeight: 1, 
    position: 'absolute' as const,
  };

  const emailToDisplay = data.Email || settings.email;

  return (
    <div 
      className="bg-white text-black shadow-lg relative overflow-hidden border border-gray-200 mx-auto box-border"
      style={{ width: widthPx, height: heightPx }}
    >
      {/* --- LOGOS --- */}
      <div 
        style={{ 
          ...textStyle,
          top: s(layout.logoTopY), 
          left: s(layout.logoMargin), 
          height: s(layout.logoHeight),
          display: 'flex',
          alignItems: 'flex-start'
        }}
      >
         {settings.logoLeft ? (
            <img src={settings.logoLeft} alt="Made in Europe" className="h-full w-auto object-contain" />
         ) : (
            <div className="h-full w-24 bg-gray-200 flex items-center justify-center text-[10px] text-gray-500">Logo L</div>
         )}
      </div>

      <div 
        style={{ 
          ...textStyle,
          top: s(layout.logoTopY), 
          right: s(layout.logoMargin), 
          height: s(layout.logoHeight),
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-end'
        }}
      >
         {settings.logoRight ? (
            <img src={settings.logoRight} alt="Repa" className="h-full w-auto object-contain" />
         ) : (
            <div className="h-full w-12 bg-gray-200 flex items-center justify-center text-[10px] text-gray-500">Logo R</div>
         )}
      </div>

      {/* Email */}
      <div
        style={{
          ...textStyle,
          top: s(layout.emailTopY),
          right: s(layout.logoMargin),
          fontSize: s(layout.emailFontSize),
          textAlign: 'right'
        }}
      >
        {emailToDisplay}
      </div>

      {/* --- CONTENT --- */}
      <div
        className="truncate"
        style={{
          ...textStyle,
          top: s(layout.titleTopY),
          left: s(layout.titleLeftMargin),
          width: widthPx - s(layout.titleLeftMargin * 2), 
          fontSize: s(layout.titleFontSize),
          fontWeight: 'bold',
        }}
      >
        {data.Title}
      </div>

      {data.ColorLine && (
        <div
          className="truncate"
          style={{
            ...textStyle,
            top: s(layout.colorLineTopY),
            left: s(layout.colorLineLeftMargin),
            width: widthPx - s(layout.colorLineLeftMargin * 2),
            fontSize: s(layout.colorLineFontSize),
          }}
        >
          {data.ColorLine}
        </div>
      )}

      {data.BarcodeText && (
        <div
          style={{
            ...textStyle,
            top: s(layout.barcodeTopY),
            left: (widthPx - s(layout.barcodeWidth)) / 2,
            width: s(layout.barcodeWidth),
            height: s(layout.barcodeHeight),
            display: 'flex',
            justifyContent: 'center'
          }}
        >
           <svg ref={barcodeRef} className="w-full h-full" preserveAspectRatio="none" />
        </div>
      )}
      {data.BarcodeText && (
        <div
           style={{
             ...textStyle,
             top: s(layout.barcodeTopY + layout.barcodeHeight + 2),
             width: '100%',
             textAlign: 'center',
             fontSize: s(layout.barcodeTextFontSize),
           }}
        >
          {data.BarcodeText}
        </div>
      )}

      {/* --- FOOTER --- */}
      <div
        style={{
          ...textStyle,
          top: s(layout.modelTopY),
          left: s(layout.modelLeftMargin),
          fontSize: s(layout.modelFontSize),
          fontWeight: 'bold'
        }}
      >
        {data.Model}
      </div>

      <div 
        className="pointer-events-none"
        style={{
           ...textStyle,
           top: 0, 
           right: 0, 
           width: '100%',
           height: '100%',
           background: 'transparent'
        }}
      >
         {data.SizeInch && (
           <div
             style={{
               position: 'absolute',
               top: s(layout.sizeInchTopY),
               right: s(layout.sizeRightMargin),
               fontSize: s(layout.sizeFontSize),
               fontWeight: 'bold',
               lineHeight: 1
             }}
           >
             {data.SizeInch}
           </div>
         )}
         {data.SizeMM && (
           <div
             style={{
               position: 'absolute',
               top: s(layout.sizeMmTopY),
               right: s(layout.sizeRightMargin),
               fontSize: s(layout.sizeFontSize),
               fontWeight: 'bold',
               lineHeight: 1
             }}
           >
             {data.SizeMM}
           </div>
         )}
      </div>

    </div>
  );
};

export default LabelPreview;