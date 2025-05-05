import { Wine } from '../repositories/types';
import { v4 as uuidv4 } from 'uuid';
import { IndexedDBStorage } from '../db/storage';

export class WineService {
    private storage: IndexedDBStorage;

    constructor() {
        this.storage = new IndexedDBStorage();
    }

    public async initialize(): Promise<void> {
        try {
            await this.storage.initialize();
        } catch (error) {
            throw new Error(`Failed to initialize wine database: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    async scanBarcode(barcode: string): Promise<Wine> {
        try {
            const existing = await this.findWineByBarcode(barcode);
            if (existing) {
                return existing;
            }

            const newWine: Wine = {
                id: uuidv4(),
                barcode,
                name: `Wine ${barcode.slice(-4)}`,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            };

            await this.storage.addWine(newWine);
            return newWine;
        } catch (error) {
            throw new Error(`Failed to process wine scan: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    private async findWineByBarcode(barcode: string): Promise<Wine | null> {
        const wines = await this.storage.getAllWines();
        return wines.find(wine => wine.barcode === barcode) || null;
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