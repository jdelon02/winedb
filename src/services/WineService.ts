import { Wine } from '../context/types';
import { 
  findFuzzyBarcodeMatch, 
  normalizeBarcode as normalizeBarcodeUtil
} from '../utils/barcodeUtils';

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
          // Changed unique to false to allow multiple wines with the same barcode
          store.createIndex('barcode', 'barcode', { unique: false });
          store.createIndex('updated_at', 'updated_at', { unique: false });
          
          console.log('Database schema created');
        } else {
          // Check if the indexes exist and create them if not
          const transaction = (event.target as IDBOpenDBRequest).transaction;
          if (transaction) {
            const store = transaction.objectStore(this.storeName);
            
            // Check and create the barcode index if not exists
            // Changed unique to false to allow multiple wines with the same barcode
            if (!store.indexNames.contains('barcode')) {
              store.createIndex('barcode', 'barcode', { unique: false });
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
      console.log(`\n[SCAN EVENT] =====================================================`);
      console.log(`[SCAN EVENT] 📲 Processing scan: "${barcode}"`);
      
      await this.checkDatabaseStructure();
      
      const normalizedBarcode = normalizeBarcodeUtil(barcode);
      if (!normalizedBarcode) {
        console.error(`[SCAN EVENT] ❌ Invalid barcode format: "${barcode}"`);
        throw new Error('Invalid barcode format');
      }
      
      console.log(`[SCAN EVENT] Normalized barcode: "${normalizedBarcode}"`);
      
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
          
          // Retrieve all wines to allow for matching
          const request = store.getAll();
          
          request.onsuccess = async () => {
            const allWines = request.result;
            
            // Important: Always check for exact barcode matches first
            const exactMatch = allWines.find(w => w.barcode === normalizedBarcode);
            if (exactMatch) {
              console.log(`[SCAN EVENT] EXACT Match found: "${exactMatch.barcode}" = "${normalizedBarcode}"`);
              console.log(`[SCAN EVENT] Wine: "${exactMatch.name}" (ID: ${exactMatch.id})`);
              
              try {
                // CRITICAL: Always fetch the latest version of the wine DIRECTLY from the database
                const currentWine = await this.getWineById(exactMatch.id);
                if (!currentWine) {
                  throw new Error(`Wine with ID ${exactMatch.id} not found`);
                }
                
                // Calculate new quantity based on the latest data
                const oldQuantity = currentWine.quantity || 1;
                const newQuantity = oldQuantity + 1;
                
                console.log(`[SCAN EVENT] Incrementing quantity from ${oldQuantity} to ${newQuantity}`);
                
                // Create updated wine object with new quantity
                const updatedWine = {
                  ...currentWine,
                  quantity: newQuantity,
                  updated_at: new Date().toISOString()
                };
                
                // Update the wine in the database
                const savedWine = await this.updateWine(updatedWine);
                console.log(`[SCAN EVENT] Successfully updated wine quantity to ${savedWine.quantity}`);
                
                // IMPORTANT: Always resolve with the updated wine to ensure UI gets latest data
                resolve(savedWine);
              } catch (error) {
                console.error(`[SCAN EVENT] Error updating wine:`, error);
                reject(error);
              }
              return;
            }
            
            // If no exact match, then proceed with fuzzy matching or creation logic
            // If no exact match, try fuzzy matching
            const fuzzyMatch = findFuzzyBarcodeMatch(normalizedBarcode, allWines);
            
            if (fuzzyMatch) {
              console.log(`[SCAN EVENT] Found fuzzy barcode match: "${fuzzyMatch.barcode}" for scanned barcode: "${normalizedBarcode}"`);
              try {
                // Get the latest version of the wine to ensure we have the most current quantity
                const currentWine = await this.getWineById(fuzzyMatch.id);
                if (!currentWine) {
                  throw new Error(`Wine with ID ${fuzzyMatch.id} not found`);
                }
                
                // Increment quantity based on the latest data
                const oldQuantity = currentWine.quantity || 1;
                const newQuantity = oldQuantity + 1;
                
                const updatedWine = {
                  ...currentWine,
                  quantity: newQuantity,
                  updated_at: new Date().toISOString()
                };
                
                console.log(`[SCAN EVENT] Incrementing quantity for "${currentWine.name}" from ${oldQuantity} to ${newQuantity}`);
                
                const savedWine = await this.updateWine(updatedWine);
                console.log(`[SCAN EVENT] Successfully updated wine: "${savedWine.name}" (ID: ${savedWine.id})`);
                resolve(savedWine);
              } catch (error) {
                console.error(`[SCAN EVENT] Error updating wine:`, error);
                reject(error);
              }
              return;
            }
            
            // If no match at all, create a new wine
            try {
              // If not found, create a new wine entry
              const newWine: Wine = {
                id: crypto.randomUUID(), // Generate a UUID for the record ID
                barcode: normalizedBarcode, // Store the normalized barcode
                name: `Wine (${normalizedBarcode})`, // Default name using barcode
                producer: '',
                vintage: '',
                varietal: '',
                quantity: 1, // Start with 1 bottle
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
              };
              
              console.log(`[SCAN EVENT] Creating new wine with barcode: "${normalizedBarcode}"`);
              
              // Save the new wine
              const savedWine = await this.addWine(newWine);
              console.log(`[SCAN EVENT] New wine saved: "${savedWine.name}" (ID: ${savedWine.id})`);
              resolve(savedWine);
            } catch (error) {
              console.error(`[SCAN EVENT] Error creating new wine:`, error);
              reject(error);
            }
          };
          
          request.onerror = () => {
            reject(new Error(`Failed to scan barcode: ${normalizedBarcode}`));
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
      console.error(`[SCAN EVENT] Error scanning barcode "${barcode}":`, error);
      
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