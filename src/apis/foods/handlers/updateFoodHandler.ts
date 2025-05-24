import { foods } from '@/server/database';
import { ApiHandlerContext } from '@/apis/types';
import { UpdateFoodRequest, UpdateFoodResponse, FoodClient } from '../types';
import { Food } from '@/server/database/collections/foods/types';

const convertFoodToClient = (food: Food): FoodClient => ({
    ...food,
    _id: food._id?.toString(),
    displayName: food.name.split(',')[0].trim(),
    createdAt: food.createdAt.toISOString(),
    updatedAt: food.updatedAt.toISOString(),
});

export const process = async (
    payload: UpdateFoodRequest,
    context: ApiHandlerContext
): Promise<UpdateFoodResponse> => {
    try {
        if (!context.userId) {
            throw new Error('User must be authenticated to update foods');
        }

        // Check if food exists and user has permission to edit it
        const existingFood = await foods.getFoodById(payload.id);
        if (!existingFood) {
            return { food: null, error: 'Food not found' };
        }

        if (existingFood.isUserCreated && existingFood.createdBy !== context.userId) {
            return { food: null, error: 'You can only edit foods you created' };
        }

        const updatedFood = await foods.updateFood(payload.id, payload.updates);

        if (!updatedFood) {
            return { food: null, error: 'Food not found' };
        }

        return { food: convertFoodToClient(updatedFood) };
    } catch (error) {
        console.error('Error updating food:', error);
        return {
            food: null,
            error: error instanceof Error ? error.message : 'Failed to update food'
        };
    }
}; 