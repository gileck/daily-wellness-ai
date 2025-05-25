import { ObjectId } from 'mongodb';

export interface WellnessMetric {
    _id: ObjectId;
    userId: ObjectId;
    name: string;
    isPredefined: boolean;
    predefinedId?: string; // Link to the id in the JSON file if it came from there
    enabled: boolean;
    color?: string; // Hex color value for the metric
    icon?: string; // Material UI icon name
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
    color?: string; // Hex color value for the metric
    icon?: string; // Material UI icon name
    createdAt: Date;
    updatedAt: Date;
}

export interface WellnessMetricRecord {
    _id: ObjectId;
    userId: ObjectId;
    metricId: ObjectId;
    metricName: string;
    value: number | string;
    notes?: string;
    timestamp: Date;
    createdAt: Date;
}

export interface WellnessMetricRecordDBSchema {
    _id: ObjectId;
    userId: ObjectId;
    metricId: ObjectId;
    metricName: string;
    value: number | string;
    notes?: string;
    timestamp: Date;
    createdAt: Date;
}

export const WELLNESS_METRIC_COLLECTION_NAME = 'wellnessMetrics';
export const WELLNESS_METRIC_RECORDS_COLLECTION_NAME = 'wellnessMetricRecords'; 