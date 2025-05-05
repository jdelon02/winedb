export interface Wine {
  id: string;
  barcode: string;
  name: string;
  vintage?: string;
  producer?: string;
  region?: string;
  type?: string;
  varietal?: string;
  rating?: number;
  addedDate: string;
  lastModified: string;
}

export interface WineCollection {
  wines: Map<string, Wine>;
  version: number;
  lastSync?: string;
}

export interface StorageManager {
  save(key: string, data: unknown): Promise<void>;
  load<T>(key: string): Promise<T | null>;
  clear(): Promise<void>;
  getSize(): Promise<number>;
}