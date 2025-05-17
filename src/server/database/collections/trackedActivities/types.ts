import { ObjectId } from 'mongodb';

// Represents the actual values logged by the user for the fields of an ActivityType
export interface TrackedActivityValue {
    fieldName: string;
    value: unknown; // Changed from any to unknown
}

// Document structure for a single tracked activity instance in the database
export interface TrackedActivityDBSchema {
    _id: ObjectId;
    userId: ObjectId;
    activityTypeId: ObjectId; // Reference to the ActivityType being tracked
    activityName: string; // Denormalized for easier display, from ActivityType.name
    timestamp: Date; // When the activity occurred or was logged
    values: TrackedActivityValue[]; // The actual data points for this activity instance
    notes?: string; // Optional user notes for this specific instance
    createdAt: Date;
    updatedAt: Date;
}

export const TRACKED_ACTIVITY_COLLECTION_NAME = 'trackedActivities';

// Interface for client-side representation, if needed (might be same as DB schema or slightly different)
// For now, let's assume it's similar to the DB schema for API responses.
export interface TrackedActivity extends Omit<TrackedActivityDBSchema, '_id' | 'userId' | 'activityTypeId'> {
    _id: string; // Usually converted to string for client
    userId: string;
    activityTypeId: string;
} 