# API Routes Documentation

## Authentication Routes
```
POST   /api/auth/register
POST   /api/auth/login
POST   /api/auth/logout
GET    /api/auth/user
POST   /api/auth/forgot-password
POST   /api/auth/reset-password
```

## User Routes
```
GET    /api/users
GET    /api/users/{id}
PUT    /api/users/{id}
GET    /api/users/{id}/recipes
GET    /api/users/{id}/wines
GET    /api/users/{id}/reviews
GET    /api/users/{id}/followers
GET    /api/users/{id}/following
POST   /api/users/{id}/follow
DELETE /api/users/{id}/unfollow
```

## Recipe Routes
```
GET    /api/recipes
POST   /api/recipes
GET    /api/recipes/{id}
PUT    /api/recipes/{id}
DELETE /api/recipes/{id}
GET    /api/recipes/{id}/ingredients
POST   /api/recipes/{id}/ingredients
PUT    /api/recipes/{id}/ingredients/{ingredient_id}
DELETE /api/recipes/{id}/ingredients/{ingredient_id}
GET    /api/recipes/{id}/steps
POST   /api/recipes/{id}/steps
PUT    /api/recipes/{id}/steps/{step_id}
DELETE /api/recipes/{id}/steps/{step_id}
POST   /api/recipes/{id}/rate
POST   /api/recipes/{id}/review
GET    /api/recipes/{id}/reviews
POST   /api/recipes/{id}/comments
GET    /api/recipes/{id}/comments
```

## Wine Routes
```
GET    /api/wines
POST   /api/wines
GET    /api/wines/{id}
PUT    /api/wines/{id}
DELETE /api/wines/{id}
POST   /api/wines/{id}/varietals
DELETE /api/wines/{id}/varietals/{varietal_id}
POST   /api/wines/{id}/classifications
DELETE /api/wines/{id}/classifications/{classification_id}
POST   /api/wines/{id}/tasting-notes
GET    /api/wines/{id}/tasting-notes
PUT    /api/wines/{id}/tasting-notes/{note_id}
DELETE /api/wines/{id}/tasting-notes/{note_id}
POST   /api/wines/{id}/rate
POST   /api/wines/{id}/review
GET    /api/wines/{id}/reviews
POST   /api/wines/{id}/comments
GET    /api/wines/{id}/comments
```

## Shopping List Routes
```
GET    /api/shopping-lists
POST   /api/shopping-lists
GET    /api/shopping-lists/{id}
PUT    /api/shopping-lists/{id}
DELETE /api/shopping-lists/{id}
POST   /api/shopping-lists/{id}/items
PUT    /api/shopping-lists/{id}/items/{item_id}
DELETE /api/shopping-lists/{id}/items/{item_id}
POST   /api/shopping-lists/{id}/recipes/{recipe_id}
POST   /api/shopping-lists/{id}/wines/{wine_id}
```

## Group Routes
```
GET    /api/groups
POST   /api/groups
GET    /api/groups/{id}
PUT    /api/groups/{id}
DELETE /api/groups/{id}
POST   /api/groups/{id}/members
DELETE /api/groups/{id}/members/{user_id}
```

## Message Routes
```
GET    /api/messages
POST   /api/messages
GET    /api/messages/{id}
DELETE /api/messages/{id}
```

## Search Routes
```
GET    /api/search/recipes
GET    /api/search/wines
GET    /api/search/users
GET    /api/search/groups
```

## Utility Routes
```
GET    /api/tags
GET    /api/ingredients
GET    /api/varietals
GET    /api/classifications
```

Each endpoint will support the following response formats:
- Success Response: 200/201 OK with data
- Validation Error: 422 Unprocessable Entity
- Authentication Error: 401 Unauthorized
- Authorization Error: 403 Forbidden
- Not Found Error: 404 Not Found
- Server Error: 500 Internal Server Error
