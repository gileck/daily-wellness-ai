import { useState, useCallback, useEffect } from 'react';
import { getActivityTypes } from '@/apis/activity/client';
import { ActivityTypeClient } from '@/apis/activity/types';
import { getActivityPresets } from '@/apis/activityPresets/client';
import { ActivityPresetClient } from '@/apis/activityPresets/types';
import { createTrackedActivity, getTrackedActivities } from '@/apis/trackedActivities/client';
import { CreateTrackedActivityPayload, TrackedActivityValue, TrackedActivity } from '@/apis/trackedActivities/types';

// Interface for recently logged activities
export interface RecentlyLoggedActivity {
    activityType: ActivityTypeClient;
    timestamp: Date;
}

export interface HomeDataState {
    activityTypes: ActivityTypeClient[];
    activityPresets: ActivityPresetClient[];
    isLoading: boolean;
    error: string | null;
    isSubmitting: boolean;
    successMessage: string | null;
    lastLoggedTimes: Record<string, Date>;
    recentlyLoggedActivities: TrackedActivity[];
    trackingDialog: {
        open: boolean;
        activityType: ActivityTypeClient | null;
        presetValues?: Record<string, unknown>;
    };
}

const getDefaultState = (): HomeDataState => ({
    activityTypes: [],
    activityPresets: [],
    isLoading: true,
    error: null,
    isSubmitting: false,
    successMessage: null,
    lastLoggedTimes: {},
    recentlyLoggedActivities: [],
    trackingDialog: {
        open: false,
        activityType: null,
        presetValues: undefined,
    },
});

export interface UseHomeDataResult extends HomeDataState {
    fetchActivityTypes: () => Promise<void>;
    fetchActivityPresets: () => Promise<void>;
    fetchRecentActivities: () => Promise<void>;
    openTrackingDialog: (activityType: ActivityTypeClient) => void;
    openTrackingDialogWithPreset: (preset: ActivityPresetClient, activityType: ActivityTypeClient) => void;
    closeTrackingDialog: () => void;
    handleTrackActivity: (activityType: ActivityTypeClient, values: TrackedActivityValue[], notes?: string) => Promise<void>;
    handleTrackPreset: (preset: ActivityPresetClient) => Promise<void>;
    clearSuccessMessage: () => void;
}

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

