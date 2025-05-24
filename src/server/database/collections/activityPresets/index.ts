import { ObjectId } from 'mongodb';
import { getDb } from '@/server/database';
import { ActivityPresetJSON } from '@/apis/activityPresets/types';

export interface ActivityPresetDocument {
    _id?: ObjectId;
    userId: ObjectId;
    activityTypeId: ObjectId;
    name: string;
    description?: string;
    presetFields: Record<string, unknown>;
    isActive: boolean;
    usageCount: number;
    lastUsedAt: Date;
    createdAt: Date;
    updatedAt: Date;
}

const COLLECTION_NAME = 'activityPresets';

export const getActivityPresetsCollection = async () => {
    const db = await getDb();
    return db.collection<ActivityPresetDocument>(COLLECTION_NAME);
};

export const documentToJSON = (doc: ActivityPresetDocument): ActivityPresetJSON => ({
    _id: doc._id!.toHexString(),
    userId: doc.userId.toHexString(),
    activityTypeId: doc.activityTypeId.toHexString(),
    name: doc.name,
    description: doc.description,
    presetFields: doc.presetFields,
    isActive: doc.isActive,
    usageCount: doc.usageCount,
    lastUsedAt: doc.lastUsedAt.toISOString(),
    createdAt: doc.createdAt.toISOString(),
    updatedAt: doc.updatedAt.toISOString()
});

export const createActivityPreset = async (
    userId: string,
    activityTypeId: string,
    name: string,
    presetFields: Record<string, unknown>,
    description?: string
): Promise<ActivityPresetDocument> => {
    const collection = await getActivityPresetsCollection();
    const now = new Date();

    const doc: ActivityPresetDocument = {
        userId: new ObjectId(userId),
        activityTypeId: new ObjectId(activityTypeId),
        name,
        description,
        presetFields,
        isActive: true,
        usageCount: 0,
        lastUsedAt: now,
        createdAt: now,
        updatedAt: now
    };

    const result = await collection.insertOne(doc);
    return { ...doc, _id: result.insertedId };
};

export const getActivityPresetsByUserId = async (userId: string): Promise<ActivityPresetDocument[]> => {
    const collection = await getActivityPresetsCollection();

    return collection.find({
        userId: new ObjectId(userId),
        isActive: true
    }).sort({ usageCount: -1, updatedAt: -1 }).toArray();
};

export const getActivityPresetById = async (presetId: string): Promise<ActivityPresetDocument | null> => {
    const collection = await getActivityPresetsCollection();

    return collection.findOne({
        _id: new ObjectId(presetId),
        isActive: true
    });
};

export const updateActivityPreset = async (
    presetId: string,
    updates: Partial<Omit<ActivityPresetDocument, '_id' | 'userId' | 'createdAt'>>
): Promise<ActivityPresetDocument | null> => {
    const collection = await getActivityPresetsCollection();

    const updateDoc = {
        ...updates,
        updatedAt: new Date()
    };

    const result = await collection.findOneAndUpdate(
        { _id: new ObjectId(presetId), isActive: true },
        { $set: updateDoc },
        { returnDocument: 'after' }
    );

    return result || null;
};

export const incrementPresetUsage = async (presetId: string): Promise<void> => {
    const collection = await getActivityPresetsCollection();

    await collection.updateOne(
        { _id: new ObjectId(presetId) },
        {
            $inc: { usageCount: 1 },
            $set: { lastUsedAt: new Date() }
        }
    );
};

export const deleteActivityPreset = async (presetId: string): Promise<boolean> => {
    const collection = await getActivityPresetsCollection();

    const result = await collection.updateOne(
        { _id: new ObjectId(presetId) },
        {
            $set: {
                isActive: false,
                updatedAt: new Date()
            }
        }
    );

    return result.modifiedCount > 0;
};

export const deletePresetsByActivityType = async (activityTypeId: string): Promise<void> => {
    const collection = await getActivityPresetsCollection();

    await collection.updateMany(
        { activityTypeId: new ObjectId(activityTypeId) },
        {
            $set: {
                isActive: false,
                updatedAt: new Date()
            }
        }
    );
}; 