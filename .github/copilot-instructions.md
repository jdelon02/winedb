# GitHub Copilot Instructions - Wine Collection App

This file (`.github/copilot-instructions.md`) provides guidance for GitHub Copilot when assisting with the Wine Collection App. It contains information about the application's architecture, components, and development guidelines.

## Application Overview

The Wine Collection App allows users to:
- Scan wine barcodes using a USB barcode scanner, camera, or manual entry
- Store wine details locally using IndexedDB
- Fetch wine information from external APIs when available
- View, edit, and manage their wine collection
- Record tasting notes and vineyard information for each wine
- Add quick reviews directly from the wine list view

## Technical Stack

- React 18+ with TypeScript
- React Router for navigation
- React Bootstrap for UI components
- IndexedDB for local storage
- Context API for state management
- QuaggaJS for camera-based barcode scanning

## Key Components

- **Scanner**: Handles barcode input via USB scanner, camera, or manual entry
- **CameraScanner**: Provides camera-based barcode scanning using QuaggaJS
- **WineList**: Displays the collection with search and auto-refresh
- **WineDetail**: Shows and edits individual wine details
- **QuickReviewModal**: Provides a quick way to add or update tasting notes
- **WineService**: Manages database operations and API integration
- **WineContext**: Provides state management across the application
- **ErrorBoundary**: Handles component-level errors
- **BarcodeUtils**: Provides utilities for barcode normalization and fuzzy matching

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
   - ✅ Add camera-based barcode scanning using mobile device cameras (implemented with QuaggaJS)
   - ✅ Improve scanner detection algorithms with fuzzy barcode matching
   - ✅ Smart barcode normalization for consistent handling
   - ✅ Enhanced buffer management for reliable consecutive scans
   - ✅ Detailed scan logging for troubleshooting
   - Add support for additional barcode formats
   - Enhance the camera scanner's UI and performance

2. **Inventory Management**:
   - ✅ Track multiple bottles of the same wine with quantity counter
   - ✅ Quick consumption tracking with one-click decrement
   - ✅ Consistent quantity increments with consecutive scans
   - Add location tracking (cellar, rack, bin, etc.)
   - Implement drink-by date recommendations
   - Add purchase price and valuation tracking

3. **Wine Information Management**:
   - ✅ Tasting notes with rating, aroma, taste, and finish characteristics
   - ✅ Quick review system accessible from the wine list
   - ✅ Vineyard information including owner, location, and history
   - Add wine region and classification information
   - Implement vintage tracking and aging recommendations
   - Add label photo capture and storage

4. **API Integration**:
   - Extend the tiered API approach with additional wine data sources
   - Implement more sophisticated caching strategies
   - Add wine image retrieval capabilities

5. **Data Visualization**:
   - Create charts and graphs for wine collection analytics
   - ✅ Visualize wine ratings with star displays
   - Implement comparison features

6. **Offline Capabilities**:
   - Enhance offline functionality
   - Implement background sync for operations when connection is restored
   - Add export/import functionality for backup

7. **Testing**:
   - Add Jest/React Testing Library tests
   - Implement E2E tests with Cypress
   - Create mock service workers for API testing

## Development Guidelines

The development of this application follows the guidelines specified in the project documentation, including:

- Use TypeScript strict mode
- Follow React functional component patterns with hooks
- Use async/await for asynchronous operations
- Implement proper error boundaries and error handling
- Maintain WCAG 2.1 Level AA compliance for accessibility
- Follow the tiered API approach for data integration
- Implement IndexedDB with proper versioning and error handling
- Ensure responsive design for all screen sizes

## File Structure

```
src/
├── components/      # React components
│   ├── CameraScanner.tsx  # Camera-based barcode scanner
│   ├── ErrorBoundary.tsx
│   ├── QuickReviewModal.tsx  # Modal for adding wine reviews quickly
│   ├── Scanner.tsx
│   ├── WineDetail.tsx
│   └── WineList.tsx
├── context/         # Context providers
│   └── WineContext.tsx
├── services/        # Service classes
│   └── WineService.ts
├── types/           # TypeScript interfaces
│   ├── index.ts     # Contains TastingNotes and VineyardInfo interfaces
│   └── quagga.d.ts  # Type definitions for QuaggaJS
├── utils/           # Utility functions
│   └── barcodeUtils.ts  # Barcode normalization and fuzzy matching
├── App.tsx          # Main application component
├── App.css          # Application styles
└── index.tsx        # Application entry point
```