export const useHomeData = (): UseHomeDataResult => {
    const [state, setState] = useState<HomeDataState>(() => {
        // Initialize with saved data
        const savedData = loadFromLocalStorage();
        return {
            ...getDefaultState(),
            lastLoggedTimes: savedData.lastLoggedTimes
        };
    });

    const updateState = useCallback((partialState: Partial<HomeDataState>) => {
        setState(prev => ({ ...prev, ...partialState }));
    }, []);

    const fetchActivityTypes = useCallback(async () => {
        updateState({ isLoading: true, error: null });
        try {
            const response = await getActivityTypes();
            const enabledActivityTypes = response.data?.activityTypes.filter(at => at.enabled) || [];

            // Sort activities with recently logged ones at the end
            const sortedActivities = sortActivitiesByLastLogged(
                enabledActivityTypes,
                state.lastLoggedTimes
            );

            updateState({ activityTypes: sortedActivities, isLoading: false });
        } catch (err: unknown) {
            let message = 'An unknown error occurred.';
            if (err instanceof Error) {
                message = err.message;
            }
            updateState({ error: message, isLoading: false });
            console.error("Failed to fetch activity types:", err);
        }
    }, [updateState, state.lastLoggedTimes]);

    const fetchActivityPresets = useCallback(async () => {
        try {
            const response = await getActivityPresets();
            updateState({ activityPresets: response.data.activityPresets });
        } catch (err: unknown) {
            console.error("Failed to fetch activity presets:", err);
        }
    }, [updateState]);

    const fetchRecentActivities = useCallback(async () => {
        try {
            const now = new Date();
            const threeHoursAgo = new Date(now.getTime() - (3 * 60 * 60 * 1000)); // 3 hours ago

            const response = await getTrackedActivities({
                startDate: threeHoursAgo.toISOString(),
                endDate: now.toISOString(),
                limit: 10
            });

            updateState({ recentlyLoggedActivities: response.data.trackedActivities });
        } catch (err: unknown) {
            console.error("Failed to fetch recent activities:", err);
        }
    }, [updateState]);

    useEffect(() => {
        fetchActivityTypes();
        fetchActivityPresets();
        fetchRecentActivities();
    }, [fetchActivityTypes, fetchActivityPresets, fetchRecentActivities]);

    const openTrackingDialog = useCallback((activityType: ActivityTypeClient) => {
        updateState({ trackingDialog: { open: true, activityType, presetValues: undefined } });
    }, [updateState]);

    const openTrackingDialogWithPreset = useCallback((preset: ActivityPresetClient, activityType: ActivityTypeClient) => {
        updateState({
            trackingDialog: {
                open: true,
                activityType: activityType,
                presetValues: preset.presetFields
            }
        });
    }, [updateState]);

    const closeTrackingDialog = useCallback(() => {
        updateState({ trackingDialog: { open: false, activityType: null, presetValues: undefined } });
    }, [updateState]);

    const clearSuccessMessage = useCallback(() => {
        updateState({ successMessage: null });
    }, [updateState]);

    // Save lastLoggedTimes to localStorage whenever it changes
    useEffect(() => {
        try {
            localStorage.setItem('lastLoggedTimes', JSON.stringify(state.lastLoggedTimes));
        } catch (e) {
            console.error('Error saving to localStorage:', e);
        }
    }, [state.lastLoggedTimes]);

    const handleTrackActivity = useCallback(async (
        activityType: ActivityTypeClient,
        values: TrackedActivityValue[],
        notes?: string
    ) => {
        updateState({ isSubmitting: true, error: null });
        try {
            const timestamp = new Date();
            const payload: CreateTrackedActivityPayload = {
                activityTypeId: activityType._id,
                activityName: activityType.name,
                timestamp,
                values,
                notes,
            };
            await createTrackedActivity(payload);

            // Update the last logged time for this activity
            const updatedLastLoggedTimes = {
                ...state.lastLoggedTimes,
                [activityType._id]: timestamp
            };

            // Filter out the tracked activity from the list
            const updatedActivityTypes = state.activityTypes.filter(
                activity => activity._id !== activityType._id
            );

            updateState({
                isSubmitting: false,
                successMessage: `${activityType.name} logged successfully!`,
                lastLoggedTimes: updatedLastLoggedTimes,
                activityTypes: updatedActivityTypes
            });

            closeTrackingDialog();

            // Refresh recent activities to include the new one
            fetchRecentActivities();

            // Auto-clear success message after 5 seconds
            setTimeout(() => {
                clearSuccessMessage();
            }, 5000);

        } catch (err: unknown) {
            let message = 'An unknown error occurred while tracking activity.';
            if (err instanceof Error) {
                message = err.message;
            }
            updateState({ error: message, isSubmitting: false });
            console.error("Failed to track activity:", err);
        }
    }, [state.activityTypes, state.lastLoggedTimes, updateState, closeTrackingDialog, clearSuccessMessage, fetchRecentActivities]);

    const handleTrackPreset = useCallback(async (preset: ActivityPresetClient) => {
        // Find the corresponding activity type
        const allActivityTypes = await getActivityTypes();
        const activityType = allActivityTypes.data?.activityTypes.find(at => at._id === preset.activityTypeId);

        if (!activityType) {
            updateState({ error: 'Activity type not found for this preset' });
            return;
        }

        // Open the tracking dialog with preset values pre-filled
        openTrackingDialogWithPreset(preset, activityType);
    }, [openTrackingDialogWithPreset, updateState]);

    return {
        ...state,
        fetchActivityTypes,
        fetchActivityPresets,
        fetchRecentActivities,
        openTrackingDialog,
        openTrackingDialogWithPreset,
        closeTrackingDialog,
        handleTrackActivity,
        handleTrackPreset,
        clearSuccessMessage,
    };
}; 