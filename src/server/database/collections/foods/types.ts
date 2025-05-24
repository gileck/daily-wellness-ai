export interface Food {
    _id?: string;
    id: string; // "usda-171705" or "user-abc123"
    name: string; // "Avocados, raw, all commercial varieties"
    brand?: string; // null for basic foods, brand name for branded items
    category: string; // Use USDA category directly: "Fruits and Fruit Juices", "Beef Products", etc.
    categorySimplified?: FoodCategory; // Optional simplified category for UI filtering
    nutritionPer100g: NutritionInfo;
    commonServings: ServingSize[];
    isUserCreated: boolean;
    source: 'usda' | 'user';

    // USDA specific fields
    usdaFdcId?: number;
    usdaDataType?: string; // "SR Legacy", "Survey (FNDDS)", etc.

    // User specific fields  
    createdBy?: string; // userId for user-created foods

    // Metadata
    createdAt: Date;
    updatedAt: Date;
}

export interface NutritionInfo {
    calories: number; // kcal per 100g
    protein: number; // grams per 100g
    carbs: number; // grams per 100g
    fat: number; // grams per 100g
    fiber: number; // grams per 100g

    // Optional additional nutrients
    sugar?: number;
    sodium?: number; // mg per 100g
    cholesterol?: number; // mg per 100g
    saturatedFat?: number;
    transFat?: number;
}

export interface ServingSize {
    name: string; // "1 medium", "1 cup chopped", "1 slice"
    gramsEquivalent: number; // weight in grams
}

// Simplified categories for UI filtering (optional)
export type FoodCategory =
    | 'fruits'
    | 'vegetables'
    | 'grains'
    | 'proteins'
    | 'dairy'
    | 'nuts_seeds'
    | 'oils_fats'
    | 'beverages'
    | 'sweets'
    | 'condiments'
    | 'other';

// For search and filtering
export interface FoodSearchFilters {
    category?: string; // Can filter by USDA category
    categorySimplified?: FoodCategory; // Or by simplified category
    isUserCreated?: boolean;
    source?: 'usda' | 'user';
    query?: string; // text search on name
}

// For creating new foods
export interface CreateFoodData {
    name: string;
    brand?: string;
    category: string; // Use USDA category or user-defined category
    categorySimplified?: FoodCategory;
    nutritionPer100g: NutritionInfo;
    commonServings: ServingSize[];
    isUserCreated: boolean;
    source: 'usda' | 'user';
    usdaFdcId?: number;
    usdaDataType?: string;
    createdBy?: string;
} 