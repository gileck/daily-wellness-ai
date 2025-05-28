import { useState, useCallback, useEffect } from 'react';
import { getActivityTypes } from '@/apis/activity/client';
import { ActivityTypeClient } from '@/apis/activity/types';
import { getActivityPresets } from '@/apis/activityPresets/client';
import { ActivityPresetClient } from '@/apis/activityPresets/types';
import { createTrackedActivity } from '@/apis/trackedActivities/client';
import { CreateTrackedActivityPayload, TrackedActivityValue } from '@/apis/trackedActivities/types';
import { ActivityHooksResult, LoadingState } from './useHomeData.types';

interface ActivityState {
    activityTypes: ActivityTypeClient[];
    activityPresets: ActivityPresetClient[];
    lastLoggedTimes: Record<string, Date>;
}

const getDefaultActivityState = (): ActivityState => ({
    activityTypes: [],
    activityPresets: [],
    lastLoggedTimes: {}
});

// Helper to sort activities by last logged time
const sortActivitiesByLastLogged = (
    activities: ActivityTypeClient[],
    lastLoggedTimes: Record<string, Date>
): ActivityTypeClient[] => {
    return [...activities].sort((a, b) => {
        const timeA = lastLoggedTimes[a._id] ? lastLoggedTimes[a._id].getTime() : 0;
        const timeB = lastLoggedTimes[b._id] ? lastLoggedTimes[b._id].getTime() : 0;

        // Recently logged items (higher timestamp) go to the end
        // If neither was logged, maintain original order
        if (timeA === 0 && timeB === 0) return 0;
        if (timeA === 0) return -1; // A wasn't logged, move to top
        if (timeB === 0) return 1;  // B wasn't logged, move to top
        return timeA - timeB;       // Sort by time, oldest first
    });
};

// Load data from localStorage
const loadFromLocalStorage = () => {
    try {
        const lastLoggedTimesStr = localStorage.getItem('lastLoggedTimes');
        const lastLoggedTimes = lastLoggedTimesStr ?
            Object.entries(JSON.parse(lastLoggedTimesStr)).reduce((acc, [key, value]) => {
                acc[key] = new Date(value as string);
                return acc;
            }, {} as Record<string, Date>) :
            {};

        return { lastLoggedTimes };
    } catch (e) {
        console.error('Error loading from localStorage:', e);
        return { lastLoggedTimes: {} };
    }
};

interface UseActivityHooksParams {
    updateLoadingState: (key: keyof LoadingState, value: boolean) => void;
    setError: (error: string | null) => void;
    setIsSubmitting: (isSubmitting: boolean) => void;
    setSuccessMessage: (message: string | null) => void;
    setIsRefreshing: (isRefreshing: boolean) => void;
    closeTrackingDialog: () => void;
    clearSuccessMessage: () => void;
    refreshRecentActivities: () => Promise<void>;
}

