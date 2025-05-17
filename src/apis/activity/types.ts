// import { ObjectId } from 'mongodb'; // This was unused
import { type ActivityTypeField as ServerActivityTypeField } from '../../server/database/collections/activityTypes/types';
import { ObjectId } from 'mongodb';
import { activities } from '../../server/database/collections';

// Re-export for client-side convenience from the source of truth (if still needed, or use ServerActivityTypeField directly)
// export type { ActivityTypeField } from '../../server/database/collections/activityTypes/types';
export type ActivityTypeField = ServerActivityTypeField; // Alias for local use

// Define the enum for field types based on ActivityTypeField.fieldType
// Assuming ServerActivityTypeField has fieldType, otherwise this needs adjustment
export const ActivityFieldTypeValues = ['Boolean', 'Number', 'Time', 'Date', 'Text', 'String'] as const;
export type ActivityFieldTypeEnum = typeof ActivityFieldTypeValues[number];

// Base interface for common fields
export interface ActivityTypeBase {
    name: string;
    type: string; // E.g., 'Exercise', 'Work', 'Hobby' - could be an enum or a separate collection later
    fields: ActivityTypeField[];
    color?: string;
    isPredefined: boolean;
    predefinedId?: string; // if isPredefined is true, this links to the original predefined ID
    enabled: boolean;
    // Note: _id and userId are typically added at the database layer or by the handler
}

// Schema for data stored in MongoDB, extending base, including DB-specific fields
export interface ActivityTypeDBSchema extends ActivityTypeBase {
    _id: ObjectId;
    userId: ObjectId;
}

// Client-side representation, extending base, converting ObjectId to string for _id and userId
export interface ActivityTypeClient extends Omit<ActivityTypeDBSchema, '_id' | 'userId'> {
    _id: string;
    userId: string;
}

// Client-facing DTOs with string IDs
export interface ActivityClient {
    _id: string;
    userId: string;
    activityTypeId: string;
    startTime: string; // Dates as ISO strings
    fields: Record<string, string | number | boolean | Date | null>; // Assuming this is client-safe or handle date fields specifically if they are Date objects
    createdAt: string;
    updatedAt: string;
}

// ===== ActivityType API Payloads =====

// Payload for creating a new activity type
export interface CreateActivityTypePayload {
    name: string;
    type: string;
    fields: ActivityTypeField[];
    color?: string;
    isPredefined?: boolean;
    predefinedId?: string;
    enabled?: boolean;
}

export interface CreateActivityTypeResponse {
    activityType: ActivityTypeClient;
}

export interface GetActivityTypesResponse {
    activityTypes: ActivityTypeClient[];
}

// Payload for updating an existing activity type
// Making most fields optional for partial updates. Client should send only changed fields.
export type UpdateActivityTypePayload = Partial<Omit<ActivityTypeBase, 'isPredefined' | 'predefinedId'>>;

export interface UpdateActivityTypeClientPayload {
    activityTypeId: string;
    updates: UpdateActivityTypePayload;
}

export interface UpdateActivityTypeResponse {
    activityType: ActivityTypeClient;
}

export interface DeleteActivityTypePayload {
    activityTypeId: string;
}

export interface DeleteActivityTypeResponse {
    success: boolean;
    message?: string;
}

// ===== Activity API Payloads =====

export interface AddActivityPayload {
    activityTypeId: string;
    startTime: Date;
    fields: Record<string, string | number | boolean | Date | null>;
}

export interface AddActivityResponse {
    activityId: string; // Return as string for client
}

export interface GetActivitiesPayload {
    startDate?: string; // ISO date string
    endDate?: string;   // ISO date string
}

export interface GetActivitiesResponse {
    activities: ActivityClient[];
}

export interface GetActivityByIdPayload {
    activityId: string;
}

export interface GetActivityByIdResponse {
    activity: ActivityClient | null;
}

export interface UpdateActivityPayload {
    activityId: string;
    updates: Partial<Omit<activities.Activity, '_id' | 'userId' | 'createdAt' | 'updatedAt' | 'activityTypeId'>>;
}

export interface UpdateActivityResponse {
    success: boolean;
}

export interface DeleteActivityPayload {
    activityId: string;
}

export interface DeleteActivityResponse {
    success: boolean;
}

export interface RecordActivityPayload {
    activityTypeId: string;
    startTime?: Date;
    endTime?: Date;
    duration?: number; // in minutes, if applicable
    notes?: string;
    fields: ActivityRecordField[];
    relatedMetrics?: WellnessMetricRecord[];
}

export interface ActivityRecordField {
    fieldName: string;
    value: string | number | boolean | Date | null;
}

export interface WellnessMetricRecord {
    metricId: string;
    value: number | string; // Depending on the metric type
}

export interface LoggedActivity {
    _id: string;
    userId: string;
    activityTypeId: string;
    activityTypeName: string; // Denormalized for easier display
    startTime: Date;
    endTime?: Date;
    duration?: number; // in minutes
    notes?: string;
    fields: ActivityRecordField[];
    relatedMetrics?: WellnessMetricRecord[];
    createdAt: Date;
    updatedAt: Date;
}

export interface GetLoggedActivitiesResponse {
    loggedActivities: LoggedActivity[];
} 