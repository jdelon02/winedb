# GitHub Copilot Instructions - Wine Collection App

This file (`.github/copilot-instructions.md`) provides guidance for GitHub Copilot when assisting with the Wine Collection App. It contains information about the application's architecture, components, and development guidelines.

## Application Overview

The Wine Collection App allows users to:
- Scan wine barcodes using a USB barcode scanner, camera, or manual entry
- Store wine details locally using IndexedDB
- Fetch wine information from external APIs when available
- View, edit, and manage their wine collection

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
   - ✅ Add camera-based barcode scanning using mobile device cameras (implemented with QuaggaJS)
   - Improve scanner detection algorithms further
   - Add support for additional barcode formats
   - Enhance the camera scanner's UI and performance

2. **Inventory Management**:
   - ✅ Track multiple bottles of the same wine with quantity counter
   - ✅ Quick consumption tracking with one-click decrement
   - Add location tracking (cellar, rack, bin, etc.)
   - Implement drink-by date recommendations
   - Add purchase price and valuation tracking

3. **API Integration**:
   - Extend the tiered API approach with additional wine data sources
   - Implement more sophisticated caching strategies
   - Add wine image retrieval capabilities

4. **Data Visualization**:
   - Create charts and graphs for wine collection analytics
   - Visualize wine ratings and vintages
   - Implement comparison features

5. **Offline Capabilities**:
   - Enhance offline functionality
   - Implement background sync for operations when connection is restored
   - Add export/import functionality for backup

6. **Testing**:
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
│   ├── Scanner.tsx
│   ├── WineDetail.tsx
│   └── WineList.tsx
├── context/         # Context providers
│   └── WineContext.tsx
├── services/        # Service classes
│   └── WineService.ts
├── types/           # TypeScript interfaces
│   ├── index.ts
│   └── quagga.d.ts  # Type definitions for QuaggaJS
├── App.tsx          # Main application component
├── App.css          # Application styles
└── index.tsx        # Application entry point
```

## Camera Scanning Implementation

The application now implements camera-based barcode scanning using QuaggaJS:

- **CameraScanner Component**: Provides camera access and real-time barcode detection
- **Scanner Modes**: Users can switch between USB scanner, camera scanner, and manual entry
- **Multi-Camera Support**: Auto-detection of available cameras with preference for rear cameras
- **Confidence Tracking**: Implements confidence algorithm requiring multiple consistent scans
- **Error Handling**: Comprehensive error handling for camera permissions and scanning issues
- **Barcode Formats**: Support for EAN-13, EAN-8, UPC-A, UPC-E, and CODE-128 formats

## Inventory Management Implementation

The application now includes inventory management features for tracking multiple bottles:

- **Quantity Tracking**: Each wine entry includes a quantity counter for multiple bottles
- **Automatic Increments**: When scanning a previously recorded wine, quantity auto-increments
- **One-Click Consumption**: Quick decrement buttons in both list and detail views
- **Smart Delete Flow**: When consuming the last bottle, user is prompted to delete or keep the record
- **Quantity-Aware UI**: Bottle counts displayed prominently in list view with badges
- **Direct Quantity Editing**: Intuitive +/- controls for quantity adjustment in edit mode

These features make the app more practical for real-world use, allowing users to maintain an accurate inventory with minimal effort.

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