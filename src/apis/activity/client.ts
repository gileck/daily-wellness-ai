import apiClient from '../../client/utils/apiClient';
import { CacheResult } from '../../server/cache/types';
import {
    API_CREATE_ACTIVITY_TYPE,
    API_GET_ACTIVITY_TYPES,
    API_UPDATE_ACTIVITY_TYPE,
    API_DELETE_ACTIVITY_TYPE,
    API_ADD_ACTIVITY,
    API_GET_ACTIVITIES,
    API_GET_ACTIVITY_BY_ID,
    API_UPDATE_ACTIVITY,
    API_DELETE_ACTIVITY,
} from './index';
import {
    CreateActivityTypePayload,
    CreateActivityTypeResponse,
    GetActivityTypesResponse,
    UpdateActivityTypeClientPayload,
    UpdateActivityTypeResponse,
    DeleteActivityTypePayload,
    DeleteActivityTypeResponse,
    AddActivityPayload,
    AddActivityResponse,
    GetActivitiesPayload,
    GetActivitiesResponse,
    GetActivityByIdPayload,
    GetActivityByIdResponse,
    UpdateActivityPayload,
    UpdateActivityResponse,
    DeleteActivityPayload,
    DeleteActivityResponse,
} from './types';

// ===== ActivityType Client Functions =====

export const createActivityType = (
    payload: CreateActivityTypePayload
): Promise<CacheResult<CreateActivityTypeResponse>> => {
    return apiClient.call(API_CREATE_ACTIVITY_TYPE, payload);
};

export const getActivityTypes = (
): Promise<CacheResult<GetActivityTypesResponse>> => {
    return apiClient.call(API_GET_ACTIVITY_TYPES);
};

export const updateActivityType = (
    payload: UpdateActivityTypeClientPayload
): Promise<CacheResult<UpdateActivityTypeResponse>> => {
    return apiClient.call(API_UPDATE_ACTIVITY_TYPE, payload);
};

export const deleteActivityType = (
    payload: DeleteActivityTypePayload
): Promise<CacheResult<DeleteActivityTypeResponse>> => {
    return apiClient.call(API_DELETE_ACTIVITY_TYPE, payload);
};

// ===== Activity Client Functions =====

export const addActivity = (
    payload: AddActivityPayload
): Promise<CacheResult<AddActivityResponse>> => {
    return apiClient.call(API_ADD_ACTIVITY, payload);
};

export const getActivities = (
    payload?: GetActivitiesPayload
): Promise<CacheResult<GetActivitiesResponse>> => {
    return apiClient.call(API_GET_ACTIVITIES, payload);
};

export const getActivityById = (
    payload: GetActivityByIdPayload
): Promise<CacheResult<GetActivityByIdResponse>> => {
    return apiClient.call(API_GET_ACTIVITY_BY_ID, payload);
};

export const updateActivity = (
    payload: UpdateActivityPayload
): Promise<CacheResult<UpdateActivityResponse>> => {
    return apiClient.call(API_UPDATE_ACTIVITY, payload);
};

export const deleteActivity = (
    payload: DeleteActivityPayload
): Promise<CacheResult<DeleteActivityResponse>> => {
    return apiClient.call(API_DELETE_ACTIVITY, payload);
}; 