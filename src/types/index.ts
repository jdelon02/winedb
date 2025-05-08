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