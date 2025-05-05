CREATE TABLE producers (
    id UUID PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    region VARCHAR(255),
    country VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE wine_types (
    id UUID PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE wines (
    id UUID PRIMARY KEY,
    barcode VARCHAR(255) UNIQUE,
    name VARCHAR(255) NOT NULL,
    vintage INTEGER,
    producer_id UUID REFERENCES producers(id),
    type_id UUID REFERENCES wine_types(id),
    varietal VARCHAR(255),
    rating DECIMAL(3,2),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT valid_rating CHECK (rating >= 0 AND rating <= 5)
);

CREATE INDEX idx_wines_barcode ON wines(barcode);
CREATE INDEX idx_wines_producer ON wines(producer_id);
CREATE INDEX idx_wines_type ON wines(type_id);

CREATE TABLE collection_entries (
    id UUID PRIMARY KEY,
    wine_id UUID REFERENCES wines(id),
    quantity INTEGER DEFAULT 1,
    purchase_date TIMESTAMP,
    purchase_price DECIMAL(10,2),
    location VARCHAR(255),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT positive_quantity CHECK (quantity >= 0)
);

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_wines_updated_at
    BEFORE UPDATE ON wines
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_collection_entries_updated_at
    BEFORE UPDATE ON collection_entries
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Full-text search configuration
ALTER TABLE wines ADD COLUMN search_vector tsvector;
CREATE INDEX wines_search_idx ON wines USING GIN (search_vector);

CREATE TRIGGER wines_search_update
    BEFORE INSERT OR UPDATE ON wines
    FOR EACH ROW EXECUTE FUNCTION
    tsvector_update_trigger(search_vector, 'pg_catalog.english', name, varietal, notes);