import { useState, useCallback } from 'react';
import { getWellnessMetrics, trackWellnessMetric } from '@/apis/wellnessMetrics/client';
import { WellnessMetricClient, TrackWellnessMetricPayload } from '@/apis/wellnessMetrics/types';
import { MetricsHooksResult, LoadingState } from './useHomeData.types';

interface MetricsState {
    wellnessMetrics: WellnessMetricClient[];
}

const getDefaultMetricsState = (): MetricsState => ({
    wellnessMetrics: []
});

interface UseMetricsHooksParams {
    updateLoadingState: (key: keyof LoadingState, value: boolean) => void;
    setError: (error: string | null) => void;
    setIsSubmitting: (isSubmitting: boolean) => void;
    setSuccessMessage: (message: string | null) => void;
    clearSuccessMessage: () => void;
}

export const useMetricsHooks = (params: UseMetricsHooksParams): MetricsHooksResult => {
    const {
        updateLoadingState,
        setError,
        setIsSubmitting,
        setSuccessMessage,
        clearSuccessMessage
    } = params;

    const [state, setState] = useState<MetricsState>(getDefaultMetricsState);

    const updateState = useCallback((partialState: Partial<MetricsState>) => {
        setState(prev => ({ ...prev, ...partialState }));
    }, []);

    const fetchWellnessMetrics = useCallback(async () => {
        updateLoadingState('wellnessMetrics', true);
        try {
            const response = await getWellnessMetrics();
            updateState({ wellnessMetrics: response.data.wellnessMetrics });
            updateLoadingState('wellnessMetrics', false);
        } catch (err: unknown) {
            console.error("Failed to fetch wellness metrics:", err);
            updateLoadingState('wellnessMetrics', false);
        }
    }, [updateLoadingState, updateState]);

    const handleTrackMetric = useCallback(async (metric: WellnessMetricClient, value: number | string, notes?: string) => {
        try {
            const payload: TrackWellnessMetricPayload = {
                metricId: metric._id,
                value,
                notes,
            };
            await trackWellnessMetric(payload);

            setSuccessMessage(`${metric.name} tracked successfully!`);

            // Auto-clear success message after 5 seconds
            setTimeout(() => {
                clearSuccessMessage();
            }, 5000);

        } catch (err: unknown) {
            let message = 'An unknown error occurred while tracking metric.';
            if (err instanceof Error) {
                message = err.message;
            }
            setError(message);
            setIsSubmitting(false);
            console.error("Failed to track metric:", err);
        }
    }, [setSuccessMessage, clearSuccessMessage, setError, setIsSubmitting]);

    return {
        wellnessMetrics: state.wellnessMetrics,
        fetchWellnessMetrics,
        handleTrackMetric
    };
}; 