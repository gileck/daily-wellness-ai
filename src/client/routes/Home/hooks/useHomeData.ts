import { useState, useCallback, useEffect } from 'react';
import { getActivityTypes } from '@/apis/activity/client';
import { ActivityTypeClient } from '@/apis/activity/types';
import { createTrackedActivity } from '@/apis/trackedActivities/client';
import { CreateTrackedActivityPayload, TrackedActivityValue } from '@/apis/trackedActivities/types';

// Interface for recently logged activities
export interface RecentlyLoggedActivity {
    activityType: ActivityTypeClient;
    timestamp: Date;
}

export interface HomeDataState {
    activityTypes: ActivityTypeClient[];
    isLoading: boolean;
    error: string | null;
    isSubmitting: boolean;
    successMessage: string | null;
    lastLoggedTimes: Record<string, Date>;
    recentlyLoggedActivities: RecentlyLoggedActivity[];
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
    successMessage: null,
    lastLoggedTimes: {},
    recentlyLoggedActivities: [],
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

    useEffect(() => {
        fetchActivityTypes();
    }, [fetchActivityTypes]);

    const openTrackingDialog = useCallback((activityType: ActivityTypeClient) => {
        updateState({ trackingDialog: { open: true, activityType } });
    }, [updateState]);

    const closeTrackingDialog = useCallback(() => {
        updateState({ trackingDialog: { open: false, activityType: null } });
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

            // Create a copy of the activity to store in recently logged
            const activityCopy = { ...activityType };

            // Add to recently logged activities (keep most recent 5)
            const updatedRecentlyLogged = [
                { activityType: activityCopy, timestamp },
                ...state.recentlyLoggedActivities
            ].slice(0, 5);

            // Filter out the tracked activity from the list
            const updatedActivityTypes = state.activityTypes.filter(
                activity => activity._id !== activityType._id
            );

            updateState({
                isSubmitting: false,
                successMessage: `${activityType.name} logged successfully!`,
                lastLoggedTimes: updatedLastLoggedTimes,
                recentlyLoggedActivities: updatedRecentlyLogged,
                activityTypes: updatedActivityTypes
            });

            closeTrackingDialog();

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
    }, [state.activityTypes, state.lastLoggedTimes, state.recentlyLoggedActivities, updateState, closeTrackingDialog, clearSuccessMessage]);

    return {
        ...state,
        fetchActivityTypes,
        openTrackingDialog,
        closeTrackingDialog,
        handleTrackActivity,
        clearSuccessMessage,
    };
}; 