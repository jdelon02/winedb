import { WineService } from '../services/WineService';

// Wine data structure
export interface Wine {
  id: string;
  barcode: string;
  name: string;
  producer?: string;
  vintage?: string;
  varietal?: string;
  rating?: number;
  quantity: number; // Track number of bottles
  created_at: string;
  updated_at: string;
}

// WineContext type definition
export interface WineContextType {
  wineService: WineService;
  wines: Wine[];
  isLoading: boolean;
  isInitialized: boolean;
  error: Error | null;
  clearError: () => void;
  refreshCollection: () => Promise<Wine[] | undefined>;
  notification: { message: string; show: boolean } | null;
  hideNotification: () => void;
}