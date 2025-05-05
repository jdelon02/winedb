import React from 'react';
import { WineProvider } from '../contexts/WineContext';
import { ErrorBoundary } from './ErrorBoundary';

interface AppProviderProps {
    children: React.ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
    return (
        <ErrorBoundary>
            <WineProvider>
                {children}
            </WineProvider>
        </ErrorBoundary>
    );
};