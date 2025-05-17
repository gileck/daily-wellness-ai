import { useState, useCallback, useEffect } from 'react';
import { getActivityTypes } from '@/apis/activity/client';
import { ActivityTypeClient } from '@/apis/activity/types';
import { createTrackedActivity } from '@/apis/trackedActivities/client';
import { CreateTrackedActivityPayload, TrackedActivityValue } from '@/apis/trackedActivities/types';

export interface HomeDataState {
    activityTypes: ActivityTypeClient[];
    isLoading: boolean;
    error: string | null;
    isSubmitting: boolean;
    trackingDialog: {
        open: boolean;
        activityType: ActivityTypeClient | null;
    };
}

const getDefaultState = (): HomeDataState => ({
    activityTypes: [],
    isLoading: true,
    error: null,
    isSubmitting: false,
    trackingDialog: {
        open: false,
        activityType: null,
    },
});

export interface UseHomeDataResult extends HomeDataState {
    fetchActivityTypes: () => Promise<void>;
    openTrackingDialog: (activityType: ActivityTypeClient) => void;
    closeTrackingDialog: () => void;
    handleTrackActivity: (activityType: ActivityTypeClient, values: TrackedActivityValue[], notes?: string) => Promise<void>;
}

export const useHomeData = (): UseHomeDataResult => {
    const [state, setState] = useState<HomeDataState>(getDefaultState());

    const updateState = useCallback((partialState: Partial<HomeDataState>) => {
        setState(prev => ({ ...prev, ...partialState }));
    }, []);

    const fetchActivityTypes = useCallback(async () => {
        updateState({ isLoading: true, error: null });
        try {
            const response = await getActivityTypes();
            const enabledActivityTypes = response.data?.activityTypes.filter(at => at.enabled) || [];
            updateState({ activityTypes: enabledActivityTypes, isLoading: false });
        } catch (err: unknown) {
            let message = 'An unknown error occurred.';
            if (err instanceof Error) {
                message = err.message;
            }
            updateState({ error: message, isLoading: false });
            console.error("Failed to fetch activity types:", err);
        }
    }, [updateState]);

    useEffect(() => {
        fetchActivityTypes();
    }, [fetchActivityTypes]);

    const openTrackingDialog = useCallback((activityType: ActivityTypeClient) => {
        updateState({ trackingDialog: { open: true, activityType } });
    }, [updateState]);

    const closeTrackingDialog = useCallback(() => {
        updateState({ trackingDialog: { open: false, activityType: null } });
    }, [updateState]);

    const handleTrackActivity = useCallback(async (
        activityType: ActivityTypeClient,
        values: TrackedActivityValue[],
        notes?: string
    ) => {
        updateState({ isSubmitting: true, error: null });
        try {
            const payload: CreateTrackedActivityPayload = {
                activityTypeId: activityType._id,
                activityName: activityType.name,
                timestamp: new Date(), // Current time for now, dialog can allow changing this
                values,
                notes,
            };
            await createTrackedActivity(payload);
            updateState({ isSubmitting: false });
            closeTrackingDialog();
            // Optionally, show a success message or refresh some data
        } catch (err: unknown) {
            let message = 'An unknown error occurred while tracking activity.';
            if (err instanceof Error) {
                message = err.message;
            }
            updateState({ error: message, isSubmitting: false });
            console.error("Failed to track activity:", err);
        }
    }, [updateState, closeTrackingDialog]);

    return {
        ...state,
        fetchActivityTypes,
        openTrackingDialog,
        closeTrackingDialog,
        handleTrackActivity,
    };
}; 