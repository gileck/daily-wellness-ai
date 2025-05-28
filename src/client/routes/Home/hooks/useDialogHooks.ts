import { useState, useCallback } from 'react';
import { ActivityTypeClient } from '@/apis/activity/types';
import { ActivityPresetClient } from '@/apis/activityPresets/types';
import { WellnessMetricClient } from '@/apis/wellnessMetrics/types';
import { DialogHooksResult, TrackingDialogState, MetricDialogState } from './useHomeData.types';

interface DialogState {
    trackingDialog: TrackingDialogState;
    metricDialog: MetricDialogState;
}

const getDefaultDialogState = (): DialogState => ({
    trackingDialog: {
        open: false,
        activityType: null,
        presetValues: undefined,
    },
    metricDialog: {
        open: false,
        metric: null,
    },
});

export const useDialogHooks = (): DialogHooksResult => {
    const [state, setState] = useState<DialogState>(getDefaultDialogState);

    const updateState = useCallback((partialState: Partial<DialogState>) => {
        setState(prev => ({ ...prev, ...partialState }));
    }, []);

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

    const openMetricDialog = useCallback((metric: WellnessMetricClient) => {
        updateState({ metricDialog: { open: true, metric } });
    }, [updateState]);

    const closeMetricDialog = useCallback(() => {
        updateState({ metricDialog: { open: false, metric: null } });
    }, [updateState]);

    return {
        trackingDialog: state.trackingDialog,
        metricDialog: state.metricDialog,
        openTrackingDialog,
        openTrackingDialogWithPreset,
        closeTrackingDialog,
        openMetricDialog,
        closeMetricDialog
    };
}; 