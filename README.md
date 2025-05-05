# Wine Collection Manager

A React TypeScript application for managing your wine collection with barcode scanning support.

## Features

- Barcode scanning with Symcode USB scanner support
- Manual barcode entry fallback
- Offline-first with IndexedDB storage
- Wine details lookup via multiple APIs:
  - Open Food Facts API (free)
  - Wine-Searcher API (paid subscription)
  - Global Wine Score API (requires API key)
- Auto-refreshing wine collection view
- Detailed wine information pages
- Toast notifications for collection updates
- WCAG 2.1 Level AA compliant
- Responsive design for mobile and desktop

## Requirements

- Node.js 16+
- npm 7+
- Symcode USB Barcode Scanner (optional)
- API keys for premium wine data (optional)

## Setup

```bash
# Install dependencies
npm install

# Copy environment template
cp .env.example .env

# Configure API keys (optional)
# Edit .env with your API keys

# Start development server
npm start

# Run tests
npm test

# Build for production
npm run build
```

## Development

- Written in TypeScript with React 18+
- Uses Context API for state management
- IndexedDB for offline storage
- React Router for navigation
- Full WCAG 2.1 Level AA compliance

## Project Structure

```
src/
  components/      # React components
  contexts/        # React contexts
  db/             # IndexedDB storage
  repositories/    # Data models
  services/       # Business logic
  utils/          # Helper functions
  icons/          # SVG icons
  styles/         # CSS styles
```

## Features in Detail

### Wine Collection
- Auto-refreshes every 30 seconds
- Manual refresh button
- Clickable wine cards
- Detailed wine view pages

### Barcode Scanning
- USB scanner support
- Manual entry fallback
- Automatic wine data lookup
- Local caching of results

### API Integration
- Multi-tier wine data lookup
- Configurable API providers
- Automatic fallback to free API
- Response caching

### Storage
- Offline-first approach
- IndexedDB for persistence
- Automatic data sync
- Error recovery

## Contributing

1. Fork the repository
2. Create your feature branch
3. Follow the coding guidelines in .github/copilot-instructions.md
4. Submit a pull request

## License

MIT