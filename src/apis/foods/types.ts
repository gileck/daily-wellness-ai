import { FoodSearchFilters, NutritionInfo, ServingSize, FoodCategory } from '@/server/database/collections/foods/types';

// Client-facing Food DTO (with string IDs and dates)
export interface FoodClient {
    _id?: string;
    id: string;
    name: string;
    displayName: string;
    brand?: string;
    category: string;
    categorySimplified?: FoodCategory;
    nutritionPer100g: NutritionInfo;
    commonServings: ServingSize[];
    isUserCreated: boolean;
    source: 'usda' | 'user';
    usdaFdcId?: number;
    usdaDataType?: string;
    createdBy?: string; // userId for user-created foods
    createdAt: string; // ISO string
    updatedAt: string; // ISO string
}

// Search Foods
export interface SearchFoodsRequest {
    filters: FoodSearchFilters;
    limit?: number;
    skip?: number;
}

export interface SearchFoodsResponse {
    foods: FoodClient[];
    error?: string;
}

// Get Food by ID
export interface GetFoodRequest {
    id: string;
}

export interface GetFoodResponse {
    food: FoodClient | null;
    error?: string;
}

// Create Food
export interface CreateFoodRequest {
    name: string;
    brand?: string;
    category: string;
    categorySimplified?: FoodCategory;
    nutritionPer100g: NutritionInfo;
    commonServings: ServingSize[];
    usdaFdcId?: number;
    usdaDataType?: string;
}

export interface CreateFoodResponse {
    food: FoodClient;
    error?: string;
}

// Update Food
export interface UpdateFoodRequest {
    id: string;
    updates: {
        name?: string;
        brand?: string;
        category?: string;
        categorySimplified?: FoodCategory;
        nutritionPer100g?: NutritionInfo;
        commonServings?: ServingSize[];
    };
}

export interface UpdateFoodResponse {
    food: FoodClient | null;
    error?: string;
}

// Delete Food
export interface DeleteFoodRequest {
    id: string;
}

export interface DeleteFoodResponse {
    success: boolean;
    error?: string;
}

// Get Foods Count
export type GetFoodsCountRequest = Record<string, never>;

export interface GetFoodsCountResponse {
    count: number;
    error?: string;
}

// Generate Food Data with AI
export interface GenerateFoodDataRequest {
    foodDescription: string;
    additionalContext?: string;
    modelId?: string;
}

export interface GenerateFoodDataResponse {
    suggestedFood: {
        name: string;
        brand?: string;
        category: string;
        categorySimplified: FoodCategory;
        nutritionPer100g: NutritionInfo;
        commonServings: ServingSize[];
    };
    aiCost: {
        totalCost: number;
    };
    modelUsed: string;
    error?: string;
} 