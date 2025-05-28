export * from './index';

import {
    API_SEARCH_FOODS,
    API_GET_FOOD,
    API_CREATE_FOOD,
    API_UPDATE_FOOD,
    API_DELETE_FOOD,
    API_GET_FOODS_COUNT,
    API_GENERATE_FOOD_DATA
} from './index';

import { process as searchFoodsProcess } from './handlers/searchFoodsHandler';
import { process as getFoodProcess } from './handlers/getFoodHandler';
import { process as createFoodProcess } from './handlers/createFoodHandler';
import { process as updateFoodProcess } from './handlers/updateFoodHandler';
import { process as deleteFoodProcess } from './handlers/deleteFoodHandler';
import { process as getFoodsCountProcess } from './handlers/getFoodsCountHandler';
import { process as generateFoodDataProcess } from './handlers/generateFoodDataHandler';

export const foodsApiHandlers = {
    [API_SEARCH_FOODS]: { process: searchFoodsProcess },
    [API_GET_FOOD]: { process: getFoodProcess },
    [API_CREATE_FOOD]: { process: createFoodProcess },
    [API_UPDATE_FOOD]: { process: updateFoodProcess },
    [API_DELETE_FOOD]: { process: deleteFoodProcess },
    [API_GET_FOODS_COUNT]: { process: getFoodsCountProcess },
    [API_GENERATE_FOOD_DATA]: { process: generateFoodDataProcess },
}; 