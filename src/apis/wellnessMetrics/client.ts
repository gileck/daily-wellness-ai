import apiClient from '../../client/utils/apiClient';
import { CacheResult } from '../../server/cache/types';
import {
    API_CREATE_WELLNESS_METRIC,
    API_GET_WELLNESS_METRICS,
    API_GET_WELLNESS_METRIC_BY_ID,
    API_UPDATE_WELLNESS_METRIC,
    API_DELETE_WELLNESS_METRIC,
    API_TRACK_WELLNESS_METRIC,
    API_GET_WELLNESS_METRIC_RECORDS,
    API_UPDATE_WELLNESS_METRIC_RECORD,
    API_DELETE_WELLNESS_METRIC_RECORD,
} from './index';
import {
    CreateWellnessMetricPayload,
    CreateWellnessMetricResponse,
    GetWellnessMetricsResponse,
    GetWellnessMetricByIdPayload,
    GetWellnessMetricByIdResponse,
    UpdateWellnessMetricPayload,
    UpdateWellnessMetricResponse,
    DeleteWellnessMetricPayload,
    DeleteWellnessMetricResponse,
    TrackWellnessMetricPayload,
    TrackWellnessMetricResponse,
    GetWellnessMetricRecordsPayload,
    GetWellnessMetricRecordsResponse,
    UpdateWellnessMetricRecordPayload,
    UpdateWellnessMetricRecordResponse,
    DeleteWellnessMetricRecordPayload,
    DeleteWellnessMetricRecordResponse,
} from './types';

export const createWellnessMetric = (
    payload: CreateWellnessMetricPayload
): Promise<CacheResult<CreateWellnessMetricResponse>> => {
    return apiClient.call(API_CREATE_WELLNESS_METRIC, payload);
};

export const getWellnessMetrics = (): Promise<CacheResult<GetWellnessMetricsResponse>> => {
    return apiClient.call(API_GET_WELLNESS_METRICS);
};

export const getWellnessMetricById = (
    payload: GetWellnessMetricByIdPayload
): Promise<CacheResult<GetWellnessMetricByIdResponse>> => {
    return apiClient.call(API_GET_WELLNESS_METRIC_BY_ID, payload);
};

export const updateWellnessMetric = (
    payload: UpdateWellnessMetricPayload
): Promise<CacheResult<UpdateWellnessMetricResponse>> => {
    return apiClient.call(API_UPDATE_WELLNESS_METRIC, payload);
};

export const deleteWellnessMetric = (
    payload: DeleteWellnessMetricPayload
): Promise<CacheResult<DeleteWellnessMetricResponse>> => {
    return apiClient.call(API_DELETE_WELLNESS_METRIC, payload);
};

export const trackWellnessMetric = (
    payload: TrackWellnessMetricPayload
): Promise<CacheResult<TrackWellnessMetricResponse>> => {
    return apiClient.call(API_TRACK_WELLNESS_METRIC, payload);
};

export const getWellnessMetricRecords = (
    payload: GetWellnessMetricRecordsPayload = {}
): Promise<CacheResult<GetWellnessMetricRecordsResponse>> => {
    return apiClient.call(API_GET_WELLNESS_METRIC_RECORDS, payload);
};

export const updateWellnessMetricRecord = (
    payload: UpdateWellnessMetricRecordPayload
): Promise<CacheResult<UpdateWellnessMetricRecordResponse>> => {
    return apiClient.call(API_UPDATE_WELLNESS_METRIC_RECORD, payload);
};

export const deleteWellnessMetricRecord = (
    payload: DeleteWellnessMetricRecordPayload
): Promise<CacheResult<DeleteWellnessMetricRecordResponse>> => {
    return apiClient.call(API_DELETE_WELLNESS_METRIC_RECORD, payload);
}; 