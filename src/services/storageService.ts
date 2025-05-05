import { Wine, WineCollection } from '../repositories/types';

const STORAGE_KEY = 'wineCollection';
const VERSION = 1;

interface StorageManager {
  save(key: string, data: unknown): Promise<void>;
  load<T>(key: string): Promise<T | null>;
  clear(): Promise<void>;
  getSize(): Promise<number>;
}

class WineStorageManager implements StorageManager {
  async save(key: string, data: unknown): Promise<void> {
    try {
      const serialized = JSON.stringify(data);
      localStorage.setItem(key, serialized);
    } catch (error) {
      console.error('Error saving to storage:', error);
      throw new Error('Failed to save data');
    }
  }

  async load<T>(key: string): Promise<T | null> {
    try {
      const data = localStorage.getItem(key);
      if (!data) return null;
      return JSON.parse(data) as T;
    } catch (error) {
      console.error('Error loading from storage:', error);
      throw new Error('Failed to load data');
    }
  }

  async clear(): Promise<void> {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error('Error clearing storage:', error);
      throw new Error('Failed to clear data');
    }
  }

  async getSize(): Promise<number> {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? new Blob([data]).size : 0;
    } catch (error) {
      console.error('Error getting storage size:', error);
      throw new Error('Failed to get storage size');
    }
  }
}

export class WineStorage {
  private storage: WineStorageManager;
  private collection: WineCollection;

  constructor() {
    this.storage = new WineStorageManager();
    this.collection = {
      wines: new Map(),
      version: VERSION,
      lastSync: new Date().toISOString()
    };
  }

  async initialize(): Promise<void> {
    const stored = await this.storage.load<WineCollection>(STORAGE_KEY);
    if (stored) {
      this.collection = {
        ...stored,
        wines: new Map(Object.entries(JSON.parse(JSON.stringify([...stored.wines])))) // Convert stored object back to Map
      };
    }
  }

  async addWine(wine: Wine): Promise<void> {
    this.collection.wines.set(wine.id, wine);
    this.collection.lastSync = new Date().toISOString();
    await this.save();
  }

  async getWine(id: string): Promise<Wine | undefined> {
    return this.collection.wines.get(id);
  }

  async getAllWines(): Promise<Wine[]> {
    return Array.from(this.collection.wines.values());
  }

  async updateWine(id: string, wine: Partial<Wine>): Promise<void> {
    const existing = this.collection.wines.get(id);
    if (!existing) throw new Error('Wine not found');
    
    this.collection.wines.set(id, {
      ...existing,
      ...wine,
      updated_at: new Date().toISOString()
    });
    
    this.collection.lastSync = new Date().toISOString();
    await this.save();
  }

  async deleteWine(id: string): Promise<void> {
    if (!this.collection.wines.delete(id)) {
      throw new Error('Wine not found');
    }
    this.collection.lastSync = new Date().toISOString();
    await this.save();
  }

  private async save(): Promise<void> {
    const serializable = {
      ...this.collection,
      wines: Object.fromEntries(this.collection.wines) // Convert Map to plain object for storage
    };
    await this.storage.save(STORAGE_KEY, serializable);
  }
}