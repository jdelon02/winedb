# Wine Collection App

A React-based application for scanning, cataloging, and managing your wine collection.

## Features

- **Multi-mode Barcode Scanning**:
  - USB barcode scanner support
  - Camera-based scanning using device cameras
  - Manual barcode entry
  
- **Inventory Management**:
  - Track multiple bottles of the same wine with quantity counter
  - One-click consumption tracking to decrease quantity
  - Auto-increment quantity when scanning existing wines
  - Smart handling of last bottle consumption
  
- **Local Storage**:
  - Store your entire wine collection on your device
  - No internet connection required for core functionality
  - IndexedDB for efficient local data storage

- **Collection Management**:
  - View your full wine collection
  - Search and filter wines by name, producer, or varietal
  - Add, edit, and delete wine entries
  - Track wine details including vintage, producer, and rating

- **Responsive Design**:
  - Works on desktop, tablet, and mobile devices
  - Optimized for touch interfaces and keyboard input

## Technical Implementation

- Built with React 18+ and TypeScript
- React Router for navigation
- React Bootstrap for responsive UI components
- Context API for state management
- IndexedDB for local storage
- QuaggaJS for camera-based barcode scanning

## Camera Scanning

The app features advanced camera-based barcode scanning using the QuaggaJS library:

- Multi-camera support with automatic device detection
- Rear camera preference for mobile devices
- Confidence tracking algorithm to ensure accurate scans
- User-friendly viewfinder with targeting rectangle
- Support for common wine barcode formats (EAN-13, UPC-A, etc.)
- Comprehensive permission and error handling

## Inventory Management

The app features practical inventory management capabilities:

- **Quantity Tracking**: Keep count of how many bottles you have of each wine
- **Automatic Detection**: When scanning a wine that's already in your collection, quantity is automatically incremented
- **Quick Consumption**: Mark bottles as consumed with one click from the wine list or detail page
- **Smart Last Bottle Handling**: When consuming the last bottle, you'll be prompted to keep or remove the wine from your collection
- **Visual Indicators**: Quantity badges show bottle counts at a glance
- **Intuitive Editing**: Easily adjust quantities with increment/decrement buttons in edit mode

## Getting Started

### Prerequisites

- Node.js 14+ and npm
- Modern web browser with camera access (for scanning feature)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/wine-collection-app.git
cd wine-collection-app
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

### Scanning a Wine Bottle

1. Navigate to the main page
2. Choose your preferred scanning method:
   - **USB Scanner**: Simply scan a barcode with your USB scanner
   - **Camera Scanner**: Click "Camera Scanner" and position the barcode in the highlighted area
   - **Manual Entry**: Click "Manual Entry" and type the barcode number

3. After scanning, the wine details page will open where you can edit information

### Managing Your Inventory

- **View Quantity**: Each wine card shows how many bottles you have with a badge
- **Consume a Bottle**: Click the "-1" button on any wine card to mark a bottle as consumed
- **Add More Bottles**: Either scan the same barcode again or use the "Add Another" button on the detail page
- **Adjust Quantity**: On the wine details page, click "Edit" to manually adjust the quantity

### Managing Your Collection

- **View Collection**: The home page displays all wines in your collection
- **Search**: Use the search box to filter by name, producer, or varietal
- **Edit Wine**: Click on any wine to view details and make changes
- **Delete Wine**: On the wine details page, click "Delete" to remove it from your collection

## Browser Support

The application works best on:
- Chrome 83+
- Firefox 76+
- Safari 13.1+
- Edge 83+

Camera scanning requires a browser with WebRTC support and camera access.

## Privacy

Your data never leaves your device. All wine information is stored locally in your browser's IndexedDB.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- [QuaggaJS](https://github.com/serratus/quaggaJS) for barcode scanning functionality
- [React Bootstrap](https://react-bootstrap.github.io/) for UI components
- [React Router](https://reactrouter.com/) for navigation