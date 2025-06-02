import {
    createTrackedActivity,
    getTrackedActivityWithTypeById
} from '@/server/database/collections/trackedActivities';
import {
    ExternalTrackActivityPayload,
    ExternalTrackActivityResponse,
    TrackedActivity,
    TrackedActivityValue
} from '../types';
import { ObjectId } from 'mongodb';
import { ServerError } from '@/server/utils/serverError';
import { getActivityTypeById } from '@/server/database/collections/activityTypes';

// Helper function to convert database result to API response format
const convertToApiFormat = (dbActivity: {
    _id: ObjectId;
    userId: ObjectId;
    activityTypeId: ObjectId;
    activityName: string;
    timestamp: Date;
    values: TrackedActivityValue[];
    notes?: string;
    createdAt: Date;
    updatedAt: Date;
    activityType?: {
        icon?: string;
        color?: string;
        type?: string;
    };
}): TrackedActivity => {
    return {
        _id: dbActivity._id.toString(),
        userId: dbActivity.userId.toString(),
        activityTypeId: dbActivity.activityTypeId.toString(),
        activityName: dbActivity.activityName,
        timestamp: dbActivity.timestamp,
        values: dbActivity.values,
        notes: dbActivity.notes,
        createdAt: dbActivity.createdAt,
        updatedAt: dbActivity.updatedAt,
        activityType: dbActivity.activityType
    };
};

export const process = async (
    payload: ExternalTrackActivityPayload & { userId: string; activityTypeId: string }
): Promise<ExternalTrackActivityResponse> => {
    try {
        const { userId, activityTypeId, timestamp, values, notes } = payload;

        if (!userId || !activityTypeId || !values) {
            throw new ServerError(400, 'Missing required fields: userId, activityTypeId, and values are required.');
        }

        // Validate that the activity type exists and belongs to the user
        const activityType = await getActivityTypeById(new ObjectId(activityTypeId));
        if (!activityType) {
            throw new ServerError(404, 'Activity type not found.');
        }

        if (activityType.userId.toString() !== userId && !activityType.isPredefined) {
            throw new ServerError(403, 'Activity type not accessible by this user.');
        }

        // Create the tracked activity
        const activityId = await createTrackedActivity({
            userId: new ObjectId(userId),
            activityTypeId: new ObjectId(activityTypeId),
            activityName: activityType.name,
            timestamp: timestamp || new Date(),
            values,
            notes,
        });

        // Get the created activity with populated ActivityType data
        const result = await getTrackedActivityWithTypeById(activityId, new ObjectId(userId));
        if (!result) {
            throw new ServerError(500, 'Failed to retrieve created activity with type information.');
        }

        return {
            success: true,
            trackedActivity: convertToApiFormat(result)
        };
    } catch (error) {
        console.error('Error in external track activity process:', error);
        if (error instanceof ServerError) {
            throw error;
        }
        throw new ServerError(500, `Failed to track activity: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}; 