import { TrackedActivity as DBTrackedActivity, TrackedActivityValue as DBTrackedActivityValue } from '@/server/database/collections/trackedActivities/types';

export type TrackedActivity = DBTrackedActivity;
export type TrackedActivityValue = DBTrackedActivityValue;

export const API_TRACKED_ACTIVITIES = 'trackedActivities';

// Payload for creating a new tracked activity
export interface CreateTrackedActivityPayload {
    activityTypeId: string;
    activityName: string; // Denormalized name of the activity type
    timestamp: Date;
    values: TrackedActivityValue[];
    notes?: string;
}

export interface CreateTrackedActivityResponse {
    trackedActivity: TrackedActivity;
}

// Params for fetching tracked activities (e.g., for history page)
export interface GetTrackedActivitiesParams {
    limit?: number;
    offset?: number;
    startDate?: string; // ISO date string
    endDate?: string;   // ISO date string
}

export interface GetTrackedActivitiesResponse {
    trackedActivities: TrackedActivity[];
    total: number;
} 