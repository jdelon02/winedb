import React, { useEffect, useState, useCallback } from 'react';
import { useWine } from '../contexts/WineContext';
import { Wine } from '../repositories/types';
import { ErrorBoundary } from './ErrorBoundary';
import { Card, Row, Col, Spinner, Alert } from 'react-bootstrap';

export const WineList: React.FC = () => {
    const { wineService, isLoading } = useWine();
    const [wines, setWines] = useState<Wine[]>([]);
    const [error, setError] = useState<string | null>(null);

    const loadWines = useCallback(async () => {
        try {
            setError(null);
            const collection = await wineService.getWineCollection();
            setWines(collection);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load wines');
            console.error('Error loading wines:', err);
        }
    }, [wineService]);

    useEffect(() => {
        loadWines();
    }, [loadWines]);

    if (isLoading) {
        return (
            <div className="text-center p-4" aria-live="polite">
                <Spinner animation="border" role="status">
                    <span className="visually-hidden">Loading wine collection...</span>
                </Spinner>
            </div>
        );
    }

    return (
        <ErrorBoundary>
            <section aria-labelledby="collection-heading">
                <h2 id="collection-heading" className="mb-4">Your Wine Collection</h2>
                {error && (
                    <Alert variant="danger" dismissible onClose={() => setError(null)}>
                        {error}
                    </Alert>
                )}
                {!error && wines.length === 0 ? (
                    <Alert variant="info">
                        No wines in your collection yet. Start scanning!
                    </Alert>
                ) : (
                    <Row xs={1} md={2} lg={3} className="g-4">
                        {wines.map(wine => (
                            <Col key={wine.id}>
                                <Card>
                                    <Card.Body>
                                        <Card.Title>{wine.name}</Card.Title>
                                        <dl className="mb-0">
                                            {wine.vintage && (
                                                <>
                                                    <dt>Vintage</dt>
                                                    <dd>{wine.vintage}</dd>
                                                </>
                                            )}
                                            {wine.producer && (
                                                <>
                                                    <dt>Producer</dt>
                                                    <dd>{wine.producer}</dd>
                                                </>
                                            )}
                                            {wine.varietal && (
                                                <>
                                                    <dt>Varietal</dt>
                                                    <dd>{wine.varietal}</dd>
                                                </>
                                            )}
                                            {wine.rating && (
                                                <>
                                                    <dt>Rating</dt>
                                                    <dd>{wine.rating}/5</dd>
                                                </>
                                            )}
                                            <dt>Added</dt>
                                            <dd>{new Date(wine.created_at).toLocaleDateString()}</dd>
                                        </dl>
                                    </Card.Body>
                                </Card>
                            </Col>
                        ))}
                    </Row>
                )}
            </section>
        </ErrorBoundary>
    );
};