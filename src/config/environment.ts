interface WineApiConfig {
  apiKey?: string;
  baseUrl?: string;
  enabled: boolean;
}

export class Environment {
  static get wineSearcherConfig(): WineApiConfig {
    return {
      apiKey: process.env.WINE_SEARCHER_API_KEY,
      baseUrl: process.env.WINE_SEARCHER_BASE_URL,
      enabled: process.env.ENABLE_WINE_SEARCHER === 'true'
    };
  }

  static get globalWineScoreConfig(): WineApiConfig {
    return {
      apiKey: process.env.GLOBAL_WINE_SCORE_API_KEY,
      baseUrl: process.env.GLOBAL_WINE_SCORE_BASE_URL,
      enabled: process.env.ENABLE_GLOBAL_WINE_SCORE === 'true'
    };
  }

  static get apiCacheDuration(): number {
    return parseInt(process.env.API_CACHE_DURATION || '86400000', 10);
  }

  static get openFoodFactsConfig() {
    return {
      baseUrl: process.env.NODE_ENV === 'production' 
        ? 'https://world.openfoodfacts.org'
        : 'https://world.openfoodfacts.net',
      auth: process.env.NODE_ENV === 'production'
        ? null
        : { username: 'off', password: 'off' }
    };
  }
}