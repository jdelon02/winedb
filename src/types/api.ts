// OpenFoodFacts API Response Types
export interface OpenFoodFactsResponse {
    code: string;
    product: {
        _id: string;
        product_name: string;
        brands?: string;
        generic_name?: string;
        categories_tags?: string[];
        allergens_tags?: string[];
        ingredients_text?: string;
        alcohol_100g?: number;
        image_url?: string;
        image_small_url?: string;
        image_nutrition_url?: string;
        quantity?: string;
        serving_size?: string;
        packaging?: string;
        origins?: string;
        manufacturing_places?: string;
        labels?: string;
        stores?: string;
        countries?: string;
        created_t?: number;
        last_modified_t?: number;
    };
    status: number;
    status_verbose: string;
}

// Wine-Searcher API Response Types
export interface WineSearcherResponse {
    wine: {
        name: string;
        producer: string;
        vintage?: string;
        varietal?: string;
        region?: string;
        country?: string;
        type?: string; // Red, White, Sparkling, etc.
        alcohol_content?: string;
        bottle_size?: string;
        closure_type?: string; // Cork, Screw Cap, etc.
        price_retail?: number;
        critics_score?: number;
        critics_rating?: string;
        producer_rating?: number;
        tasting_notes?: string[];
        food_pairings?: string[];
        serving_temperature?: string;
        cellaring_potential?: string;
        production_size?: string;
    };
    status: string;
    message?: string;
}

// Global Wine Score API Response Types
export interface GlobalWineScoreResponse {
    wine: {
        name: string;
        producer: string;
        vintage?: string;
        color?: string;
        type?: string;
        region?: string;
        appellation?: string;
        country?: string;
        score: number; // 0-100 scale
        confidence_index: number;
        journalist_count: number;
        ratings_count: number;
        wine_id: string;
        classification?: string;
        drink_from?: number;
        drink_to?: number;
        maturity?: string;
        grape_varieties?: string[];
        bottle_size?: string;
    };
    success: boolean;
    error?: string;
}

// Mapped Wine Data (how we consolidate the APIs)
export type WineDataSource = 'openfoodfacts' | 'wine-searcher' | 'global-wine-score' | 'wine-scraper';

export interface MappedWineData {
    name: string;
    producer?: string;
    vintage?: string;
    varietal?: string;
    region?: string;
    country?: string;
    rating?: number;
    price?: number;
    alcoholContent?: number;
    type?: string;
    imageUrl?: string;
    tastingNotes?: string[];
    foodPairings?: string[];
    cellaring?: string;
    drinkWindow?: {
        from?: number;
        to?: number;
    };
    metadata: {
        source: WineDataSource;
        confidence?: number;
        lastUpdated: string;
    };
}