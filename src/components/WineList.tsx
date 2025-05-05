import React from 'react';
import { useWine } from '../contexts/WineContext';
import { ErrorBoundary } from './ErrorBoundary';
import { Card, Row, Col, Spinner, Alert, Button } from 'react-bootstrap';
import { RefreshIcon } from '../icons/RefreshIcon';
import { Link } from 'react-router-dom';

export const WineList: React.FC = () => {
    const { wines, isLoading, error, refreshCollection } = useWine();

    return (
        <ErrorBoundary>
            <section aria-labelledby="collection-heading">
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <h2 id="collection-heading">Your Wine Collection</h2>
                    <Button 
                        onClick={() => refreshCollection()} 
                        variant="outline-primary"
                        disabled={isLoading}
                        aria-label="Refresh collection"
                    >
                        <RefreshIcon className={isLoading ? 'spin' : ''} />
                    </Button>
                </div>

                {error && (
                    <Alert variant="danger" dismissible>
                        {error.message}
                    </Alert>
                )}

                {isLoading && (
                    <div className="text-center p-4" aria-live="polite">
                        <Spinner animation="border" role="status">
                            <span className="visually-hidden">Loading wine collection...</span>
                        </Spinner>
                    </div>
                )}

                {!isLoading && wines.length === 0 && (
                    <Alert variant="info">
                        No wines in your collection yet. Start scanning!
                    </Alert>
                )}

                {!isLoading && wines.length > 0 && (
                    <Row xs={1} md={2} lg={3} className="g-4">
                        {wines.map(wine => (
                            <Col key={wine.id}>
                                <Link 
                                    to={`/wine/${wine.id}`}
                                    className="text-decoration-none"
                                >
                                    <Card className="h-100 hover-shadow">
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
                                                <dt>Added</dt>
                                                <dd>{new Date(wine.created_at).toLocaleDateString()}</dd>
                                            </dl>
                                        </Card.Body>
                                    </Card>
                                </Link>
                            </Col>
                        ))}
                    </Row>
                )}
            </section>
        </ErrorBoundary>
    );
};