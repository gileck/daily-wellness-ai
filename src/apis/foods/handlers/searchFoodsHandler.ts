import { foods } from '@/server/database';
import { SearchFoodsRequest, SearchFoodsResponse, FoodClient } from '../types';
import { Food } from '@/server/database/collections/foods/types';
import { ApiHandlerContext } from '@/apis/types';

const convertFoodToClient = (food: Food): FoodClient => ({
    ...food,
    _id: food._id?.toString(),
    displayName: food.name.split(',')[0].trim(),
    createdAt: food.createdAt.toISOString(),
    updatedAt: food.updatedAt.toISOString(),
});

export const process = async (
    payload: SearchFoodsRequest,
    context: ApiHandlerContext
): Promise<SearchFoodsResponse> => {
    try {
        const { filters, limit = 20, skip = 0 } = payload;

        // Modify filters to include user-specific foods
        const enhancedFilters = { ...filters };

        // If searching for user-created foods, filter by current user
        // If not specified, include both USDA foods and user's own foods
        if (context.userId) {
            if (enhancedFilters.isUserCreated === true) {
                // Only user-created foods by this user
                enhancedFilters.createdBy = context.userId;
            } else if (enhancedFilters.isUserCreated === undefined) {
                // Include USDA foods and user's own foods, but not other users' foods
                // This will be handled in the database query
            }
        } else {
            // Not authenticated - only show USDA foods
            enhancedFilters.isUserCreated = false;
        }

        const foodsList = await foods.searchFoods(enhancedFilters, limit, skip, context.userId);
        const clientFoods = foodsList.map(convertFoodToClient);

        return { foods: clientFoods };
    } catch (error) {
        console.error('Error searching foods:', error);
        return { foods: [], error: 'Failed to search foods' };
    }
}; 