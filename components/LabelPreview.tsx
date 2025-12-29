import React, { useEffect, useRef, useState } from 'react';
import JsBarcode from 'jsbarcode';
import { LabelData, AppSettings, LayoutConfig } from '../types';

interface Props {
  data: LabelData;
  settings: AppSettings;
  layout: LayoutConfig;
}

const LabelPreview: React.FC<Props> = ({ data, settings, layout }) => {
  const barcodeRef = useRef<SVGSVGElement>(null);
  const [leftImgError, setLeftImgError] = useState(false);
  const [rightImgError, setRightImgError] = useState(false);

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

  // Reset error states when image settings change
  useEffect(() => { setLeftImgError(false); }, [settings.logoLeft]);
  useEffect(() => { setRightImgError(false); }, [settings.logoRight]);

  const PREVIEW_SCALE = 1.5; 
  const widthPx = layout.pageWidth * PREVIEW_SCALE;
  const heightPx = layout.pageHeight * PREVIEW_SCALE;
  const s = (val: number) => val * PREVIEW_SCALE;

  const textStyle = {
    fontFamily: 'Helvetica, Arial, sans-serif',
    lineHeight: 1, 
    position: 'absolute' as const,
  };

  const LogoPlaceholder = ({ text, error, url }: { text: string, error: boolean, url: string | null }) => {
    const filename = url ? url.split('/').pop() : text;
    return (
      <div className="h-full px-2 bg-gray-100 flex flex-col items-center justify-center text-[7px] text-gray-400 border border-dashed leading-tight text-center min-w-[40px]">
        <span className="font-bold">{error ? '404 NOT FOUND' : 'LOADING...'}</span>
        <span className="opacity-70 mt-1">{filename}</span>
      </div>
    );
  };

  return (
    <div 
      className="bg-white text-black shadow-lg relative overflow-hidden border border-gray-200 mx-auto box-border"
      style={{ width: widthPx, height: heightPx }}
    >
      {/* Left Logo */}
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
         {settings.logoLeft && !leftImgError ? (
            <img 
              src={settings.logoLeft} 
              alt="Left Logo" 
              className="h-full w-auto object-contain" 
              onError={() => setLeftImgError(true)}
              crossOrigin="anonymous"
            />
         ) : (
            <LogoPlaceholder text="logo-left.png" error={leftImgError} url={settings.logoLeft} />
         )}
      </div>

      {/* Right Logo */}
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
         {settings.logoRight && !rightImgError ? (
            <img 
              src={settings.logoRight} 
              alt="Right Logo" 
              className="h-full w-auto object-contain" 
              onError={() => setRightImgError(true)}
              crossOrigin="anonymous"
            />
         ) : (
            <LogoPlaceholder text="logo-right.png" error={rightImgError} url={settings.logoRight} />
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
        order@repamarket.eu
      </div>

      {/* Title */}
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

      {/* ColorLine */}
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

      {/* Barcode */}
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

      {/* Model */}
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

      {/* Sizes */}
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