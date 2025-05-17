import { Collection, ObjectId, Filter } from 'mongodb';
import { ActivityDBSchema, ACTIVITY_COLLECTION_NAME } from './types';
import { getDb } from '../../index'; // Import getDb

// Internal function to get collection reference
const getActivitiesCollection = async (): Promise<Collection<ActivityDBSchema>> => {
    const db = await getDb();
    return db.collection<ActivityDBSchema>(ACTIVITY_COLLECTION_NAME);
};

export const addActivity = async (activityData: Omit<ActivityDBSchema, '_id' | 'createdAt' | 'updatedAt'>) => {
    const collection = await getActivitiesCollection();
    const now = new Date();
    const result = await collection.insertOne({
        ...activityData,
        _id: new ObjectId(),
        createdAt: now,
        updatedAt: now,
    });
    return result.insertedId;
};

export const getActivityById = async (id: ObjectId) => {
    const collection = await getActivitiesCollection();
    return collection.findOne({ _id: id });
};

export const getActivitiesByUserId = async (userId: ObjectId, startDate?: Date, endDate?: Date) => {
    const collection = await getActivitiesCollection();
    const query: Filter<ActivityDBSchema> = { userId };
    if (startDate && endDate) {
        query.startTime = { $gte: startDate, $lte: endDate };
    }
    return collection.find(query).sort({ startTime: -1 }).toArray();
};

export const updateActivity = async (id: ObjectId, updates: Partial<Omit<ActivityDBSchema, '_id' | 'userId' | 'createdAt' | 'activityTypeId'>>) => {
    const collection = await getActivitiesCollection();
    const result = await collection.updateOne(
        { _id: id },
        { $set: { ...updates, updatedAt: new Date() } }
    );
    return result.modifiedCount > 0;
};

export const deleteActivity = async (id: ObjectId) => {
    const collection = await getActivitiesCollection();
    const result = await collection.deleteOne({ _id: id });
    return result.deletedCount > 0;
}; 