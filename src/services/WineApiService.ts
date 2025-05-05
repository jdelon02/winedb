import { Wine } from '../repositories/types';
import { Environment } from '../config/environment';
import { ApiCacheService } from './ApiCacheService';

interface OpenFoodFactsProduct {
  product_name: string;
  brands?: string;
  generic_name?: string;
  categories_tags?: string[];
  created_t?: number;
  _id: string;
}

export class WineApiService {
  private readonly OFF_API_URL = 'https://world.openfoodfacts.org/api/v0/product';
  private apiCache: ApiCacheService;

  constructor() {
    this.apiCache = new ApiCacheService();
  }

  async lookupBarcode(barcode: string): Promise<Partial<Wine> | null> {
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

  private async searchOpenFoodFacts(barcode: string): Promise<Partial<Wine> | null> {
    const cacheKey = `off_${barcode}`;
    const cached = await this.apiCache.get<Partial<Wine>>(cacheKey, Environment.apiCacheDuration);
    if (cached) return cached;

    const response = await fetch(`${this.OFF_API_URL}/${barcode}.json`);
    const data = await response.json();

    if (!data.product) return null;

    const product = data.product as OpenFoodFactsProduct;
    const wineData = {
      name: product.product_name || '',
      producer: product.brands,
      varietal: product.categories_tags?.find(tag => tag.includes('wines-'))?.replace('wines-', '') || undefined
    };

    await this.apiCache.set(cacheKey, wineData);
    return wineData;
  }

  private async searchWineSearcher(barcode: string): Promise<Partial<Wine> | null> {
    const config = Environment.wineSearcherConfig;
    if (!config.apiKey || !config.baseUrl) return null;

    const cacheKey = `ws_${barcode}`;
    const cached = await this.apiCache.get<Partial<Wine>>(cacheKey, Environment.apiCacheDuration);
    if (cached) return cached;

    try {
      const response = await fetch(`${config.baseUrl}/barcode/${barcode}`, {
        headers: {
          'Authorization': `Bearer ${config.apiKey}`
        }
      });
      const data = await response.json();
      if (!data.wine) return null;

      const wineData = {
        name: data.wine.name,
        producer: data.wine.producer,
        vintage: data.wine.vintage,
        varietal: data.wine.varietal
      };

      await this.apiCache.set(cacheKey, wineData);
      return wineData;
    } catch (error) {
      console.error('Wine-Searcher API error:', error);
      return null;
    }
  }

  private async searchGlobalWineScore(barcode: string): Promise<Partial<Wine> | null> {
    const config = Environment.globalWineScoreConfig;
    if (!config.apiKey || !config.baseUrl) return null;

    const cacheKey = `gws_${barcode}`;
    const cached = await this.apiCache.get<Partial<Wine>>(cacheKey, Environment.apiCacheDuration);
    if (cached) return cached;

    try {
      const response = await fetch(`${config.baseUrl}/wine/${barcode}`, {
        headers: {
          'Authorization': config.apiKey
        }
      });
      const data = await response.json();
      if (!data.wine) return null;

      const wineData = {
        name: data.wine.name,
        producer: data.wine.producer,
        vintage: data.wine.vintage,
        rating: data.wine.score
      };

      await this.apiCache.set(cacheKey, wineData);
      return wineData;
    } catch (error) {
      console.error('Global Wine Score API error:', error);
      return null;
    }
  }
}