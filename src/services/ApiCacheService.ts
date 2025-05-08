import { CachedData } from '../types';

export class ApiCacheService {
  private db: IDBDatabase | null = null;
  private readonly DB_NAME = 'WineApiCache';
  private readonly STORE_NAME = 'apiCache';
  private readonly DB_VERSION = 1;
  private readonly cacheDuration: number;

  constructor(cacheDuration?: number) {
    this.cacheDuration = cacheDuration ?? (24 * 60 * 60 * 1000); // Use provided duration or 24 hours default
  }

  async initialize(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.DB_NAME, this.DB_VERSION);

      request.onerror = () => {
        reject(new Error('Failed to open cache database'));
      };

      request.onsuccess = (event) => {
        this.db = (event.target as IDBOpenDBRequest).result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(this.STORE_NAME)) {
          db.createObjectStore(this.STORE_NAME, { keyPath: 'key' });
        }
      };
    });
  }

  async get<T>(key: string): Promise<T | null> {
    if (!this.db) {
      throw new Error('Cache database not initialized');
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.STORE_NAME], 'readonly');
      const store = transaction.objectStore(this.STORE_NAME);
      const request = store.get(key);

      request.onerror = () => reject(new Error('Failed to read from cache'));

      request.onsuccess = () => {
        const result = request.result as CachedData<T>;
        if (!result) {
          resolve(null);
          return;
        }

        if (Date.now() - result.timestamp > this.cacheDuration) {
          // Cache expired, remove it and return null
          this.delete(key).catch(console.error);
          resolve(null);
          return;
        }

        resolve(result.data);
      };
    });
  }

  async set<T>(key: string, data: T): Promise<void> {
    if (!this.db) {
      throw new Error('Cache database not initialized');
    }

    const cacheData: CachedData<T> = {
      key,
      data,
      timestamp: Date.now()
    };

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.STORE_NAME], 'readwrite');
      const store = transaction.objectStore(this.STORE_NAME);
      const request = store.put(cacheData);

      request.onerror = () => reject(new Error('Failed to write to cache'));
      request.onsuccess = () => resolve();
    });
  }

  async delete(key: string): Promise<void> {
    if (!this.db) {
      throw new Error('Cache database not initialized');
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.STORE_NAME], 'readwrite');
      const store = transaction.objectStore(this.STORE_NAME);
      const request = store.delete(key);

      request.onerror = () => reject(new Error('Failed to delete from cache'));
      request.onsuccess = () => resolve();
    });
  }

  async clear(): Promise<void> {
    if (!this.db) {
      throw new Error('Cache database not initialized');
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.STORE_NAME], 'readwrite');
      const store = transaction.objectStore(this.STORE_NAME);
      const request = store.clear();

      request.onerror = () => reject(new Error('Failed to clear cache'));
      request.onsuccess = () => resolve();
    });
  }
}