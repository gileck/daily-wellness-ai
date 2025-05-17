import { useEffect, useState, useCallback } from 'react';
import { getPredefinedData } from '@/apis/predefinedData/client';
import { GetPredefinedDataResponse, PredefinedActivityTypeJSON, PredefinedWellnessMetricJSON } from '@/apis/predefinedData/types';
import { getActivityTypes, createActivityType, updateActivityType, deleteActivityType } from '@/apis/activity/client';
import { ActivityTypeClient, GetActivityTypesResponse, CreateActivityTypePayload, UpdateActivityTypePayload, DeleteActivityTypePayload } from '@/apis/activity/types';
import { getWellnessMetrics, createWellnessMetric, updateWellnessMetric, deleteWellnessMetric } from '@/apis/wellnessMetrics/client';
import { WellnessMetricClient, GetWellnessMetricsResponse, CreateWellnessMetricPayload, UpdateWellnessMetricPayload, DeleteWellnessMetricPayload } from '@/apis/wellnessMetrics/types';
import { CacheResult } from '@/server/cache/types';
import { UseActivityConfigurationDashboardResult, ActivityConfigurationDashboardState } from './useActivityConfigurationDashboard.types';

const getDefaultState = (): ActivityConfigurationDashboardState => ({
    predefinedData: null,
    userActivityTypes: [],
    userWellnessMetrics: [],
    isLoading: true,
    error: null,
    isSubmitting: {},
    openAddActivityDialog: false,
    editingActivityType: null,
    openAddMetricDialog: false,
    editingWellnessMetric: null,
});

