import { foods } from '@/server/database';
import { SearchFoodsRequest, SearchFoodsResponse, FoodClient } from '../types';
import { Food } from '@/server/database/collections/foods/types';

const convertFoodToClient = (food: Food): FoodClient => ({
    ...food,
    _id: food._id?.toString(),
    displayName: food.name.split(',')[0].trim(),
    createdAt: food.createdAt.toISOString(),
    updatedAt: food.updatedAt.toISOString(),
});

export const process = async (
    payload: SearchFoodsRequest
): Promise<SearchFoodsResponse> => {
    try {
        const { filters, limit = 20, skip = 0 } = payload;

        const foodsList = await foods.searchFoods(filters, limit, skip);
        const clientFoods = foodsList.map(convertFoodToClient);

        return { foods: clientFoods };
    } catch (error) {
        console.error('Error searching foods:', error);
        return { foods: [], error: 'Failed to search foods' };
    }
}; 