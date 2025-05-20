import { ApiHandlerContext } from '@/server/types';
import { TrackedActivityCollection, TrackedActivityDBSchema } from '@/server/database/collections/trackedActivities';
import {
    CreateTrackedActivityPayload,
    CreateTrackedActivityResponse,
    GetTrackedActivitiesParams,
    GetTrackedActivitiesResponse,
    TrackedActivity,
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
import mongoose from 'mongoose';

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

        // Ensure MongoDB connection is established
        if (mongoose.connection.readyState !== 1) {
            console.error('MongoDB connection not ready. Current state:', mongoose.connection.readyState);
            throw new ServerError(500, 'Database connection is not established.');
        }

        const newTrackedActivity = await TrackedActivityCollection.create({
            userId: new ObjectId(userId),
            activityTypeId: new ObjectId(activityTypeId),
            activityName,
            timestamp: new Date(timestamp),
            values,
            notes,
        });

        const result: TrackedActivity = {
            ...newTrackedActivity.toObject(),
            _id: newTrackedActivity._id.toString(),
            userId: newTrackedActivity.userId.toString(),
            activityTypeId: newTrackedActivity.activityTypeId.toString(),
            createdAt: newTrackedActivity.createdAt,
            updatedAt: newTrackedActivity.updatedAt,
        };
        return { trackedActivity: result };
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

        // Ensure MongoDB connection is established
        if (mongoose.connection.readyState !== 1) {
            console.error('MongoDB connection not ready. Current state:', mongoose.connection.readyState);
            throw new ServerError(500, 'Database connection is not established.');
        }

        const query: Record<string, unknown> = { userId: new ObjectId(userId) };
        if (startDate || endDate) {
            query.timestamp = {};
            if (startDate) (query.timestamp as Record<string, Date>).$gte = new Date(startDate);
            if (endDate) (query.timestamp as Record<string, Date>).$lte = new Date(endDate);
        }

        const trackedActivitiesDocs = await TrackedActivityCollection.find(query)
            .sort({ timestamp: -1 })
            .skip(Number(offset))
            .limit(Number(limit))
            .lean<TrackedActivityDBSchema[]>();

        const total = await TrackedActivityCollection.countDocuments(query);

        const trackedActivities: TrackedActivity[] = trackedActivitiesDocs.map((doc: TrackedActivityDBSchema) => ({
            ...doc,
            _id: doc._id.toString(),
            userId: doc.userId.toString(),
            activityTypeId: doc.activityTypeId.toString(),
            timestamp: doc.timestamp,
            values: doc.values,
            activityName: doc.activityName,
            notes: doc.notes,
            createdAt: doc.createdAt,
            updatedAt: doc.updatedAt,
        }));

        return { trackedActivities, total };
    } catch (error) {
        console.error('Error in getTrackedActivitiesProcess:', error);
        if (error instanceof ServerError) {
            throw error;
        }
        throw new ServerError(500, `Failed to get tracked activities: ${error instanceof Error ? error.message : 'Unknown error'}`);
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

        // Ensure MongoDB connection is established
        if (mongoose.connection.readyState !== 1) {
            console.error('MongoDB connection not ready. Current state:', mongoose.connection.readyState);
            throw new ServerError(500, 'Database connection is not established.');
        }

        // Verify the activity belongs to the user
        const existingActivity = await TrackedActivityCollection.findOne({
            _id: new ObjectId(activityId),
            userId: new ObjectId(userId)
        });

        if (!existingActivity) {
            throw new ServerError(404, 'Tracked activity not found or you do not have permission.');
        }

        // Update the activity
        const updatedActivity = await TrackedActivityCollection.findOneAndUpdate(
            { _id: new ObjectId(activityId) },
            { $set: updates },
            { new: true }
        ).lean<TrackedActivityDBSchema>();

        if (!updatedActivity) {
            throw new ServerError(404, 'Failed to update the activity.');
        }

        // Convert ObjectIds to strings for client response
        const trackedActivity: TrackedActivity = {
            ...updatedActivity,
            _id: updatedActivity._id.toString(),
            userId: updatedActivity.userId.toString(),
            activityTypeId: updatedActivity.activityTypeId.toString(),
            timestamp: updatedActivity.timestamp,
            values: updatedActivity.values,
            activityName: updatedActivity.activityName,
            notes: updatedActivity.notes,
            createdAt: updatedActivity.createdAt,
            updatedAt: updatedActivity.updatedAt,
        };

        return { trackedActivity };
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

        // Ensure MongoDB connection is established
        if (mongoose.connection.readyState !== 1) {
            console.error('MongoDB connection not ready. Current state:', mongoose.connection.readyState);
            throw new ServerError(500, 'Database connection is not established.');
        }

        // Verify the activity belongs to the user
        const existingActivity = await TrackedActivityCollection.findOne({
            _id: new ObjectId(activityId),
            userId: new ObjectId(userId)
        });

        if (!existingActivity) {
            throw new ServerError(404, 'Tracked activity not found or you do not have permission.');
        }

        // Delete the activity
        const result = await TrackedActivityCollection.deleteOne({
            _id: new ObjectId(activityId),
            userId: new ObjectId(userId)
        });

        if (result.deletedCount !== 1) {
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

        // Ensure MongoDB connection is established
        if (mongoose.connection.readyState !== 1) {
            console.error('MongoDB connection not ready. Current state:', mongoose.connection.readyState);
            throw new ServerError(500, 'Database connection is not established.');
        }

        // Find the activity to duplicate
        const existingActivity = await TrackedActivityCollection.findOne({
            _id: new ObjectId(activityId),
            userId: new ObjectId(userId)
        }).lean<TrackedActivityDBSchema>();

        if (!existingActivity) {
            throw new ServerError(404, 'Tracked activity not found or you do not have permission.');
        }

        // Create a duplicate with a new timestamp
        const newTrackedActivity = await TrackedActivityCollection.create({
            userId: existingActivity.userId,
            activityTypeId: existingActivity.activityTypeId,
            activityName: existingActivity.activityName,
            timestamp: timestamp,
            values: existingActivity.values,
            notes: existingActivity.notes
        });

        // Convert ObjectIds to strings for client response
        const trackedActivity: TrackedActivity = {
            ...newTrackedActivity.toObject(),
            _id: newTrackedActivity._id.toString(),
            userId: newTrackedActivity.userId.toString(),
            activityTypeId: newTrackedActivity.activityTypeId.toString(),
            timestamp: newTrackedActivity.timestamp,
            values: newTrackedActivity.values,
            activityName: newTrackedActivity.activityName,
            notes: newTrackedActivity.notes,
            createdAt: newTrackedActivity.createdAt,
            updatedAt: newTrackedActivity.updatedAt,
        };

        return { trackedActivity };
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
    [API_DUPLICATE_TRACKED_ACTIVITY]: { process: duplicateTrackedActivityProcess },
}; 