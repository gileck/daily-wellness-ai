import { ObjectId } from 'mongodb';

export interface Activity {
    _id: ObjectId;
    userId: ObjectId;
    activityTypeId: ObjectId; // Reference to ActivityTypes collection
    startTime: Date;
    // Store type-specific fields in a flexible way.
    // Example: { duration: 60, quality: 'good', intensity: 'high', calories: 300 }
    fields: Record<string, string | number | boolean | Date | null>;
    createdAt: Date;
    updatedAt: Date;
}

export interface ActivityDBSchema {
    _id: ObjectId;
    userId: ObjectId;
    activityTypeId: ObjectId;
    startTime: Date;
    fields: Record<string, string | number | boolean | Date | null>;
    createdAt: Date;
    updatedAt: Date;
}

export const ACTIVITY_COLLECTION_NAME = 'activities'; 