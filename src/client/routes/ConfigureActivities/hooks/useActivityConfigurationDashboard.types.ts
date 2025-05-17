import { PredefinedData, PredefinedActivityTypeJSON, PredefinedWellnessMetricJSON } from '@/apis/predefinedData/types';
import { ActivityTypeClient, CreateActivityTypePayload, UpdateActivityTypePayload } from '@/apis/activity/types';
import { WellnessMetricClient, CreateWellnessMetricPayload } from '@/apis/wellnessMetrics/types';

export interface ActivityConfigurationDashboardState {
    predefinedData: PredefinedData | null;
    userActivityTypes: ActivityTypeClient[];
    userWellnessMetrics: WellnessMetricClient[];
    isLoading: boolean;
    error: string | null;
    isSubmitting: Record<string, boolean>;
    openAddActivityDialog: boolean;
    editingActivityType: ActivityTypeClient | null;
    openAddMetricDialog: boolean;
    editingWellnessMetric: WellnessMetricClient | null;
}

export interface ActivityConfigurationDashboardActions {
    fetchData: () => Promise<void>;
    handleTogglePredefined: (item: PredefinedActivityTypeJSON | PredefinedWellnessMetricJSON, type: 'activityType' | 'wellnessMetric') => Promise<void>;
    handleSaveActivityType: (payload: CreateActivityTypePayload | { updates: UpdateActivityTypePayload, activityTypeId: string }) => Promise<void>;
    handleSaveWellnessMetric: (payload: CreateWellnessMetricPayload | { metricId: string, updates: Partial<Omit<WellnessMetricClient, '_id' | 'userId' | 'isPredefined' | 'predefinedId'>> }) => Promise<void>;
    handleDeleteActivityType: (activityTypeId: string) => Promise<void>;
    handleDeleteWellnessMetric: (metricId: string) => Promise<void>;
    handleOpenAddActivityDialog: (activityTypeToEdit?: ActivityTypeClient) => void;
    handleCloseAddActivityDialog: () => void;
    handleOpenAddMetricDialog: (metricToEdit?: WellnessMetricClient) => void;
    handleCloseAddMetricDialog: () => void;
    isItemAddedAndEnabled: (item: PredefinedActivityTypeJSON | PredefinedWellnessMetricJSON, type: 'activityType' | 'wellnessMetric') => boolean;
}

export interface UseActivityConfigurationDashboardResult extends ActivityConfigurationDashboardState, ActivityConfigurationDashboardActions { } 