import React from 'react';
import { WineProvider } from '../context/WineContext';
import ErrorBoundary from './ErrorBoundary';

interface AppProviderProps {
  children: React.ReactNode;
}

const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  return (
    <ErrorBoundary>
      <WineProvider>
        {children}
      </WineProvider>
    </ErrorBoundary>
  );
};

export default AppProvider;