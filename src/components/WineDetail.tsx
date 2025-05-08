import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Spinner, Form, Modal, InputGroup, Tabs, Tab } from 'react-bootstrap';
import { useWineContext } from '../context/WineContext';
import { Wine } from '../context/types';
import { TastingNotes, VineyardInfo } from '../types';
import ErrorBoundary from './ErrorBoundary';
import { normalizeBarcode } from '../utils/barcodeUtils';

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
  const [tastingNotes, setTastingNotes] = useState<TastingNotes | undefined>(undefined);
  const [vineyardInfo, setVineyardInfo] = useState<VineyardInfo | undefined>(undefined);
  const [activeTab, setActiveTab] = useState('details');

  // State for barcode input buffer
  const [barcodeBuffer, setBarcodeBuffer] = useState<string>('');
  const [lastKeypressTime, setLastKeypressTime] = useState<number>(0);
  const barcodeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Constants for barcode scanner behavior
  const BARCODE_SCAN_TIMEOUT = 50; // Time between keypresses to consider part of same scan (ms)
  const MIN_BARCODE_LENGTH = 8; // Minimum valid barcode length

  useEffect(() => {
    if (!id) return;

    const fetchWine = async () => {
      try {
        const fetchedWine = await wineService.getWineById(id);
        if (fetchedWine) {
          setWine(fetchedWine);
          setEditedWine(fetchedWine);
          setTastingNotes(fetchedWine.tastingNotes || undefined);
          setVineyardInfo(fetchedWine.vineyard || undefined);
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

  const showQuantityUpdateToast = useCallback((wineName: string) => {
    const existingNotification = document.getElementById('quantity-update-toast');
    if (existingNotification) {
      document.body.removeChild(existingNotification);
    }

    const notification = document.createElement('div');
    notification.id = 'quantity-update-toast';
    notification.className = 'position-fixed top-0 end-0 p-3';
    notification.style.zIndex = '1050';
    notification.innerHTML = `
      <div class="toast show" role="alert" aria-live="assertive" aria-atomic="true">
        <div class="toast-header bg-success text-white">
          <strong class="me-auto">Quantity Updated</strong>
          <button type="button" class="btn-close btn-close-white" data-bs-dismiss="toast" aria-label="Close"></button>
        </div>
        <div class="toast-body">
          Added another bottle of ${wineName}. Quantity: ${isEditing ? editedWine.quantity : wine?.quantity || 1}
        </div>
      </div>
    `;
    document.body.appendChild(notification);

    setTimeout(() => {
      if (document.getElementById('quantity-update-toast')) {
        document.body.removeChild(document.getElementById('quantity-update-toast')!);
      }
    }, 3000);
  }, [isEditing, editedWine, wine]);

  const handleAddAnother = async () => {
    if (!wine) return;
    
    try {
      const newQuantity = (wine.quantity || 1) + 1;
      const updatedWine = {
        ...wine,
        quantity: newQuantity,
        updated_at: new Date().toISOString()
      };
      
      const savedWine = await wineService.updateWine(updatedWine);
      setWine(savedWine);
      
      if (isEditing) {
        setEditedWine({
          ...editedWine,
          quantity: newQuantity
        });
      }
      
      showQuantityUpdateToast(wine.name);
      await refreshCollection();
    } catch (err) {
      console.error('Error adding another bottle:', err);
      setError('Failed to update quantity');
    }
  };

  // Process complete barcode after collection
  const processCompleteBarcode = (completeBarcode: string) => {
    // Add prefix to make log messages stand out in the console
    console.log(`\n📟 [BARCODE SCAN] ===== PROCESSING COMPLETE BARCODE =====`);
    console.log(`📟 [BARCODE SCAN] Raw barcode input: "${completeBarcode}"`);
    
    if (completeBarcode.length < MIN_BARCODE_LENGTH) {
      console.warn(`📟 [BARCODE SCAN] ⚠️ Barcode too short to be valid: "${completeBarcode}" (length: ${completeBarcode.length})`);
      return;
    }
    
    if (wine) {
      const normalizedScannedBarcode = normalizeBarcode(completeBarcode);
      const normalizedCurrentBarcode = normalizeBarcode(wine.barcode);
      
      console.log(`📟 [BARCODE SCAN] Normalized scanned barcode: "${normalizedScannedBarcode}"`);
      console.log(`📟 [BARCODE SCAN] Current wine barcode: "${normalizedCurrentBarcode}"`);
      
      // Check if scanned barcode matches current wine
      if (normalizedScannedBarcode === normalizedCurrentBarcode) {
        console.log(`📟 [BARCODE SCAN] ✅ MATCH FOUND - Same wine scanned again: "${normalizedScannedBarcode}"`);
        console.log(`📟 [BARCODE SCAN] Current quantity: ${wine.quantity || 1}, about to increment`);
        
        // Increment quantity and update
        handleAddAnother();
      } else {
        // Different wine scanned
        console.log(`📟 [BARCODE SCAN] ❌ NO MATCH - Different wine barcode detected: "${normalizedScannedBarcode}"`);
        
        const existingNotification = document.getElementById('different-wine-toast');
        if (existingNotification) {
          document.body.removeChild(existingNotification);
        }
    
        const notification = document.createElement('div');
        notification.id = 'different-wine-toast';
        notification.className = 'position-fixed top-0 end-0 p-3';
        notification.style.zIndex = '1050';
        notification.innerHTML = `
          <div class="toast show" role="alert" aria-live="assertive" aria-atomic="true">
            <div class="toast-header bg-warning text-white">
              <strong class="me-auto">Different Wine Detected</strong>
              <button type="button" class="btn-close btn-close-white" data-bs-dismiss="toast" aria-label="Close"></button>
            </div>
            <div class="toast-body">
              <p>You scanned a different wine barcode.</p>
              <div class="mt-2 pt-2 border-top d-flex justify-content-end">
                <button type="button" class="btn btn-sm btn-secondary me-2" id="stay-button">
                  Stay Here
                </button>
                <button type="button" class="btn btn-sm btn-primary" id="go-to-wine-button">
                  Go to That Wine
                </button>
              </div>
            </div>
          </div>
        `;
        document.body.appendChild(notification);
    
        document.getElementById('stay-button')?.addEventListener('click', () => {
          if (document.getElementById('different-wine-toast')) {
            document.body.removeChild(document.getElementById('different-wine-toast')!);
          }
        });
    
        document.getElementById('go-to-wine-button')?.addEventListener('click', () => {
          if (document.getElementById('different-wine-toast')) {
            document.body.removeChild(document.getElementById('different-wine-toast')!);
          }
          navigate(`/?scanBarcode=${normalizedScannedBarcode}`);
        });
    
        setTimeout(() => {
          if (document.getElementById('different-wine-toast')) {
            document.body.removeChild(document.getElementById('different-wine-toast')!);
          }
        }, 10000);
      }
    } else {
      console.warn(`📟 [BARCODE SCAN] ⚠️ No current wine loaded, cannot compare barcode`);
    }
    
    console.log(`📟 [BARCODE SCAN] ===== SCAN PROCESSING COMPLETE =====\n`);
  };

  // Handle keydown for barcode scanner
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    const now = Date.now();
    
    // Only log keypresses that might be part of a barcode
    if (/[\d\n\r]/.test(event.key) || event.key === 'Enter') {
      console.log(`🔤 [KEY EVENT] "${event.key}" pressed in WineDetail component`);
    }
    
    // Reset barcode buffer if too much time has passed between keypresses
    if (now - lastKeypressTime > BARCODE_SCAN_TIMEOUT && barcodeBuffer.length > 0) {
      console.log(`🔤 [KEY EVENT] ⏱️ Timeout reached (${now - lastKeypressTime}ms), resetting barcode buffer: "${barcodeBuffer}"`);
      setBarcodeBuffer('');
    }
    
    setLastKeypressTime(now);
    
    // Clear any existing timeout
    if (barcodeTimeoutRef.current) {
      clearTimeout(barcodeTimeoutRef.current);
    }
    
    if (event.key === 'Enter') {
      // If Enter is pressed, process the complete barcode
      console.log(`🔤 [KEY EVENT] Enter key detected with barcode buffer: "${barcodeBuffer}" (length: ${barcodeBuffer.length})`);
      
      if (barcodeBuffer.length > 0) {
        processCompleteBarcode(barcodeBuffer);
        setBarcodeBuffer('');
      } else {
        console.log(`🔤 [KEY EVENT] Empty buffer on Enter key - likely manual keystroke, ignoring`);
      }
    } else if (/[\d]/.test(event.key)) {
      // If key is a digit, add to buffer
      const newBuffer = barcodeBuffer + event.key;
      console.log(`🔤 [KEY EVENT] Adding digit to barcode buffer: "${newBuffer}"`);
      setBarcodeBuffer(newBuffer);
      
      // Set a timeout to process the barcode if no more keys are pressed
      barcodeTimeoutRef.current = setTimeout(() => {
        if (newBuffer.length >= MIN_BARCODE_LENGTH) {
          console.log(`🔤 [KEY EVENT] ⏱️ Buffer timeout with complete barcode: "${newBuffer}" (length: ${newBuffer.length})`);
          processCompleteBarcode(newBuffer);
          setBarcodeBuffer('');
        } else if (newBuffer.length > 0) {
          console.log(`🔤 [KEY EVENT] ⏱️ Buffer timeout but barcode too short: "${newBuffer}" (length: ${newBuffer.length})`);
          setBarcodeBuffer('');
        }
      }, BARCODE_SCAN_TIMEOUT + 50);
    }
  }, [barcodeBuffer, lastKeypressTime, wine, handleAddAnother, processCompleteBarcode]);

  useEffect(() => {
    // Need to handle barcode scanner input
    window.addEventListener('keydown', handleKeyDown);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      if (barcodeTimeoutRef.current) {
        clearTimeout(barcodeTimeoutRef.current);
      }
    };
  }, [handleKeyDown]);

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

  const handleTastingNotesChange = (field: keyof TastingNotes, value: any) => {
    setTastingNotes(prev => ({
      ...(prev || { date: new Date().toISOString(), rating: 0, notes: '' }),
      [field]: value
    }));
  };

  const handleVineyardInfoChange = (field: keyof VineyardInfo, value: any) => {
    setVineyardInfo(prev => ({
      ...(prev || { name: '' }),
      [field]: value
    }));
  };

  const handleSave = async () => {
    if (!editedWine || !wine) return;

    try {
      const updatedWine: Wine = {
        ...wine,
        ...editedWine,
        tastingNotes: tastingNotes,
        vineyard: vineyardInfo,
        updated_at: new Date().toISOString()
      };

      const updated = await wineService.updateWine(updatedWine);
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
        setShowDeleteModal(true);
      } else {
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
          <Form>
            <Tabs 
              activeKey={activeTab} 
              onSelect={(k) => setActiveTab(k || 'details')}
              className="mb-3"
            >
              <Tab eventKey="details" title="Details">
                <Card>
                  <Card.Header>
                    <h1 className="h3">Edit Wine</h1>
                  </Card.Header>
                  <Card.Body>
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
                  </Card.Body>
                </Card>
              </Tab>

              <Tab eventKey="tasting" title="Tasting Notes">
                <Card className="mb-3">
                  <Card.Body>
                    <Row>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Tasting Date</Form.Label>
                          <Form.Control 
                            type="date" 
                            value={tastingNotes?.date ? new Date(tastingNotes.date).toISOString().split('T')[0] : ''}
                            onChange={(e) => handleTastingNotesChange('date', e.target.value ? new Date(e.target.value).toISOString() : '')}
                          />
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Rating (1-5)</Form.Label>
                          <Form.Control 
                            type="number" 
                            min="1" 
                            max="5" 
                            value={tastingNotes?.rating || ''}
                            onChange={(e) => handleTastingNotesChange('rating', parseInt(e.target.value))}
                          />
                        </Form.Group>
                      </Col>
                    </Row>
                    
                    <Form.Group className="mb-3">
                      <Form.Label>Overall Notes</Form.Label>
                      <Form.Control 
                        as="textarea" 
                        rows={3}
                        value={tastingNotes?.notes || ''}
                        onChange={(e) => handleTastingNotesChange('notes', e.target.value)}
                      />
                    </Form.Group>
                    
                    <Row>
                      <Col md={4}>
                        <Form.Group className="mb-3">
                          <Form.Label>Aroma</Form.Label>
                          <Form.Control 
                            type="text"
                            value={tastingNotes?.aroma || ''}
                            onChange={(e) => handleTastingNotesChange('aroma', e.target.value)}
                          />
                        </Form.Group>
                      </Col>
                      <Col md={4}>
                        <Form.Group className="mb-3">
                          <Form.Label>Taste</Form.Label>
                          <Form.Control 
                            type="text"
                            value={tastingNotes?.taste || ''}
                            onChange={(e) => handleTastingNotesChange('taste', e.target.value)}
                          />
                        </Form.Group>
                      </Col>
                      <Col md={4}>
                        <Form.Group className="mb-3">
                          <Form.Label>Finish</Form.Label>
                          <Form.Control 
                            type="text"
                            value={tastingNotes?.finish || ''}
                            onChange={(e) => handleTastingNotesChange('finish', e.target.value)}
                          />
                        </Form.Group>
                      </Col>
                    </Row>
                    
                    <Form.Group className="mb-3">
                      <Form.Label>Food Pairings (comma separated)</Form.Label>
                      <Form.Control 
                        type="text"
                        value={tastingNotes?.foodPairings?.join(', ') || ''}
                        onChange={(e) => handleTastingNotesChange('foodPairings', 
                          e.target.value.split(',').map(item => item.trim()).filter(item => item)
                        )}
                      />
                    </Form.Group>
                  </Card.Body>
                </Card>
              </Tab>

              <Tab eventKey="vineyard" title="Vineyard Info">
                <Card className="mb-3">
                  <Card.Body>
                    <Form.Group className="mb-3">
                      <Form.Label>Vineyard Name</Form.Label>
                      <Form.Control 
                        type="text"
                        value={vineyardInfo?.name || ''}
                        onChange={(e) => handleVineyardInfoChange('name', e.target.value)}
                      />
                    </Form.Group>
                    
                    <Row>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Owner</Form.Label>
                          <Form.Control 
                            type="text"
                            value={vineyardInfo?.owner || ''}
                            onChange={(e) => handleVineyardInfoChange('owner', e.target.value)}
                          />
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Location</Form.Label>
                          <Form.Control 
                            type="text"
                            value={vineyardInfo?.location || ''}
                            onChange={(e) => handleVineyardInfoChange('location', e.target.value)}
                          />
                        </Form.Group>
                      </Col>
                    </Row>
                    
                    <Form.Group className="mb-3">
                      <Form.Label>Description</Form.Label>
                      <Form.Control 
                        as="textarea" 
                        rows={3}
                        value={vineyardInfo?.description || ''}
                        onChange={(e) => handleVineyardInfoChange('description', e.target.value)}
                      />
                    </Form.Group>
                    
                    <Row>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Founded Year</Form.Label>
                          <Form.Control 
                            type="number"
                            value={vineyardInfo?.foundedYear || ''}
                            onChange={(e) => handleVineyardInfoChange('foundedYear', e.target.value ? parseInt(e.target.value) : undefined)}
                          />
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Website</Form.Label>
                          <Form.Control 
                            type="url"
                            value={vineyardInfo?.website || ''}
                            onChange={(e) => handleVineyardInfoChange('website', e.target.value)}
                          />
                        </Form.Group>
                      </Col>
                    </Row>
                  </Card.Body>
                </Card>
              </Tab>
            </Tabs>
          </Form>
        ) : (
          <Card>
            <Card.Header>
              <h1 className="h3">{wine.name}</h1>
              {wine.producer && <p className="text-muted mb-0">{wine.producer}</p>}
            </Card.Header>
            <Card.Body>
              <Row>
                <Col md={3} className="fw-bold">Barcode:</Col>
                <Col md={9}>
                  {wine.barcode || 'No barcode available'}
                  {wine.barcode && wine.id === wine.barcode && (
                    <span className="ms-2 text-danger">
                      <small>(Using ID as barcode - please scan again)</small>
                    </span>
                  )}
                </Col>
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
                      onClick={handleAddAnother}
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