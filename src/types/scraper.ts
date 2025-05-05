export interface ScraperCredentials {
    username: string;
    password: string;
}

export interface DataSelector {
    selector: string;
    attribute?: string; // e.g., 'textContent', 'href', 'src'
    transform?: (value: string) => any; // Optional transformation function
    required?: boolean;
    validation?: RegExp; // Validation pattern
}

export interface WineDataSelectors {
    name: DataSelector;
    producer: DataSelector;
    vintage: DataSelector;
    rating: DataSelector;
    region?: DataSelector;
    varietal?: DataSelector;
    type?: DataSelector;
    size?: DataSelector;
    notes?: DataSelector;
    price?: DataSelector;
    image?: DataSelector;
    reviews?: DataSelector;
}

export interface LoginFormSelectors {
    usernameField: DataSelector;
    passwordField: DataSelector;
    submitButton: DataSelector;
    errorMessage?: DataSelector;
    captcha?: DataSelector;
}

export interface ScraperConfig {
    baseUrl: string;
    loginPath: string;
    searchPath: string;
    rateLimit: {
        requests: number;
        perSeconds: number;
    };
    headers?: Record<string, string>; // Custom headers for requests
    cookies?: Record<string, string>; // Required cookies
    selectors: {
        loginForm: LoginFormSelectors;
        wineData: WineDataSelectors;
        pagination?: {
            nextButton: string;
            pageNumbers: string;
            resultCount: string;
        };
    };
    validation?: {
        loginSuccess: string; // Selector to verify successful login
        searchResults: string; // Selector to verify valid search results
    };
}