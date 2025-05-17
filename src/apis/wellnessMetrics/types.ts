import { wellnessMetrics } from '../../server/database/collections';

// Client-facing DTO for WellnessMetric
export interface WellnessMetricClient {
    _id: string;
    userId: string;
    name: string;
    isPredefined: boolean;
    predefinedId?: string;
    enabled: boolean;
    createdAt: string; // ISO date string
    updatedAt: string; // ISO date string
}

// Create
export interface CreateWellnessMetricPayload {
    name: string;
    isPredefined: boolean;
    predefinedId?: string;
    enabled?: boolean; // Defaults to true on server if not provided
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