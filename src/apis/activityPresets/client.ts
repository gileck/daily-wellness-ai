import apiClient from '@/client/utils/apiClient';
import { CacheResult } from '@/server/cache/types';
import {
    GET_ACTIVITY_PRESETS_API,
    CREATE_ACTIVITY_PRESET_API,
    UPDATE_ACTIVITY_PRESET_API,
    DELETE_ACTIVITY_PRESET_API
} from './index';
import {
    GetActivityPresetsResponse,
    CreateActivityPresetResponse,
    UpdateActivityPresetResponse,
    DeleteActivityPresetResponse,
    CreateActivityPresetPayload,
    UpdateActivityPresetPayload,
    DeleteActivityPresetPayload
} from './types';

export const getActivityPresets = async (): Promise<CacheResult<GetActivityPresetsResponse>> => {
    return apiClient.call<GetActivityPresetsResponse>(GET_ACTIVITY_PRESETS_API);
};

export const createActivityPreset = async (payload: CreateActivityPresetPayload): Promise<CacheResult<CreateActivityPresetResponse>> => {
    return apiClient.call<CreateActivityPresetResponse, CreateActivityPresetPayload>(CREATE_ACTIVITY_PRESET_API, payload);
};

export const updateActivityPreset = async (payload: UpdateActivityPresetPayload): Promise<CacheResult<UpdateActivityPresetResponse>> => {
    return apiClient.call<UpdateActivityPresetResponse, UpdateActivityPresetPayload>(UPDATE_ACTIVITY_PRESET_API, payload);
};

export const deleteActivityPreset = async (payload: DeleteActivityPresetPayload): Promise<CacheResult<DeleteActivityPresetResponse>> => {
    return apiClient.call<DeleteActivityPresetResponse, DeleteActivityPresetPayload>(DELETE_ACTIVITY_PRESET_API, payload);
}; 