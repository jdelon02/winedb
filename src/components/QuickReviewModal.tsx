import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Row, Col } from 'react-bootstrap';
import { Wine } from '../context/types';
import { TastingNotes } from '../types';

interface QuickReviewModalProps {
  show: boolean;
  wine: Wine;
  onHide: () => void;
  onSave: (wine: Wine, tastingNotes: TastingNotes) => Promise<void>;
}

const QuickReviewModal: React.FC<QuickReviewModalProps> = ({ show, wine, onHide, onSave }) => {
  const [isSaving, setIsSaving] = useState(false);
  const [tastingNotes, setTastingNotes] = useState<TastingNotes>({
    date: new Date().toISOString(),
    rating: 3,
    notes: '',
    aroma: '',
    taste: '',
    finish: '',
    foodPairings: []
  });

  // Initialize with existing tasting notes if available
  useEffect(() => {
    if (wine.tastingNotes) {
      setTastingNotes(wine.tastingNotes);
    } else {
      // Reset to default values if no existing notes
      setTastingNotes({
        date: new Date().toISOString(),
        rating: 3,
        notes: '',
        aroma: '',
        taste: '',
        finish: '',
        foodPairings: []
      });
    }
  }, [wine]);

  const handleChange = (field: keyof TastingNotes, value: any) => {
    setTastingNotes(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    try {
      await onSave(wine, tastingNotes);
    } catch (error) {
      console.error('Error saving review:', error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal show={show} onHide={onHide} centered backdrop="static" size="lg">
      <Form onSubmit={handleSubmit}>
        <Modal.Header closeButton>
          <Modal.Title>
            {wine.tastingNotes ? 'Update Review' : 'Add Review'}: {wine.name}
          </Modal.Title>
        </Modal.Header>
        
        <Modal.Body className="px-4 py-4">
          <Row className="mb-4">
            <Col md={6} className="mb-3 mb-md-0">
              <Form.Group>
                <Form.Label>Tasting Date</Form.Label>
                <Form.Control
                  type="date"
                  value={tastingNotes.date ? new Date(tastingNotes.date).toISOString().split('T')[0] : ''}
                  onChange={(e) => handleChange('date', e.target.value ? new Date(e.target.value).toISOString() : '')}
                  required
                  className="form-control-lg"
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label>Rating</Form.Label>
                <div className="star-rating-container d-flex align-items-center justify-content-center">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <span 
                      key={i} 
                      onClick={() => handleChange('rating', i + 1)}
                      style={{ 
                        cursor: 'pointer', 
                        color: i < tastingNotes.rating ? 'gold' : 'lightgray',
                        fontSize: '2rem',
                        margin: '0 5px',
                        transition: 'transform 0.1s ease, color 0.2s ease',
                        transform: i < tastingNotes.rating ? 'scale(1.2)' : 'scale(1)'
                      }}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          handleChange('rating', i + 1);
                        }
                      }}
                      aria-label={`Rate ${i + 1} star${i > 0 ? 's' : ''}`}
                      className="wine-rating-star"
                      onMouseEnter={(e) => {
                        // Visual feedback on hover
                        const stars = document.querySelectorAll('.wine-rating-star');
                        for (let j = 0; j <= i; j++) {
                          if (stars[j]) {
                            (stars[j] as HTMLElement).style.color = 'gold';
                            (stars[j] as HTMLElement).style.transform = 'scale(1.2)';
                          }
                        }
                        for (let j = i + 1; j < 5; j++) {
                          if (stars[j]) {
                            (stars[j] as HTMLElement).style.color = 'lightgray';
                            (stars[j] as HTMLElement).style.transform = 'scale(1)';
                          }
                        }
                      }}
                      onMouseLeave={(e) => {
                        // Reset to actual rating on mouse leave
                        const stars = document.querySelectorAll('.wine-rating-star');
                        for (let j = 0; j < 5; j++) {
                          if (stars[j]) {
                            (stars[j] as HTMLElement).style.color = j < tastingNotes.rating ? 'gold' : 'lightgray';
                            (stars[j] as HTMLElement).style.transform = j < tastingNotes.rating ? 'scale(1.2)' : 'scale(1)';
                          }
                        }
                      }}
                    >
                      ★
                    </span>
                  ))}
                </div>
                <div className="text-center mt-2 text-muted">
                  {tastingNotes.rating} of 5 stars
                </div>
              </Form.Group>
            </Col>
          </Row>

          <Form.Group className="mb-4">
            <Form.Label>Overall Notes</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              value={tastingNotes.notes}
              onChange={(e) => handleChange('notes', e.target.value)}
              placeholder="How did it taste? What did you like/dislike?"
              required
              className="form-control-lg"
            />
          </Form.Group>

          <div className="mb-4">
            <Form.Label>Quick Impressions (Optional)</Form.Label>
            <Row>
              <Col md={4} className="mb-3 mb-md-0">
                <Form.Control
                  type="text"
                  placeholder="Aroma"
                  value={tastingNotes.aroma || ''}
                  onChange={(e) => handleChange('aroma', e.target.value)}
                  className="form-control-lg"
                />
              </Col>
              <Col md={4} className="mb-3 mb-md-0">
                <Form.Control
                  type="text"
                  placeholder="Taste"
                  value={tastingNotes.taste || ''}
                  onChange={(e) => handleChange('taste', e.target.value)}
                  className="form-control-lg"
                />
              </Col>
              <Col md={4}>
                <Form.Control
                  type="text"
                  placeholder="Finish"
                  value={tastingNotes.finish || ''}
                  onChange={(e) => handleChange('finish', e.target.value)}
                  className="form-control-lg"
                />
              </Col>
            </Row>
          </div>

          <Form.Group>
            <Form.Label>Food Pairings (comma separated)</Form.Label>
            <Form.Control
              type="text"
              placeholder="e.g. Steak, Chocolate, Cheese"
              value={tastingNotes.foodPairings?.join(', ') || ''}
              onChange={(e) => handleChange('foodPairings', 
                e.target.value.split(',').map(item => item.trim()).filter(item => item)
              )}
              className="form-control-lg"
            />
          </Form.Group>
        </Modal.Body>
        
        <Modal.Footer className="px-4 py-3">
          <Button variant="secondary" onClick={onHide} disabled={isSaving} size="lg">
            Cancel
          </Button>
          <Button variant="primary" type="submit" disabled={isSaving} size="lg">
            {isSaving ? 'Saving...' : 'Save Review'}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default QuickReviewModal;