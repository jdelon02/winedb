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

export interface Recipe {
  id: number;
  user_id: number;
  title: string;
  description: string;
  prep_time: number;
  cook_time: number;
  servings: number;
  difficulty_level: string;
  featured_image?: string;
  status: 'draft' | 'published';
  steps: RecipeStep[];
  ingredients: RecipeIngredient[];
  tags: Tag[];
  created_at: string;
  updated_at: string;
  user?: User;
  average_rating?: number;
  ratings_count?: number;
}

export interface Wine {
  id: number;
  user_id: number;
  name: string;
  description: string;
  year?: number;
  producer: string;
  country: string;
  region?: string;
  featured_image?: string;
  status: 'draft' | 'published';
  varietals: Varietal[];
  classifications: Classification[];
  tasting_notes: TastingNote[];
  created_at: string;
  updated_at: string;
  user?: User;
  average_rating?: number;
  ratings_count?: number;
}

export interface RecipeStep {
  id: number;
  recipe_id: number;
  step_number: number;
  instruction: string;
  image?: string;
}

export interface RecipeIngredient {
  id: number;
  recipe_id: number;
  ingredient_id: number;
  ingredient: Ingredient;
  quantity: number;
  unit: string;
  notes?: string;
}

export interface Ingredient {
  id: number;
  name: string;
  description?: string;
}

export interface Varietal {
  id: number;
  name: string;
  description?: string;
}

export interface Classification {
  id: number;
  name: string;
  description?: string;
}

export interface TastingNote {
  id: number;
  wine_id: number;
  user_id: number;
  notes: string;
  tasted_at: string;
  user?: User;
}

export interface Rating {
  id: number;
  user_id: number;
  rateable_id: number;
  rateable_type: string;
  rating: number;
  user?: User;
}

export interface Review {
  id: number;
  user_id: number;
  reviewable_id: number;
  reviewable_type: string;
  title: string;
  content: string;
  user?: User;
}

export interface Comment {
  id: number;
  user_id: number;
  commentable_id: number;
  commentable_type: string;
  content: string;
  user?: User;
}

export interface Tag {
  id: number;
  name: string;
  type?: string;
}

export interface ShoppingList {
  id: number;
  user_id: number;
  name: string;
  description?: string;
  items: ShoppingListItem[];
}

export interface ShoppingListItem {
  id: number;
  shopping_list_id: number;
  ingredient_id?: number;
  wine_id?: number;
  quantity?: number;
  unit?: string;
  notes?: string;
  checked: boolean;
  ingredient?: Ingredient;
  wine?: Wine;
}

export interface PaginatedResponse<T> {
  data: T[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}
