import { useState, useCallback } from 'react';
import { getTrackedActivities } from '@/apis/trackedActivities/client';
import { TrackedActivity } from '@/apis/trackedActivities/types';
import { RecentActivitiesHooksResult, LoadingState } from './useHomeData.types';

interface RecentActivitiesState {
    recentlyLoggedActivities: TrackedActivity[];
}

const getDefaultRecentActivitiesState = (): RecentActivitiesState => ({
    recentlyLoggedActivities: []
});

interface UseRecentActivitiesHooksParams {
    updateLoadingState: (key: keyof LoadingState, value: boolean) => void;
}

export const useRecentActivitiesHooks = (params: UseRecentActivitiesHooksParams): RecentActivitiesHooksResult => {
    const { updateLoadingState } = params;

    const [state, setState] = useState<RecentActivitiesState>(getDefaultRecentActivitiesState);

    const updateState = useCallback((partialState: Partial<RecentActivitiesState>) => {
        setState(prev => ({ ...prev, ...partialState }));
    }, []);

    const fetchRecentActivities = useCallback(async () => {
        updateLoadingState('recentActivities', true);
        try {
            const now = new Date();
            const threeHoursAgo = new Date(now.getTime() - (3 * 60 * 60 * 1000)); // 3 hours ago

            const response = await getTrackedActivities({
                startDate: threeHoursAgo.toISOString(),
                endDate: now.toISOString(),
                limit: 10
            });

            updateState({ recentlyLoggedActivities: response.data.trackedActivities });
            updateLoadingState('recentActivities', false);
        } catch (err: unknown) {
            console.error("Failed to fetch recent activities:", err);
            updateLoadingState('recentActivities', false);
        }
    }, [updateLoadingState, updateState]);

    const refreshRecentActivities = useCallback(async () => {
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
            console.error("Failed to refresh recent activities:", err);
        }
    }, [updateState]);

    return {
        recentlyLoggedActivities: state.recentlyLoggedActivities,
        fetchRecentActivities,
        refreshRecentActivities
    };
}; 