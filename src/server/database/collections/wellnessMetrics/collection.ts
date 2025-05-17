import { Collection, ObjectId } from 'mongodb';
import { WellnessMetricDBSchema, WELLNESS_METRIC_COLLECTION_NAME } from './types';
import { getDb } from '../../index'; // Import getDb

// Internal function to get collection reference
const getWellnessMetricsCollection = async (): Promise<Collection<WellnessMetricDBSchema>> => {
    const db = await getDb();
    return db.collection<WellnessMetricDBSchema>(WELLNESS_METRIC_COLLECTION_NAME);
};

export const addWellnessMetric = async (metricData: Omit<WellnessMetricDBSchema, '_id' | 'createdAt' | 'updatedAt'>) => {
    const collection = await getWellnessMetricsCollection();
    const now = new Date();
    const result = await collection.insertOne({
        ...metricData,
        _id: new ObjectId(),
        createdAt: now,
        updatedAt: now,
    });
    return result.insertedId;
};

export const getWellnessMetricById = async (id: ObjectId) => {
    const collection = await getWellnessMetricsCollection();
    return collection.findOne({ _id: id });
};

export const getWellnessMetricsByUserId = async (userId: ObjectId) => {
    const collection = await getWellnessMetricsCollection();
    return collection.find({ userId }).toArray();
};

// Find by user and predefinedId to check if a predefined metric has already been added for this user
export const getWellnessMetricByPredefinedId = async (userId: ObjectId, predefinedId: string) => {
    const collection = await getWellnessMetricsCollection();
    return collection.findOne({ userId, predefinedId });
};

export const updateWellnessMetric = async (id: ObjectId, updates: Partial<Omit<WellnessMetricDBSchema, '_id' | 'userId' | 'createdAt'>>) => {
    const collection = await getWellnessMetricsCollection();
    const result = await collection.updateOne(
        { _id: id },
        { $set: { ...updates, updatedAt: new Date() } }
    );
    return result.modifiedCount > 0;
};

export const deleteWellnessMetric = async (id: ObjectId) => {
    const collection = await getWellnessMetricsCollection();
    const result = await collection.deleteOne({ _id: id });
    return result.deletedCount > 0;
}; 