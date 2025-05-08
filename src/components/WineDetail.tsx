import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Spinner, Form, Modal, InputGroup } from 'react-bootstrap';
import { useWineContext } from '../context/WineContext';
import { Wine } from '../context/types';
import ErrorBoundary from './ErrorBoundary';

const WineDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const { wineService, isLoading, refreshCollection } = useWineContext();
  
  const [wine, setWine] = useState<Wine | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedWine, setEditedWine] = useState<Partial<Wine> & { id: string }>({ id: '' });
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDecrementing, setIsDecrementing] = useState(false);

  useEffect(() => {
    if (!id) return;

    const fetchWine = async () => {
      try {
        const fetchedWine = await wineService.getWineById(id);
        if (fetchedWine) {
          setWine(fetchedWine);
          setEditedWine(fetchedWine);
        } else {
          setError('Wine not found');
        }
      } catch (err) {
        console.error('Error fetching wine:', err);
        setError('Failed to load wine details');
      }
    };

    fetchWine();
  }, [id, wineService]);

  const handleBack = () => {
    navigate('/');
  };

  const handleEditToggle = () => {
    if (isEditing) {
      setEditedWine(wine || { id: '' });
    }
    setIsEditing(!isEditing);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'number') {
      setEditedWine({
        ...editedWine,
        [name]: value === '' ? undefined : Number(value)
      });
    } else {
      setEditedWine({
        ...editedWine,
        [name]: value
      });
    }
  };

  const handleSave = async () => {
    if (!editedWine) return;

    try {
      const updated = await wineService.updateWine(editedWine);
      setWine(updated);
      setIsEditing(false);
      await refreshCollection();
    } catch (err) {
      console.error('Error updating wine:', err);
      setError('Failed to update wine');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!id) return;
    
    setIsDeleting(true);
    try {
      await wineService.deleteWine(id);
      setShowDeleteModal(false);
      await refreshCollection();
      navigate('/');
    } catch (err) {
      console.error('Error deleting wine:', err);
      setError('Failed to delete wine');
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  };

  const handleQuickConsume = async () => {
    if (!wine || isDecrementing) return;
    
    setIsDecrementing(true);
    
    try {
      if (!wine.quantity || wine.quantity <= 1) {
        // Show delete confirmation if it's the last bottle
        setShowDeleteModal(true);
      } else {
        // Decrement quantity
        const updatedWine = {
          ...wine,
          quantity: wine.quantity - 1,
          updated_at: new Date().toISOString()
        };
        
        const updated = await wineService.updateWine(updatedWine);
        setWine(updated);
        await refreshCollection();
      }
    } catch (err) {
      console.error('Error consuming wine:', err);
      setError('Failed to update quantity');
    } finally {
      setIsDecrementing(false);
    }
  };

  if (isLoading && !wine) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
        <p className="mt-3">Loading wine details...</p>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="py-5">
        <div className="alert alert-danger">
          <h3>Error</h3>
          <p>{error}</p>
          <Button variant="outline-primary" onClick={handleBack}>
            Back to Collection
          </Button>
        </div>
      </Container>
    );
  }

  if (!wine) {
    return (
      <Container className="py-5">
        <div className="alert alert-warning">
          <h3>Wine Not Found</h3>
          <p>The wine you're looking for could not be found.</p>
          <Button variant="outline-primary" onClick={handleBack}>
            Back to Collection
          </Button>
        </div>
      </Container>
    );
  }

  return (
    <ErrorBoundary>
      <Container className="py-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <Button 
            variant="outline-secondary" 
            onClick={handleBack}
            aria-label="Back to collection"
          >
            &larr; Back
          </Button>
          <div>
            {!isEditing && (
              <Button
                variant="outline-danger"
                onClick={handleQuickConsume}
                className="me-2"
                disabled={isDecrementing}
                aria-label="Mark as consumed"
              >
                {isDecrementing ? (
                  <>
                    <Spinner 
                      as="span" 
                      animation="border" 
                      size="sm" 
                      role="status" 
                      aria-hidden="true" 
                      className="me-2" 
                    />
                    Updating...
                  </>
                ) : (
                  'Mark as Consumed'
                )}
              </Button>
            )}
            <Button
              variant="outline-primary"
              onClick={handleEditToggle}
              className="me-2"
              aria-label={isEditing ? "Cancel editing" : "Edit wine"}
            >
              {isEditing ? 'Cancel' : 'Edit'}
            </Button>
            {isEditing ? (
              <Button
                variant="primary"
                onClick={handleSave}
                aria-label="Save changes"
              >
                Save
              </Button>
            ) : (
              <Button
                variant="outline-danger"
                onClick={() => setShowDeleteModal(true)}
                aria-label="Delete wine"
              >
                Delete
              </Button>
            )}
          </div>
        </div>

        {isEditing ? (
          <Card>
            <Card.Header>
              <h1 className="h3">Edit Wine</h1>
            </Card.Header>
            <Card.Body>
              <Form>
                <Form.Group as={Row} className="mb-3">
                  <Form.Label column sm={3}>Barcode</Form.Label>
                  <Col sm={9}>
                    <Form.Control
                      type="text"
                      name="barcode"
                      value={editedWine.barcode || ''}
                      onChange={handleChange}
                      disabled
                    />
                    <Form.Text className="text-muted">
                      The original scanned barcode. This field cannot be edited.
                    </Form.Text>
                  </Col>
                </Form.Group>

                <Form.Group as={Row} className="mb-3">
                  <Form.Label column sm={3}>Quantity</Form.Label>
                  <Col sm={9}>
                    <InputGroup>
                      <Button 
                        variant="outline-secondary"
                        onClick={() => {
                          if ((editedWine.quantity || 0) > 1) {
                            setEditedWine({
                              ...editedWine,
                              quantity: (editedWine.quantity || 1) - 1
                            });
                          }
                        }}
                        aria-label="Decrease quantity"
                      >
                        -
                      </Button>
                      <Form.Control
                        type="number"
                        name="quantity"
                        value={editedWine.quantity || 1}
                        onChange={handleChange}
                        min="1"
                        style={{ textAlign: 'center' }}
                        aria-label="Quantity"
                      />
                      <Button 
                        variant="outline-secondary"
                        onClick={() => {
                          setEditedWine({
                            ...editedWine,
                            quantity: (editedWine.quantity || 1) + 1
                          });
                        }}
                        aria-label="Increase quantity"
                      >
                        +
                      </Button>
                    </InputGroup>
                    <Form.Text className="text-muted">
                      Number of bottles in your collection
                    </Form.Text>
                  </Col>
                </Form.Group>

                <Form.Group as={Row} className="mb-3">
                  <Form.Label column sm={3}>Name</Form.Label>
                  <Col sm={9}>
                    <Form.Control
                      type="text"
                      name="name"
                      value={editedWine.name}
                      onChange={handleChange}
                      required
                    />
                  </Col>
                </Form.Group>

                <Form.Group as={Row} className="mb-3">
                  <Form.Label column sm={3}>Producer</Form.Label>
                  <Col sm={9}>
                    <Form.Control
                      type="text"
                      name="producer"
                      value={editedWine.producer || ''}
                      onChange={handleChange}
                    />
                  </Col>
                </Form.Group>

                <Form.Group as={Row} className="mb-3">
                  <Form.Label column sm={3}>Vintage</Form.Label>
                  <Col sm={9}>
                    <Form.Control
                      type="text"
                      name="vintage"
                      value={editedWine.vintage || ''}
                      onChange={handleChange}
                    />
                  </Col>
                </Form.Group>

                <Form.Group as={Row} className="mb-3">
                  <Form.Label column sm={3}>Varietal</Form.Label>
                  <Col sm={9}>
                    <Form.Control
                      type="text"
                      name="varietal"
                      value={editedWine.varietal || ''}
                      onChange={handleChange}
                    />
                  </Col>
                </Form.Group>

                <Form.Group as={Row} className="mb-3">
                  <Form.Label column sm={3}>Rating (1-5)</Form.Label>
                  <Col sm={9}>
                    <Form.Control
                      type="number"
                      name="rating"
                      value={editedWine.rating || ''}
                      onChange={handleChange}
                      min={1}
                      max={5}
                      step={0.1}
                    />
                  </Col>
                </Form.Group>
              </Form>
            </Card.Body>
          </Card>
        ) : (
          <Card>
            <Card.Header>
              <h1 className="h3">{wine.name}</h1>
              {wine.producer && <p className="text-muted mb-0">{wine.producer}</p>}
            </Card.Header>
            <Card.Body>
              <Row>
                <Col md={3} className="fw-bold">Barcode:</Col>
                <Col md={9}>{wine.barcode}</Col>
              </Row>
              <Row className="mt-3">
                <Col md={3} className="fw-bold">Quantity:</Col>
                <Col md={9}>
                  <span className="d-flex align-items-center">
                    {wine.quantity || 1} {(wine.quantity || 1) === 1 ? 'bottle' : 'bottles'}
                    <Button 
                      variant="outline-primary" 
                      size="sm"
                      className="ms-3"
                      onClick={() => {
                        setEditedWine({
                          ...wine,
                          quantity: (wine.quantity || 1) + 1
                        });
                        setIsEditing(true);
                      }}
                      aria-label="Add another bottle"
                    >
                      + Add Another
                    </Button>
                  </span>
                </Col>
              </Row>
              {wine.vintage && (
                <Row className="mt-3">
                  <Col md={3} className="fw-bold">Vintage:</Col>
                  <Col md={9}>{wine.vintage}</Col>
                </Row>
              )}
              {wine.varietal && (
                <Row className="mt-3">
                  <Col md={3} className="fw-bold">Varietal:</Col>
                  <Col md={9}>{wine.varietal}</Col>
                </Row>
              )}
              {wine.rating && (
                <Row className="mt-3">
                  <Col md={3} className="fw-bold">Rating:</Col>
                  <Col md={9}>
                    <div className="d-flex align-items-center">
                      {wine.rating}/5
                      <div className="ms-2" aria-label={`${wine.rating} out of 5 stars`}>
                        {Array.from({ length: 5 }).map((_, i) => (
                          <span key={i} style={{ color: i < Math.floor(wine.rating as number) ? 'gold' : 'gray' }}>
                            ★
                          </span>
                        ))}
                      </div>
                    </div>
                  </Col>
                </Row>
              )}
              <Row className="mt-3">
                <Col md={3} className="fw-bold">Added:</Col>
                <Col md={9}>{new Date(wine.created_at).toLocaleDateString()}</Col>
              </Row>
              <Row className="mt-3">
                <Col md={3} className="fw-bold">Last Updated:</Col>
                <Col md={9}>{new Date(wine.updated_at).toLocaleDateString()}</Col>
              </Row>
            </Card.Body>
          </Card>
        )}

        <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
          <Modal.Header closeButton>
            <Modal.Title>Confirm Delete</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            Are you sure you want to delete "{wine.name}"? This action cannot be undone.
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
              Cancel
            </Button>
            <Button 
              variant="danger" 
              onClick={handleDeleteConfirm} 
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <Spinner 
                    as="span" 
                    animation="border" 
                    size="sm" 
                    role="status" 
                    aria-hidden="true" 
                    className="me-2" 
                  />
                  Deleting...
                </>
              ) : (
                'Delete'
              )}
            </Button>
          </Modal.Footer>
        </Modal>
      </Container>
    </ErrorBoundary>
  );
};

export default WineDetail;