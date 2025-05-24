import { TrackedActivity as DBTrackedActivity, TrackedActivityValue as DBTrackedActivityValue } from '@/server/database/collections/trackedActivities/types';

export interface TrackedActivity extends DBTrackedActivity {
    activityType?: {
        icon?: string;
        color?: string;
        type?: string;
    };
}
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

// Update tracked activity interfaces
export interface UpdateTrackedActivityPayload {
    activityId: string;
    updates: {
        activityName?: string;
        timestamp?: Date;
        values?: TrackedActivityValue[];
        notes?: string;
    };
}

export interface UpdateTrackedActivityResponse {
    trackedActivity: TrackedActivity;
}

// Delete tracked activity interfaces
export interface DeleteTrackedActivityPayload {
    activityId: string;
}

export interface DeleteTrackedActivityResponse {
    success: boolean;
}

// Duplicate tracked activity interfaces
export interface DuplicateTrackedActivityPayload {
    activityId: string;
    timestamp?: Date; // Optional new timestamp (defaults to current time)
}

export interface DuplicateTrackedActivityResponse {
    trackedActivity: TrackedActivity;
} 