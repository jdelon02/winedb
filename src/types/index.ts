import { WineService } from '../services/WineService';

export interface Wine {
    id: string;
    barcode: string;
    name: string;
    vintage?: string;
    producer?: string;
    varietal?: string;
    rating?: number;
    created_at: string;
    updated_at: string;
    tastingNotes?: TastingNotes;
    vineyard?: VineyardInfo;
}

export interface TastingNotes {
    date: string;
    rating: number; // 1-5 stars
    notes: string;
    aroma?: string;
    taste?: string;
    finish?: string;
    foodPairings?: string[];
}

export interface VineyardInfo {
    name: string;
    owner?: string;
    location?: string;
    description?: string;
    foundedYear?: number;
    website?: string;
}

export interface WineContextType {
    wineService: WineService;
    isLoading: boolean;
    isInitialized: boolean;
    error: Error | null;
    clearError: () => void;
    refreshCollection: () => Promise<Wine[] | undefined>; // Updated return type
    wines: Wine[];
    notification: { message: string; show: boolean } | null;
    hideNotification: () => void;
}

export interface WineDetails {
    name: string;
    vintage?: string;
    producer?: string;
    region?: string;
    type?: string;
    varietal?: string;
    rating?: number;
    averagePrice?: number;
    imageUrl?: string;
}

export interface ApiResponse<T> {
    status: number;
    data?: T;
    error?: string;
}

export interface WineApiConfig {
    apiKey?: string;
    baseUrl?: string;
    enabled: boolean;
    provider: 'vivino' | 'globalwinescore' | 'openfoodfacts';
}

export interface CachedData<T> {
    data: T;
    timestamp: number;
    key: string;
}