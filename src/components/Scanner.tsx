import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Form, Button, InputGroup, Alert, ButtonGroup } from 'react-bootstrap';
import { useWineContext } from '../context/WineContext';
import { Wine } from '../context/types';
import CameraScanner from './CameraScanner';

interface ScannerProps {
  onScanComplete?: (wine: Wine) => void;
}

const Scanner: React.FC<ScannerProps> = ({ onScanComplete }) => {
  const [barcode, setBarcode] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [scanMode, setScanMode] = useState<'manual' | 'usb' | 'camera'>('usb'); // Add camera mode
  const [showCameraScanner, setShowCameraScanner] = useState(false);
  const { wineService, refreshCollection } = useWineContext();
  
  const inputRef = useRef<HTMLInputElement>(null);
  const barcodeBuffer = useRef('');
  const timeoutRef = useRef<number | null>(null);
  
  // Flag to track if scanner is enabled
  const scannerEnabled = scanMode === 'usb';

  // Process barcode data
  const processBarcode = useCallback(async (code: string) => {
    if (!code || code.trim() === '') {
      setError('Please enter a valid barcode');
      return;
    }

    setBarcode(code);
    setIsScanning(true);
    setError(null);

    try {
      const wine = await wineService.scanBarcode(code);
      
      // Notify parent component
      if (onScanComplete) {
        onScanComplete(wine);
      }

      // Refresh collection
      await refreshCollection();
      
      // Reset form
      setBarcode('');
      setIsScanning(false);
      
      // Reset barcodeBuffer
      barcodeBuffer.current = '';
      
      // Focus input for next scan
      if (inputRef.current && scanMode === 'manual') {
        inputRef.current.focus();
      }
    } catch (err) {
      console.error('Error scanning barcode:', err);
      setError(err instanceof Error ? err.message : 'Failed to process barcode');
      setIsScanning(false);
    }
  }, [onScanComplete, refreshCollection, scanMode, wineService]);

  // Handle keydown events for barcode scanner
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    // Detect if this is coming from a barcode scanner
    // Barcode scanners usually send data rapidly with a final Enter key
    if (e.key !== 'Enter') {
      // Add character to buffer
      barcodeBuffer.current += e.key;
      
      // Clear previous timeout
      if (timeoutRef.current !== null) {
        window.clearTimeout(timeoutRef.current);
      }
      
      // Set new timeout - if no more keys within 50ms, consider it manual typing
      timeoutRef.current = window.setTimeout(() => {
        // If too slow between keystrokes, probably not a scanner
        if (barcodeBuffer.current.length < 5) { // Arbitrary threshold
          barcodeBuffer.current = '';
        }
      }, 50);
    } else {
      // Enter key pressed - process the complete barcode
      if (barcodeBuffer.current.length > 0) {
        processBarcode(barcodeBuffer.current);
        barcodeBuffer.current = '';
        e.preventDefault(); // Prevent form submission
      }
    }
  }, [processBarcode]);

  // Clear barcode input buffer
  const clearBarcodeInput = useCallback(() => {
    barcodeBuffer.current = '';
    if (timeoutRef.current !== null) {
      window.clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  // Listen for barcode scanner events
  useEffect(() => {
    if (!scannerEnabled) return;

    // Perform input capturing
    window.addEventListener('keydown', handleKeyDown);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      clearBarcodeInput();
    };
  }, [scannerEnabled, handleKeyDown, clearBarcodeInput, processBarcode]);

  // Handle scan mode changes
  useEffect(() => {
    if (scanMode === 'camera') {
      setShowCameraScanner(true);
    } else {
      setShowCameraScanner(false);
    }
    
    // Focus input for manual mode
    if (scanMode === 'manual' && inputRef.current) {
      inputRef.current.focus();
    }
  }, [scanMode]);

  // Handle manual form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await processBarcode(barcode);
  };

  // Handle camera scan detection
  const handleCameraDetection = (detectedCode: string) => {
    processBarcode(detectedCode);
  };

  return (
    <div className="scanner-container" aria-live="polite">
      <h2>Wine Scanner</h2>
      
      {error && (
        <Alert variant="danger" dismissible onClose={() => setError(null)}>
          {error}
        </Alert>
      )}
      
      <ButtonGroup className="mb-3 w-100">
        <Button 
          variant={scanMode === 'usb' ? 'primary' : 'outline-primary'}
          onClick={() => setScanMode('usb')}
          aria-pressed={scanMode === 'usb'}
        >
          USB Scanner
        </Button>
        <Button 
          variant={scanMode === 'camera' ? 'primary' : 'outline-primary'}
          onClick={() => setScanMode('camera')}
          aria-pressed={scanMode === 'camera'}
        >
          Camera Scanner
        </Button>
        <Button 
          variant={scanMode === 'manual' ? 'primary' : 'outline-primary'}
          onClick={() => setScanMode('manual')}
          aria-pressed={scanMode === 'manual'}
        >
          Manual Entry
        </Button>
      </ButtonGroup>
      
      {scanMode === 'manual' && (
        <Form onSubmit={handleSubmit}>
          <InputGroup className="mb-3">
            <Form.Control
              ref={inputRef}
              type="text"
              value={barcode}
              onChange={(e) => setBarcode(e.target.value)}
              placeholder="Enter barcode manually"
              disabled={isScanning}
              aria-label="Barcode input"
            />
            <Button 
              variant="primary" 
              type="submit" 
              disabled={isScanning || !barcode} 
              aria-label="Scan barcode"
            >
              {isScanning ? 'Processing...' : 'Scan'}
            </Button>
          </InputGroup>
        </Form>
      )}
      
      {scanMode === 'usb' && (
        <div className="scanner-status mt-3" aria-live="polite">
          <p>
            Ready for USB scanner. Simply scan a barcode to begin.
          </p>
          <p className="text-muted">
            <small>
              The scanner will automatically detect and process barcodes from a USB barcode scanner.
              No need to click any buttons.
            </small>
          </p>
          {isScanning && <p>Scanning... Please wait.</p>}
        </div>
      )}
      
      <CameraScanner
        isShowing={showCameraScanner}
        onDetected={handleCameraDetection}
        onClose={() => setScanMode('usb')}
      />
    </div>
  );
};

export default Scanner;