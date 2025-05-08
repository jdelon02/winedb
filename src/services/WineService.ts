import { Wine } from '../context/types';

export class WineService {
  private dbName = 'WineCollectionDB';
  private dbVersion = 2; // Increment database version
  private storeName = 'wines';
  
  // Open the IndexedDB database with proper version handling
  private async openDatabase(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);
      
      request.onerror = (event) => {
        console.error('Database error:', request.error);
        reject(new Error('Failed to open database: ' + request.error));
      };
      
      request.onsuccess = () => {
        resolve(request.result);
      };
      
      // This event is triggered when the database is being created or upgraded
      request.onupgradeneeded = (event) => {
        const db = request.result;
        
        // Create object store if it doesn't exist
        if (!db.objectStoreNames.contains(this.storeName)) {
          const store = db.createObjectStore(this.storeName, { keyPath: 'id' });
          
          // Create indexes for efficient queries
          store.createIndex('barcode', 'barcode', { unique: true });
          store.createIndex('updated_at', 'updated_at', { unique: false });
          
          console.log('Database schema created');
        } else {
          // Check if the indexes exist and create them if not
          const transaction = (event.target as IDBOpenDBRequest).transaction;
          if (transaction) {
            const store = transaction.objectStore(this.storeName);
            
            // Check and create the barcode index if not exists
            if (!store.indexNames.contains('barcode')) {
              store.createIndex('barcode', 'barcode', { unique: true });
              console.log('Created barcode index');
            }
            
            // Check and create the updated_at index if not exists
            if (!store.indexNames.contains('updated_at')) {
              store.createIndex('updated_at', 'updated_at', { unique: false });
              console.log('Created updated_at index');
            }
          }
        }

        // For upgrading from version 1 to 2 (adding tasting notes and vineyard)
        if (event.oldVersion < 2) {
          console.log('Upgrading database to version 2');
          // No need to create new indexes or stores, just the schema is changing
        }
      };
    });
  }

  // Check if database is initialized properly
  async checkDatabaseStructure(): Promise<void> {
    const db = await this.openDatabase();
    
    try {
      // Verify the store exists
      if (!db.objectStoreNames.contains(this.storeName)) {
        console.error('Store not found: ' + this.storeName);
        throw new Error('Database structure is incorrect: store not found');
      }
      
      // Check indexes in a read-only transaction
      const transaction = db.transaction(this.storeName, 'readonly');
      const store = transaction.objectStore(this.storeName);
      
      // Check if required indexes exist
      const hasBarcode = store.indexNames.contains('barcode');
      const hasUpdatedAt = store.indexNames.contains('updated_at');
      
      if (!hasBarcode || !hasUpdatedAt) {
        console.error('Missing required indexes:', {
          barcode: hasBarcode,
          updated_at: hasUpdatedAt
        });
        
        // Recreate the database with incremented version if indexes are missing
        this.recreateDatabase();
      }
    } finally {
      db.close();
    }
  }
  
  // Recreate the database with incremented version
  private async recreateDatabase(): Promise<void> {
    // Increment version to trigger onupgradeneeded
    const newVersion = this.dbVersion + 1;
    
    console.log(`Recreating database with version ${newVersion}`);
    
    // Get all existing data first
    const wines = await this.getAllWines().catch(() => []);
    
    // Delete the database
    await new Promise<void>((resolve, reject) => {
      const deleteRequest = indexedDB.deleteDatabase(this.dbName);
      
      deleteRequest.onsuccess = () => {
        console.log('Database deleted successfully');
        resolve();
      };
      
      deleteRequest.onerror = () => {
        console.error('Failed to delete database:', deleteRequest.error);
        reject(new Error('Failed to delete database'));
      };
    });
    
    // Update version number for future openings
    this.dbVersion = newVersion;
    
    // Open with new version to recreate structure
    const db = await this.openDatabase();
    db.close();
    
    // Restore data if we had any
    if (wines.length > 0) {
      for (const wine of wines) {
        await this.addWine(wine);
      }
      console.log(`Restored ${wines.length} wines after database recreation`);
    }
  }
  
  // Get all wines from the database
  async getAllWines(): Promise<Wine[]> {
    try {
      await this.checkDatabaseStructure();
      
      const db = await this.openDatabase();
      return new Promise((resolve, reject) => {
        const transaction = db.transaction(this.storeName, 'readonly');
        const store = transaction.objectStore(this.storeName);
        const request = store.getAll();
        
        request.onsuccess = () => {
          resolve(request.result);
        };
        
        request.onerror = () => {
          reject(new Error('Failed to retrieve wines'));
        };
        
        transaction.oncomplete = () => {
          db.close();
        };
      });
    } catch (error) {
      console.error('Error getting all wines:', error);
      throw error;
    }
  }
  
  // Get a wine by ID
  async getWineById(id: string): Promise<Wine | undefined> {
    try {
      await this.checkDatabaseStructure();
      
      const db = await this.openDatabase();
      return new Promise((resolve, reject) => {
        const transaction = db.transaction(this.storeName, 'readonly');
        const store = transaction.objectStore(this.storeName);
        const request = store.get(id);
        
        request.onsuccess = () => {
          resolve(request.result);
        };
        
        request.onerror = () => {
          reject(new Error(`Failed to retrieve wine with ID: ${id}`));
        };
        
        transaction.oncomplete = () => {
          db.close();
        };
      });
    } catch (error) {
      console.error(`Error getting wine by ID ${id}:`, error);
      throw error;
    }
  }
  
  // Scan barcode and retrieve or create wine
  async scanBarcode(barcode: string): Promise<Wine> {
    try {
      await this.checkDatabaseStructure();
      
      // First check if we already have this wine
      const db = await this.openDatabase();
      return new Promise((resolve, reject) => {
        try {
          const transaction = db.transaction(this.storeName, 'readonly');
          const store = transaction.objectStore(this.storeName);
          
          // Use the barcode index safely
          if (!store.indexNames.contains('barcode')) {
            throw new Error('Barcode index not found - database needs recreation');
          }
          
          const index = store.index('barcode');
          const request = index.get(barcode);
          
          request.onsuccess = async () => {
            const existingWine = request.result;
            
            if (existingWine) {
              // Found existing wine - increment quantity
              try {
                const updatedWine = {
                  ...existingWine,
                  quantity: (existingWine.quantity || 1) + 1
                };
                const savedWine = await this.updateWine(updatedWine);
                console.log('Incremented quantity for existing wine:', savedWine);
                resolve(savedWine);
              } catch (error) {
                reject(error);
              }
            } else {
              try {
                // If not found, create a new wine entry
                const newWine: Wine = {
                  id: crypto.randomUUID(), // Generate a UUID for the record ID
                  barcode: barcode, // Store the actual scanned barcode
                  name: `Wine (${barcode})`, // Default name using barcode
                  producer: '',
                  vintage: '',
                  varietal: '',
                  quantity: 1, // Start with 1 bottle
                  created_at: new Date().toISOString(),
                  updated_at: new Date().toISOString()
                };
                
                console.log('Creating new wine with barcode:', barcode);
                
                // Save the new wine
                const savedWine = await this.addWine(newWine);
                resolve(savedWine);
              } catch (error) {
                reject(error);
              }
            }
          };
          
          request.onerror = () => {
            reject(new Error(`Failed to scan barcode: ${barcode}`));
          };
          
          transaction.oncomplete = () => {
            db.close();
          };
        } catch (error) {
          db.close();
          reject(error);
        }
      });
    } catch (error) {
      console.error(`Error scanning barcode ${barcode}:`, error);
      
      if (error instanceof Error && error.message.includes('index not found')) {
        await this.recreateDatabase();
        // Try again after database recreation
        return this.scanBarcode(barcode);
      }
      
      throw error;
    }
  }
  
  // Add a new wine
  async addWine(wine: Wine): Promise<Wine> {
    try {
      const db = await this.openDatabase();
      return new Promise((resolve, reject) => {
        const transaction = db.transaction(this.storeName, 'readwrite');
        const store = transaction.objectStore(this.storeName);
        
        // Ensure timestamps
        if (!wine.created_at) {
          wine.created_at = new Date().toISOString();
        }
        wine.updated_at = new Date().toISOString();
        
        const request = store.add(wine);
        
        request.onsuccess = () => {
          resolve(wine);
        };
        
        request.onerror = () => {
          reject(new Error('Failed to add wine'));
        };
        
        transaction.oncomplete = () => {
          db.close();
        };
      });
    } catch (error) {
      console.error('Error adding wine:', error);
      throw error;
    }
  }
  
  // Update an existing wine
  async updateWine(wine: Partial<Wine> & { id: string }): Promise<Wine> {
    try {
      const db = await this.openDatabase();
      return new Promise((resolve, reject) => {
        const transaction = db.transaction(this.storeName, 'readwrite');
        const store = transaction.objectStore(this.storeName);
        
        // Get current wine
        const getRequest = store.get(wine.id);
        
        getRequest.onsuccess = () => {
          const currentWine = getRequest.result;
          
          if (!currentWine) {
            reject(new Error(`Wine with ID ${wine.id} not found`));
            return;
          }
          
          // Update with new values
          const updatedWine = {
            ...currentWine,
            ...wine,
            updated_at: new Date().toISOString()
          };
          
          // Put updated wine
          const putRequest = store.put(updatedWine);
          
          putRequest.onsuccess = () => {
            resolve(updatedWine);
          };
          
          putRequest.onerror = () => {
            reject(new Error(`Failed to update wine with ID: ${wine.id}`));
          };
        };
        
        getRequest.onerror = () => {
          reject(new Error(`Failed to get wine with ID: ${wine.id}`));
        };
        
        transaction.oncomplete = () => {
          db.close();
        };
      });
    } catch (error) {
      console.error(`Error updating wine ${wine.id}:`, error);
      throw error;
    }
  }
  
  // Delete a wine
  async deleteWine(id: string): Promise<void> {
    try {
      const db = await this.openDatabase();
      return new Promise((resolve, reject) => {
        const transaction = db.transaction(this.storeName, 'readwrite');
        const store = transaction.objectStore(this.storeName);
        
        const request = store.delete(id);
        
        request.onsuccess = () => {
          resolve();
        };
        
        request.onerror = () => {
          reject(new Error(`Failed to delete wine with ID: ${id}`));
        };
        
        transaction.oncomplete = () => {
          db.close();
        };
      });
    } catch (error) {
      console.error(`Error deleting wine ${id}:`, error);
      throw error;
    }
  }
}