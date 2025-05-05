# Wine Collection App - Development Guidelines

## Overview
React TypeScript application for wine collection management with barcode scanning support. Optimized for Symcode USB scanner with fallback manual entry.

## Core Technical Stack
- React 18+ with TypeScript
- React Router for navigation
- IndexedDB for local storage
- WCAG 2.1 Level AA compliance
- Error Boundary implementation
- USB Barcode Scanner integration
- React Bootstrap components

## Component Structure
```typescript
// Primary Components
- Scanner          # Barcode input component
- WineList         # Collection display with auto-refresh
- WineDetail       # Individual wine view page
- ErrorBoundary    # Error handling wrapper
```

## State Management
### WineContext
```typescript
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
```

## Data Models
```typescript
interface Wine {
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
```

## Storage Implementation
### IndexedDB Structure
- WineCollectionDB (main database)
  - wines (object store)
- WineApiCache (cache database)
  - apiCache (object store)

### Cache Management
```typescript
interface CachedData<T> {
    data: T;
    timestamp: number;
    key: string;
}
```

## API Integration
### Tiered API Approach
1. Wine-Searcher API (if configured)
2. Global Wine Score API (if configured)
3. Open Food Facts API (fallback)

### Environment Variables
```
WINE_SEARCHER_API_KEY=your_key_here
WINE_SEARCHER_BASE_URL=https://api.wine-searcher.com/v1
GLOBAL_WINE_SCORE_API_KEY=your_key_here
GLOBAL_WINE_SCORE_BASE_URL=https://api.globalwinescore.com/v1
ENABLE_WINE_SEARCHER=false
ENABLE_GLOBAL_WINE_SCORE=false
API_CACHE_DURATION=86400000
```

## UI/UX Guidelines
### Collection View
- Auto-refresh every 30 seconds
- Manual refresh button
- Clickable wine cards
- Loading states
- Toast notifications

### Wine Detail View
- Back navigation
- Full wine details
- Loading states
- Error handling

### Accessibility
- ARIA labels on all interactive elements
- Proper heading hierarchy
- Focus management
- Screen reader announcements
- Keyboard navigation

## Error Handling
- Component error boundaries
- API error fallbacks
- Database error recovery
- User-friendly error messages
- Toast notifications

## Performance Guidelines
- API response caching
- Optimistic UI updates
- Debounced auto-refresh
- Lazy loading of routes
- Memoized components where needed

## Testing Requirements
- Jest + React Testing Library
- API mocking
- IndexedDB mocking
- Accessibility tests
- Route testing
- Context testing

## Security
- API key protection
- Input sanitization
- IndexedDB versioning
- Rate limiting
- XSS prevention

## Routing Structure
```typescript
<Routes>
    <Route path="/" element={<WineList />} />
    <Route path="/wine/:id" element={<WineDetail />} />
</Routes>
```

Remember:
- Follow TypeScript strict mode
- Implement proper error boundaries
- Handle all async operations safely
- Maintain WCAG 2.1 Level AA compliance
- Test all user interactions
- Document new features