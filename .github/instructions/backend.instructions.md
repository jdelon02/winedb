# Backend Development Guide

## Architecture Overview
The backend is built using Laravel 10 and follows a clean, modular architecture:

### Core Components
1. Models (Domain Layer)
   - Represent database entities
   - Define relationships
   - Handle basic model-specific logic

2. Controllers (Presentation Layer)
   - Handle HTTP requests
   - Validate input
   - Delegate to services
   - Return API responses

3. Services (Business Layer)
   - Implement business logic
   - Coordinate between models
   - Handle complex operations

4. Resources (Transformation Layer)
   - Transform models to JSON
   - Handle data presentation
   - Manage included relationships

### Key Design Patterns
1. Repository Pattern
   - Abstract database operations
   - Enable swappable implementations
   - Facilitate testing

2. Service Layer Pattern
   - Encapsulate business logic
   - Manage transactions
   - Handle cross-cutting concerns

3. Observer Pattern (Events)
   - Handle asynchronous operations
   - Manage notifications
   - Track user activities

## Database Management
### Using Blueprint
1. Edit draft.yaml for schema changes
2. Run blueprint:build
3. Review generated files:
   - Migrations
   - Models
   - Factories
   - Seeders

### Best Practices
1. Always use migrations
2. Implement proper indexes
3. Use foreign key constraints
4. Follow naming conventions
5. Include docblocks

## API Development
### Endpoint Structure
```php
public function index()
{
    $recipes = Recipe::query()
        ->with(['user', 'ingredients'])
        ->paginate();
    
    return RecipeResource::collection($recipes);
}

public function store(StoreRecipeRequest $request)
{
    $recipe = Recipe::create($request->validated());
    
    return new RecipeResource($recipe);
}
```

### Validation
1. Use Form Requests
2. Implement custom rules
3. Handle validation errors
4. Validate relationships

### Resources
1. Define proper includes
2. Handle nested relations
3. Manage conditional fields
4. Optimize for performance

## Authentication
### Sanctum Setup
1. Configure guard
2. Set token expiration
3. Handle CORS
4. Manage token abilities

### Security Best Practices
1. Rate limiting
2. Input sanitization
3. Proper authorization
4. Secure headers

## Testing
### Test Types
1. Feature Tests
   - API endpoints
   - Authentication
   - Authorization
   
2. Unit Tests
   - Services
   - Models
   - Helpers

### Test Structure
```php
public function test_can_create_recipe()
{
    $user = User::factory()->create();
    $data = Recipe::factory()->make()->toArray();
    
    $response = $this->actingAs($user)
        ->postJson('/api/recipes', $data);
    
    $response->assertCreated()
        ->assertJsonStructure([
            'data' => ['id', 'title']
        ]);
}
```

## Error Handling
### Exception Types
1. ValidationException
2. AuthenticationException
3. AuthorizationException
4. ModelNotFoundException
5. CustomExceptions

### Response Format
```json
{
    "message": "Error message",
    "errors": {
        "field": ["Error detail"]
    },
    "code": "ERROR_CODE"
}
```

## Performance
### Optimization Techniques
1. Database Query Optimization
   - Eager loading
   - Query caching
   - Proper indexing
   
2. Response Optimization
   - Resource caching
   - Compression
   - Pagination

### Monitoring
1. Query logging
2. Performance metrics
3. Error tracking
4. Request timing

## Deployment
### Environment Setup
1. Configure .env
2. Set up queues
3. Configure caching
4. Set up storage

### Deployment Steps
1. Run migrations
2. Clear caches
3. Restart queues
4. Update assets

## Models

The application uses the following main models:

- User - Application users
- Recipe - Recipe entries with ingredients and instructions
- Wine - Wine entries with details and classifications
- Tag - Tags for categorizing recipes and wines
- Rating - User ratings for recipes and wines (polymorphic)
- Comment - User comments on recipes, wines, etc. (polymorphic)
- ShoppingList - User shopping lists
- ShoppingListItem - Items in shopping lists
- BlogPost - Blog entries authored by users

## API Endpoints

The API follows RESTful conventions and includes the following main endpoints:

### Authentication
- `POST /api/register` - Register a new user
- `POST /api/login` - Log in a user
- `POST /api/logout` - Log out the current user
- `GET /api/user` - Get the current authenticated user

### Recipes
- `GET /api/recipes` - List all recipes (paginated)
- `GET /api/recipes/{id}` - Get a specific recipe
- `POST /api/recipes` - Create a new recipe
- `PUT /api/recipes/{id}` - Update a recipe
- `DELETE /api/recipes/{id}` - Delete a recipe

### Wines
- `GET /api/wines` - List all wines (paginated)
- `GET /api/wines/{id}` - Get a specific wine
- `POST /api/wines` - Create a new wine
- `PUT /api/wines/{id}` - Update a wine
- `DELETE /api/wines/{id}` - Delete a wine

### Recommendations
- `GET /api/recommendations/recipes` - Get recipe recommendations for the current user
- `GET /api/recommendations/wines` - Get wine recommendations for the current user
- `GET /api/recipes/{id}/wine-pairings` - Get wine pairings for a specific recipe

### Shopping Lists
- `GET /api/shopping-lists` - Get all shopping lists for the current user
- `GET /api/shopping-lists/{id}` - Get a specific shopping list
- `POST /api/shopping-lists` - Create a new shopping list
- `PUT /api/shopping-lists/{id}` - Update a shopping list
- `DELETE /api/shopping-lists/{id}` - Delete a shopping list
- `POST /api/shopping-lists/{id}/items` - Add an item to a shopping list
- `POST /api/shopping-lists/{id}/recipes` - Add a recipe's ingredients to a shopping list

## Recommendation System

The backend recommendation system is implemented in the `RecommendationService` class and includes:

- Collaborative filtering for personalized recommendations based on similar users
- Content-based filtering for recommendations based on item attributes
- Hybrid approach combining both methods for optimal recommendations
- Wine pairing algorithm based on flavor profiles and food pairing rules

Example implementation of the recommendation service:

```php
class RecommendationService
{
    public function getRecipeRecommendationsForUser(User $user, int $limit = 10): Collection
    {
        // Combine collaborative and content-based filtering
        $collaborativeRecs = $this->getCollaborativeRecipeRecommendations($user, $limit);
        
        if ($collaborativeRecs->count() >= $limit) {
            return $collaborativeRecs->take($limit);
        }
        
        // If not enough collaborative recommendations, add content-based ones
        $contentBasedRecs = $this->getContentBasedRecipeRecommendations($user, $limit);
        
        return $collaborativeRecs->merge($contentBasedRecs)->unique('id')->take($limit);
    }
    
    public function getWinePairingsForRecipe(Recipe $recipe, int $limit = 5): Collection
    {
        // Implementation of wine pairing algorithm based on recipe attributes
    }
    
    // Private helper methods for different recommendation strategies
}
```
