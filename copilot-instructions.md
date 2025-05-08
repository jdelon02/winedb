# GitHub Copilot Instructions - Wine Collection App

This repository contains a React TypeScript application for managing wine collections with barcode scanning capabilities.

## Application Overview

The Wine Collection App allows users to:
- Scan wine barcodes using a USB barcode scanner or manual entry
- Store wine details locally using IndexedDB
- Fetch wine information from external APIs when available
- View, edit, and manage their wine collection

## Technical Stack

- React 18+ with TypeScript
- React Router for navigation
- React Bootstrap for UI components
- IndexedDB for local storage
- Context API for state management

## Key Components

- **Scanner**: Handles barcode input via USB scanner or manual entry
- **WineList**: Displays the collection with search and auto-refresh
- **WineDetail**: Shows and edits individual wine details
- **WineService**: Manages database operations and API integration
- **WineContext**: Provides state management across the application
- **ErrorBoundary**: Handles component-level errors

## Running the Application

To run the application locally:

1. Install dependencies:
```bash
npm install
```

2. Configure environment variables (optional):
Create a `.env` file with the following variables for API integration:
```
WINE_SEARCHER_API_KEY=your_key_here
WINE_SEARCHER_BASE_URL=https://api.wine-searcher.com/v1
GLOBAL_WINE_SCORE_API_KEY=your_key_here
GLOBAL_WINE_SCORE_BASE_URL=https://api.globalwinescore.com/v1
ENABLE_WINE_SEARCHER=false
ENABLE_GLOBAL_WINE_SCORE=false
API_CACHE_DURATION=86400000
```

3. Start the development server:
```bash
npm start
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Feature Areas for Enhancements

Here are some areas where GitHub Copilot can assist with enhancements:

1. **Scanner Enhancement**:
   - Add camera-based barcode scanning using mobile device cameras
   - Improve scanner detection algorithms
   - Add support for different barcode formats

2. **API Integration**:
   - Extend the tiered API approach with additional wine data sources
   - Implement more sophisticated caching strategies
   - Add wine image retrieval capabilities

3. **Data Visualization**:
   - Create charts and graphs for wine collection analytics
   - Visualize wine ratings and vintages
   - Implement comparison features

4. **Offline Capabilities**:
   - Enhance offline functionality
   - Implement background sync for operations when connection is restored
   - Add export/import functionality for backup

5. **Testing**:
   - Add Jest/React Testing Library tests
   - Implement E2E tests with Cypress
   - Create mock service workers for API testing

## Code Conventions

- Use TypeScript strict mode
- Follow React functional component patterns with hooks
- Use async/await for asynchronous operations
- Implement proper error boundaries and error handling
- Maintain WCAG 2.1 Level AA compliance for accessibility

## File Structure

```
src/
├── components/      # React components
│   ├── ErrorBoundary.tsx
│   ├── Scanner.tsx
│   ├── WineDetail.tsx
│   └── WineList.tsx
├── contexts/        # Context providers
│   └── WineContext.tsx
├── services/        # Service classes
│   └── WineService.ts
├── types/           # TypeScript interfaces
│   └── index.ts
├── App.tsx          # Main application component
├── App.css          # Application styles
└── index.tsx        # Application entry point
```