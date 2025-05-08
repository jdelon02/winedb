import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { WineContextType, Wine } from './types';
import { WineService } from '../services/WineService';

// Create the context with a proper default value
const WineContext = createContext<WineContextType>({
  wineService: new WineService(),
  wines: [],
  isLoading: false,
  isInitialized: false,
  error: null,
  clearError: () => {},
  refreshCollection: async () => { return [] },
  notification: null,
  hideNotification: () => {}
});

// Create a custom hook for using the Wine context
export const useWineContext = (): WineContextType => {
  const context = useContext(WineContext);
  if (!context) {
    throw new Error('useWineContext must be used within a WineProvider');
  }
  return context;
};

interface WineProviderProps {
  children: ReactNode;
}

export const WineProvider: React.FC<WineProviderProps> = ({ children }) => {
  const [wines, setWines] = useState<Wine[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [notification, setNotification] = useState<{ message: string; show: boolean } | null>(null);
  
  // Create an instance of WineService
  const wineService = new WineService();

  const clearError = () => {
    setError(null);
  };

  const hideNotification = () => {
    setNotification(null);
  };

  const refreshCollection = async (): Promise<Wine[]> => {
    try {
      setIsLoading(true);
      const fetchedWines = await wineService.getAllWines();
      setWines(fetchedWines);
      setIsInitialized(true);
      return fetchedWines;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('An unknown error occurred');
      setError(error);
      console.error('Error refreshing wine collection:', error);
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  // Initialize the wine collection on component mount
  useEffect(() => {
    refreshCollection();
  }, []);

  const value: WineContextType = {
    wineService,
    isLoading,
    isInitialized,
    error,
    clearError,
    refreshCollection,
    wines,
    notification,
    hideNotification
  };

  return <WineContext.Provider value={value}>{children}</WineContext.Provider>;
};