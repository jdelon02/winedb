import { Wine } from '../repositories/types';
import { v4 as uuidv4 } from 'uuid';
import { IndexedDBStorage } from '../db/storage';
import { WineApiService } from './WineApiService';
import { WineScraperService } from './WineScraperService';
import { VIVINO_CONFIG } from '../config/scraper-config';
import { Environment } from '../config/environment';
import { ApiCacheService } from './ApiCacheService';

export class WineService {
    private storage: IndexedDBStorage;
    private apiService: WineApiService;
    private apiCache: ApiCacheService;
    private scraper: WineScraperService | null = null;
    private initialized: boolean = false;

    constructor() {
        this.storage = new IndexedDBStorage();
        this.apiService = new WineApiService();
        this.apiCache = new ApiCacheService();
    }

    private initializeScraper() {
        const credentials = {
            username: process.env.WINE_SCRAPER_USERNAME || '',
            password: process.env.WINE_SCRAPER_PASSWORD || ''
        };

        if (credentials.username && credentials.password) {
            this.scraper = new WineScraperService(VIVINO_CONFIG, credentials);
        }
    }

    async initialize(): Promise<void> {
        if (this.initialized) return;
        await Promise.all([
            this.storage.initialize(),
            this.apiCache.initialize()
        ]);
        this.initializeScraper();
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

            // Try API lookup first
            let wineData = await this.apiService.lookupBarcode(barcode);

            // If API lookup fails and scraper is available, try scraping
            if (!wineData && this.scraper) {
                try {
                    wineData = await this.scraper.searchWine(barcode);
                } catch (error) {
                    console.error('Scraping failed:', error);
                }
            }
            
            const newWine: Wine = {
                id: uuidv4(),
                barcode,
                name: wineData?.name || `Wine ${barcode.slice(-4)}`,
                producer: wineData?.producer,
                varietal: wineData?.varietal,
                vintage: wineData?.vintage,
                rating: wineData?.rating,
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