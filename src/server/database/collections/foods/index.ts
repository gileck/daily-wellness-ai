import { Collection, ObjectId } from 'mongodb';
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
    skip: number = 0
): Promise<Food[]> => {
    const collection = await getFoodsCollection();
    const query: Record<string, unknown> = {};

    if (filters.category) query.category = filters.category;
    if (filters.isUserCreated !== undefined) query.isUserCreated = filters.isUserCreated;
    if (filters.source) query.source = filters.source;
    if (filters.query) {
        query.$text = { $search: filters.query };
    }

    try {
        return await collection
            .find(query)
            .limit(limit)
            .skip(skip)
            .sort(filters.query ? { score: { $meta: 'textScore' } } : { name: 1 })
            .toArray();
    } catch (error: unknown) {
        // If text index doesn't exist, create it and retry
        if (error && typeof error === 'object' && 'code' in error && error.code === 27 && filters.query) {
            await initializeFoodsIndexes();
            return await collection
                .find(query)
                .limit(limit)
                .skip(skip)
                .sort({ score: { $meta: 'textScore' } })
                .toArray();
        }
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