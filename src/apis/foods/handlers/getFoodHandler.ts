import { foods } from '@/server/database';
import { GetFoodRequest, GetFoodResponse, FoodClient } from '../types';
import { Food } from '@/server/database/collections/foods/types';

const convertFoodToClient = (food: Food): FoodClient => ({
    ...food,
    _id: food._id?.toString(),
    displayName: food.name.split(',')[0].trim(),
    createdAt: food.createdAt.toISOString(),
    updatedAt: food.updatedAt.toISOString(),
});

export const process = async (
    payload: GetFoodRequest
): Promise<GetFoodResponse> => {
    try {
        const food = await foods.getFoodById(payload.id);

        if (!food) {
            return { food: null, error: 'Food not found' };
        }

        return { food: convertFoodToClient(food) };
    } catch (error) {
        console.error('Error getting food:', error);
        return { food: null, error: 'Failed to get food' };
    }
}; 