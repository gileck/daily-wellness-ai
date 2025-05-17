import mongoose, { Schema, Model } from 'mongoose';
import { TrackedActivityDBSchema, TRACKED_ACTIVITY_COLLECTION_NAME, TrackedActivityValue } from './types';

const TrackedActivityValueSchema = new Schema<TrackedActivityValue>(
    {
        fieldName: { type: String, required: true },
        value: { type: Schema.Types.Mixed, required: true },
    },
    { _id: false }
);

const TrackedActivitySchema = new Schema<TrackedActivityDBSchema>(
    {
        userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
        activityTypeId: { type: Schema.Types.ObjectId, ref: 'ActivityType', required: true, index: true },
        activityName: { type: String, required: true },
        timestamp: { type: Date, required: true, default: Date.now, index: true },
        values: [TrackedActivityValueSchema],
        notes: { type: String },
    },
    {
        timestamps: true, // Handles createdAt and updatedAt automatically
        collection: TRACKED_ACTIVITY_COLLECTION_NAME,
    }
);

TrackedActivitySchema.index({ userId: 1, timestamp: -1 });

// Ensure the model is not recompiled if it already exists
export const TrackedActivityCollection: Model<TrackedActivityDBSchema> =
    mongoose.models[TRACKED_ACTIVITY_COLLECTION_NAME] ||
    mongoose.model<TrackedActivityDBSchema>(TRACKED_ACTIVITY_COLLECTION_NAME, TrackedActivitySchema); 