## Camera Scanning Implementation
- **CameraScanner Component**: Provides camera access and real-time barcode detection
- **Scanner Modes**: Users can switch between USB scanner, camera scanner, and manual entry
- **Multi-Camera Support**: Auto-detection of available cameras with preference for rear cameras
- **Confidence Tracking**: Implements confidence algorithm requiring multiple consistent scans
- **Error Handling**: Comprehensive error handling for camera permissions and scanning issues
- **Barcode Formats**: Support for EAN-13, EAN-8, UPC-A, UPC-E, and CODE-128 formats

## Barcode Fuzzy Matching Implementation

The application implements a sophisticated barcode fuzzy matching system to handle scanning variations:

- **Barcode Normalization**: Standardizes barcode formats across the application
  - Removes non-numeric characters
  - Validates barcode length and format
  - Ensures consistent handling of EAN/UPC codes

- **Fuzzy Matching Strategies**:
  - **Container Matching**: Detects when one barcode contains another (handles truncated scans)
  - **Similarity Scoring**: Calculates match percentage based on digit comparison

- **Central Utilities**: 
  - Shared `barcodeUtils.ts` utility file ensures consistent handling across components
  - Functions are pure and easily testable
  - Configurable similarity threshold (default 80%)

- **Enhanced Detection**:
  - Falls back to fuzzy matching only when exact matches aren't found
  - Prevents duplicate entries from slightly different scans of the same barcode
  - Comprehensive logging for easier debugging
  - Prioritizes matches by confidence level

This implementation ensures users can reliably scan the same bottle multiple times, even when barcode readers capture the code slightly differently each time.

## Inventory Management Implementation

The application now includes inventory management features for tracking multiple bottles:

- **Quantity Tracking**: Each wine entry includes a quantity counter for multiple bottles
- **Automatic Increments**: When scanning a previously recorded wine, quantity auto-increments
- **One-Click Consumption**: Quick decrement buttons in both list and detail views
- **Smart Delete Flow**: When consuming the last bottle, user is prompted to delete or keep the record
- **Quantity-Aware UI**: Bottle counts displayed prominently in list view with badges
- **Direct Quantity Editing**: Intuitive +/- controls for quantity adjustment in edit mode

These features make the app more practical for real-world use, allowing users to maintain an accurate inventory with minimal effort.

## Tasting Notes and Vineyard Information

The application now includes comprehensive wine information management:

- **Tasting Notes**: Track detailed tasting experiences with:
  - Star ratings (1-5) for wine quality
  - Tasting date record
  - Aroma, taste, and finish characteristics
  - Overall notes and impressions
  - Food pairing suggestions

- **Quick Review System**:
  - Add or update reviews directly from the wine list
  - Interactive star rating system
  - Simplified form for capturing key impressions
  - Reviews display prominently in wine cards

- **Vineyard Information**:
  - Track vineyard name, owner, and location
  - Record vineyard history and founding year
  - Store vineyard description and background story
  - Link to vineyard website

- **Enhanced Wine List Display**:
  - Star ratings displayed prominently on wine cards
  - Preview of tasting notes on each wine card
  - Vineyard information displayed when available
  - Tasting date shown alongside ratings

The database has been upgraded to version 2 to support these new data structures, with appropriate migration paths for existing data.

## API Integration

The application uses a tiered approach to API integration:

1. **Primary API**: Wine-Searcher API (premium, requires API key)
2. **Secondary API**: Global Wine Score API (premium, requires API key)
3. **Fallback API**: Open Food Facts API (free, no API key required)

When a barcode is scanned, the application attempts to fetch wine data from these APIs in sequence, using the first successful result. All API responses are cached in IndexedDB to minimize API calls and improve offline performance.

## Database Structure

The application uses two IndexedDB databases:

1. **WineCollectionDB**: Stores the user's wine collection
   - Object Store: `wines`
   - Indexes: `barcode`, `updated_at`
   - Schema version: 2 (upgraded to support tasting notes and vineyard info)

2. **WineApiCache**: Caches API responses
   - Object Store: `apiCache`
   - Indexes: `timestamp`

The WineService implementation includes mechanisms for database structure verification and auto-repair when needed.

## Error Handling

The application implements comprehensive error handling:

- Component-level errors are caught by ErrorBoundary
- API errors are caught and logged with fallback to next API tier
- Database errors are handled with appropriate user feedback
- Network errors trigger offline mode with cached data
- Camera permission errors provide clear user guidance

## Performance Considerations

To ensure optimal performance, the application:

- Uses IndexedDB for efficient local storage
- Implements data caching to minimize API calls
- Uses lazy loading for components when appropriate
- Optimizes re-renders with React.memo and useMemo/useCallback
- Dynamically imports heavy libraries like QuaggaJS to reduce initial bundle size

## Security Considerations

Security measures include:

- No sensitive API keys in client-side code (should be provided via environment variables)
- Input validation for all user-entered data
- Content Security Policy (CSP) headers for production
- HTTPS for all API communications
- Secure handling of camera permissions