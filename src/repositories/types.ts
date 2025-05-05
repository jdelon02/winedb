export interface BaseRepository<T> {
    findById(id: string): Promise<T | null>;
    findAll(): Promise<T[]>;
    create(entity: Omit<T, 'id'>): Promise<T>;
    update(id: string, entity: Partial<T>): Promise<T>;
    delete(id: string): Promise<void>;
}

export interface WineRepository {
    findById(id: string): Promise<Wine | null>;
    findAll(): Promise<Wine[]>;
    create(wine: Omit<Wine, 'id'>): Promise<Wine>;
    update(id: string, wine: Partial<Wine>): Promise<Wine>;
    delete(id: string): Promise<void>;
    findByBarcode(barcode: string): Promise<Wine | null>;
    search(query: string): Promise<Wine[]>;
}

export interface ProducerRepository extends BaseRepository<Producer> {
    findByName(name: string): Promise<Producer | null>;
}

export interface CollectionEntryRepository extends BaseRepository<CollectionEntry> {
    findByWineId(wineId: string): Promise<CollectionEntry[]>;
}

export interface Wine {
    id: string;
    barcode: string;
    name: string;
    vintage?: string;
    producer?: string;
    producer_id?: string;
    type?: string;
    type_id?: string;
    varietal?: string;
    rating?: number;
    notes?: string;
    created_at: string;
    updated_at: string;
}

export interface WineCollection {
    wines: Map<string, Wine>;
    version: number;
    lastSync?: string;
}

export interface Producer {
    id: string;
    name: string;
    region?: string;
    country?: string;
    created_at: string;
    updated_at: string;
}

export interface CollectionEntry {
    id: string;
    wine_id: string;
    quantity: number;
    purchase_date?: string;
    purchase_price?: number;
    location?: string;
    notes?: string;
    created_at: string;
    updated_at: string;
}