export const useActivityConfigurationDashboard = (): UseActivityConfigurationDashboardResult => {
    const [state, setState] = useState<ActivityConfigurationDashboardState>(getDefaultState());

    const updateState = useCallback((partialState: Partial<ActivityConfigurationDashboardState>) => {
        setState(prev => ({ ...prev, ...partialState }));
    }, []);

    const fetchData = useCallback(async () => {
        updateState({ isLoading: true, error: null });
        try {
            const results = await Promise.all([
                getPredefinedData(),
                getActivityTypes(),
                getWellnessMetrics(),
            ]);

            const pdRes: CacheResult<GetPredefinedDataResponse> = results[0];
            const uatRes: CacheResult<GetActivityTypesResponse> = results[1];
            const uwmRes: CacheResult<GetWellnessMetricsResponse> = results[2];

            updateState({
                predefinedData: pdRes.data,
                userActivityTypes: uatRes.data.activityTypes || [],
                userWellnessMetrics: uwmRes.data.wellnessMetrics || [],
            });
        } catch (err: unknown) {
            if (err instanceof Error) {
                updateState({ error: err.message });
            } else {
                updateState({ error: 'An unknown error occurred while fetching configuration data.' });
            }
            console.error("Failed to fetch configuration data:", err);
        } finally {
            updateState({ isLoading: false });
        }
    }, [updateState]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleTogglePredefined = useCallback(async (
        item: PredefinedActivityTypeJSON | PredefinedWellnessMetricJSON,
        type: 'activityType' | 'wellnessMetric'
    ) => {
        const itemId = item.id;
        updateState({ isSubmitting: { ...state.isSubmitting, [itemId]: true }, error: null });

        try {
            if (type === 'activityType') {
                const predefinedItem = item as PredefinedActivityTypeJSON;
                const existingUserItem = state.userActivityTypes.find(at => at.isPredefined && at.name === predefinedItem.name);

                if (existingUserItem) {
                    await updateActivityType({
                        activityTypeId: existingUserItem._id,
                        updates: { enabled: !existingUserItem.enabled }
                    });
                } else {
                    const payload: CreateActivityTypePayload = {
                        name: predefinedItem.name,
                        type: predefinedItem.type,
                        fields: predefinedItem.fields,
                        isPredefined: true,
                        enabled: true,
                    };
                    await createActivityType(payload);
                }
            } else { // wellnessMetric
                const predefinedItem = item as PredefinedWellnessMetricJSON;
                const existingUserItem = state.userWellnessMetrics.find(wm => wm.isPredefined && wm.predefinedId === predefinedItem.id);

                if (existingUserItem) {
                    await updateWellnessMetric({
                        metricId: existingUserItem._id,
                        updates: { enabled: !existingUserItem.enabled }
                    });
                } else {
                    const payload: CreateWellnessMetricPayload = {
                        name: predefinedItem.name,
                        isPredefined: true,
                        predefinedId: predefinedItem.id,
                        enabled: true,
                    };
                    await createWellnessMetric(payload);
                }
            }
            await fetchData();
        } catch (err: unknown) {
            const itemName = item?.name || 'item';
            if (err instanceof Error) {
                updateState({ error: `Failed to update ${itemName}: ${err.message}` });
            } else {
                updateState({ error: `An unknown error occurred while updating ${itemName}.` });
            }
            console.error(`Failed to toggle ${type} ${itemName}:`, err);
        } finally {
            updateState({ isSubmitting: { ...state.isSubmitting, [item?.id || 'unknown']: false } });
        }
    }, [fetchData, state.isSubmitting, state.userActivityTypes, state.userWellnessMetrics, updateState]);

    const handleSaveActivityType = useCallback(async (payload: CreateActivityTypePayload | { updates: UpdateActivityTypePayload, activityTypeId: string }) => {
        const submissionKey = 'activityTypeId' in payload ? payload.activityTypeId : `newActivity_${Date.now()}`;
        updateState({ isSubmitting: { ...state.isSubmitting, [submissionKey]: true }, error: null });
        try {
            if ('activityTypeId' in payload) {
                await updateActivityType({
                    activityTypeId: payload.activityTypeId,
                    updates: payload.updates
                });
            } else {
                await createActivityType(payload as CreateActivityTypePayload);
            }
            await fetchData();
            updateState({ openAddActivityDialog: false, editingActivityType: null });
        } catch (err: unknown) {
            const action = 'activityTypeId' in payload ? 'update' : 'create';
            if (err instanceof Error) {
                updateState({ error: `Failed to ${action} activity type: ${err.message}` });
            } else {
                updateState({ error: `An unknown error occurred while ${action}ing the activity type.` });
            }
            console.error(`Failed to ${action} activity type:`, err);
        } finally {
            updateState({ isSubmitting: { ...state.isSubmitting, [submissionKey]: false } });
        }
    }, [fetchData, state.isSubmitting, updateState]);

    const handleSaveWellnessMetric = useCallback(async (payload: CreateWellnessMetricPayload | { metricId: string, updates: Partial<Omit<WellnessMetricClient, '_id' | 'userId' | 'isPredefined' | 'predefinedId'>> }) => {
        const isUpdate = 'metricId' in payload;
        const submissionKey = isUpdate ? payload.metricId : `newMetric_${Date.now()}`;
        updateState({ isSubmitting: { ...state.isSubmitting, [submissionKey]: true }, error: null });
        try {
            if (isUpdate) {
                const updatePayload: UpdateWellnessMetricPayload = {
                    metricId: payload.metricId,
                    updates: payload.updates as UpdateWellnessMetricPayload['updates']
                };
                await updateWellnessMetric(updatePayload);
            } else {
                await createWellnessMetric(payload as CreateWellnessMetricPayload);
            }
            await fetchData();
            updateState({ openAddMetricDialog: false, editingWellnessMetric: null });
        } catch (err: unknown) {
            const action = isUpdate ? 'update' : 'create';
            if (err instanceof Error) {
                updateState({ error: `Failed to ${action} wellness metric: ${err.message}` });
            } else {
                updateState({ error: `An unknown error occurred while ${action}ing the wellness metric.` });
            }
            console.error(`Failed to ${action} wellness metric:`, err);
        } finally {
            updateState({ isSubmitting: { ...state.isSubmitting, [submissionKey]: false } });
        }
    }, [fetchData, state.isSubmitting, updateState]);

    const handleDeleteActivityType = useCallback(async (activityTypeId: string) => {
        const submissionKey = `delete_activity_${activityTypeId}`;
        updateState({ isSubmitting: { ...state.isSubmitting, [submissionKey]: true }, error: null });
        try {
            const payload: DeleteActivityTypePayload = { activityTypeId };
            await deleteActivityType(payload);
            await fetchData(); // Refresh data
        } catch (err: unknown) {
            if (err instanceof Error) {
                updateState({ error: `Failed to delete activity type: ${err.message}` });
            } else {
                updateState({ error: 'An unknown error occurred while deleting the activity type.' });
            }
            console.error(`Failed to delete activity type ${activityTypeId}:`, err);
        } finally {
            updateState({ isSubmitting: { ...state.isSubmitting, [submissionKey]: false } });
        }
    }, [fetchData, state.isSubmitting, updateState]);

    const handleDeleteWellnessMetric = useCallback(async (metricId: string) => {
        const submissionKey = `delete_metric_${metricId}`;
        updateState({ isSubmitting: { ...state.isSubmitting, [submissionKey]: true }, error: null });
        try {
            const payload: DeleteWellnessMetricPayload = { metricId };
            await deleteWellnessMetric(payload);
            await fetchData();
        } catch (err: unknown) {
            if (err instanceof Error) {
                updateState({ error: `Failed to delete wellness metric: ${err.message}` });
            } else {
                updateState({ error: 'An unknown error occurred while deleting wellness metric.' });
            }
            console.error(`Failed to delete wellness metric ${metricId}:`, err);
        } finally {
            updateState({ isSubmitting: { ...state.isSubmitting, [submissionKey]: false } });
        }
    }, [fetchData, state.isSubmitting, updateState]);

    const handleOpenAddActivityDialog = useCallback((activityTypeToEdit?: ActivityTypeClient) => {
        if (activityTypeToEdit) {
            updateState({ editingActivityType: activityTypeToEdit, openAddActivityDialog: true });
        } else {
            updateState({ editingActivityType: null, openAddActivityDialog: true });
        }
    }, [updateState]);

    const handleCloseAddActivityDialog = useCallback(() => {
        updateState({ openAddActivityDialog: false, editingActivityType: null });
    }, [updateState]);

    const handleOpenAddMetricDialog = useCallback((metricToEdit?: WellnessMetricClient) => {
        if (metricToEdit) {
            updateState({ editingWellnessMetric: metricToEdit, openAddMetricDialog: true });
        } else {
            updateState({ editingWellnessMetric: null, openAddMetricDialog: true });
        }
    }, [updateState]);

    const handleCloseAddMetricDialog = useCallback(() => {
        updateState({ openAddMetricDialog: false });
    }, [updateState]);

    const isItemAddedAndEnabled = useCallback((item: PredefinedActivityTypeJSON | PredefinedWellnessMetricJSON, type: 'activityType' | 'wellnessMetric'): boolean => {
        if (type === 'activityType') {
            return state.userActivityTypes.some(at => at.isPredefined && at.name === item.name && at.enabled);
        } else { // wellnessMetric
            return state.userWellnessMetrics.some(wm => wm.isPredefined && wm.predefinedId === item.id && wm.enabled);
        }
    }, [state.userActivityTypes, state.userWellnessMetrics]);

    return {
        ...state,
        fetchData,
        handleTogglePredefined,
        handleSaveActivityType,
        handleSaveWellnessMetric,
        handleDeleteActivityType,
        handleDeleteWellnessMetric,
        handleOpenAddActivityDialog,
        handleCloseAddActivityDialog,
        handleOpenAddMetricDialog,
        handleCloseAddMetricDialog,
        isItemAddedAndEnabled,
    };
}; 