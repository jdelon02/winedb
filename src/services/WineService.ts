import { Wine } from '../repositories/types';
import { v4 as uuidv4 } from 'uuid';
import { IndexedDBStorage } from '../db/storage';
import { WineApiService } from './WineApiService';
import { ApiCacheService } from './ApiCacheService';

export class WineService {
    private storage: IndexedDBStorage;
    private apiService: WineApiService;
    private apiCache: ApiCacheService;
    private initialized: boolean = false;

    constructor() {
        this.storage = new IndexedDBStorage();
        this.apiService = new WineApiService();
        this.apiCache = new ApiCacheService();
    }

    async initialize(): Promise<void> {
        if (this.initialized) return;
        await Promise.all([
            this.storage.initialize(),
            this.apiCache.initialize()
        ]);
        this.initialized = true;
    }

    async scanBarcode(barcode: string): Promise<Wine> {
        try {
            // Check local storage first
            const wines = await this.storage.getAllWines();
            const existing = wines.find(wine => wine.barcode === barcode);
            if (existing) {
                return existing;
            }

            // Try to get wine data from API
            const wineData = await this.apiService.lookupBarcode(barcode);
            
            const newWine: Wine = {
                id: uuidv4(),
                barcode,
                name: wineData?.name || `Wine ${barcode.slice(-4)}`,
                producer: wineData?.producer,
                varietal: wineData?.varietal,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            };

            await this.storage.addWine(newWine);
            return newWine;
        } catch (error) {
            console.error('Scan error:', error);
            throw new Error('Failed to process wine scan');
        }
    }

    async updateWineDetails(id: string, details: Partial<Wine>): Promise<Wine> {
        const existing = await this.storage.getWine(id);
        if (!existing) {
            throw new Error('Wine not found');
        }

        const updated = {
            ...existing,
            ...details,
            updated_at: new Date().toISOString()
        };

        await this.storage.addWine(updated);
        return updated;
    }

    async getWineCollection(): Promise<Wine[]> {
        return this.storage.getAllWines();
    }

    async getWineById(id: string): Promise<Wine | null> {
        return this.storage.getWine(id);
    }

    async deleteWine(id: string): Promise<void> {
        return this.storage.deleteWine(id);
    }
}