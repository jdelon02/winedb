import React, { useCallback, useState } from 'react';
import { useWine } from '../contexts/WineContext';
import { ErrorBoundary } from './ErrorBoundary';
import { Form, Button, Card, Alert, Spinner } from 'react-bootstrap';

export const Scanner: React.FC = () => {
    const { wineService, isLoading, error, clearError } = useWine();
    const [input, setInput] = useState('');

    const handleScan = useCallback(async (barcode: string) => {
        try {
            clearError();
            await wineService.scanBarcode(barcode);
            setInput('');
        } catch (err) {
            console.error('Scan error:', err);
        }
    }, [wineService, clearError]);

    const handleSubmit = useCallback((event: React.FormEvent) => {
        event.preventDefault();
        if (input.trim()) {
            handleScan(input.trim());
        }
    }, [input, handleScan]);

    return (
        <ErrorBoundary>
            <Card className="mb-4">
                <Card.Header>
                    <h2>Wine Scanner</h2>
                </Card.Header>
                <Card.Body>
                    <Form onSubmit={handleSubmit}>
                        <Form.Group className="mb-3">
                            <Form.Label htmlFor="barcode-input">
                                Scan or enter barcode
                            </Form.Label>
                            <Form.Control
                                id="barcode-input"
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                disabled={isLoading}
                                isInvalid={!!error}
                                aria-describedby={error ? "scan-error" : undefined}
                                placeholder="Enter barcode number..."
                                autoFocus
                            />
                        </Form.Group>
                        {error && (
                            <Alert variant="danger" id="scan-error" onClose={clearError} dismissible>
                                {error.message}
                            </Alert>
                        )}
                        <Button 
                            type="submit" 
                            disabled={isLoading || !input.trim()}
                            variant="primary"
                        >
                            {isLoading ? (
                                <>
                                    <Spinner
                                        as="span"
                                        animation="border"
                                        size="sm"
                                        role="status"
                                        aria-hidden="true"
                                        className="me-2"
                                    />
                                    Processing...
                                </>
                            ) : (
                                'Add Wine'
                            )}
                        </Button>
                    </Form>
                </Card.Body>
            </Card>
        </ErrorBoundary>
    );
};