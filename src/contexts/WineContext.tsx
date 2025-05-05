import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { WineService } from '../services/WineService';
import { Wine } from '../repositories/types';
import { Toast } from 'react-bootstrap';

interface WineContextType {
    wineService: WineService;
    isLoading: boolean;
    isInitialized: boolean;
    error: Error | null;
    clearError: () => void;
    refreshCollection: () => Promise<void>;
    wines: Wine[];
    notification: { message: string; show: boolean } | null;
    hideNotification: () => void;
}

const WineContext = createContext<WineContextType | null>(null);

export const WineProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isLoading, setIsLoading] = useState(true);
    const [isInitialized, setIsInitialized] = useState(false);
    const [error, setError] = useState<Error | null>(null);
    const [wines, setWines] = useState<Wine[]>([]);
    const [notification, setNotification] = useState<{ message: string; show: boolean } | null>(null);
    const [wineService] = useState(() => new WineService());

    const refreshCollection = useCallback(async () => {
        try {
            const collection = await wineService.getWineCollection();
            setWines(collection);
        } catch (err) {
            setError(err instanceof Error ? err : new Error('Failed to refresh collection'));
        }
    }, [wineService]);

    useEffect(() => {
        const initializeDB = async () => {
            try {
                await wineService.initialize();
                setIsInitialized(true);
                await refreshCollection();
            } catch (err) {
                setError(err instanceof Error ? err : new Error('Failed to initialize database'));
            } finally {
                setIsLoading(false);
            }
        };

        initializeDB();
    }, [wineService, refreshCollection]);

    // Auto-refresh every 30 seconds
    useEffect(() => {
        if (!isInitialized) return;

        const intervalId = setInterval(refreshCollection, 30000);
        return () => clearInterval(intervalId);
    }, [isInitialized, refreshCollection]);

    const showNotification = useCallback((message: string) => {
        setNotification({ message, show: true });
    }, []);

    const hideNotification = useCallback(() => {
        setNotification(null);
    }, []);

    const clearError = useCallback(() => {
        setError(null);
    }, []);

    // Override wineService methods to add notifications
    useEffect(() => {
        const originalScanBarcode = wineService.scanBarcode.bind(wineService);
        wineService.scanBarcode = async (barcode: string) => {
            const wine = await originalScanBarcode(barcode);
            showNotification(`Added ${wine.name} to your collection`);
            refreshCollection();
            return wine;
        };
    }, [wineService, showNotification]);

    const contextValue: WineContextType = {
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

    return (
        <WineContext.Provider value={contextValue}>
            {notification && (
                <Toast 
                    show={notification.show}
                    onClose={hideNotification}
                    delay={3000}
                    autohide
                    style={{
                        position: 'fixed',
                        bottom: 20,
                        right: 20,
                        zIndex: 1000
                    }}
                >
                    <Toast.Header>
                        <strong className="me-auto">Wine Collection</strong>
                    </Toast.Header>
                    <Toast.Body>{notification.message}</Toast.Body>
                </Toast>
            )}
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