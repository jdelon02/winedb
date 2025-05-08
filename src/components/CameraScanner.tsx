import React, { useState, useEffect, useRef, useCallback } from 'react';
import Quagga from 'quagga';
import { Button, Modal, Form, Alert, Spinner } from 'react-bootstrap';
import { normalizeBarcode } from '../utils/barcodeUtils';

interface CameraScannerProps {
  onDetected: (barcode: string) => void;
  isShowing: boolean;
  onClose: () => void;
}

interface CameraDevice {
  deviceId: string;
  label: string;
}

const CameraScanner: React.FC<CameraScannerProps> = ({ onDetected, isShowing, onClose }) => {
  const [cameras, setCameras] = useState<CameraDevice[]>([]);
  const [selectedCamera, setSelectedCamera] = useState<string>('');
  const [isInitialized, setIsInitialized] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [confidenceThreshold] = useState<number>(0.7);
  const [scanCount, setScanCount] = useState<number>(0);
  // Track results for confidence thresholds
  const resultsBuffer = useRef<Set<string>>(new Set());
  const viewfinderRef = useRef<HTMLDivElement>(null);
  // Track if component is mounted to avoid state updates after unmount
  const isMounted = useRef<boolean>(true);

  // Define stopScanner BEFORE the useEffect that depends on it
  // Stop the scanner
  const stopScanner = useCallback(() => {
    if (isInitialized) {
      Quagga.stop();
      setIsInitialized(false);
      resultsBuffer.current.clear();
      setScanCount(0);
    }
  }, [isInitialized]);

  // Initialize the scanner when the component mounts
  useEffect(() => {
    isMounted.current = true;
    // List available cameras
    if (isShowing) {
      listCameras();
    }
    
    return () => {
      isMounted.current = false;
      // Stop scanner when unmounting
      stopScanner();
    };
  }, [isShowing, stopScanner]); // Added stopScanner as dependency

  // Start or stop scanner when selectedCamera changes
  useEffect(() => {
    if (selectedCamera && isShowing) {
      startScanner();
    } else if (isInitialized) {
      stopScanner();
    }
    
    // Cleanup function to stop scanner when unmounting or when dependencies change
    return () => {
      if (isInitialized) {
        stopScanner();
      }
    };
  }, [selectedCamera, isShowing, stopScanner, isInitialized]); // Added isInitialized as dependency

  // Get list of available cameras
  const listCameras = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter(device => device.kind === 'videoinput');
      
      if (videoDevices.length === 0) {
        setError('No cameras found on your device');
        setIsLoading(false);
        return;
      }

      const mappedCameras = videoDevices.map(device => ({
        deviceId: device.deviceId,
        label: device.label || `Camera ${videoDevices.indexOf(device) + 1}`
      }));
      
      if (isMounted.current) {
        setCameras(mappedCameras);
        
        // Auto-select rear camera if available, otherwise first camera
        const rearCamera = mappedCameras.find(camera => 
          camera.label.toLowerCase().includes('back') || 
          camera.label.toLowerCase().includes('rear')
        );
        
        setSelectedCamera(rearCamera ? rearCamera.deviceId : mappedCameras[0].deviceId);
        setIsLoading(false);
      }
    } catch (err) {
      if (isMounted.current) {
        setError('Error accessing cameras. Please check permissions.');
        setIsLoading(false);
        console.error('Camera access error:', err);
      }
    }
  };

  // Initialize and start the barcode scanner
  const startScanner = () => {
    if (!selectedCamera || !viewfinderRef.current) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      Quagga.init({
        inputStream: {
          name: "Live",
          type: "LiveStream",
          target: viewfinderRef.current,
          constraints: {
            width: 640,
            height: 480,
            facingMode: "environment",
            deviceId: selectedCamera
          },
        },
        decoder: {
          readers: [
            "ean_reader",
            "ean_8_reader",
            "upc_reader",
            "upc_e_reader",
            "code_128_reader"
          ],
          debug: {
            showCanvas: true,
            showPatches: true,
            showFoundPatches: true,
            showSkeleton: true,
            showLabels: true,
            showPatchLabels: true,
            showRemainingPatchLabels: true,
          }
        },
        locate: true,
        frequency: 10
      }, (err) => {
        if (err) {
          if (isMounted.current) {
            setError(`Scanner initialization error: ${err}`);
            setIsLoading(false);
          }
          return;
        }
        
        if (isMounted.current) {
          setIsInitialized(true);
          setIsLoading(false);
          
          Quagga.start();
          
          Quagga.onDetected(handleDetection);
        }
      });
    } catch (err) {
      if (isMounted.current) {
        setError(`Scanner error: ${err}`);
        setIsLoading(false);
      }
    }
  };

  // Handle a successful barcode detection
  const handleDetection = (result: any) => {
    const code = result.codeResult.code;
    const confidence = result.codeResult.confidence;
    
    console.log(`Detected barcode: ${code} (confidence: ${confidence})`);
    
    if (!code) return;
    
    // Add to results buffer for confidence check
    if (confidence > confidenceThreshold) {
      resultsBuffer.current.add(code);
      setScanCount(prev => prev + 1);
      
      // If we get multiple consistent scans, consider it a valid detection
      if (resultsBuffer.current.size === 1 && scanCount >= 2) {
        const normalizedCode = normalizeBarcode(code);
        if (normalizedCode) {
          onDetected(normalizedCode);
          stopScanner();
          onClose();
        }
      } else if (resultsBuffer.current.size > 1) {
        // If we get inconsistent results, clear and start over
        resultsBuffer.current.clear();
        setScanCount(0);
      }
    }
  };

  const handleCameraChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCamera(e.target.value);
  };

  const handleTryAgain = () => {
    setError(null);
    listCameras();
  };

  return (
    <Modal show={isShowing} onHide={onClose} centered backdrop="static" size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Scan Barcode</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {error ? (
          <Alert variant="danger">
            <Alert.Heading>Scanner Error</Alert.Heading>
            <p>{error}</p>
            <Button variant="outline-danger" onClick={handleTryAgain}>
              Try Again
            </Button>
          </Alert>
        ) : (
          <>
            <div className="camera-select-container mb-3">
              <Form.Group>
                <Form.Label>Select Camera:</Form.Label>
                <Form.Select 
                  value={selectedCamera} 
                  onChange={handleCameraChange}
                  disabled={isLoading}
                >
                  {cameras.map(camera => (
                    <option key={camera.deviceId} value={camera.deviceId}>
                      {camera.label}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </div>
            
            <div className="scanner-container" style={{ position: 'relative' }}>
              {isLoading && (
                <div className="scanner-loading" style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  backgroundColor: 'rgba(0,0,0,0.3)',
                  zIndex: 10
                }}>
                  <div className="text-center">
                    <Spinner animation="border" variant="light" />
                    <p className="text-white mt-2">Initializing camera...</p>
                  </div>
                </div>
              )}
              
              <div 
                ref={viewfinderRef} 
                className="viewport" 
                style={{
                  position: 'relative',
                  height: '300px',
                  overflow: 'hidden'
                }}
              ></div>
              
              <div className="scanner-overlay" style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                border: '2px solid #00ff00',
                boxShadow: 'inset 0 0 0 3px rgba(0,255,0,0.3)',
                pointerEvents: 'none'
              }}></div>
            </div>
            
            <div className="text-center mt-3">
              <p>Position the barcode within the green area and hold steady.</p>
            </div>
          </>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onClose}>
          Cancel
        </Button>
        <Button 
          variant="primary" 
          onClick={() => {
            stopScanner();
            onClose();
          }}
        >
          Done
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default CameraScanner;