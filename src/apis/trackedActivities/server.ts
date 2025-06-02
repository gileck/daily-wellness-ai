import { ApiHandlerContext } from '@/server/types';
import {
    createTrackedActivity,
    getTrackedActivitiesWithType,
    getTrackedActivityWithTypeById,
    updateTrackedActivity as updateTrackedActivityInDb,
    deleteTrackedActivity as deleteTrackedActivityInDb,
    trackedActivityExists,
    getTrackedActivityForDuplication
} from '@/server/database/collections/trackedActivities';
import {
    CreateTrackedActivityPayload,
    CreateTrackedActivityResponse,
    GetTrackedActivitiesParams,
    GetTrackedActivitiesResponse,
    TrackedActivity,
    TrackedActivityValue,
    UpdateTrackedActivityPayload,
    UpdateTrackedActivityResponse,
    DeleteTrackedActivityPayload,
    DeleteTrackedActivityResponse,
    DuplicateTrackedActivityPayload,
    DuplicateTrackedActivityResponse
} from './types';
import { API_CREATE_TRACKED_ACTIVITY, API_GET_TRACKED_ACTIVITIES, API_UPDATE_TRACKED_ACTIVITY, API_DELETE_TRACKED_ACTIVITY, API_DUPLICATE_TRACKED_ACTIVITY } from './index';
import { ObjectId } from 'mongodb';
import { ServerError } from '@/server/utils/serverError';

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

