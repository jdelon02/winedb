import React, { useState, useEffect, useRef } from 'react';
import { Button, Spinner, Alert, Form } from 'react-bootstrap';
import { useWineContext } from '../context/WineContext';
import { Wine } from '../context/types';
// Type import - will use the declaration file we created
import type Quagga from 'quagga';

// QuaggaJS will be imported dynamically to reduce initial bundle size
let QuaggaInstance: typeof Quagga | null = null;

interface CameraScannerProps {
  onScanComplete?: (wine: Wine) => void;
  onClose: () => void;
}

const CameraScanner: React.FC<CameraScannerProps> = ({ onScanComplete, onClose }) => {
  const [initializing, setInitializing] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [scanning, setScanning] = useState(false);
  const [cameraPermission, setCameraPermission] = useState<boolean | null>(null);
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [lastResults, setLastResults] = useState<any[]>([]);

  const scannerRef = useRef<HTMLDivElement>(null);
  const { wineService, refreshCollection } = useWineContext();

  // Load QuaggaJS dynamically
  useEffect(() => {
    const loadQuagga = async () => {
      try {
        setLoading(true);
        // Dynamic import of QuaggaJS
        const QuaggaModule = await import('quagga');
        QuaggaInstance = QuaggaModule.default;
        setLoading(false);
        // Initialize devices after Quagga is loaded
        initializeDevices();
      } catch (err) {
        console.error('Failed to load barcode scanning library:', err);
        setError('Failed to load barcode scanning library. Please try again later.');
        setLoading(false);
        setInitializing(false);
      }
    };

    loadQuagga();

    // Cleanup
    return () => {
      stopScanner();
    };
  }, []);

  // Initialize video devices
  const initializeDevices = async () => {
    try {
      // Check for camera permission
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      setCameraPermission(true);

      // Get available video devices
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter(device => device.kind === 'videoinput');
      setDevices(videoDevices);

      // Select the rear camera by default if available, otherwise the first camera
      const rearCamera = videoDevices.find(device =>
        device.label.toLowerCase().includes('back') ||
        device.label.toLowerCase().includes('rear')
      );

      if (rearCamera) {
        setSelectedDeviceId(rearCamera.deviceId);
      } else if (videoDevices.length > 0) {
        setSelectedDeviceId(videoDevices[0].deviceId);
      }

      // Close the test stream
      stream.getTracks().forEach(track => track.stop());

      setInitializing(false);
    } catch (err) {
      console.error('Error accessing camera:', err);
      setCameraPermission(false);
      setError('Camera access denied. Please enable camera permissions in your browser settings and try again.');
      setInitializing(false);
    }
  };

  // Start the barcode scanner
  const startScanner = () => {
    if (!scannerRef.current || !QuaggaInstance) return;

    setScanning(true);
    setError(null);
    setLastResults([]);

    QuaggaInstance.init({
      inputStream: {
        name: "Live",
        type: "LiveStream",
        target: scannerRef.current,
        constraints: {
          width: { min: 640 },
          height: { min: 480 },
          facingMode: "environment", // Prefer rear camera
          deviceId: selectedDeviceId ? { exact: selectedDeviceId } : undefined
        },
        area: { // Only scan the center area of the video
          top: "30%",
          right: "10%",
          left: "10%",
          bottom: "30%"
        },
        singleChannel: false
      },
      locator: {
        patchSize: "medium",
        halfSample: true
      },
      numOfWorkers: navigator.hardwareConcurrency ? Math.max(navigator.hardwareConcurrency - 1, 1) : 2,
      frequency: 10,
      decoder: {
        readers: [
          "ean_reader", // EAN-13 and EAN-8 (most wine bottles use EAN-13)
          "ean_8_reader",
          "upc_reader", // UPC-A and UPC-E (US products)
          "upc_e_reader",
          "code_128_reader" // CODE 128 (less common)
        ]
      },
      locate: true
    }, (err: any) => {
      if (err) {
        console.error("Scanner initialization error:", err);
        setError("Failed to initialize the scanner. Please try again or use a different camera.");
        setScanning(false);
        return;
      }

      console.log("Scanner initialized successfully");

      // Setup barcode detection callback
      QuaggaInstance!.onDetected(handleBarcodeDetected);

      // Start scanning
      QuaggaInstance!.start();
    });
  };

  // Stop the barcode scanner
  const stopScanner = () => {
    if (!QuaggaInstance) return;

    try {
      if (scanning) {
        QuaggaInstance.offDetected(handleBarcodeDetected);
        QuaggaInstance.stop();
      }
    } catch (e) {
      // Ignore errors when stopping
      console.log('Error stopping scanner:', e);
    }

    setScanning(false);
  };

  // Handle barcode detection with confidence tracking
  const handleBarcodeDetected = async (result: Quagga.QuaggaResult) => {
    // Only process if we have a valid result
    if (result.codeResult && result.codeResult.code) {
      // Get the barcode
      const barcode = result.codeResult.code;

      // Keep track of the last few results to ensure consistency
      setLastResults(prev => {
        const newResults = [...prev, barcode].slice(-5); // Keep last 5 results

        // Check if we have at least 3 matching results
        const counts: { [key: string]: number } = {};
        let maxCount = 0;
        let mostFrequent = '';

        newResults.forEach(code => {
          counts[code] = (counts[code] || 0) + 1;
          if (counts[code] > maxCount) {
            maxCount = counts[code];
            mostFrequent = code;
          }
        });

        // If we have at least 3 matching results, process the barcode
        if (maxCount >= 3) {
          console.log("Consistent barcode detected:", mostFrequent);
          processBarcodeResult(mostFrequent);
          return []; // Clear results after processing
        }

        return newResults;
      });
    }
  };

  // Process a confirmed barcode
  const processBarcodeResult = async (barcode: string) => {
    // Stop scanner to prevent multiple detections
    stopScanner();

    try {
      setLoading(true);
      // Process the scanned barcode
      const wine = await wineService.scanBarcode(barcode);

      // Update the collection
      await refreshCollection();

      // Notify parent component
      if (onScanComplete) {
        onScanComplete(wine);
      }
    } catch (err) {
      console.error("Error processing barcode:", err);
      setError(`Error: ${err instanceof Error ? err.message : "Failed to process barcode"}`);
      setScanning(false);
    } finally {
      setLoading(false);
    }
  };

  // Switch camera
  const handleDeviceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const deviceId = e.target.value;
    setSelectedDeviceId(deviceId);

    // Restart scanner with new device if already scanning
    if (scanning) {
      stopScanner();
      // Small delay to ensure camera switch happens cleanly
      setTimeout(() => {
        startScanner();
      }, 300);
    }
  };

  // If still loading QuaggaJS
  if (loading && !QuaggaInstance) {
    return (
      <div className="text-center py-4">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading scanner...</span>
        </Spinner>
        <p className="mt-3">Loading scanner components...</p>
      </div>
    );
  }

  // If still initializing
  if (initializing) {
    return (
      <div className="text-center py-4">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Initializing camera...</span>
        </Spinner>
        <p className="mt-3">Initializing camera...</p>
      </div>
    );
  }

  // If camera permission was denied
  if (cameraPermission === false) {
    return (
      <div className="py-4">
        <Alert variant="danger">
          <Alert.Heading>Camera Access Required</Alert.Heading>
          <p>
            Please allow camera access to use the barcode scanner.
            You may need to check your browser settings and refresh the page.
          </p>
        </Alert>
        <Button variant="secondary" onClick={onClose} className="mt-2">
          Back to Manual Entry
        </Button>
      </div>
    );
  }

  return (
    <div className="camera-scanner-container">
      <div className="scanner-header mb-3">
        <h3>Camera Scanner</h3>
        {devices.length > 1 && (
          <Form.Group className="mb-3">
            <Form.Label htmlFor="cameraSelect">Select Camera:</Form.Label>
            <Form.Select 
              id="cameraSelect" 
              value={selectedDeviceId}
              onChange={handleDeviceChange}
              disabled={scanning}
              aria-label="Select camera device"
            >
              {devices.map(device => (
                <option key={device.deviceId} value={device.deviceId}>
                  {device.label || `Camera ${devices.indexOf(device) + 1}`}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
        )}
      </div>

      {error && (
        <Alert variant="danger" onClose={() => setError(null)} dismissible>
          {error}
        </Alert>
      )}

      <div 
        ref={scannerRef} 
        className="scanner-viewfinder mb-3"
        style={{ 
          position: 'relative',
          width: '100%',
          height: '320px',
          overflow: 'hidden',
          backgroundColor: '#000',
          borderRadius: '8px'
        }}
      >
        {/* Custom scanner overlay with targeting rectangle */}
        {scanning && (
          <div 
            style={{
              position: 'absolute',
              top: '30%',
              left: '10%',
              right: '10%',
              bottom: '30%',
              border: '2px solid #007bff',
              borderRadius: '4px',
              zIndex: 2,
              pointerEvents: 'none',
              boxShadow: '0 0 0 2000px rgba(0, 0, 0, 0.3)'
            }}
          />
        )}

        {!scanning && !loading && (
          <div 
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              background: 'rgba(0, 0, 0, 0.7)',
              color: 'white',
              zIndex: 2
            }}
          >
            <div className="text-center">
              <p>Camera preview will appear here</p>
              <Button 
                variant="primary" 
                onClick={startScanner}
                disabled={scanning || loading}
              >
                Start Camera
              </Button>
            </div>
          </div>
        )}

        {loading && (
          <div 
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              background: 'rgba(0, 0, 0, 0.7)',
              color: 'white',
              zIndex: 3
            }}
          >
            <div className="text-center">
              <Spinner animation="border" role="status" variant="light">
                <span className="visually-hidden">Processing...</span>
              </Spinner>
              <p className="mt-2">Processing barcode...</p>
            </div>
          </div>
        )}
      </div>

      <div className="d-flex justify-content-between">
        {scanning ? (
          <Button 
            variant="danger" 
            onClick={stopScanner}
            className="me-2"
            disabled={loading}
          >
            Stop Scanner
          </Button>
        ) : (
          <Button 
            variant="primary" 
            onClick={startScanner}
            className="me-2"
            disabled={!cameraPermission || loading}
          >
            Start Scanner
          </Button>
        )}

        <Button 
          variant="outline-secondary" 
          onClick={onClose}
          disabled={loading}
        >
          Back to Manual Entry
        </Button>
      </div>

      <div className="scanner-instructions mt-4">
        <p className="text-muted">
          <small>
            Hold the wine bottle's barcode in front of your camera. 
            Keep it steady and ensure good lighting for best results.
            Center the barcode within the highlighted area.
          </small>
        </p>
      </div>
    </div>
  );
};

export default CameraScanner;