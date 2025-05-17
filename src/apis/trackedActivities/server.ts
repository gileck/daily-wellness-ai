import { ApiHandlerContext } from '@/server/types';
import { TrackedActivityCollection, TrackedActivityDBSchema } from '@/server/database/collections/trackedActivities';
import {
    CreateTrackedActivityPayload,
    CreateTrackedActivityResponse,
    GetTrackedActivitiesParams,
    GetTrackedActivitiesResponse,
    TrackedActivity
} from './types';
import { API_CREATE_TRACKED_ACTIVITY, API_GET_TRACKED_ACTIVITIES } from './index';
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

export const trackedActivitiesApiHandlers = {
    [API_CREATE_TRACKED_ACTIVITY]: { process: createTrackedActivityProcess },
    [API_GET_TRACKED_ACTIVITIES]: { process: getTrackedActivitiesProcess },
}; 