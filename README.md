# Wine Collection App

A React application for wine enthusiasts to track their collection, record tasting notes, and manage wine inventory.

## Features

- **Barcode Scanning**: Add wines via USB barcode scanner, camera, or manual entry
- **Collection Management**: View, edit, and manage your personal wine collection
- **Inventory Tracking**: Keep track of multiple bottles with quantity counters
- **Quick Consumption**: One-click consumption tracking
- **Tasting Notes**: Record your wine tasting experiences with ratings and detailed notes
- **Quick Review System**: Add reviews directly from the wine list with an intuitive star rating system
- **Vineyard Information**: Store details about vineyards including location, ownership, and history
- **Offline First**: Works with or without an internet connection
- **Progressive Web App**: Install on your device for a native-like experience

## Getting Started

### Prerequisites

- Node.js 16 or higher
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/winedb.git
cd winedb
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

### Adding a Wine

1. Use the scanner at the top of the home page to scan a wine barcode
2. The app will attempt to identify the wine or create a new entry
3. Edit the wine details as needed

### Managing Your Collection

- **View Wines**: Browse and search your collection on the home page
- **Edit Details**: Click on any wine to view and edit its details
- **Consume Wine**: Click "Consume" to decrease the quantity by one
- **Add Review**: Use the "Add Review" button to quickly rate and review a wine
- **Delete Wine**: Remove wines from your collection when needed

### Recording Tasting Notes

1. Click "Add Review" on a wine card or open the wine details and go to the "Tasting Notes" tab
2. Record the tasting date and rating (1-5 stars)
3. Add notes about aroma, taste, finish, and food pairings
4. Save your review

### Storing Vineyard Information

1. Open a wine's details
2. Go to the "Vineyard Info" tab
3. Add information about the vineyard, its location, owner, and story
4. Save your changes

## Technologies

- React
- TypeScript
- IndexedDB
- React Bootstrap
- React Router
- QuaggaJS (for barcode scanning)

## Project Structure

```
src/
├── components/      # React components
├── context/         # Context providers
├── services/        # Service classes
├── types/           # TypeScript interfaces
├── App.tsx          # Main application component
└── index.tsx        # Application entry point
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- React team for the amazing framework
- QuaggaJS for barcode scanning capabilities
- React Bootstrap for UI components