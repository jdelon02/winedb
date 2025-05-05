# Wine Collection App

A web-based application for managing wine collections using barcode scanning capabilities, optimized for the Symcode USB barcode scanner.

## Features

- Barcode scanning for wine bottles using Symcode USB scanner
- Multiple barcode format support (UPC-A, EAN-13, Code 39, Code 128)
- Offline storage capability
- Wine collection management
- Accessible interface (WCAG 2.1 Level AA compliant)

## Technical Stack

- React 18+ with TypeScript
- Context API and Zustand for state management
- Local Storage for offline capability
- Jest and React Testing Library
- Web APIs for barcode scanner integration

## Prerequisites

- Node.js (v16 or higher)
- npm
- Symcode USB barcode scanner (or compatible device)
- Modern web browser (Chrome, Firefox, Safari, Edge)

## Development Setup

1. Clone the repository:
   ```bash
   git clone [repository-url]
   cd wine-collection
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm start
   ```
   This will start the application on http://localhost:3000

## Development Guidelines

### Component Structure
- Use functional components with hooks
- Follow composition over inheritance
- Implement proper prop validation
- Use memo/useCallback for performance optimization

### State Management
- React Context for global state
- Zustand for complex state management
- Local component state for UI-specific state
- Implement proper loading/error states

### Error Handling
- Error boundaries for graceful failures
- User-friendly error messages
- Proper logging and error tracking
- Recovery strategies for scanner failures

### Testing
- Unit tests with React Testing Library
- Integration tests for scanner functionality
- Accessibility tests (jest-axe)
- E2E tests for critical paths

### Performance
- Lazy loading for non-critical components
- Image optimization for wine labels
- Proper caching strategies
- Bundle size optimization

### Security
- Input sanitization
- Secure storage of wine collection data
- Rate limiting for API calls
- XSS prevention
- CSRF protection

## Building for Production

1. Create a production build:
   ```bash
   npm run build
   ```

2. The build files will be created in the `build` directory

## Scanner Setup

1. Connect your Symcode USB scanner to your computer
2. Ensure the scanner is in USB keyboard emulation mode
3. Test the scanner in any input field

## Troubleshooting

- Verify scanner is in keyboard emulation mode
- Clear browser cache for display issues
- Check console for JavaScript errors
- Ensure proper focus management for scanner input

## Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## License

This project is licensed under the MIT License