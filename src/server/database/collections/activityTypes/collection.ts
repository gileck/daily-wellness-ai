import { Collection, ObjectId } from 'mongodb';
import { ActivityTypeDBSchema, ACTIVITY_TYPE_COLLECTION_NAME } from './types';
import { getDb } from '../../index'; // Import getDb

// Internal function to get collection reference
const getActivityTypesCollection = async (): Promise<Collection<ActivityTypeDBSchema>> => {
    const db = await getDb();
    return db.collection<ActivityTypeDBSchema>(ACTIVITY_TYPE_COLLECTION_NAME);
};

// Example basic CRUD operations - extend as needed

export const addActivityType = async (activityTypeData: Omit<ActivityTypeDBSchema, '_id' | 'createdAt' | 'updatedAt'>) => {
    const collection = await getActivityTypesCollection();
    const now = new Date();
    const result = await collection.insertOne({
        ...activityTypeData,
        _id: new ObjectId(),
        createdAt: now,
        updatedAt: now,
    });
    return result.insertedId;
};

export const getActivityTypeById = async (id: ObjectId) => {
    const collection = await getActivityTypesCollection();
    return collection.findOne({ _id: id });
};

export const getActivityTypesByUserId = async (userId: ObjectId) => {
    const collection = await getActivityTypesCollection();
    return collection.find({ userId }).toArray();
};

export const updateActivityType = async (id: ObjectId, updates: Partial<Omit<ActivityTypeDBSchema, '_id' | 'userId' | 'createdAt'>>) => {
    const collection = await getActivityTypesCollection();
    const result = await collection.updateOne(
        { _id: id },
        { $set: { ...updates, updatedAt: new Date() } }
    );
    return result.modifiedCount > 0;
};

export const deleteActivityType = async (id: ObjectId) => {
    const collection = await getActivityTypesCollection();
    const result = await collection.deleteOne({ _id: id });
    return result.deletedCount > 0;
}; 