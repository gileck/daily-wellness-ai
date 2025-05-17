import { useState, useCallback, useEffect } from 'react';
import { getTrackedActivities } from '@/apis/trackedActivities/client';
import { TrackedActivity, GetTrackedActivitiesParams } from '@/apis/trackedActivities/types';

const PAGE_SIZE = 20;

export interface HistoryDataState {
    trackedActivities: TrackedActivity[];
    isLoading: boolean;
    error: string | null;
    currentPage: number;
    totalActivities: number;
}

const getDefaultState = (): HistoryDataState => ({
    trackedActivities: [],
    isLoading: false, // Initially false until fetch is called
    error: null,
    currentPage: 0,
    totalActivities: 0,
});

export interface UseHistoryDataResult extends HistoryDataState {
    fetchHistory: (page?: number, params?: Omit<GetTrackedActivitiesParams, 'limit' | 'offset'>) => Promise<void>;
    // loadMore: () => void; // For infinite scroll if implemented later
    // hasMore: boolean;
}

export const useHistoryData = (): UseHistoryDataResult => {
    const [state, setState] = useState<HistoryDataState>(getDefaultState());

    const updateState = useCallback((partialState: Partial<HistoryDataState>) => {
        setState(prev => ({ ...prev, ...partialState }));
    }, []);

    const fetchHistory = useCallback(async (page: number = 0, params?: Omit<GetTrackedActivitiesParams, 'limit' | 'offset'>) => {
        updateState({ isLoading: true, error: null, currentPage: page });
        try {
            const apiParams: GetTrackedActivitiesParams = {
                ...params,
                limit: PAGE_SIZE,
                offset: page * PAGE_SIZE,
            };
            const response = await getTrackedActivities(apiParams);
            // Note: makeApiRequest (used by getTrackedActivities) throws on error, so no response.error check needed here
            updateState({
                trackedActivities: page === 0 ? response.data.trackedActivities : [...state.trackedActivities, ...response.data.trackedActivities],
                totalActivities: response.data.total,
                isLoading: false,
            });
        } catch (err: unknown) {
            let message = 'An unknown error occurred while fetching history.';
            if (err instanceof Error) {
                message = err.message;
            }
            updateState({ error: message, isLoading: false });
            console.error("Failed to fetch history:", err);
        }
    }, [updateState, state.trackedActivities]);

    useEffect(() => {
        fetchHistory(0); // Initial fetch for the first page
    }, [fetchHistory]);

    // const hasMore = state.trackedActivities.length < state.totalActivities;
    // const loadMore = useCallback(() => {
    //     if (!state.isLoading && hasMore) {
    //         fetchHistory(state.currentPage + 1);
    //     }
    // }, [state.isLoading, hasMore, fetchHistory, state.currentPage]);

    return {
        ...state,
        fetchHistory,
        // loadMore,
        // hasMore,
    };
}; 