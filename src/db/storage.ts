import { Wine } from '../repositories/types';

const DB_NAME = 'WineCollectionDB';
const DB_VERSION = 1;
const WINE_STORE = 'wines';

export class IndexedDBStorage {
  private db: IDBDatabase | null = null;
  private readonly DB_NAME = 'WineCollectionDB';
  private readonly STORE_NAME = 'wines';
  private readonly DB_VERSION = 1;

  async initialize(): Promise<void> {
    return new Promise((resolve, reject) => {
      console.log(`Opening IndexedDB: ${this.DB_NAME}`);
      const request = indexedDB.open(this.DB_NAME, this.DB_VERSION);

      request.onerror = () => {
        console.error('Failed to open IndexedDB:', request.error);
        reject(request.error);
      };

      request.onsuccess = () => {
        this.db = request.result;
        console.log('IndexedDB opened successfully:', this.db);
        resolve();
      };

      request.onupgradeneeded = (event) => {
        console.log('Upgrading IndexedDB...');
        const db = (event.target as IDBOpenDBRequest).result;

        if (!db.objectStoreNames.contains(this.STORE_NAME)) {
          console.log(`Creating object store: ${this.STORE_NAME}`);
          db.createObjectStore(this.STORE_NAME, { keyPath: 'id' });
        }
      };
    });
  }

  private ensureDb(): IDBDatabase {
    if (!this.db) {
      throw new Error('IndexedDB not initialized');
    }
    return this.db;
  }

  async addWine(wine: Wine): Promise<void> {
    const db = this.ensureDb();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(this.STORE_NAME, 'readwrite');
      const store = transaction.objectStore(this.STORE_NAME);
      const request = store.add(wine);

      request.onerror = () => {
        console.error('Failed to add wine:', request.error);
        reject(request.error);
      };

      request.onsuccess = () => {
        console.log('Wine added successfully:', wine);
        resolve();
      };
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
      const transaction = db.transaction(this.STORE_NAME, 'readonly');
      const store = transaction.objectStore(this.STORE_NAME);
      const request = store.getAll();

      request.onerror = () => {
        console.error('Failed to fetch wines:', request.error);
        reject(request.error);
      };

      request.onsuccess = () => {
        console.log('Fetched wines successfully:', request.result);
        resolve(request.result as Wine[]);
      };
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