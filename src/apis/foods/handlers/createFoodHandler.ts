import { foods } from '@/server/database';
import { ApiHandlerContext } from '@/apis/types';
import { CreateFoodRequest, CreateFoodResponse, FoodClient } from '../types';
import { Food, CreateFoodData } from '@/server/database/collections/foods/types';

const convertFoodToClient = (food: Food): FoodClient => ({
    ...food,
    _id: food._id?.toString(),
    displayName: food.name.split(',')[0].trim(),
    createdAt: food.createdAt.toISOString(),
    updatedAt: food.updatedAt.toISOString(),
});

export const process = async (
    payload: CreateFoodRequest,
    context: ApiHandlerContext
): Promise<CreateFoodResponse> => {
    try {
        if (!context.userId) {
            throw new Error('User must be authenticated to create foods');
        }

        const foodData: CreateFoodData = {
            ...payload,
            isUserCreated: true,
            source: 'user',
            createdBy: context.userId,
        };

        const createdFood = await foods.createFood(foodData);

        return { food: convertFoodToClient(createdFood) };
    } catch (error) {
        console.error('Error creating food:', error);
        return {
            food: {} as FoodClient,
            error: error instanceof Error ? error.message : 'Failed to create food'
        };
    }
}; 