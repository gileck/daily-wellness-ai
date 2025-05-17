import apiClient from '@/client/utils/apiClient';
import { CacheResult } from '@/server/cache/types';
import {
    CreateTrackedActivityPayload,
    CreateTrackedActivityResponse,
    GetTrackedActivitiesParams,
    GetTrackedActivitiesResponse
} from './types';
import { API_CREATE_TRACKED_ACTIVITY, API_GET_TRACKED_ACTIVITIES } from './index'; // Import specific API names

export const createTrackedActivity = async (payload: CreateTrackedActivityPayload): Promise<CacheResult<CreateTrackedActivityResponse>> => {
    return apiClient.call<CreateTrackedActivityResponse, CreateTrackedActivityPayload>(API_CREATE_TRACKED_ACTIVITY, payload);
};

export const getTrackedActivities = async (params: GetTrackedActivitiesParams): Promise<CacheResult<GetTrackedActivitiesResponse>> => {
    // For GET requests with this pattern, params are often sent in the body or as query string in the URL for `makeApiRequest`
    // Assuming `makeApiRequest` handles params in the second argument for GET if body is not typical.
    // Or, it might take full path if params are query string.
    // The previous version was /list?params, this implies the API name itself is the path.
    return apiClient.call<GetTrackedActivitiesResponse, GetTrackedActivitiesParams>(API_GET_TRACKED_ACTIVITIES, params);
}; 