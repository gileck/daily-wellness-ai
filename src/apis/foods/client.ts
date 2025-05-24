import apiClient from '@/client/utils/apiClient';
import { CacheResult } from '@/server/cache/types';
import {
    API_SEARCH_FOODS,
    API_GET_FOOD,
    API_CREATE_FOOD,
    API_UPDATE_FOOD,
    API_DELETE_FOOD,
    API_GET_FOODS_COUNT
} from './index';
import {
    SearchFoodsRequest,
    SearchFoodsResponse,
    GetFoodRequest,
    GetFoodResponse,
    CreateFoodRequest,
    CreateFoodResponse,
    UpdateFoodRequest,
    UpdateFoodResponse,
    DeleteFoodRequest,
    DeleteFoodResponse,
    GetFoodsCountRequest,
    GetFoodsCountResponse,
} from './types';

export const searchFoods = (
    payload: SearchFoodsRequest
): Promise<CacheResult<SearchFoodsResponse>> => {
    return apiClient.call(API_SEARCH_FOODS, payload);
};

export const getFood = (payload: GetFoodRequest): Promise<CacheResult<GetFoodResponse>> => {
    return apiClient.call(API_GET_FOOD, payload);
};

export const createFood = (payload: CreateFoodRequest): Promise<CacheResult<CreateFoodResponse>> => {
    return apiClient.call(API_CREATE_FOOD, payload);
};

export const updateFood = (payload: UpdateFoodRequest): Promise<CacheResult<UpdateFoodResponse>> => {
    return apiClient.call(API_UPDATE_FOOD, payload);
};

export const deleteFood = (payload: DeleteFoodRequest): Promise<CacheResult<DeleteFoodResponse>> => {
    return apiClient.call(API_DELETE_FOOD, payload);
};

export const getFoodsCount = (payload: GetFoodsCountRequest): Promise<CacheResult<GetFoodsCountResponse>> => {
    return apiClient.call(API_GET_FOODS_COUNT, payload);
}; 