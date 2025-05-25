import { Collection, ObjectId } from 'mongodb';
import { WellnessMetricDBSchema, WELLNESS_METRIC_COLLECTION_NAME, WellnessMetricRecordDBSchema, WELLNESS_METRIC_RECORDS_COLLECTION_NAME } from './types';
import { getDb } from '../../index'; // Import getDb

// Internal function to get collection reference
const getWellnessMetricsCollection = async (): Promise<Collection<WellnessMetricDBSchema>> => {
    const db = await getDb();
    return db.collection<WellnessMetricDBSchema>(WELLNESS_METRIC_COLLECTION_NAME);
};

const getWellnessMetricRecordsCollection = async (): Promise<Collection<WellnessMetricRecordDBSchema>> => {
    const db = await getDb();
    return db.collection<WellnessMetricRecordDBSchema>(WELLNESS_METRIC_RECORDS_COLLECTION_NAME);
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

export const addWellnessMetricRecord = async (recordData: Omit<WellnessMetricRecordDBSchema, '_id' | 'createdAt'>) => {
    const collection = await getWellnessMetricRecordsCollection();
    const now = new Date();
    const result = await collection.insertOne({
        ...recordData,
        _id: new ObjectId(),
        createdAt: now,
    });
    return result.insertedId;
};

export const getWellnessMetricRecords = async (
    userId: ObjectId,
    options: {
        metricId?: ObjectId;
        startDate?: Date;
        endDate?: Date;
        limit?: number;
    } = {}
) => {
    const collection = await getWellnessMetricRecordsCollection();
    const { metricId, startDate, endDate, limit = 50 } = options;

    const filter: { userId: ObjectId; metricId?: ObjectId; timestamp?: { $gte?: Date; $lte?: Date } } = { userId };

    if (metricId) {
        filter.metricId = metricId;
    }

    if (startDate || endDate) {
        filter.timestamp = {};
        if (startDate) filter.timestamp.$gte = startDate;
        if (endDate) filter.timestamp.$lte = endDate;
    }

    return await collection
        .find(filter)
        .sort({ timestamp: -1 })
        .limit(limit)
        .toArray();
};

export const getWellnessMetricRecordById = async (id: ObjectId) => {
    const collection = await getWellnessMetricRecordsCollection();
    return collection.findOne({ _id: id });
};

export const updateWellnessMetricRecord = async (id: ObjectId, updates: Partial<Omit<WellnessMetricRecordDBSchema, '_id' | 'userId' | 'metricId' | 'createdAt'>>) => {
    const collection = await getWellnessMetricRecordsCollection();
    const result = await collection.updateOne(
        { _id: id },
        { $set: updates }
    );
    return result.modifiedCount > 0;
};

export const deleteWellnessMetricRecord = async (id: ObjectId) => {
    const collection = await getWellnessMetricRecordsCollection();
    const result = await collection.deleteOne({ _id: id });
    return result.deletedCount > 0;
}; 