export const useActivityHooks = (params: UseActivityHooksParams): ActivityHooksResult => {
    const {
        updateLoadingState,
        setError,
        setIsSubmitting,
        setSuccessMessage,
        setIsRefreshing,
        closeTrackingDialog,
        clearSuccessMessage,
        refreshRecentActivities
    } = params;

    const [state, setState] = useState<ActivityState>(() => {
        const savedData = loadFromLocalStorage();
        return {
            ...getDefaultActivityState(),
            lastLoggedTimes: savedData.lastLoggedTimes
        };
    });

    const updateState = useCallback((partialState: Partial<ActivityState>) => {
        setState(prev => ({ ...prev, ...partialState }));
    }, []);

    // Save lastLoggedTimes to localStorage whenever it changes
    useEffect(() => {
        try {
            localStorage.setItem('lastLoggedTimes', JSON.stringify(state.lastLoggedTimes));
        } catch (e) {
            console.error('Error saving to localStorage:', e);
        }
    }, [state.lastLoggedTimes]);

    const fetchActivityTypes = useCallback(async () => {
        updateLoadingState('activityTypes', true);
        setError(null);
        try {
            const response = await getActivityTypes();
            const enabledActivityTypes = response.data?.activityTypes.filter(at => at.enabled) || [];

            // Sort activities with recently logged ones at the end
            const sortedActivities = sortActivitiesByLastLogged(
                enabledActivityTypes,
                state.lastLoggedTimes
            );

            updateState({ activityTypes: sortedActivities });
            updateLoadingState('activityTypes', false);
        } catch (err: unknown) {
            let message = 'An unknown error occurred.';
            if (err instanceof Error) {
                message = err.message;
            }
            setError(message);
            updateLoadingState('activityTypes', false);
            console.error("Failed to fetch activity types:", err);
        }
    }, [updateLoadingState, setError, state.lastLoggedTimes, updateState]);

    const fetchActivityPresets = useCallback(async () => {
        updateLoadingState('activityPresets', true);
        try {
            const response = await getActivityPresets();
            updateState({ activityPresets: response.data.activityPresets });
            updateLoadingState('activityPresets', false);
        } catch (err: unknown) {
            console.error("Failed to fetch activity presets:", err);
            updateLoadingState('activityPresets', false);
        }
    }, [updateLoadingState, updateState]);

    const refreshActivityTypes = useCallback(async () => {
        try {
            const response = await getActivityTypes();
            const enabledActivityTypes = response.data?.activityTypes.filter(at => at.enabled) || [];

            // Sort activities with recently logged ones at the end
            const sortedActivities = sortActivitiesByLastLogged(
                enabledActivityTypes,
                state.lastLoggedTimes
            );

            updateState({ activityTypes: sortedActivities });
        } catch (err: unknown) {
            console.error("Failed to refresh activity types:", err);
        }
    }, [state.lastLoggedTimes, updateState]);

    const updateLastLoggedTimes = useCallback((times: Record<string, Date>) => {
        updateState({ lastLoggedTimes: times });
    }, [updateState]);

    const handleTrackActivity = useCallback(async (
        activityType: ActivityTypeClient,
        values: TrackedActivityValue[],
        notes?: string,
        timestamp?: Date
    ) => {
        setIsSubmitting(true);
        setError(null);
        try {
            const activityTimestamp = timestamp || new Date();
            const payload: CreateTrackedActivityPayload = {
                activityTypeId: activityType._id,
                activityName: activityType.name,
                timestamp: activityTimestamp,
                values,
                notes,
            };
            await createTrackedActivity(payload);

            // Update the last logged time for this activity
            const updatedLastLoggedTimes = {
                ...state.lastLoggedTimes,
                [activityType._id]: activityTimestamp
            };

            setIsSubmitting(false);
            setSuccessMessage(`${activityType.name} logged successfully!`);
            updateState({ lastLoggedTimes: updatedLastLoggedTimes });
            setIsRefreshing(true); // Start refresh operation

            closeTrackingDialog();

            // Refresh data to reflect changes
            await Promise.all([
                refreshRecentActivities(),
                refreshActivityTypes() // This will re-sort activities with the new logged time
            ]);

            // End refresh operation
            setIsRefreshing(false);

            // Auto-clear success message after 5 seconds
            setTimeout(() => {
                clearSuccessMessage();
            }, 5000);

        } catch (err: unknown) {
            let message = 'An unknown error occurred while tracking activity.';
            if (err instanceof Error) {
                message = err.message;
            }
            setError(message);
            setIsSubmitting(false);
            setIsRefreshing(false);
            console.error("Failed to track activity:", err);
        }
    }, [state.lastLoggedTimes, setIsSubmitting, setError, setSuccessMessage, setIsRefreshing, closeTrackingDialog, clearSuccessMessage, refreshRecentActivities, refreshActivityTypes, updateState]);

    const handleTrackPreset = useCallback(async (preset: ActivityPresetClient) => {
        // This will be implemented by the main hook which has access to openTrackingDialogWithPreset
        // For now, we'll just log it - the main hook will override this behavior
        console.log('Track preset:', preset);
    }, []);

    return {
        activityTypes: state.activityTypes,
        activityPresets: state.activityPresets,
        lastLoggedTimes: state.lastLoggedTimes,
        fetchActivityTypes,
        fetchActivityPresets,
        refreshActivityTypes,
        handleTrackActivity,
        handleTrackPreset,
        updateLastLoggedTimes
    };
}; 