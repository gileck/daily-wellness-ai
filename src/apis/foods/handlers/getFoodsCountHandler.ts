import { foods } from '@/server/database';
import { GetFoodsCountResponse } from '../types';

export const process = async (): Promise<GetFoodsCountResponse> => {
    try {
        const count = await foods.getFoodsCount();

        return { count };
    } catch (error) {
        console.error('Error getting foods count:', error);
        return { count: 0, error: 'Failed to get foods count' };
    }
}; 