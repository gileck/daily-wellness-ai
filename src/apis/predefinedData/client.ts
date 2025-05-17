import apiClient from '../../client/utils/apiClient';
import { CacheResult } from '../../server/cache/types';
import { API_GET_PREDEFINED_DATA } from './index';
import { GetPredefinedDataResponse } from './types';

export const getPredefinedData = (): Promise<CacheResult<GetPredefinedDataResponse>> => {
    return apiClient.call(API_GET_PREDEFINED_DATA);
}; 