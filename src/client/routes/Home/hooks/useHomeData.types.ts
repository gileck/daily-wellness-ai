import { ActivityTypeClient } from '@/apis/activity/types';
import { ActivityPresetClient } from '@/apis/activityPresets/types';
import { TrackedActivity, TrackedActivityValue } from '@/apis/trackedActivities/types';
import { WellnessMetricClient } from '@/apis/wellnessMetrics/types';

// Interface for recently logged activities
export interface RecentlyLoggedActivity {
    activityType: ActivityTypeClient;
    timestamp: Date;
}

// Loading state management
export interface LoadingState {
    activityTypes: boolean;
    activityPresets: boolean;
    wellnessMetrics: boolean;
    recentActivities: boolean;
}

// Dialog states
export interface TrackingDialogState {
    open: boolean;
    activityType: ActivityTypeClient | null;
    presetValues?: Record<string, unknown>;
}

export interface MetricDialogState {
    open: boolean;
    metric: WellnessMetricClient | null;
}

// Main home data state
export interface HomeDataState {
    activityTypes: ActivityTypeClient[];
    activityPresets: ActivityPresetClient[];
    wellnessMetrics: WellnessMetricClient[];
    isLoading: boolean;
    error: string | null;
    isSubmitting: boolean;
    successMessage: string | null;
    lastLoggedTimes: Record<string, Date>;
    recentlyLoggedActivities: TrackedActivity[];
    isRefreshing: boolean;
    hasInitiallyLoaded: boolean;
    loadingState: LoadingState;
    trackingDialog: TrackingDialogState;
    metricDialog: MetricDialogState;
}

// Hook result interfaces
export interface ActivityHooksResult {
    activityTypes: ActivityTypeClient[];
    activityPresets: ActivityPresetClient[];
    lastLoggedTimes: Record<string, Date>;
    fetchActivityTypes: () => Promise<void>;
    fetchActivityPresets: () => Promise<void>;
    refreshActivityTypes: () => Promise<void>;
    handleTrackActivity: (activityType: ActivityTypeClient, values: TrackedActivityValue[], notes?: string, timestamp?: Date) => Promise<void>;
    handleTrackPreset: (preset: ActivityPresetClient) => Promise<void>;
    updateLastLoggedTimes: (times: Record<string, Date>) => void;
}

export interface MetricsHooksResult {
    wellnessMetrics: WellnessMetricClient[];
    fetchWellnessMetrics: () => Promise<void>;
    handleTrackMetric: (metric: WellnessMetricClient, value: number | string, notes?: string) => Promise<void>;
}

export interface RecentActivitiesHooksResult {
    recentlyLoggedActivities: TrackedActivity[];
    fetchRecentActivities: () => Promise<void>;
    refreshRecentActivities: () => Promise<void>;
}

export interface DialogHooksResult {
    trackingDialog: TrackingDialogState;
    metricDialog: MetricDialogState;
    openTrackingDialog: (activityType: ActivityTypeClient) => void;
    openTrackingDialogWithPreset: (preset: ActivityPresetClient, activityType: ActivityTypeClient) => void;
    closeTrackingDialog: () => void;
    openMetricDialog: (metric: WellnessMetricClient) => void;
    closeMetricDialog: () => void;
}

export interface UseHomeDataResult extends HomeDataState {
    fetchActivityTypes: () => Promise<void>;
    fetchActivityPresets: () => Promise<void>;
    fetchWellnessMetrics: () => Promise<void>;
    fetchRecentActivities: () => Promise<void>;
    openTrackingDialog: (activityType: ActivityTypeClient) => void;
    openTrackingDialogWithPreset: (preset: ActivityPresetClient, activityType: ActivityTypeClient) => void;
    closeTrackingDialog: () => void;
    openMetricDialog: (metric: WellnessMetricClient) => void;
    closeMetricDialog: () => void;
    handleTrackActivity: (activityType: ActivityTypeClient, values: TrackedActivityValue[], notes?: string, timestamp?: Date) => Promise<void>;
    handleTrackPreset: (preset: ActivityPresetClient) => Promise<void>;
    handleTrackMetric: (metric: WellnessMetricClient, value: number | string, notes?: string) => Promise<void>;
    clearSuccessMessage: () => void;
} 