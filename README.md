# Wine Collection App

A modern Progressive Web App for managing your personal wine collection with barcode scanning capabilities.

## Features

- **Barcode Scanning**: 
  - Scan wine barcodes using USB barcode scanners or mobile device cameras
  - Enhanced buffer management for reliable barcode detection
  - Smart barcode normalization and fuzzy matching to handle scanning variations
  - Detailed scan logging for troubleshooting
  - Support for consecutive scans of the same bottle to increment quantity

- **Wine Collection Management**:
  - Store comprehensive wine details including producer, vintage, and varietal
  - Track multiple bottles of the same wine with quantity counter
  - Quick consumption tracking with one-click decrement
  - Offline-first design with local storage using IndexedDB

- **Information Management**:
  - Tasting notes with rating, aroma, taste, and finish characteristics
  - Quick review system accessible from the wine list
  - Vineyard information including owner, location, and history

## Getting Started

To run the application locally:

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

### Barcode Scanning

The app supports multiple barcode input methods:

- **USB Barcode Scanner**: Connect a USB barcode scanner to your computer and scan wine barcodes directly. The app will automatically detect the input as a barcode.
- **Camera Scanning**: Use your device's camera to scan barcodes directly within the app.
- **Manual Entry**: Enter the barcode digits manually if scanning is not available.

### How Scanning Works

1. The app listens for barcode scanner input (rapid sequence of digits followed by Enter key)
2. When an Enter key is detected, the accumulated barcode is processed
3. The barcode is normalized to remove non-numeric characters
4. The system checks if this wine already exists in your collection:
   - If it does, the quantity is automatically incremented
   - If it's a new wine, a new entry is created with default values

### Scanning Troubleshooting

If you encounter issues with barcode scanning:

- Ensure your scanner is properly connected and configured to send digits followed by an Enter key
- Check the browser console (F12) for detailed scan logs
- Try scanning slowly to ensure all digits are captured
- If using a camera scanner, ensure adequate lighting and hold the barcode steady

## Technical Stack

- React 18+ with TypeScript
- React Router for navigation
- React Bootstrap for UI components
- IndexedDB for local storage
- QuaggaJS for camera-based barcode scanning

## License

[MIT License](LICENSE)

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.