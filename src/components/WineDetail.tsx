import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useWine } from '../contexts/WineContext';
import { Card, Button, Spinner, Alert } from 'react-bootstrap';
import { Wine } from '../repositories/types';

export const WineDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { wineService, isLoading } = useWine();
    const [wine, setWine] = useState<Wine | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadWine = async () => {
            try {
                if (!id) throw new Error('Wine ID is required');
                const wineData = await wineService.getWineById(id);
                if (!wineData) throw new Error('Wine not found');
                setWine(wineData);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to load wine details');
            }
        };
        loadWine();
    }, [id, wineService]);

    if (isLoading) {
        return (
            <div className="text-center p-4">
                <Spinner animation="border" role="status">
                    <span className="visually-hidden">Loading wine details...</span>
                </Spinner>
            </div>
        );
    }

    if (error) {
        return <Alert variant="danger">{error}</Alert>;
    }

    if (!wine) {
        return <Alert variant="warning">Wine not found</Alert>;
    }

    return (
        <div>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2>{wine.name}</h2>
                <Button 
                    variant="outline-primary" 
                    onClick={() => navigate(-1)}
                    aria-label="Back to collection"
                >
                    Back to Collection
                </Button>
            </div>
            <Card>
                <Card.Body>
                    <dl>
                        <dt>Barcode</dt>
                        <dd>{wine.barcode}</dd>
                        
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
                        
                        <dt>Last Updated</dt>
                        <dd>{new Date(wine.updated_at).toLocaleDateString()}</dd>
                    </dl>
                </Card.Body>
            </Card>
        </div>
    );
};