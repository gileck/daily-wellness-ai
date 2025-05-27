import { Collection, ObjectId, Sort } from 'mongodb';
import { getDb } from '../../index';
import { Food, CreateFoodData, FoodSearchFilters } from './types';

const FOODS_COLLECTION_NAME = 'foods';

// Private async function to get collection reference - MANDATORY pattern
const getFoodsCollection = async (): Promise<Collection<Food>> => {
    const db = await getDb();
    return db.collection<Food>(FOODS_COLLECTION_NAME);
};

export const createFood = async (foodData: CreateFoodData): Promise<Food> => {
    const collection = await getFoodsCollection();
    const now = new Date();
    const food: Food = {
        ...foodData,
        id: foodData.source === 'usda'
            ? `usda-${foodData.usdaFdcId}`
            : `user-${new ObjectId().toString()}`,
        createdAt: now,
        updatedAt: now
    };

    const result = await collection.insertOne(food);
    return { ...food, _id: result.insertedId.toString() };
};

export const getFoodById = async (id: string): Promise<Food | null> => {
    const collection = await getFoodsCollection();
    return await collection.findOne({ id });
};

export const getFoodByUsdaId = async (usdaFdcId: number): Promise<Food | null> => {
    const collection = await getFoodsCollection();
    return await collection.findOne({ usdaFdcId });
};

export const searchFoods = async (
    filters: FoodSearchFilters,
    limit: number = 20,
    skip: number = 0,
    userId?: string
): Promise<Food[]> => {
    const collection = await getFoodsCollection();
    const query: Record<string, unknown> = {};

    if (filters.category) query.category = filters.category;
    if (filters.isUserCreated !== undefined) query.isUserCreated = filters.isUserCreated;
    if (filters.source) query.source = filters.source;
    if (filters.createdBy) query.createdBy = filters.createdBy;
    
    // Use regex for partial matching instead of MongoDB text search
    if (filters.query) {
        // Escape special regex characters and create case-insensitive regex
        const escapedQuery = filters.query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        query.name = { $regex: escapedQuery, $options: 'i' };
    }

    // If user is authenticated and no specific isUserCreated filter is set,
    // include USDA foods and user's own foods, but exclude other users' foods
    if (userId && filters.isUserCreated === undefined && !filters.createdBy) {
        query.$or = [
            { isUserCreated: false }, // USDA foods
            { createdBy: userId } // User's own foods
        ];
    }

    try {
        const sortCriteria: Sort = { name: 1 };
        
        // If there's a query, sort by relevance (name starts with query first, then contains query)
        if (filters.query) {
            const results = await collection
                .find(query)
                .limit(limit * 2) // Get more results for sorting
                .skip(skip)
                .toArray();
            
            // Sort by relevance: exact matches first, then starts with, then contains
            const searchTerm = filters.query.toLowerCase();
            results.sort((a, b) => {
                const aName = a.name.toLowerCase();
                const bName = b.name.toLowerCase();
                
                // Exact match
                if (aName === searchTerm && bName !== searchTerm) return -1;
                if (bName === searchTerm && aName !== searchTerm) return 1;
                
                // Starts with
                const aStartsWith = aName.startsWith(searchTerm);
                const bStartsWith = bName.startsWith(searchTerm);
                if (aStartsWith && !bStartsWith) return -1;
                if (bStartsWith && !aStartsWith) return 1;
                
                // Position of match (earlier is better)
                const aIndex = aName.indexOf(searchTerm);
                const bIndex = bName.indexOf(searchTerm);
                if (aIndex !== bIndex) return aIndex - bIndex;
                
                // Finally, alphabetical
                return aName.localeCompare(bName);
            });
            
            return results.slice(0, limit);
        }
        
        return await collection
            .find(query)
            .limit(limit)
            .skip(skip)
            .sort(sortCriteria)
            .toArray();
    } catch (error: unknown) {
        console.error('Error in searchFoods:', error);
        throw error;
    }
};

export const getFoodsByCategory = async (category: string, limit: number = 50): Promise<Food[]> => {
    const collection = await getFoodsCollection();
    return await collection
        .find({ category })
        .limit(limit)
        .sort({ name: 1 })
        .toArray();
};

export const getFoodsCount = async (): Promise<number> => {
    const collection = await getFoodsCollection();
    return await collection.countDocuments();
};

export const bulkCreateFoods = async (foods: CreateFoodData[]): Promise<number> => {
    const collection = await getFoodsCollection();
    const now = new Date();
    const foodsWithIds = foods.map(foodData => ({
        ...foodData,
        id: foodData.source === 'usda'
            ? `usda-${foodData.usdaFdcId}`
            : `user-${new ObjectId().toString()}`,
        createdAt: now,
        updatedAt: now
    }));

    const result = await collection.insertMany(foodsWithIds, { ordered: false });
    return result.insertedCount;
};

export const updateFood = async (id: string, updates: Partial<Food>): Promise<Food | null> => {
    const collection = await getFoodsCollection();
    const result = await collection.findOneAndUpdate(
        { id },
        {
            $set: {
                ...updates,
                updatedAt: new Date()
            }
        },
        { returnDocument: 'after' }
    );

    return result;
};

export const deleteFood = async (id: string): Promise<boolean> => {
    const collection = await getFoodsCollection();
    const result = await collection.deleteOne({ id });
    return result.deletedCount > 0;
};

export const initializeFoodsIndexes = async (): Promise<void> => {
    const collection = await getFoodsCollection();
    await Promise.all([
        collection.createIndex({ id: 1 }, { unique: true }),
        collection.createIndex({ name: 'text' }),
        collection.createIndex({ category: 1 }),
        collection.createIndex({ source: 1 }),
        collection.createIndex({ usdaFdcId: 1 })
    ]);
}; 