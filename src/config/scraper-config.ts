import { ScraperConfig } from '../types/scraper';

export const CELLARTRACKER_CONFIG: ScraperConfig = {
    baseUrl: 'https://www.cellartracker.com',
    loginPath: '/login.asp',
    searchPath: '/search.asp',
    rateLimit: {
        requests: 10,
        perSeconds: 60 // 10 requests per minute
    },
    selectors: {
        loginForm: {
            usernameField: {
                selector: 'input[name="user"]',
                required: true
            },
            passwordField: {
                selector: 'input[name="pass"]',
                required: true
            },
            submitButton: {
                selector: 'input[type="submit"]',
                required: true
            }
        },
        wineData: {
            name: {
                selector: '.wine-name',
                attribute: 'textContent',
                required: true,
                transform: (value: string) => value.trim()
            },
            producer: {
                selector: '.producer-name',
                attribute: 'textContent',
                required: true
            },
            vintage: {
                selector: '.vintage',
                attribute: 'textContent',
                transform: (value: string) => parseInt(value.match(/\d{4}/)?.[0] || '0', 10)
            },
            rating: {
                selector: '.rating-value',
                attribute: 'textContent',
                transform: (value: string) => parseFloat(value)
            },
            region: {
                selector: '.wine-region',
                attribute: 'textContent'
            },
            varietal: {
                selector: '.varietal',
                attribute: 'textContent'
            },
            type: {
                selector: '.wine-type',
                attribute: 'textContent'
            },
            size: {
                selector: '.bottle-size',
                attribute: 'textContent'
            },
            notes: {
                selector: '.tasting-notes',
                attribute: 'textContent'
            },
            price: {
                selector: '.price-value',
                attribute: 'textContent',
                transform: (value: string) => parseFloat(value.replace(/[^0-9.]/g, ''))
            }
        }
    }
};

export const VIVINO_CONFIG: ScraperConfig = {
    baseUrl: 'https://www.vivino.com',
    loginPath: '/api/login',
    searchPath: '/search/wines',
    rateLimit: {
        requests: 5,
        perSeconds: 60
    },
    selectors: {
        loginForm: {
            usernameField: {
                selector: 'input[name="email"]',
                required: true,
                validation: /^[^@]+@[^@]+\.[^@]+$/
            },
            passwordField: {
                selector: 'input[name="password"]',
                required: true
            },
            submitButton: {
                selector: 'button[type="submit"]',
                required: true
            }
        },
        wineData: {
            name: {
                selector: '[data-testid="wine-name"]',
                attribute: 'textContent',
                required: true,
                transform: (value: string) => value.trim()
            },
            producer: {
                selector: '[data-testid="winery-name"]',
                attribute: 'textContent',
                required: true
            },
            vintage: {
                selector: '[data-testid="vintage-name"]',
                attribute: 'textContent',
                transform: (value: string) => parseInt(value.match(/\d{4}/)?.[0] || '0', 10)
            },
            rating: {
                selector: '[data-testid="aggregate-rating"] .rating',
                attribute: 'textContent',
                transform: (value: string) => parseFloat(value)
            },
            region: {
                selector: '[data-testid="wine-region"]',
                attribute: 'textContent'
            },
            varietal: {
                selector: '[data-testid="grape-names"]',
                attribute: 'textContent',
                transform: (value: string) => value.split(',').map(g => g.trim()).join(', ')
            },
            price: {
                selector: '[data-testid="price"]',
                attribute: 'textContent',
                transform: (value: string) => parseFloat(value.replace(/[^0-9.]/g, ''))
            },
            reviews: {
                selector: '[data-testid="reviews-list"]',
                attribute: 'textContent'
            }
        }
    },
    validation: {
        loginSuccess: '.user-profile',
        searchResults: '.search-results-list'
    }
};

// Function to validate and merge custom config with defaults
export function createScraperConfig(
    customConfig: Partial<ScraperConfig>,
    baseConfig: ScraperConfig = CELLARTRACKER_CONFIG
): ScraperConfig {
    return {
        ...baseConfig,
        ...customConfig,
        rateLimit: {
            ...baseConfig.rateLimit,
            ...customConfig.rateLimit
        },
        selectors: {
            ...baseConfig.selectors,
            ...customConfig.selectors
        }
    };
}