import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Button, Container, Row, Col, Spinner, Toast, Form, Badge, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { useWineContext } from '../context/WineContext';
import { Wine } from '../context/types';
import ErrorBoundary from './ErrorBoundary';
import Scanner from './Scanner';

const WineList: React.FC = () => {
  const { wines, isLoading, refreshCollection, notification, hideNotification, wineService } = useWineContext();
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredWines, setFilteredWines] = useState<Wine[]>([]);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const navigate = useNavigate();

  // Filter wines based on search term
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredWines(wines);
      return;
    }

    const lowercasedSearch = searchTerm.toLowerCase();
    const filtered = wines.filter((wine: Wine) => 
      wine.name.toLowerCase().includes(lowercasedSearch) ||
      (wine.producer && wine.producer.toLowerCase().includes(lowercasedSearch)) ||
      (wine.varietal && wine.varietal.toLowerCase().includes(lowercasedSearch)) ||
      (wine.vintage && wine.vintage.toLowerCase().includes(lowercasedSearch))
    );
    
    setFilteredWines(filtered);
  }, [wines, searchTerm]);

  // Navigate to wine detail page
  const handleWineClick = (id: string) => {
    navigate(`/wine/${id}`);
  };

  // Handle manual refresh
  const handleRefresh = async () => {
    await refreshCollection();
  };

  // Handle scan completion
  const handleScanComplete = (wine: Wine) => {
    // Navigate to the newly scanned wine
    navigate(`/wine/${wine.id}`);
  };

  // Quick consume function - decrement bottle count
  const handleQuickConsume = async (e: React.MouseEvent, wine: Wine) => {
    e.stopPropagation(); // Prevent navigating to wine detail
    
    if (processingId === wine.id) return; // Prevent multiple clicks
    
    setProcessingId(wine.id);
    
    try {
      if (!wine.quantity || wine.quantity <= 1) {
        // Show delete confirmation if it's the last bottle
        if (window.confirm(`This is your last bottle of "${wine.name}". Do you want to remove it from your collection?`)) {
          await wineService.deleteWine(wine.id);
          await refreshCollection();
        }
      } else {
        // Decrement quantity
        const updatedWine = {
          ...wine,
          quantity: wine.quantity - 1,
          updated_at: new Date().toISOString()
        };
        
        await wineService.updateWine(updatedWine);
        await refreshCollection();
      }
    } catch (error) {
      console.error('Error consuming wine:', error);
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <ErrorBoundary>
      <Container className="py-4">
        <h1 className="mb-4">Wine Collection</h1>
        
        <Scanner onScanComplete={handleScanComplete} />
        
        <div className="d-flex justify-content-between align-items-center my-4">
          <h2 className="h4 mb-0">Your Wines</h2>
          <Button 
            variant="outline-primary" 
            onClick={handleRefresh} 
            disabled={isLoading}
            aria-label="Refresh wine list"
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
                Refreshing...
              </>
            ) : (
              'Refresh'
            )}
          </Button>
        </div>
        
        <Form.Group className="mb-4">
          <Form.Control
            type="text"
            placeholder="Search wines by name, producer, varietal..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            aria-label="Search wines"
          />
        </Form.Group>
        
        {isLoading && wines.length === 0 ? (
          <div className="text-center py-5">
            <Spinner animation="border" role="status">
              <span className="visually-hidden">Loading...</span>
            </Spinner>
            <p className="mt-3">Loading your wine collection...</p>
          </div>
        ) : filteredWines.length === 0 ? (
          <div className="text-center py-5">
            <p>No wines found {searchTerm ? 'matching your search' : 'in your collection'}.</p>
            {searchTerm && (
              <Button variant="link" onClick={() => setSearchTerm('')}>
                Clear search
              </Button>
            )}
            {!searchTerm && (
              <p>Use the scanner above to add wines to your collection.</p>
            )}
          </div>
        ) : (
          <Row xs={1} md={2} lg={3} className="g-4">
            {filteredWines.map((wine) => (
              <Col key={wine.id}>
                <Card 
                  className="h-100 wine-card" 
                  onClick={() => handleWineClick(wine.id)}
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleWineClick(wine.id);
                    }
                  }}
                  aria-label={`Wine: ${wine.name}`}
                  role="button"
                >
                  <Card.Body>
                    <div className="d-flex justify-content-between align-items-start">
                      <Card.Title>{wine.name}</Card.Title>
                      <div className="d-flex align-items-center">
                        {(wine.quantity && wine.quantity > 1) && (
                          <Badge bg="primary" pill className="me-2">
                            {wine.quantity} bottles
                          </Badge>
                        )}
                        
                        {/* Quick consume button */}
                        <OverlayTrigger
                          placement="top"
                          overlay={<Tooltip id={`tooltip-${wine.id}`}>Mark as consumed</Tooltip>}
                        >
                          <Button 
                            variant="outline-danger" 
                            size="sm"
                            onClick={(e) => handleQuickConsume(e, wine)}
                            disabled={processingId === wine.id}
                            aria-label="Mark as consumed"
                            className="quick-consume-btn"
                            style={{ minWidth: '36px' }}
                          >
                            {processingId === wine.id ? (
                              <Spinner animation="border" size="sm" />
                            ) : (
                              <span>-1</span>
                            )}
                          </Button>
                        </OverlayTrigger>
                      </div>
                    </div>
                    {wine.producer && <Card.Subtitle className="mb-2 text-muted">{wine.producer}</Card.Subtitle>}
                    <Card.Text as="div">
                      {wine.vintage && <div><strong>Vintage:</strong> {wine.vintage}</div>}
                      {wine.varietal && <div><strong>Varietal:</strong> {wine.varietal}</div>}
                      {wine.rating && <div><strong>Rating:</strong> {wine.rating}/5</div>}
                    </Card.Text>
                  </Card.Body>
                  <Card.Footer className="text-muted">
                    <small>Added: {new Date(wine.created_at).toLocaleDateString()}</small>
                  </Card.Footer>
                </Card>
              </Col>
            ))}
          </Row>
        )}
        
        {/* Toast notification */}
        {notification && (
          <Toast 
            show={notification.show} 
            onClose={hideNotification}
            style={{ 
              position: 'fixed', 
              bottom: '20px', 
              right: '20px',
              zIndex: 1000 
            }}
            delay={5000}
            autohide
            animation
          >
            <Toast.Header>
              <strong className="me-auto">Notification</strong>
            </Toast.Header>
            <Toast.Body>{notification.message}</Toast.Body>
          </Toast>
        )}
      </Container>
    </ErrorBoundary>
  );
};

export default WineList;