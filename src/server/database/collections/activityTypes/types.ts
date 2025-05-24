import { ObjectId } from 'mongodb';

export interface ActivityTypeField {
    name: string;
    fieldType: 'Boolean' | 'Number' | 'Time' | 'Date' | 'Text' | 'String' | 'Foods' | 'Options'; // 'String' as a synonym for 'Text'
    required?: boolean;
    options?: string[]; // For Options field type
}

export interface ActivityType {
    _id: ObjectId;
    userId: ObjectId;
    name: string;
    type: string; // e.g., sleep, meal, workout - for categorization
    description?: string;
    color?: string; // Hex color value
    icon?: string; // Material UI icon name
    fields: ActivityTypeField[];
    isPredefined: boolean; // Indicates if it's a system-provided default
    enabled: boolean; // User can enable/disable tracking for this type
    createdAt: Date;
    updatedAt: Date;
}

export interface ActivityTypeDBSchema {
    _id: ObjectId;
    userId: ObjectId;
    name: string;
    type: string;
    description?: string;
    color?: string; // Hex color value
    icon?: string; // Material UI icon name
    fields: ActivityTypeField[];
    isPredefined: boolean;
    enabled: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export const ACTIVITY_TYPE_COLLECTION_NAME = 'activityTypes'; 