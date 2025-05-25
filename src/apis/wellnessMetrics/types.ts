import { wellnessMetrics } from '../../server/database/collections';

// Client-facing DTO for WellnessMetric
export interface WellnessMetricClient {
    _id: string;
    userId: string;
    name: string;
    isPredefined: boolean;
    predefinedId?: string;
    enabled: boolean;
    color?: string; // Hex color value for the metric
    icon?: string; // Material UI icon name
    createdAt: string; // ISO date string
    updatedAt: string; // ISO date string
}

// Create
export interface CreateWellnessMetricPayload {
    name: string;
    isPredefined: boolean;
    predefinedId?: string;
    enabled?: boolean; // Defaults to true on server if not provided
    color?: string; // Hex color value for the metric
    icon?: string; // Material UI icon name
}
export type CreateWellnessMetricResponse = { wellnessMetricId: string };

// Get All by User
export type GetWellnessMetricsResponse = { wellnessMetrics: WellnessMetricClient[] };

// Get By ID
export interface GetWellnessMetricByIdPayload {
    metricId: string;
}
export type GetWellnessMetricByIdResponse = { wellnessMetric: WellnessMetricClient | null };

// Update
export interface UpdateWellnessMetricPayload {
    metricId: string;
    updates: Partial<Omit<wellnessMetrics.WellnessMetric, '_id' | 'userId' | 'createdAt' | 'updatedAt'>
    >;
}
export type UpdateWellnessMetricResponse = { success: boolean };

// Delete
export interface DeleteWellnessMetricPayload {
    metricId: string;
}
export type DeleteWellnessMetricResponse = { success: boolean };

// Track Wellness Metric Value
export interface TrackWellnessMetricPayload {
    metricId: string;
    value: number | string;
    notes?: string;
    timestamp?: Date;
}
export type TrackWellnessMetricResponse = { success: boolean };

// Get Wellness Metric Records
export interface GetWellnessMetricRecordsPayload {
    metricId?: string;
    startDate?: string;
    endDate?: string;
    limit?: number;
}

export interface WellnessMetricRecord {
    _id: string;
    userId: string;
    metricId: string;
    metricName: string;
    value: number | string;
    notes?: string;
    timestamp: Date;
    createdAt: Date;
}

export type GetWellnessMetricRecordsResponse = { records: WellnessMetricRecord[] };

// Update Wellness Metric Record
export interface UpdateWellnessMetricRecordPayload {
    recordId: string;
    updates: {
        value?: number | string;
        notes?: string;
        timestamp?: Date;
    };
}
export type UpdateWellnessMetricRecordResponse = { success: boolean };

// Delete Wellness Metric Record
export interface DeleteWellnessMetricRecordPayload {
    recordId: string;
}
export type DeleteWellnessMetricRecordResponse = { success: boolean }; 