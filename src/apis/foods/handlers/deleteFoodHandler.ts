import { foods } from '@/server/database';
import { ApiHandlerContext } from '@/apis/types';
import { DeleteFoodRequest, DeleteFoodResponse } from '../types';

export const process = async (
    payload: DeleteFoodRequest,
    context: ApiHandlerContext
): Promise<DeleteFoodResponse> => {
    try {
        if (!context.userId) {
            throw new Error('User must be authenticated to delete foods');
        }

        // Check if food exists and user has permission to delete it
        const existingFood = await foods.getFoodById(payload.id);
        if (!existingFood) {
            return { success: false, error: 'Food not found' };
        }

        if (existingFood.isUserCreated && existingFood.createdBy !== context.userId) {
            return { success: false, error: 'You can only delete foods you created' };
        }

        const success = await foods.deleteFood(payload.id);

        return { success };
    } catch (error) {
        console.error('Error deleting food:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to delete food'
        };
    }
}; 