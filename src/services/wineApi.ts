import { WineDetails, ApiResponse, WineApiConfig } from './types';

// Mock wine database
const mockWineDatabase: Record<string, WineDetails> = {
  '123456789': {
    name: 'Château Margaux 2015',
    vintage: '2015',
    producer: 'Château Margaux',
    region: 'Bordeaux, France',
    type: 'Red Wine',
    varietal: 'Cabernet Sauvignon Blend',
    rating: 4.8,
    averagePrice: 989.99,
    imageUrl: 'https://example.com/margaux.jpg'
  },
  '987654321': {
    name: 'Dom Pérignon 2010',
    vintage: '2010',
    producer: 'Dom Pérignon',
    region: 'Champagne, France',
    type: 'Sparkling Wine',
    varietal: 'Chardonnay Blend',
    rating: 4.9,
    averagePrice: 249.99,
    imageUrl: 'https://example.com/dom.jpg'
  }
};

// Simulate network delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export async function lookupWineByBarcode(barcode: string): Promise<ApiResponse<WineDetails>> {
  // Simulate network delay (300-800ms)
  await delay(300 + Math.random() * 500);

  // Validate barcode format
  if (!barcode || barcode.length < 8) {
    return {
      status: 400,
      error: 'Invalid barcode format'
    };
  }

  // Generate deterministic mock data for unknown barcodes
  if (!mockWineDatabase[barcode]) {
    const hash = Array.from(barcode).reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const mockWine: WineDetails = {
      name: `Wine ${barcode.slice(-4)}`,
      vintage: `${2015 + (hash % 8)}`,
      producer: `Winery ${hash % 100}`,
      region: ['Napa Valley', 'Bordeaux', 'Tuscany', 'Rioja'][hash % 4],
      type: ['Red Wine', 'White Wine', 'Sparkling Wine', 'Rosé'][hash % 4],
      varietal: ['Cabernet Sauvignon', 'Chardonnay', 'Pinot Noir', 'Merlot'][hash % 4],
      rating: 3.5 + (hash % 15) / 10,
      averagePrice: 20 + (hash % 80),
      imageUrl: `https://example.com/wine${hash % 10}.jpg`
    };
    mockWineDatabase[barcode] = mockWine;
  }

  return {
    status: 200,
    data: mockWineDatabase[barcode]
  };
}

class WineApiService {
  private config: WineApiConfig;
  private static instance: WineApiService;

  private constructor(config: WineApiConfig) {
    this.config = config;
  }

  static getInstance(config: WineApiConfig): WineApiService {
    if (!WineApiService.instance) {
      WineApiService.instance = new WineApiService(config);
    }
    return WineApiService.instance;
  }

  private async fetchWithTimeout(
    url: string,
    options: RequestInit & { timeout?: number } = {}
  ): Promise<Response> {
    const { timeout = 5000, ...fetchOptions } = options;
    
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);
    
    try {
      const response = await fetch(url, {
        ...fetchOptions,
        signal: controller.signal,
      });
      clearTimeout(id);
      return response;
    } catch (error) {
      clearTimeout(id);
      throw error;
    }
  }

  private async searchVivino(barcode: string): Promise<ApiResponse<WineDetails>> {
    try {
      // Note: This is using the unofficial Vivino API endpoint
      const response = await this.fetchWithTimeout(
        `${this.config.baseUrl}/wines/search?q=${barcode}`,
        {
          headers: {
            'User-Agent': 'Wine Collection Manager/1.0',
            'Authorization': `Bearer ${this.config.apiKey}`
          }
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      // Transform Vivino response to WineDetails
      return {
        status: response.status,
        data: {
          name: data.wines[0].name,
          vintage: data.wines[0].vintage?.year?.toString(),
          producer: data.wines[0].winery.name,
          region: data.wines[0].region.name,
          type: data.wines[0].type,
          rating: data.wines[0].statistics.ratings_average,
          imageUrl: data.wines[0].image.location
        }
      };
    } catch (error) {
      return {
        status: 500,
        error: error instanceof Error ? error.message : 'Failed to fetch wine details'
      };
    }
  }

  private async searchGlobalWineScore(barcode: string): Promise<ApiResponse<WineDetails>> {
    try {
      const response = await this.fetchWithTimeout(
        `${this.config.baseUrl}/search?q=${barcode}`,
        {
          headers: {
            'Authorization': `Token ${this.config.apiKey}`,
            'Accept': 'application/json'
          }
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return {
        status: response.status,
        data: {
          name: data.wine,
          vintage: data.vintage,
          producer: data.producer,
          region: data.appellation,
          type: data.color,
          rating: data.score,
        }
      };
    } catch (error) {
      return {
        status: 500,
        error: error instanceof Error ? error.message : 'Failed to fetch wine details'
      };
    }
  }

  async lookupWineByBarcode(barcode: string): Promise<ApiResponse<WineDetails>> {
    if (!barcode || barcode.length < 8) {
      return {
        status: 400,
        error: 'Invalid barcode format'
      };
    }

    switch (this.config.provider) {
      case 'vivino':
        return this.searchVivino(barcode);
      case 'globalwinescore':
        return this.searchGlobalWineScore(barcode);
      default:
        return {
          status: 501,
          error: 'Wine API provider not implemented'
        };
    }
  }
}

// Default configuration - can be overridden
const defaultConfig: WineApiConfig = {
  baseUrl: 'https://api.vivino.com/api/v2',
  provider: 'vivino'
};

// Export singleton instance
export const wineApi = WineApiService.getInstance(defaultConfig);

// Export configuration method
export const configureWineApi = (config: WineApiConfig) => {
  return WineApiService.getInstance(config);
};