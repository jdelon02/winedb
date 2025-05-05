import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { WineService } from '../services/WineService';

interface WineContextType {
    wineService: WineService;
    isLoading: boolean;
    isInitialized: boolean;
    error: Error | null;
    clearError: () => void;
}

const WineContext = createContext<WineContextType | null>(null);

export const WineProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isLoading, setIsLoading] = useState(true);
    const [isInitialized, setIsInitialized] = useState(false);
    const [error, setError] = useState<Error | null>(null);
    const [wineService] = useState(() => new WineService());

    useEffect(() => {
        const initializeDB = async () => {
            try {
                await wineService.initialize();
                setIsInitialized(true);
            } catch (err) {
                setError(err instanceof Error ? err : new Error('Failed to initialize database'));
            } finally {
                setIsLoading(false);
            }
        };

        initializeDB();
    }, [wineService]);

    const clearError = useCallback(() => {
        setError(null);
    }, []);

    const contextValue: WineContextType = {
        wineService,
        isLoading,
        isInitialized,
        error,
        clearError
    };

    if (isLoading) {
        return <div aria-live="polite">Initializing database...</div>;
    }

    if (error) {
        return (
            <div role="alert">
                <p>Error initializing database: {error.message}</p>
                <button onClick={clearError}>Retry</button>
            </div>
        );
    }

    return (
        <WineContext.Provider value={contextValue}>
            {children}
        </WineContext.Provider>
    );
};

export const useWine = () => {
    const context = useContext(WineContext);
    if (!context) {
        throw new Error('useWine must be used within a WineProvider');
    }
    return context;
};