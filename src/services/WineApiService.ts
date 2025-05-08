import { Environment } from '../config/environment';
import { ApiCacheService } from './ApiCacheService';
import { 
    OpenFoodFactsResponse, 
    WineSearcherResponse, 
    GlobalWineScoreResponse,
    MappedWineData 
} from '../types/api';

export class WineApiService {
    private apiCache: ApiCacheService;
    private readonly offConfig = Environment.openFoodFactsConfig;

    constructor() {
        this.apiCache = new ApiCacheService();
    }

    private getAuthHeaders(): Headers {
        const headers = new Headers();
        if (this.offConfig.auth) {
            const { username, password } = this.offConfig.auth;
            headers.set('Authorization', `Basic ${btoa(`${username}:${password}`)}`);
        }
        return headers;
    }

    async lookupBarcode(barcode: string): Promise<MappedWineData | null> {
        try {
            // Try Wine-Searcher API if enabled
            if (Environment.wineSearcherConfig.enabled) {
                const wineSearcherData = await this.searchWineSearcher(barcode);
                if (wineSearcherData) return wineSearcherData;
            }

            // Try Global Wine Score API if enabled
            if (Environment.globalWineScoreConfig.enabled) {
                const globalWineData = await this.searchGlobalWineScore(barcode);
                if (globalWineData) return globalWineData;
            }

            // Fallback to Open Food Facts
            return this.searchOpenFoodFacts(barcode);
        } catch (error) {
            console.error('API lookup error:', error);
            return null;
        }
    }

    private async searchOpenFoodFacts(barcode: string): Promise<MappedWineData | null> {
        const cacheKey = `off_${barcode}`;
        const cached = await this.apiCache.get<MappedWineData>(cacheKey);
        if (cached) return cached;

        const response = await fetch(
            `${this.offConfig.baseUrl}/api/v2/product/${barcode}.json`,
            { headers: this.getAuthHeaders() }
        );
        
        if (!response.ok) {
            throw new Error(`OpenFoodFacts API error: ${response.statusText}`);
        }

        const data: OpenFoodFactsResponse = await response.json();
        if (!data.product) return null;

        const mappedData: MappedWineData = {
            name: data.product.product_name || '',
            producer: data.product.brands,
            varietal: data.product.categories_tags?.find(tag => tag.includes('wines-'))?.replace('wines-', ''),
            alcoholContent: data.product.alcohol_100g,
            imageUrl: data.product.image_url,
            country: data.product.countries,
            metadata: {
                source: 'openfoodfacts',
                lastUpdated: new Date(data.product.last_modified_t || Date.now() * 1000).toISOString()
            }
        };

        await this.apiCache.set(cacheKey, mappedData);
        return mappedData;
    }

    private async searchWineSearcher(barcode: string): Promise<MappedWineData | null> {
        const config = Environment.wineSearcherConfig;
        if (!config.apiKey || !config.baseUrl) return null;

        const cacheKey = `ws_${barcode}`;
        const cached = await this.apiCache.get<MappedWineData>(cacheKey);
        if (cached) return cached;

        try {
            const response = await fetch(`${config.baseUrl}/barcode/${barcode}`, {
                headers: {
                    'Authorization': `Bearer ${config.apiKey}`
                }
            });
            const data: WineSearcherResponse = await response.json();
            if (!data.wine) return null;

            const mappedData: MappedWineData = {
                name: data.wine.name,
                producer: data.wine.producer,
                vintage: data.wine.vintage,
                varietal: data.wine.varietal,
                region: data.wine.region,
                country: data.wine.country,
                type: data.wine.type,
                price: data.wine.price_retail,
                rating: data.wine.critics_score,
                tastingNotes: data.wine.tasting_notes,
                foodPairings: data.wine.food_pairings,
                cellaring: data.wine.cellaring_potential,
                metadata: {
                    source: 'wine-searcher',
                    lastUpdated: new Date().toISOString()
                }
            };

            await this.apiCache.set(cacheKey, mappedData);
            return mappedData;
        } catch (error) {
            console.error('Wine-Searcher API error:', error);
            return null;
        }
    }

    private async searchGlobalWineScore(barcode: string): Promise<MappedWineData | null> {
        const config = Environment.globalWineScoreConfig;
        if (!config.apiKey || !config.baseUrl) return null;

        const cacheKey = `gws_${barcode}`;
        const cached = await this.apiCache.get<MappedWineData>(cacheKey);
        if (cached) return cached;

        try {
            const response = await fetch(`${config.baseUrl}/wine/${barcode}`, {
                headers: {
                    'Authorization': config.apiKey
                }
            });
            const data: GlobalWineScoreResponse = await response.json();
            if (!data.wine) return null;

            const mappedData: MappedWineData = {
                name: data.wine.name,
                producer: data.wine.producer,
                vintage: data.wine.vintage,
                type: `${data.wine.color || ''} ${data.wine.type || ''}`.trim(),
                region: data.wine.region,
                country: data.wine.country,
                rating: data.wine.score,
                varietal: data.wine.grape_varieties?.join(', '),
                drinkWindow: {
                    from: data.wine.drink_from,
                    to: data.wine.drink_to
                },
                metadata: {
                    source: 'global-wine-score',
                    confidence: data.wine.confidence_index,
                    lastUpdated: new Date().toISOString()
                }
            };

            await this.apiCache.set(cacheKey, mappedData);
            return mappedData;
        } catch (error) {
            console.error('Global Wine Score API error:', error);
            return null;
        }
    }
}