const createTrackedActivityProcess = async (
    payload: CreateTrackedActivityPayload,
    context: ApiHandlerContext
): Promise<CreateTrackedActivityResponse> => {
    try {
        const { userId } = context.state.user;
        const { activityTypeId, activityName, timestamp, values, notes } = payload;

        if (!activityTypeId || !activityName || !timestamp || !values) {
            throw new ServerError(400, 'Missing required fields for tracking activity.');
        }

        // Create the activity using database layer
        const activityId = await createTrackedActivity({
            userId: new ObjectId(userId),
            activityTypeId: new ObjectId(activityTypeId),
            activityName,
            timestamp: new Date(timestamp),
            values,
            notes,
        });

        // Get the created activity with populated ActivityType data
        const result = await getTrackedActivityWithTypeById(activityId, new ObjectId(userId));
        if (!result) {
            throw new ServerError(500, 'Failed to retrieve created activity with type information.');
        }

        return { trackedActivity: convertToApiFormat(result) };
    } catch (error) {
        console.error('Error in createTrackedActivityProcess:', error);
        if (error instanceof ServerError) {
            throw error;
        }
        throw new ServerError(500, `Failed to create tracked activity: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
};

const getTrackedActivitiesProcess = async (
    params: GetTrackedActivitiesParams,
    context: ApiHandlerContext
): Promise<GetTrackedActivitiesResponse> => {
    try {
        const { userId } = context.state.user;
        const { limit = 20, offset = 0, startDate, endDate } = params;

        const options = {
            limit: Number(limit),
            offset: Number(offset),
            startDate: startDate ? new Date(startDate) : undefined,
            endDate: endDate ? new Date(endDate) : undefined,
        };

        const { activities, total } = await getTrackedActivitiesWithType(new ObjectId(userId), options);

        const trackedActivities: TrackedActivity[] = activities.map(convertToApiFormat);

        return { trackedActivities, total };
    } catch (error) {
        console.error('Error fetching tracked activities:', error);
        if (error instanceof ServerError) {
            throw error;
        }
        throw new ServerError(500, 'Internal server error while fetching activities.');
    }
};

const updateTrackedActivityProcess = async (
    payload: UpdateTrackedActivityPayload,
    context: ApiHandlerContext
): Promise<UpdateTrackedActivityResponse> => {
    try {
        const { userId } = context.state.user;
        const { activityId, updates } = payload;

        if (!activityId) {
            throw new ServerError(400, 'Activity ID is required.');
        }

        const activityObjectId = new ObjectId(activityId);
        const userObjectId = new ObjectId(userId);

        // Verify the activity belongs to the user
        const exists = await trackedActivityExists(activityObjectId, userObjectId);
        if (!exists) {
            throw new ServerError(404, 'Tracked activity not found or you do not have permission.');
        }

        // Update the activity
        const updateSuccess = await updateTrackedActivityInDb(activityObjectId, userObjectId, updates);
        if (!updateSuccess) {
            throw new ServerError(500, 'Failed to update the activity.');
        }

        // Get the updated activity with populated ActivityType data
        const trackedActivity = await getTrackedActivityWithTypeById(activityObjectId, userObjectId);
        if (!trackedActivity) {
            throw new ServerError(404, 'Failed to retrieve updated activity.');
        }

        return { trackedActivity: convertToApiFormat(trackedActivity) };
    } catch (error) {
        console.error('Error updating tracked activity:', error);
        if (error instanceof ServerError) {
            throw error;
        }
        throw new ServerError(500, 'Internal server error while updating activity.');
    }
};

const deleteTrackedActivityProcess = async (
    payload: DeleteTrackedActivityPayload,
    context: ApiHandlerContext
): Promise<DeleteTrackedActivityResponse> => {
    try {
        const { userId } = context.state.user;
        const { activityId } = payload;

        if (!activityId) {
            throw new ServerError(400, 'Activity ID is required.');
        }

        const activityObjectId = new ObjectId(activityId);
        const userObjectId = new ObjectId(userId);

        // Verify the activity belongs to the user
        const exists = await trackedActivityExists(activityObjectId, userObjectId);
        if (!exists) {
            throw new ServerError(404, 'Tracked activity not found or you do not have permission.');
        }

        // Delete the activity
        const deleteSuccess = await deleteTrackedActivityInDb(activityObjectId, userObjectId);
        if (!deleteSuccess) {
            throw new ServerError(500, 'Failed to delete the activity.');
        }

        return { success: true };
    } catch (error) {
        console.error('Error deleting tracked activity:', error);
        if (error instanceof ServerError) {
            throw error;
        }
        throw new ServerError(500, 'Internal server error while deleting activity.');
    }
};

const duplicateTrackedActivityProcess = async (
    payload: DuplicateTrackedActivityPayload,
    context: ApiHandlerContext
): Promise<DuplicateTrackedActivityResponse> => {
    try {
        const { userId } = context.state.user;
        const { activityId, timestamp = new Date() } = payload;

        if (!activityId) {
            throw new ServerError(400, 'Activity ID is required.');
        }

        const activityObjectId = new ObjectId(activityId);
        const userObjectId = new ObjectId(userId);

        // Find the activity to duplicate
        const existingActivity = await getTrackedActivityForDuplication(activityObjectId, userObjectId);
        if (!existingActivity) {
            throw new ServerError(404, 'Tracked activity not found or you do not have permission.');
        }

        // Create a duplicate with a new timestamp
        const newActivityId = await createTrackedActivity({
            userId: existingActivity.userId,
            activityTypeId: existingActivity.activityTypeId,
            activityName: existingActivity.activityName,
            timestamp: timestamp,
            values: existingActivity.values,
            notes: existingActivity.notes
        });

        // Get the duplicated activity with populated ActivityType data
        const trackedActivity = await getTrackedActivityWithTypeById(newActivityId, userObjectId);
        if (!trackedActivity) {
            throw new ServerError(500, 'Failed to retrieve duplicated activity with type information.');
        }

        return { trackedActivity: convertToApiFormat(trackedActivity) };
    } catch (error) {
        console.error('Error duplicating tracked activity:', error);
        if (error instanceof ServerError) {
            throw error;
        }
        throw new ServerError(500, 'Internal server error while duplicating activity.');
    }
};

export const trackedActivitiesApiHandlers = {
    [API_CREATE_TRACKED_ACTIVITY]: { process: createTrackedActivityProcess },
    [API_GET_TRACKED_ACTIVITIES]: { process: getTrackedActivitiesProcess },
    [API_UPDATE_TRACKED_ACTIVITY]: { process: updateTrackedActivityProcess },
    [API_DELETE_TRACKED_ACTIVITY]: { process: deleteTrackedActivityProcess },
    [API_DUPLICATE_TRACKED_ACTIVITY]: { process: duplicateTrackedActivityProcess }
}; 