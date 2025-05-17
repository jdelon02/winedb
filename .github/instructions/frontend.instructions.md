# Frontend Development Guide

## Architecture Overview
The frontend is built using React 18 with TypeScript and follows a component-based architecture:

### Core Concepts
1. Component Structure
   - Atomic Design principles
   - Smart vs. Presentational components
   - Reusable components
   - Page components

2. State Management
   - React Context for global state
   - Local state with hooks
   - Form state management
   - Cache management

3. Routing
   - Protected routes
   - Lazy loading
   - Route parameters
   - Query parameters

### TypeScript Integration
1. Type Definitions
   ```typescript
   interface Recipe {
     id: number;
     title: string;
     description: string;
     // ... other properties
   }

   type RecipeFormData = Omit<Recipe, 'id' | 'created_at' | 'updated_at'>;
   ```

2. Component Props
   ```typescript
   interface RecipeCardProps {
     recipe: Recipe;
     onEdit?: (id: number) => void;
     onDelete?: (id: number) => void;
   }
   ```

## Form Management
### JSON Schema Forms
1. Schema Definition
   ```typescript
   const recipeSchema = {
     type: "object",
     required: ["title", "description"],
     properties: {
       title: {
         type: "string",
         title: "Recipe Title"
       }
       // ... other properties
     }
   };
   ```

2. UI Schema
   ```typescript
   const uiSchema = {
     description: {
       "ui:widget": "textarea"
     },
     // ... other UI customizations
   };
   ```

### Form Validation
1. Client-side validation
2. Custom validation rules
3. Async validation
4. Error handling

## API Integration
### Service Structure
```typescript
export class RecipeService {
  static async list(params: ListParams): Promise<PaginatedResponse<Recipe>> {
    const response = await api.get('/recipes', { params });
    return response.data;
  }

  static async create(data: RecipeFormData): Promise<Recipe> {
    const response = await api.post('/recipes', data);
    return response.data;
  }
}
```

### Error Handling
```typescript
try {
  const recipe = await RecipeService.create(formData);
  showSuccess('Recipe created successfully');
} catch (error) {
  handleApiError(error);
}
```

## Component Patterns
### Hooks
```typescript
function useRecipeForm(recipeId?: number) {
  const [loading, setLoading] = useState(false);
  const [recipe, setRecipe] = useState<Recipe | null>(null);

  useEffect(() => {
    if (recipeId) {
      loadRecipe(recipeId);
    }
  }, [recipeId]);

  // ... rest of the hook
}
```

### HOCs
```typescript
function withAuth<P extends object>(
  WrappedComponent: React.ComponentType<P>
) {
  return function WithAuthComponent(props: P) {
    const { isAuthenticated, loading } = useAuth();
    
    if (loading) return <LoadingSpinner />;
    if (!isAuthenticated) return <Navigate to="/login" />;
    
    return <WrappedComponent {...props} />;
  };
}
```

## Styling
### Tailwind Usage
```typescript
const Button = ({ variant = 'primary', children }) => (
  <button
    className={clsx(
      'px-4 py-2 rounded-md',
      {
        'bg-blue-500 hover:bg-blue-600': variant === 'primary',
        'bg-gray-500 hover:bg-gray-600': variant === 'secondary'
      }
    )}
  >
    {children}
  </button>
);
```

### Theme Management
1. Dark mode support
2. Custom color schemes
3. Responsive design
4. Component variants

## Performance
### Optimization Techniques
1. Code Splitting
   ```typescript
   const RecipePage = lazy(() => import('./pages/RecipePage'));
   ```

2. Memoization
   ```typescript
   const MemoizedComponent = memo(MyComponent);
   const memoizedCallback = useCallback(() => {}, []);
   const memoizedValue = useMemo(() => computeValue(), []);
   ```

3. Virtual Lists
4. Image optimization
5. Bundle optimization

### Testing
1. Unit Tests
   ```typescript
   describe('RecipeCard', () => {
     it('renders recipe details', () => {
       const recipe = mockRecipe();
       render(<RecipeCard recipe={recipe} />);
       expect(screen.getByText(recipe.title)).toBeInTheDocument();
     });
   });
   ```

2. Integration Tests
3. E2E Tests
4. Performance Tests

## State Management
### Context Structure
```typescript
export const RecipeContext = createContext<RecipeContextType | undefined>(undefined);

export function RecipeProvider({ children }: PropsWithChildren) {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  
  const value = useMemo(() => ({
    recipes,
    setRecipes
  }), [recipes]);
  
  return (
    <RecipeContext.Provider value={value}>
      {children}
    </RecipeContext.Provider>
  );
}
```

### Data Flow
1. Unidirectional data flow
2. State immutability
3. Action creators
4. Reducers

## Accessibility
1. ARIA attributes
2. Keyboard navigation
3. Color contrast
4. Screen reader support

## Common Tasks
- Adding new React components
- Implementing form validation
- Adding authentication features
- Writing tests for frontend components
- Setting up routes

