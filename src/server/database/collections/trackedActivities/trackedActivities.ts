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

    // Debug: Check collection info
    console.log('Collection name:', collection.collectionName);
    const totalDocs = await collection.countDocuments({});
    console.log(`Total documents in ${collection.collectionName}:`, totalDocs);

    // Debug: Check what collections exist in the database
    const db = await getDb();
    const collections = await db.listCollections().toArray();
    console.log('Available collections:', collections.map(c => c.name));

    // Build query
    const query: Record<string, unknown> = { userId };
    if (startDate || endDate) {
        query.timestamp = {};
        if (startDate) (query.timestamp as Record<string, Date>).$gte = startDate;
        if (endDate) (query.timestamp as Record<string, Date>).$lte = endDate;
    }

    console.log('Query:', query);
    console.log('User ID type:', typeof userId, userId);

    // Debug: Check documents matching user
    const userDocs = await collection.countDocuments({ userId });
    console.log(`Documents for user ${userId}:`, userDocs);

    // Aggregation pipeline to populate ActivityType data
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

    console.log('Executing aggregation pipeline for TrackedActivities with ActivityType lookup...');
    const activities = await collection.aggregate<TrackedActivityWithType>(aggregationPipeline).toArray();
    console.log(`Found ${activities.length} activities with populated ActivityType data`);

    // Log the first activity to debug ActivityType population
    if (activities.length > 0) {
        const firstActivity = activities[0];
        console.log(`First activity: ${firstActivity.activityName}, ActivityType:`, firstActivity.activityType);
    }

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