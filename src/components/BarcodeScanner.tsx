import React, { useEffect, useRef } from 'react';
import { Html5Qrcode, Html5QrcodeScannerState } from 'html5-qrcode';

interface BarcodeScannerProps {
  onScan: (barcode: string) => void;
  onError?: (error: string) => void;
}

export const BarcodeScanner: React.FC<BarcodeScannerProps> = ({ onScan, onError }) => {
  const scannerRef = useRef<Html5Qrcode | null>(null);

  useEffect(() => {
    if (!scannerRef.current) {
      scannerRef.current = new Html5Qrcode('reader');
    }

    const scanner = scannerRef.current;

    const startScanning = async () => {
      try {
        await scanner.start(
          { facingMode: "environment" },
          {
            fps: 10,
            qrbox: { width: 250, height: 250 }
          },
          (decodedText: string) => {
            onScan(decodedText);
          },
          (errorMessage: string) => {
            onError?.(errorMessage);
          }
        );
      } catch (err) {
        onError?.(err instanceof Error ? err.message : 'Failed to start scanner');
      }
    };

    startScanning();

    return () => {
      if (scanner?.getState() === Html5QrcodeScannerState.SCANNING) {
        scanner.stop().catch(console.error);
      }
    };
  }, [onScan, onError]);

  return <div id="reader" className="scanner-container" />;
};