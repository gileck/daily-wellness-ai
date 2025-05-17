import { ActivityTypeField } from '../../server/database/collections/activityTypes/types'; // Reusing existing field type

export interface PredefinedFieldJSON extends ActivityTypeField {
    // Add any specific properties for predefined fields if needed in future, e.g., min/max for numbers, default value
    min?: number;
    max?: number;
    defaultValue?: string | number | boolean;
}

export interface PredefinedActivityTypeJSON {
    id: string; // A unique ID for the predefined type (e.g., 'sleep', 'running_workout')
    name: string; // User-friendly display name
    type: string; // Internal category type (e.g., 'sleep', 'workout', 'meal')
    description?: string;
    fields: PredefinedFieldJSON[];
    isPredefined: true; // Always true for these
    defaultEnabled: boolean; // Suggested initial enabled state for new users
}

export interface PredefinedWellnessMetricJSON {
    id: string; // A unique ID for the predefined metric (e.g., 'energy_level', 'mood')
    name: string;
    isPredefined: true; // Always true for these
    defaultEnabled: boolean; // Suggested initial enabled state for new users
    // Metrics might have a predefined value type or range in the future (e.g., 1-5 scale for mood)
    // valueType?: 'number' | 'text';
    // valueOptions?: (string | number)[]; // For discrete options
    // min?: number;
    // max?: number;
}

export interface PredefinedData {
    predefinedActivityTypes: PredefinedActivityTypeJSON[];
    predefinedWellnessMetrics: PredefinedWellnessMetricJSON[];
}

// API Response type
export type GetPredefinedDataResponse = PredefinedData; 