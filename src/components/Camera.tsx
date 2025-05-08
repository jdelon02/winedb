import React, { useRef, useState, useCallback, useEffect } from 'react';
import { Button } from 'react-bootstrap';
import { BrowserMultiFormatReader, Result } from '@zxing/library';

interface CameraProps {
    onBarcodeDetected: (barcode: string) => void;
    onCancel: () => void;
}

export const Camera: React.FC<CameraProps> = ({ onBarcodeDetected, onCancel }) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [guidelineColor, setGuidelineColor] = useState('rgba(255, 255, 255, 0.8)');

    const startCamera = useCallback(async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
            }
        } catch (error) {
            console.error('Camera access denied:', error);
        }
    }, []);

    const startBarcodeDetection = useCallback(() => {
        if (!videoRef.current) return;

        const codeReader = new BrowserMultiFormatReader();

        codeReader.decodeFromVideoDevice(null, videoRef.current, (result: Result | null, err: Error | null) => {
            if (result) {
                setGuidelineColor('rgba(0, 255, 0, 0.8)'); // Green when barcode is detected
                onBarcodeDetected(result.getText());
                codeReader.reset();
            } else {
                setGuidelineColor('rgba(255, 255, 255, 0.8)'); // Default color
            }
        });
    }, [onBarcodeDetected]);

    useEffect(() => {
        startCamera();
        return () => {
            const currentVideo = videoRef.current;
            const stream = currentVideo?.srcObject as MediaStream | null;
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }
        };
    }, [startCamera]);

    useEffect(() => {
        if (videoRef.current) {
            startBarcodeDetection();
        }
    }, [startBarcodeDetection]);

    return (
        <div className="camera-container" style={{ position: 'relative', textAlign: 'center' }}>
            <video
                ref={videoRef}
                autoPlay
                playsInline
                style={{ width: '100%', maxWidth: '500px', borderRadius: '8px' }}
            />
            <div
                style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: '80%',
                    height: '30%',
                    border: `4px solid ${guidelineColor}`,
                    borderRadius: '8px',
                    pointerEvents: 'none',
                }}
            ></div>
            <Button
                onClick={onCancel}
                variant="secondary"
                style={{ marginTop: '1rem' }}
            >
                Cancel
            </Button>
        </div>
    );
};