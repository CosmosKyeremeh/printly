'use client';

import { useRef } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { Download, QrCode } from 'lucide-react';
import { siteConfig } from '@/config/site';

export function PrintlyQRCode() {
  const canvasRef = useRef<HTMLDivElement>(null);
  const url = siteConfig.url;

  function handleDownload() {
    const canvas = canvasRef.current?.querySelector('canvas');
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = 'printly-qrcode.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
  }

  return (
    <div className="rounded-2xl border p-5"
      style={{ background: '#0f0c06', borderColor: '#6a4920' }}>

      <div className="flex items-center gap-2 mb-4">
        <QrCode className="w-4 h-4" style={{ color: '#cca152' }} />
        <p className="text-sm font-medium" style={{ color: '#e9cb93' }}>
          Printly QR Code
        </p>
      </div>

      <p className="text-xs mb-4 leading-relaxed" style={{ color: '#6a4920' }}>
        Students can scan this to open Printly on their phone. Print it and
        put it on your classroom door or WhatsApp group.
      </p>

      {/* QR Code */}
      <div ref={canvasRef}
        className="flex items-center justify-center rounded-xl p-4 mb-4"
        style={{ background: '#ffffff' }}>
        <QRCodeCanvas
          value={url}
          size={180}
          level="H"
          includeMargin={false}
          imageSettings={{
            src: '/favicon_io/apple-touch-icon.png',
            height: 32,
            width: 32,
            excavate: true,
          }}
        />
      </div>

      <p className="text-xs text-center mb-4 font-mono"
        style={{ color: '#93682c' }}>
        {url}
      </p>

      <button
        onClick={handleDownload}
        className="w-full h-10 rounded-xl text-xs font-medium flex items-center justify-center gap-2 border transition-all"
        style={{
          background: '#1a1409',
          borderColor: '#6a4920',
          color: '#cca152',
        }}
      >
        <Download className="w-3.5 h-3.5" />
        Download as PNG
      </button>
    </div>
  );
}