export interface ActivityPresetClient {
    _id: string;
    userId: string;
    activityTypeId: string;
    name: string;
    description?: string;
    presetFields: Record<string, unknown>;
    isActive: boolean;
    usageCount: number;
    lastUsedAt: Date;
    createdAt: Date;
    updatedAt: Date;
}

export interface ActivityPresetJSON {
    _id: string;
    userId: string;
    activityTypeId: string;
    name: string;
    description?: string;
    presetFields: Record<string, unknown>;
    isActive: boolean;
    usageCount: number;
    lastUsedAt: string;
    createdAt: string;
    updatedAt: string;
}

export interface CreateActivityPresetPayload {
    activityTypeId: string;
    name: string;
    description?: string;
    presetFields: Record<string, unknown>;
}

export interface UpdateActivityPresetPayload {
    presetId: string;
    updates: {
        name?: string;
        description?: string;
        presetFields?: Record<string, unknown>;
        isActive?: boolean;
    };
}

export interface DeleteActivityPresetPayload {
    presetId: string;
}

export interface GetActivityPresetsResponse {
    activityPresets: ActivityPresetClient[];
}

export interface CreateActivityPresetResponse {
    activityPreset: ActivityPresetClient;
}

export interface UpdateActivityPresetResponse {
    activityPreset: ActivityPresetClient;
}

export interface DeleteActivityPresetResponse {
    success: boolean;
} 