import { useState, useCallback, useEffect } from 'react';
import {
    getTrackedActivities,
    updateTrackedActivity,
    deleteTrackedActivity,
    duplicateTrackedActivity
} from '@/apis/trackedActivities/client';
import {
    TrackedActivity,
    GetTrackedActivitiesParams,
    UpdateTrackedActivityPayload
} from '@/apis/trackedActivities/types';
import {
    getWellnessMetricRecords,
    updateWellnessMetricRecord,
    deleteWellnessMetricRecord
} from '@/apis/wellnessMetrics/client';
import {
    WellnessMetricRecord,
    UpdateWellnessMetricRecordPayload
} from '@/apis/wellnessMetrics/types';

const PAGE_SIZE = 50;

export interface ActivityLogDataState {
    trackedActivities: TrackedActivity[];
    wellnessMetricRecords: WellnessMetricRecord[];
    isLoading: boolean;
    error: string | null;
    totalActivities: number;
    isUpdating: boolean;
    updateError: string | null;
    isDeleting: boolean;
    deleteError: string | null;
    isDuplicating: boolean;
    duplicateError: string | null;
}

const getDefaultState = (): ActivityLogDataState => ({
    trackedActivities: [],
    wellnessMetricRecords: [],
    isLoading: false,
    error: null,
    totalActivities: 0,
    isUpdating: false,
    updateError: null,
    isDeleting: false,
    deleteError: null,
    isDuplicating: false,
    duplicateError: null,
});

export interface UseActivityLogDataResult extends ActivityLogDataState {
    fetchActivities: (params?: Omit<GetTrackedActivitiesParams, 'limit'>) => Promise<void>;
    updateActivity: (activityId: string, updates: UpdateTrackedActivityPayload['updates']) => Promise<boolean>;
    removeActivity: (activityId: string) => Promise<boolean>;
    duplicateActivity: (activityId: string, timestamp?: Date) => Promise<boolean>;
    updateMetricRecord: (recordId: string, updates: UpdateWellnessMetricRecordPayload['updates']) => Promise<boolean>;
    removeMetricRecord: (recordId: string) => Promise<boolean>;
}

export const useActivityLogData = (): UseActivityLogDataResult => {
    const [state, setState] = useState<ActivityLogDataState>(getDefaultState());

    const updateState = useCallback((partialState: Partial<ActivityLogDataState>) => {
        setState(prev => ({ ...prev, ...partialState }));
    }, []);

    const fetchActivities = useCallback(async (params?: Omit<GetTrackedActivitiesParams, 'limit'>) => {
        updateState({ isLoading: true, error: null });
        try {
            const apiParams: GetTrackedActivitiesParams = {
                ...params,
                limit: PAGE_SIZE,
                offset: 0, // Always start from the beginning to get latest activities
            };

            // Fetch both activities and wellness metric records
            const [activitiesResponse, metricsResponse] = await Promise.all([
                getTrackedActivities(apiParams),
                getWellnessMetricRecords({ limit: PAGE_SIZE })
            ]);

            updateState({
                trackedActivities: activitiesResponse.data.trackedActivities,
                wellnessMetricRecords: metricsResponse.data.records,
                totalActivities: activitiesResponse.data.total,
                isLoading: false,
            });
        } catch (err: unknown) {
            let message = 'An unknown error occurred while fetching activities.';
            if (err instanceof Error) {
                message = err.message;
            }
            updateState({ error: message, isLoading: false });
            console.error("Failed to fetch activities:", err);
        }
    }, [updateState]);

    const updateActivity = useCallback(async (activityId: string, updates: UpdateTrackedActivityPayload['updates']) => {
        updateState({ isUpdating: true, updateError: null });
        try {
            const response = await updateTrackedActivity({ activityId, updates });

            // Update local state with the updated activity
            updateState({
                trackedActivities: state.trackedActivities.map(activity =>
                    activity._id === activityId ? response.data.trackedActivity : activity
                ),
                isUpdating: false
            });

            return true;
        } catch (err: unknown) {
            let message = 'An unknown error occurred while updating the activity.';
            if (err instanceof Error) {
                message = err.message;
            }
            updateState({ updateError: message, isUpdating: false });
            console.error("Failed to update activity:", err);
            return false;
        }
    }, [state.trackedActivities, updateState]);

    const removeActivity = useCallback(async (activityId: string) => {
        updateState({ isDeleting: true, deleteError: null });
        try {
            await deleteTrackedActivity({ activityId });

            // Remove from local state
            updateState({
                trackedActivities: state.trackedActivities.filter(activity => activity._id !== activityId),
                totalActivities: state.totalActivities - 1,
                isDeleting: false
            });

            return true;
        } catch (err: unknown) {
            let message = 'An unknown error occurred while deleting the activity.';
            if (err instanceof Error) {
                message = err.message;
            }
            updateState({ deleteError: message, isDeleting: false });
            console.error("Failed to delete activity:", err);
            return false;
        }
    }, [state.trackedActivities, state.totalActivities, updateState]);

    const duplicateActivity = useCallback(async (activityId: string, timestamp?: Date) => {
        updateState({ isDuplicating: true, duplicateError: null });
        try {
            const response = await duplicateTrackedActivity({ activityId, timestamp });

            // Add the new activity to local state
            updateState({
                trackedActivities: [response.data.trackedActivity, ...state.trackedActivities],
                totalActivities: state.totalActivities + 1,
                isDuplicating: false
            });

            return true;
        } catch (err: unknown) {
            let message = 'An unknown error occurred while duplicating the activity.';
            if (err instanceof Error) {
                message = err.message;
            }
            updateState({ duplicateError: message, isDuplicating: false });
            console.error("Failed to duplicate activity:", err);
            return false;
        }
    }, [state.trackedActivities, state.totalActivities, updateState]);

    const updateMetricRecord = useCallback(async (recordId: string, updates: UpdateWellnessMetricRecordPayload['updates']) => {
        updateState({ isUpdating: true, updateError: null });
        try {
            await updateWellnessMetricRecord({ recordId, updates });

            // Update local state with the updated record
            updateState({
                wellnessMetricRecords: state.wellnessMetricRecords.map(record =>
                    record._id === recordId ? { ...record, ...updates } : record
                ),
                isUpdating: false
            });

            return true;
        } catch (err: unknown) {
            let message = 'An unknown error occurred while updating the metric record.';
            if (err instanceof Error) {
                message = err.message;
            }
            updateState({ updateError: message, isUpdating: false });
            console.error("Failed to update metric record:", err);
            return false;
        }
    }, [state.wellnessMetricRecords, updateState]);

    const removeMetricRecord = useCallback(async (recordId: string) => {
        updateState({ isDeleting: true, deleteError: null });
        try {
            await deleteWellnessMetricRecord({ recordId });

            // Remove from local state
            updateState({
                wellnessMetricRecords: state.wellnessMetricRecords.filter(record => record._id !== recordId),
                isDeleting: false
            });

            return true;
        } catch (err: unknown) {
            let message = 'An unknown error occurred while deleting the metric record.';
            if (err instanceof Error) {
                message = err.message;
            }
            updateState({ deleteError: message, isDeleting: false });
            console.error("Failed to delete metric record:", err);
            return false;
        }
    }, [state.wellnessMetricRecords, updateState]);

    useEffect(() => {
        fetchActivities();
    }, [fetchActivities]);

    return {
        ...state,
        fetchActivities,
        updateActivity,
        removeActivity,
        duplicateActivity,
        updateMetricRecord,
        removeMetricRecord,
    };
}; 