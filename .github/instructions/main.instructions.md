# Recipes & Wines Application - Development Guide

## Project Overview
- Full-stack web application for managing recipes and wines
- Built with Laravel 10 (Backend) and React 18 with TypeScript (Frontend)
- Uses JSON Schema Forms for dynamic form generation
- Implements RESTful API patterns
- Follows modern coding practices and standards

## Architecture
### Backend (Laravel)
- Models defined using Laravel Blueprint
- RESTful API with Laravel Sanctum authentication
- Follows Repository pattern for data access
- Uses Laravel's built-in features for:
  - File storage (for images)
  - Queue system (for notifications)
  - Cache system (for performance)
  - Events & Listeners (for real-time updates)

### Frontend (React)
- TypeScript for type safety
- React JSON Schema Form for dynamic forms
- Context API for state management
- React Router for navigation
- Tailwind CSS for styling
- Axios for API communication

## Development Workflow
1. Always work in feature branches
2. Follow TDD practices
3. Use Laravel Blueprint for database changes
4. Generate TypeScript interfaces from API responses
5. Update documentation when adding features

## Code Organization
### Backend Structure
```
backend/
├── app/
│   ├── Http/
│   │   ├── Controllers/     # API Controllers
│   │   ├── Resources/       # API Resources
│   │   └── Requests/        # Form Requests
│   ├── Models/             # Eloquent Models
│   ├── Services/           # Business Logic
│   └── Policies/          # Authorization
├── database/
│   ├── migrations/        # Database Migrations
│   ├── factories/         # Model Factories
│   └── seeders/          # Database Seeders
└── routes/
    └── api.php           # API Routes
```

### Frontend Structure
```
frontend/
├── src/
│   ├── components/       # React Components
│   ├── pages/           # Page Components
│   ├── schemas/         # JSON Schema Forms
│   ├── services/        # API Services
│   ├── hooks/           # Custom Hooks
│   └── types/           # TypeScript Types
└── public/              # Static Assets
```

## Coding Standards
### Backend (PHP)
- Follow PSR-12 coding standard
- Use type hints and return types
- Document complex methods
- Use Laravel's built-in features
- Write meaningful test names

### Frontend (TypeScript)
- Use TypeScript interfaces
- Follow React best practices
- Component-based architecture
- Prefer functional components
- Use proper prop types

## Security Practices
1. Always validate user input
2. Use Laravel Sanctum for authentication
3. Implement proper CORS policies
4. Rate limit API endpoints
5. Use proper authorization policies

## Performance Guidelines
1. Use eager loading for related models
2. Implement caching where appropriate
3. Optimize database queries
4. Lazy load components
4. Use proper indexes
5. Implement API pagination

## Common Tasks
### Adding a New Feature
1. Create feature branch
2. Update Blueprint if needed
3. Generate migrations
4. Create/Update API endpoints
5. Add TypeScript interfaces
6. Create/Update components
7. Add tests
8. Update documentation

### Database Changes
1. Edit draft.yaml
2. Run Blueprint
3. Review migrations
4. Update TypeScript interfaces
5. Update API Resources

### Form Changes
1. Update JSON Schema
2. Update TypeScript types
3. Update validation rules
4. Update API endpoints
5. Test form submission

## Troubleshooting
### Common Issues
1. CORS issues
2. Authentication errors
3. Form validation errors
4. File upload issues
5. Cache invalidation

### Debug Tools
1. Laravel Telescope
2. React Developer Tools
3. Network Inspector
4. Laravel Logs
5. TypeScript Compiler

## Deployment
1. Build frontend assets
2. Run database migrations
3. Clear Laravel cache
4. Update environment variables
5. Restart queue workers

## Maintenance
1. Regular backups
2. Monitor error logs
3. Update dependencies
4. Run tests regularly
5. Monitor performance

## Version Control
1. Use semantic versioning
2. Write meaningful commit messages
3. Keep feature branches updated
4. Review pull requests thoroughly
5. Tag releases properly
