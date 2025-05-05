export interface WineDetails {
  id?: string;
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
  data?: T;
  error?: string;
  status: number;
}

export interface WineApiConfig {
  apiKey?: string;
  baseUrl: string;
  provider: 'vivino' | 'globalwinescore';
}