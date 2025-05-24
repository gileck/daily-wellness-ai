import { useState, useEffect, useCallback } from 'react';
import {
    getActivityPresets,
    createActivityPreset,
    updateActivityPreset,
    deleteActivityPreset
} from '@/apis/activityPresets/client';
import {
    ActivityPresetClient,
    CreateActivityPresetPayload,
    UpdateActivityPresetPayload
} from '@/apis/activityPresets/types';

export interface UseActivityPresetsResult {
    presets: ActivityPresetClient[];
    isLoading: boolean;
    error: string | null;
    isSubmitting: boolean;
    fetchPresets: () => Promise<void>;
    handleCreatePreset: (payload: CreateActivityPresetPayload) => Promise<void>;
    handleUpdatePreset: (presetId: string, updates: Partial<Pick<ActivityPresetClient, 'name' | 'description' | 'presetFields'>>) => Promise<void>;
    handleDeletePreset: (presetId: string) => Promise<void>;
}

export const useActivityPresets = (): UseActivityPresetsResult => {
    const [presets, setPresets] = useState<ActivityPresetClient[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const fetchPresets = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const result = await getActivityPresets();
            setPresets(result.data.activityPresets);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch presets');
            console.error('Error fetching presets:', err);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const handleCreatePreset = useCallback(async (payload: CreateActivityPresetPayload) => {
        setIsSubmitting(true);
        setError(null);
        try {
            await createActivityPreset(payload);
            await fetchPresets(); // Refresh the list
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to create preset');
            throw err;
        } finally {
            setIsSubmitting(false);
        }
    }, [fetchPresets]);

    const handleUpdatePreset = useCallback(async (presetId: string, updates: Partial<Pick<ActivityPresetClient, 'name' | 'description' | 'presetFields'>>) => {
        setIsSubmitting(true);
        setError(null);
        try {
            const payload: UpdateActivityPresetPayload = { presetId, updates };
            await updateActivityPreset(payload);
            await fetchPresets(); // Refresh the list
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to update preset');
            throw err;
        } finally {
            setIsSubmitting(false);
        }
    }, [fetchPresets]);

    const handleDeletePreset = useCallback(async (presetId: string) => {
        setIsSubmitting(true);
        setError(null);
        try {
            await deleteActivityPreset({ presetId });
            await fetchPresets(); // Refresh the list
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to delete preset');
            throw err;
        } finally {
            setIsSubmitting(false);
        }
    }, [fetchPresets]);

    useEffect(() => {
        fetchPresets();
    }, [fetchPresets]);

    return {
        presets,
        isLoading,
        error,
        isSubmitting,
        fetchPresets,
        handleCreatePreset,
        handleUpdatePreset,
        handleDeletePreset
    };
}; 