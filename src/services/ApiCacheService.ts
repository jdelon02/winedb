interface CachedData<T> {
  data: T;
  timestamp: number;
}

export class ApiCacheService {
  private db: IDBDatabase | null = null;
  private readonly DB_NAME = 'WineApiCache';
  private readonly STORE_NAME = 'apiCache';
  private readonly DB_VERSION = 1;

  async initialize(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.DB_NAME, this.DB_VERSION);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
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

  private ensureDb(): IDBDatabase {
    if (!this.db) {
      throw new Error('Cache database not initialized');
    }
    return this.db;
  }

  async get<T>(key: string, maxAge: number): Promise<T | null> {
    try {
      if (!this.db) await this.initialize();
      const db = this.ensureDb();
      
      const cached = await this.getFromStore<CachedData<T>>(key);
      if (!cached) return null;

      const age = Date.now() - cached.timestamp;
      if (age > maxAge) {
        await this.delete(key);
        return null;
      }

      return cached.data;
    } catch (error) {
      console.error('Cache retrieval error:', error);
      return null;
    }
  }

  async set<T>(key: string, data: T): Promise<void> {
    if (!this.db) await this.initialize();
    
    const cacheEntry: CachedData<T> = {
      data,
      timestamp: Date.now()
    };

    return this.setInStore(key, cacheEntry);
  }

  private getFromStore<T>(key: string): Promise<T | null> {
    const db = this.ensureDb();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(this.STORE_NAME, 'readonly');
      const store = transaction.objectStore(this.STORE_NAME);
      const request = store.get(key);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result || null);
    });
  }

  private setInStore<T>(key: string, value: T): Promise<void> {
    const db = this.ensureDb();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(this.STORE_NAME, 'readwrite');
      const store = transaction.objectStore(this.STORE_NAME);
      const request = store.put({ key, ...value });

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  private async delete(key: string): Promise<void> {
    const db = this.ensureDb();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(this.STORE_NAME, 'readwrite');
      const store = transaction.objectStore(this.STORE_NAME);
      const request = store.delete(key);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }
}