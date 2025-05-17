import { ObjectId } from 'mongodb';

export interface WellnessMetric {
    _id: ObjectId;
    userId: ObjectId;
    name: string;
    isPredefined: boolean;
    predefinedId?: string; // Link to the id in the JSON file if it came from there
    enabled: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export interface WellnessMetricDBSchema {
    _id: ObjectId;
    userId: ObjectId;
    name: string;
    isPredefined: boolean;
    predefinedId?: string;
    enabled: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export const WELLNESS_METRIC_COLLECTION_NAME = 'wellnessMetrics'; 