import { Wine } from '../repositories/types';

const DB_NAME = 'WineCollectionDB';
const DB_VERSION = 1;
const WINE_STORE = 'wines';

export class IndexedDBStorage {
  private db: IDBDatabase | null = null;

  async initialize(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(WINE_STORE)) {
          db.createObjectStore(WINE_STORE, { keyPath: 'id' });
        }
      };
    });
  }

  private ensureDb(): IDBDatabase {
    if (!this.db) {
      throw new Error('Database not initialized');
    }
    return this.db;
  }

  async addWine(wine: Wine): Promise<void> {
    const db = this.ensureDb();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(WINE_STORE, 'readwrite');
      const store = transaction.objectStore(WINE_STORE);
      
      const request = store.put(wine);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  async getWine(id: string): Promise<Wine | null> {
    const db = this.ensureDb();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(WINE_STORE, 'readonly');
      const store = transaction.objectStore(WINE_STORE);
      
      const request = store.get(id);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result || null);
    });
  }

  async getAllWines(): Promise<Wine[]> {
    const db = this.ensureDb();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(WINE_STORE, 'readonly');
      const store = transaction.objectStore(WINE_STORE);
      
      const request = store.getAll();
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });
  }

  async deleteWine(id: string): Promise<void> {
    const db = this.ensureDb();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(WINE_STORE, 'readwrite');
      const store = transaction.objectStore(WINE_STORE);
      
      const request = store.delete(id);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  async clearAll(): Promise<void> {
    const db = this.ensureDb();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(WINE_STORE, 'readwrite');
      const store = transaction.objectStore(WINE_STORE);
      
      const request = store.clear();
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }
}