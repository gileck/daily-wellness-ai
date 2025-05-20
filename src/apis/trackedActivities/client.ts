import apiClient from '@/client/utils/apiClient';
import { CacheResult } from '@/server/cache/types';
import {
    CreateTrackedActivityPayload,
    CreateTrackedActivityResponse,
    GetTrackedActivitiesParams,
    GetTrackedActivitiesResponse,
    UpdateTrackedActivityPayload,
    UpdateTrackedActivityResponse,
    DeleteTrackedActivityPayload,
    DeleteTrackedActivityResponse,
    DuplicateTrackedActivityPayload,
    DuplicateTrackedActivityResponse
} from './types';
import {
    API_CREATE_TRACKED_ACTIVITY,
    API_GET_TRACKED_ACTIVITIES,
    API_UPDATE_TRACKED_ACTIVITY,
    API_DELETE_TRACKED_ACTIVITY,
    API_DUPLICATE_TRACKED_ACTIVITY
} from './index'; // Import specific API names

export const createTrackedActivity = async (payload: CreateTrackedActivityPayload): Promise<CacheResult<CreateTrackedActivityResponse>> => {
    return apiClient.call<CreateTrackedActivityResponse, CreateTrackedActivityPayload>(API_CREATE_TRACKED_ACTIVITY, payload);
};

export const getTrackedActivities = async (params: GetTrackedActivitiesParams = {}): Promise<CacheResult<GetTrackedActivitiesResponse>> => {
    // For GET requests with this pattern, params are often sent in the body or as query string in the URL for `makeApiRequest`
    // Assuming `makeApiRequest` handles params in the second argument for GET if body is not typical.
    // Or, it might take full path if params are query string.
    // The previous version was /list?params, this implies the API name itself is the path.
    return apiClient.call<GetTrackedActivitiesResponse, GetTrackedActivitiesParams>(API_GET_TRACKED_ACTIVITIES, params);
};

export const updateTrackedActivity = async (payload: UpdateTrackedActivityPayload): Promise<CacheResult<UpdateTrackedActivityResponse>> => {
    return apiClient.call<UpdateTrackedActivityResponse, UpdateTrackedActivityPayload>(API_UPDATE_TRACKED_ACTIVITY, payload);
};

export const deleteTrackedActivity = async (payload: DeleteTrackedActivityPayload): Promise<CacheResult<DeleteTrackedActivityResponse>> => {
    return apiClient.call<DeleteTrackedActivityResponse, DeleteTrackedActivityPayload>(API_DELETE_TRACKED_ACTIVITY, payload);
};

export const duplicateTrackedActivity = async (payload: DuplicateTrackedActivityPayload): Promise<CacheResult<DuplicateTrackedActivityResponse>> => {
    return apiClient.call<DuplicateTrackedActivityResponse, DuplicateTrackedActivityPayload>(API_DUPLICATE_TRACKED_ACTIVITY, payload);
}; 