-- Enable foreign key constraints
PRAGMA foreign_keys = ON;

-- Producers table
CREATE TABLE producers (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    region TEXT,
    country TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
);

-- Wine types lookup table
CREATE TABLE wine_types (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    created_at TEXT DEFAULT (datetime('now'))
);

-- Main wines table
CREATE TABLE wines (
    id TEXT PRIMARY KEY,
    barcode TEXT UNIQUE,
    name TEXT NOT NULL,
    vintage INTEGER,
    producer_id TEXT REFERENCES producers(id),
    type_id TEXT REFERENCES wine_types(id),
    varietal TEXT,
    rating REAL CHECK (rating >= 0 AND rating <= 5),
    notes TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
);

-- Collection entries for inventory management
CREATE TABLE collection_entries (
    id TEXT PRIMARY KEY,
    wine_id TEXT REFERENCES wines(id),
    quantity INTEGER DEFAULT 1 CHECK (quantity >= 0),
    purchase_date TEXT,
    purchase_price REAL,
    location TEXT,
    notes TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
);

-- Indexes for performance
CREATE INDEX idx_wines_barcode ON wines(barcode);
CREATE INDEX idx_wines_producer ON wines(producer_id);
CREATE INDEX idx_wines_type ON wines(type_id);
CREATE INDEX idx_collection_wine ON collection_entries(wine_id);

-- Virtual table for full-text search
CREATE VIRTUAL TABLE wines_fts USING fts5(
    name, 
    varietal, 
    notes,
    content='wines',
    content_rowid='id'
);

-- Triggers for FTS
CREATE TRIGGER wines_ai AFTER INSERT ON wines BEGIN
  INSERT INTO wines_fts(rowid, name, varietal, notes)
  VALUES (new.id, new.name, new.varietal, new.notes);
END;

CREATE TRIGGER wines_ad AFTER DELETE ON wines BEGIN
  INSERT INTO wines_fts(wines_fts, rowid, name, varietal, notes)
  VALUES('delete', old.id, old.name, old.varietal, old.notes);
END;

CREATE TRIGGER wines_au AFTER UPDATE ON wines BEGIN
  INSERT INTO wines_fts(wines_fts, rowid, name, varietal, notes)
  VALUES('delete', old.id, old.name, old.varietal, old.notes);
  INSERT INTO wines_fts(rowid, name, varietal, notes)
  VALUES (new.id, new.name, new.varietal, new.notes);
END;

-- Triggers for updated_at timestamps
CREATE TRIGGER update_wines_timestamp 
    AFTER UPDATE ON wines
BEGIN
    UPDATE wines 
    SET updated_at = datetime('now')
    WHERE id = NEW.id;
END;

CREATE TRIGGER update_collection_timestamp 
    AFTER UPDATE ON collection_entries
BEGIN
    UPDATE collection_entries 
    SET updated_at = datetime('now')
    WHERE id = NEW.id;
END;