## Project Structure
- `/src/components` - React components
- `/src/context` - React context providers
- `/src/hooks` - Custom React hooks
- `/src/pages` - Page components
- `/src/services` - API services
- `/src/types` - TypeScript interfaces and types
- `/src/utils` - Utility functions and helpers
- `/src/App.js` - Main App component

## Components

The application uses a component-based architecture with reusable UI elements:

### Page Components
- RecipesPage - Lists all recipes with filters
- RecipeDetailPage - Shows recipe details and wine pairings
- WinesPage - Lists all wines with filters
- WineDetailPage - Shows wine details
- BlogsPage - Lists all blog posts
- ProfilePage - User profile view and edit
- ShoppingListPage - Manage shopping lists

### Feature Components
- RecipeList/RecipeCard - For displaying recipes
- WineList/WineCard - For displaying wines
- RecipeForm/WineForm - For creating/editing recipes and wines
- RecipeRecommendations - Shows personalized recipe recommendations
- WineRecommendations - Shows personalized wine recommendations
- WinePairingRecommendations - Shows wine pairings for a recipe

## API Services

The frontend implements a service layer pattern for API communication:

```typescript
// Authentication service
export const authService = {
  register: (userData) => api.post('/register', userData),
  login: (credentials) => api.post('/login', credentials),
  logout: () => api.post('/logout'),
  getCurrentUser: () => api.get('/user'),
};

// Recipe service
export const recipeService = {
  getAll: (page = 1, params = {}) => api.get('/recipes', { params: { page, ...params } }),
  get: (id) => api.get(`/recipes/${id}`),
  create: (data) => api.post('/recipes', data),
  update: (id, data) => api.put(`/recipes/${id}`, data),
  delete: (id) => api.delete(`/recipes/${id}`),
  getUserRecipes: () => api.get('/user/recipes'),
  search: (params) => api.get('/recipes/search', { params }),
};

// Recommendation service
export const recommendationService = {
  getRecipeRecommendationsForUser: (limit = 10) => 
    api.get('/recommendations/recipes', { params: { limit } }),
  getWineRecommendationsForUser: (limit = 10) => 
    api.get('/recommendations/wines', { params: { limit } }),
  getWinePairingsForRecipe: (recipeId, limit = 5) => 
    api.get(`/recipes/${recipeId}/wine-pairings`, { params: { limit } }),
};
```

## Type Definitions

The application uses TypeScript interfaces for API responses and models:

```typescript
// User type definition
export interface User {
  id: number;
  name: string;
  email: string;
  profile_image?: string;
  bio?: string;
  preferences?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

// Recipe type definition
export interface Recipe {
  id: number;
  title: string;
  description: string;
  ingredients: Ingredient[];
  instructions: string;
  prep_time: number;
  cook_time: number;
  servings: number;
  difficulty: string;
  category: string;
  image: string;
  user_id: number;
  user?: User;
  tags?: Tag[];
  ratings_avg_rating?: number;
  ratings_count?: number;
  created_at: string;
  updated_at: string;
}

// Paginated response type
export interface PaginatedResponse<T> {
  data: T[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}
```

## Recommendation Components

The frontend includes specialized components for displaying recommendations:

### RecipeRecommendations

```jsx
const RecipeRecommendations = () => {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchRecommendations();
    } else {
      fetchPopularRecipes();
    }
  }, [user]);

  const fetchRecommendations = async () => {
    try {
      const response = await recommendationService.getRecipeRecommendationsForUser(6);
      setRecipes(response.data.data);
      setLoading(false);
    } catch (err) {
      console.error('Failed to fetch recommendations:', err);
      fetchPopularRecipes();
    }
  };
  
  // Component rendering...
}
```

### WinePairingRecommendations

```jsx
const WinePairingRecommendations = ({ recipeId }) => {
  const [wines, setWines] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWinePairings();
  }, [recipeId]);

  const fetchWinePairings = async () => {
    try {
      const response = await recommendationService.getWinePairingsForRecipe(recipeId, 3);
      setWines(response.data.data);
      setLoading(false);
    } catch (err) {
      console.error('Failed to fetch wine pairings:', err);
      setLoading(false);
    }
  };
  
  // Component rendering...
}
```

## TypeScript Migration

When converting JavaScript components to TypeScript:

1. Change file extension from `.js` to `.tsx` for components
2. Add type imports from `/src/types/api.ts`
3. Define interfaces for component props
4. Add type annotations to state variables and functions
5. Use React.FC type for functional components

Example TypeScript component:

```tsx
import React, { useState, useEffect } from 'react';
import { Wine, PaginatedResponse } from '../types/api';
import { wineService } from '../services/api';

interface WineListProps {
  limit?: number;
  showFilters?: boolean;
  onWineSelected?: (wine: Wine) => void;
}

const WineList: React.FC<WineListProps> = ({ 
  limit = 10, 
  showFilters = true,
  onWineSelected
}) => {
  const [wines, setWines] = useState<Wine[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  
  // Component implementation...
  
  return (
    // JSX rendering
  );
};

export default WineList;
```
