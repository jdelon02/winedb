# Wine Collection App - Development Guidelines

## Overview
React TypeScript application for wine collection management with barcode scanning support. Optimized for Symcode USB scanner with fallback manual entry.

## Core Technical Requirements
- React 18+ with TypeScript
- WCAG 2.1 Level AA compliance
- Error boundaries for failure handling
- Local storage for offline capability
- USB barcode scanner integration

## Component Development
```typescript
// Component Template
import React from 'react';
import { ErrorBoundary } from '../components/ErrorBoundary';

interface ComponentProps {
  // Define strict prop types
}

export const Component: React.FC<ComponentProps> = (props) => {
  // Implement with hooks
  // Use error boundaries
  // Follow accessibility guidelines
};
```

## State Management
- Context API for global scanner/collection state
- Local state for UI components
- Consider Zustand for complex flows
- Implement proper loading states

## Scanner Integration
```typescript
interface ScannerConfig {
  debounceMs: number;
  supportedFormats: string[];
  maxLength: number;
}

interface ScannerHook {
  isReady: boolean;
  lastScan: string | null;
  error: Error | null;
  scan: (input: string) => Promise<void>;
}
```

## Data Models
```typescript
interface Wine {
  id: string;
  barcode: string;
  name: string;
  vintage?: string;
  producer?: string;
  region?: string;
  type?: string;
  varietal?: string;
  rating?: number;
  addedDate: string;
  lastModified: string;
}

interface WineCollection {
  wines: Map<string, Wine>;
  version: number;
  lastSync?: string;
}
```

## Error Handling
- Implement ErrorBoundary components
- Use try/catch for async operations
- Provide user recovery options
- Log errors appropriately

## Testing Requirements
```typescript
// Test Template
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';

describe('Component', () => {
  it('should be accessible', async () => {
    const { container } = render(<Component />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
```

## Performance Guidelines
- Implement React.memo for expensive renders
- Use useCallback/useMemo appropriately
- Lazy load routes and large components
- Optimize images and bundle size

## Security Considerations
- Sanitize all user inputs
- Validate barcode data
- Implement rate limiting
- Use secure storage methods
- Follow OWASP best practices

## API Integration
```typescript
interface ApiResponse<T> {
  data?: T;
  error?: string;
  status: number;
}

interface WineApi {
  lookupByBarcode(code: string): Promise<ApiResponse<Wine>>;
  addWine(wine: Wine): Promise<ApiResponse<void>>;
  updateWine(id: string, wine: Partial<Wine>): Promise<ApiResponse<void>>;
}
```

## Local Storage
```typescript
interface StorageManager {
  save(key: string, data: unknown): Promise<void>;
  load<T>(key: string): Promise<T | null>;
  clear(): Promise<void>;
  getSize(): Promise<number>;
}
```

## Focus Management
- Maintain focus after scans
- Implement keyboard navigation
- Follow WAI-ARIA practices
- Handle modal focus trapping

Remember:
- Follow TypeScript strict mode
- Maintain WCAG compliance
- Write unit tests for all components
- Document public APIs and hooks