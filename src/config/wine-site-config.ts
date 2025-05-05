import { ScraperConfig } from '../types/scraper';

export const VIVINO_DETAILED_CONFIG: ScraperConfig = {
    baseUrl: 'https://www.vivino.com',
    loginPath: '/api/login',
    searchPath: '/search/wines',
    rateLimit: {
        requests: 5,
        perSeconds: 60
    },
    headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; WineCollection/1.0;)',
        'Accept-Language': 'en-US,en;q=0.9'
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
                required: true,
                validation: /.{8,}/
            },
            submitButton: {
                selector: 'button[type="submit"]',
                required: true
            },
            errorMessage: {
                selector: '.error-message',
                attribute: 'textContent'
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
            price: {
                selector: '[data-testid="price"]',
                attribute: 'textContent',
                transform: (value: string) => parseFloat(value.replace(/[^0-9.]/g, ''))
            },
            image: {
                selector: '.wine-image img',
                attribute: 'src'
            },
            region: {
                selector: '[data-testid="wine-region"]',
                attribute: 'textContent'
            },
            varietal: {
                selector: '[data-testid="grape-names"]',
                attribute: 'textContent',
                transform: (value: string) => value.split(',').map(g => g.trim())
            }
        },
        pagination: {
            nextButton: '.next-page-button',
            pageNumbers: '.page-number',
            resultCount: '.results-count'
        }
    },
    validation: {
        loginSuccess: '.user-profile',
        searchResults: '.search-results-list'
    }
};