import { Collection, ObjectId } from 'mongodb';
import { getDb } from '@/server/database';
import { TrackedActivityDBSchema, TRACKED_ACTIVITY_COLLECTION_NAME } from './types';

// Interface for aggregation result with populated ActivityType
interface TrackedActivityWithType extends TrackedActivityDBSchema {
    activityType?: {
        icon?: string;
        color?: string;
        type?: string;
    };
}

// Private async function to get collection reference - MANDATORY PATTERN
const getTrackedActivitiesCollection = async (): Promise<Collection<TrackedActivityDBSchema>> => {
    const db = await getDb();
    return db.collection<TrackedActivityDBSchema>(TRACKED_ACTIVITY_COLLECTION_NAME);
};

// Create a new tracked activity
export const createTrackedActivity = async (
    activityData: Omit<TrackedActivityDBSchema, '_id' | 'createdAt' | 'updatedAt'>
): Promise<ObjectId> => {
    const collection = await getTrackedActivitiesCollection();
    const now = new Date();
    const result = await collection.insertOne({
        ...activityData,
        createdAt: now,
        updatedAt: now,
    } as TrackedActivityDBSchema);
    return result.insertedId;
};

// Get tracked activities with populated ActivityType data
export const getTrackedActivitiesWithType = async (
    userId: ObjectId,
    options: {
        limit?: number;
        offset?: number;
        startDate?: Date;
        endDate?: Date;
    } = {}
): Promise<{ activities: TrackedActivityWithType[]; total: number }> => {
    const collection = await getTrackedActivitiesCollection();
    const { limit = 20, offset = 0, startDate, endDate } = options;

    const query: Record<string, unknown> = { userId };
    if (startDate || endDate) {
        query.timestamp = {};
        if (startDate) (query.timestamp as Record<string, Date>).$gte = startDate;
        if (endDate) (query.timestamp as Record<string, Date>).$lte = endDate;
    }

    const aggregationPipeline = [
        { $match: query },
        { $sort: { timestamp: -1 as const } },
        { $skip: offset },
        { $limit: limit },
        {
            $lookup: {
                from: 'activityTypes',
                localField: 'activityTypeId',
                foreignField: '_id',
                as: 'activityTypeInfo'
            }
        },
        {
            $addFields: {
                activityType: {
                    $let: {
                        vars: { activityTypeInfo: { $arrayElemAt: ['$activityTypeInfo', 0] } },
                        in: {
                            icon: '$$activityTypeInfo.icon',
                            color: '$$activityTypeInfo.color',
                            type: '$$activityTypeInfo.type'
                        }
                    }
                }
            }
        },
        {
            $project: {
                activityTypeInfo: 0
            }
        }
    ];

    const activities = await collection.aggregate<TrackedActivityWithType>(aggregationPipeline).toArray();

    const total = await collection.countDocuments(query);

    return { activities, total };
};

// Get a single tracked activity with populated ActivityType data
export const getTrackedActivityWithTypeById = async (
    activityId: ObjectId,
    userId: ObjectId
): Promise<TrackedActivityWithType | null> => {
    const collection = await getTrackedActivitiesCollection();

    const aggregationPipeline = [
        {
            $match: {
                _id: activityId,
                userId: userId
            }
        },
        {
            $lookup: {
                from: 'activityTypes',
                localField: 'activityTypeId',
                foreignField: '_id',
                as: 'activityTypeInfo'
            }
        },
        {
            $addFields: {
                activityType: {
                    $let: {
                        vars: { activityTypeInfo: { $arrayElemAt: ['$activityTypeInfo', 0] } },
                        in: {
                            icon: '$$activityTypeInfo.icon',
                            color: '$$activityTypeInfo.color',
                            type: '$$activityTypeInfo.type'
                        }
                    }
                }
            }
        },
        {
            $project: {
                activityTypeInfo: 0
            }
        }
    ];

    const result = await collection.aggregate<TrackedActivityWithType>(aggregationPipeline).toArray();
    return result.length > 0 ? result[0] : null;
};

// Update a tracked activity
export const updateTrackedActivity = async (
    activityId: ObjectId,
    userId: ObjectId,
    updates: Partial<Omit<TrackedActivityDBSchema, '_id' | 'userId' | 'createdAt' | 'updatedAt'>>
): Promise<boolean> => {
    const collection = await getTrackedActivitiesCollection();
    const result = await collection.updateOne(
        { _id: activityId, userId },
        {
            $set: {
                ...updates,
                updatedAt: new Date()
            }
        }
    );
    return result.modifiedCount > 0;
};

// Delete a tracked activity
export const deleteTrackedActivity = async (
    activityId: ObjectId,
    userId: ObjectId
): Promise<boolean> => {
    const collection = await getTrackedActivitiesCollection();
    const result = await collection.deleteOne({ _id: activityId, userId });
    return result.deletedCount > 0;
};

// Check if tracked activity exists and belongs to user
export const trackedActivityExists = async (
    activityId: ObjectId,
    userId: ObjectId
): Promise<boolean> => {
    const collection = await getTrackedActivitiesCollection();
    const count = await collection.countDocuments({ _id: activityId, userId });
    return count > 0;
};

// Get tracked activity for duplication (without ActivityType data)
export const getTrackedActivityForDuplication = async (
    activityId: ObjectId,
    userId: ObjectId
): Promise<TrackedActivityDBSchema | null> => {
    const collection = await getTrackedActivitiesCollection();
    return await collection.findOne({ _id: activityId, userId });
}; 