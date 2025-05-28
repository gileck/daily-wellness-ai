import { useState, useCallback, useEffect } from 'react';
import { getActivityTypes } from '@/apis/activity/client';
import { ActivityPresetClient } from '@/apis/activityPresets/types';
import { useActivityHooks } from './useActivityHooks';
import { useMetricsHooks } from './useMetricsHooks';
import { useRecentActivitiesHooks } from './useRecentActivitiesHooks';
import { useDialogHooks } from './useDialogHooks';
import { UseHomeDataResult, LoadingState } from './useHomeData.types';

interface MainState {
    isLoading: boolean;
    error: string | null;
    isSubmitting: boolean;
    successMessage: string | null;
    isRefreshing: boolean;
    hasInitiallyLoaded: boolean;
    loadingState: LoadingState;
}

const getDefaultMainState = (): MainState => ({
    isLoading: true, // Start with loading state
    error: null,
    isSubmitting: false,
    successMessage: null,
    isRefreshing: false,
    hasInitiallyLoaded: false,
    loadingState: {
        activityTypes: true,
        activityPresets: true,
        wellnessMetrics: true,
        recentActivities: true,
    }
});

export const useHomeData = (): UseHomeDataResult => {
    const [state, setState] = useState<MainState>(getDefaultMainState);

    const updateState = useCallback((partialState: Partial<MainState>) => {
        setState(prev => ({ ...prev, ...partialState }));
    }, []);

    const updateLoadingState = useCallback((key: keyof LoadingState, value: boolean) => {
        setState(prev => {
            const newLoadingState = { ...prev.loadingState, [key]: value };
            
            // Update global loading state based on individual loading states
            // Only show loading during initial load, not during refreshes
            let newIsLoading = prev.isLoading;
            if (!prev.hasInitiallyLoaded) {
                const { activityTypes, activityPresets, wellnessMetrics, recentActivities } = newLoadingState;
                newIsLoading = activityTypes || activityPresets || wellnessMetrics || recentActivities;
            } else {
                newIsLoading = false;
            }
            
            // Mark as initially loaded when all initial fetch operations are complete
            let newHasInitiallyLoaded = prev.hasInitiallyLoaded;
            if (!prev.hasInitiallyLoaded) {
                const { activityTypes, activityPresets, wellnessMetrics, recentActivities } = newLoadingState;
                if (!activityTypes && !activityPresets && !wellnessMetrics && !recentActivities) {
                    newHasInitiallyLoaded = true;
                    newIsLoading = false;
                }
            }
            
            return {
                ...prev,
                loadingState: newLoadingState,
                isLoading: newIsLoading,
                hasInitiallyLoaded: newHasInitiallyLoaded
            };
        });
    }, []);

    const setError = useCallback((error: string | null) => {
        updateState({ error });
    }, [updateState]);

    const setIsSubmitting = useCallback((isSubmitting: boolean) => {
        updateState({ isSubmitting });
    }, [updateState]);

    const setSuccessMessage = useCallback((successMessage: string | null) => {
        updateState({ successMessage });
    }, [updateState]);

    const setIsRefreshing = useCallback((isRefreshing: boolean) => {
        updateState({ isRefreshing });
    }, [updateState]);

    const clearSuccessMessage = useCallback(() => {
        updateState({ successMessage: null });
    }, [updateState]);

    // Initialize dialog hooks
    const dialogHooks = useDialogHooks();

    // Initialize recent activities hooks
    const recentActivitiesHooks = useRecentActivitiesHooks({
        updateLoadingState
    });

    // Initialize metrics hooks
    const metricsHooks = useMetricsHooks({
        updateLoadingState,
        setError,
        setIsSubmitting,
        setSuccessMessage,
        clearSuccessMessage
    });

    // Initialize activity hooks
    const activityHooks = useActivityHooks({
        updateLoadingState,
        setError,
        setIsSubmitting,
        setSuccessMessage,
        setIsRefreshing,
        closeTrackingDialog: dialogHooks.closeTrackingDialog,
        clearSuccessMessage,
        refreshRecentActivities: recentActivitiesHooks.refreshRecentActivities
    });

    // Initialize data on mount
    useEffect(() => {
        activityHooks.fetchActivityTypes();
        activityHooks.fetchActivityPresets();
        metricsHooks.fetchWellnessMetrics();
        recentActivitiesHooks.fetchRecentActivities();
    }, [activityHooks.fetchActivityTypes, activityHooks.fetchActivityPresets, metricsHooks.fetchWellnessMetrics, recentActivitiesHooks.fetchRecentActivities]);

    // Override handleTrackPreset to use dialog functions
    const handleTrackPreset = useCallback(async (preset: ActivityPresetClient) => {
        // Find the corresponding activity type
        const allActivityTypes = await getActivityTypes();
        const activityType = allActivityTypes.data?.activityTypes.find(at => at._id === preset.activityTypeId);

        if (!activityType) {
            setError('Activity type not found for this preset');
            return;
        }

        // Open the tracking dialog with preset values pre-filled
        dialogHooks.openTrackingDialogWithPreset(preset, activityType);
    }, [dialogHooks.openTrackingDialogWithPreset, setError]);

    return {
        // Activity data
        activityTypes: activityHooks.activityTypes,
        activityPresets: activityHooks.activityPresets,
        lastLoggedTimes: activityHooks.lastLoggedTimes,
        
        // Metrics data
        wellnessMetrics: metricsHooks.wellnessMetrics,
        
        // Recent activities data
        recentlyLoggedActivities: recentActivitiesHooks.recentlyLoggedActivities,
        
        // Main state
        isLoading: state.isLoading,
        error: state.error,
        isSubmitting: state.isSubmitting,
        successMessage: state.successMessage,
        isRefreshing: state.isRefreshing,
        hasInitiallyLoaded: state.hasInitiallyLoaded,
        loadingState: state.loadingState,
        
        // Dialog state
        trackingDialog: dialogHooks.trackingDialog,
        metricDialog: dialogHooks.metricDialog,
        
        // Fetch functions
        fetchActivityTypes: activityHooks.fetchActivityTypes,
        fetchActivityPresets: activityHooks.fetchActivityPresets,
        fetchWellnessMetrics: metricsHooks.fetchWellnessMetrics,
        fetchRecentActivities: recentActivitiesHooks.fetchRecentActivities,
        
        // Dialog functions
        openTrackingDialog: dialogHooks.openTrackingDialog,
        openTrackingDialogWithPreset: dialogHooks.openTrackingDialogWithPreset,
        closeTrackingDialog: dialogHooks.closeTrackingDialog,
        openMetricDialog: dialogHooks.openMetricDialog,
        closeMetricDialog: dialogHooks.closeMetricDialog,
        
        // Action functions
        handleTrackActivity: activityHooks.handleTrackActivity,
        handleTrackPreset,
        handleTrackMetric: metricsHooks.handleTrackMetric,
        clearSuccessMessage
    };
}; 