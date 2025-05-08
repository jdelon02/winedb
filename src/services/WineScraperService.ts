import { ScraperConfig, ScraperCredentials, DataSelector } from '../types/scraper';
import { MappedWineData } from '../types/api';
import { ApiCacheService } from './ApiCacheService';

export class WineScraperService {
    private session: string | null = null;
    private lastRequest: number = 0;
    private requestQueue: Promise<any> = Promise.resolve();
    private apiCache: ApiCacheService;

    constructor(
        private config: ScraperConfig,
        private credentials: ScraperCredentials
    ) {
        this.apiCache = new ApiCacheService();
    }

    private async rateLimit(): Promise<void> {
        const now = Date.now();
        const timeSinceLastRequest = now - this.lastRequest;
        const minDelay = (this.config.rateLimit.perSeconds * 1000) / this.config.rateLimit.requests;

        if (timeSinceLastRequest < minDelay) {
            await new Promise(resolve => setTimeout(resolve, minDelay - timeSinceLastRequest));
        }
        this.lastRequest = Date.now();
    }

    private async login(): Promise<void> {
        if (this.session) return;

        await this.rateLimit();
        
        try {
            const response = await fetch(`${this.config.baseUrl}${this.config.loginPath}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    username: this.credentials.username,
                    password: this.credentials.password
                }),
                credentials: 'include'
            });

            if (!response.ok) {
                throw new Error('Login failed');
            }

            const cookies = response.headers.get('set-cookie');
            if (cookies) {
                this.session = cookies;
            }
        } catch (error) {
            console.error('Login error:', error);
            throw new Error('Failed to authenticate with wine service');
        }
    }

    public async searchWine(query: string): Promise<MappedWineData | null> {
        // Queue this request
        return this.requestQueue.then(async () => {
            const cacheKey = `scraper_${query}`;
            const cached = await this.apiCache.get<MappedWineData>(cacheKey);
            if (cached) return cached;

            await this.login();
            await this.rateLimit();

            try {
                const response = await fetch(`${this.config.baseUrl}${this.config.searchPath}?q=${encodeURIComponent(query)}`, {
                    headers: this.session ? {
                        'Cookie': this.session
                    } : {},
                    credentials: 'include'
                });

                if (!response.ok) {
                    throw new Error('Search failed');
                }

                const data = await response.json();
                const mappedData: MappedWineData = {
                    name: data.name,
                    producer: data.producer,
                    vintage: data.vintage,
                    rating: data.rating,
                    metadata: {
                        source: 'wine-scraper',
                        lastUpdated: new Date().toISOString()
                    }
                };

                await this.apiCache.set(cacheKey, mappedData);
                return mappedData;
            } catch (error) {
                console.error('Search error:', error);
                return null;
            }
        });
    }

    private getElementValue(doc: Document, selector: DataSelector | undefined): string | null {
        if (!selector) return null;
        
        const element = doc.querySelector(selector.selector);
        if (!element) {
            if (selector.required) {
                throw new Error(`Required element not found: ${selector.selector}`);
            }
            return null;
        }

        const value = selector.attribute ? 
            element.getAttribute(selector.attribute) : 
            element.textContent;

        if (!value && selector.required) {
            throw new Error(`Required value not found for: ${selector.selector}`);
        }

        if (value && selector.validation && !selector.validation.test(value)) {
            throw new Error(`Validation failed for: ${selector.selector}`);
        }

        return selector.transform ? selector.transform(value || '') : value;
    }

    public async scrapeDetails(url: string): Promise<MappedWineData | null> {
        return this.requestQueue.then(async () => {
            const cacheKey = `scraper_detail_${url}`;
            const cached = await this.apiCache.get<MappedWineData>(cacheKey);
            if (cached) return cached;

            await this.login();
            await this.rateLimit();

            try {
                const response = await fetch(url, {
                    headers: this.session ? {
                        'Cookie': this.session
                    } : {},
                    credentials: 'include'
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch wine details');
                }

                const text = await response.text();
                const parser = new DOMParser();
                const doc = parser.parseFromString(text, 'text/html');

                const selectors = this.config.selectors.wineData;
                const mappedData: MappedWineData = {
                    name: this.getElementValue(doc, selectors.name) || '',
                    producer: this.getElementValue(doc, selectors.producer) || '',
                    vintage: this.getElementValue(doc, selectors.vintage) || '',
                    rating: parseFloat(this.getElementValue(doc, selectors.rating) || '0'),
                    region: this.getElementValue(doc, selectors.region) || undefined,
                    varietal: this.getElementValue(doc, selectors.varietal) || undefined,
                    metadata: {
                        source: 'wine-scraper',
                        lastUpdated: new Date().toISOString()
                    }
                };

                await this.apiCache.set(cacheKey, mappedData);
                return mappedData;
            } catch (error) {
                console.error('Scraping error:', error);
                return null;
            }
        });
    }
}