import {
    GetActivityPresetsResponse,
    CreateActivityPresetResponse,
    UpdateActivityPresetResponse,
    DeleteActivityPresetResponse,
    CreateActivityPresetPayload,
    UpdateActivityPresetPayload,
    DeleteActivityPresetPayload,
    ActivityPresetClient
} from './types';
import {
    GET_ACTIVITY_PRESETS_API,
    CREATE_ACTIVITY_PRESET_API,
    UPDATE_ACTIVITY_PRESET_API,
    DELETE_ACTIVITY_PRESET_API
} from './index';
import {
    getActivityPresetsByUserId,
    createActivityPreset,
    updateActivityPreset,
    deleteActivityPreset,
    getActivityPresetById,
    incrementPresetUsage,
    documentToJSON,
    ActivityPresetDocument
} from '@/server/database/collections/activityPresets';
import { ApiHandlerContext } from '@/apis/types';

const convertDocumentToClient = (doc: ActivityPresetDocument): ActivityPresetClient => {
    const json = documentToJSON(doc);
    return {
        ...json,
        lastUsedAt: new Date(json.lastUsedAt),
        createdAt: new Date(json.createdAt),
        updatedAt: new Date(json.updatedAt)
    };
};

export const getActivityPresetsServer = async (userId: string): Promise<GetActivityPresetsResponse> => {
    const presetDocs = await getActivityPresetsByUserId(userId);
    const activityPresets = presetDocs.map(convertDocumentToClient);

    return { activityPresets };
};

export const createActivityPresetServer = async (
    userId: string,
    payload: CreateActivityPresetPayload
): Promise<CreateActivityPresetResponse> => {
    const presetDoc = await createActivityPreset(
        userId,
        payload.activityTypeId,
        payload.name,
        payload.presetFields,
        payload.description
    );

    const activityPreset = convertDocumentToClient(presetDoc);
    return { activityPreset };
};

export const updateActivityPresetServer = async (
    userId: string,
    payload: UpdateActivityPresetPayload
): Promise<UpdateActivityPresetResponse> => {
    // Verify ownership
    const existingPreset = await getActivityPresetById(payload.presetId);
    if (!existingPreset || existingPreset.userId.toHexString() !== userId) {
        throw new Error('Activity preset not found or access denied');
    }

    const updatedDoc = await updateActivityPreset(payload.presetId, payload.updates);
    if (!updatedDoc) {
        throw new Error('Failed to update activity preset');
    }

    const activityPreset = convertDocumentToClient(updatedDoc);
    return { activityPreset };
};

export const deleteActivityPresetServer = async (
    userId: string,
    payload: DeleteActivityPresetPayload
): Promise<DeleteActivityPresetResponse> => {
    // Verify ownership
    const existingPreset = await getActivityPresetById(payload.presetId);
    if (!existingPreset || existingPreset.userId.toHexString() !== userId) {
        throw new Error('Activity preset not found or access denied');
    }

    const success = await deleteActivityPreset(payload.presetId);
    return { success };
};

export const useActivityPresetServer = async (
    userId: string,
    presetId: string
): Promise<ActivityPresetClient> => {
    // Verify ownership and get preset
    const existingPreset = await getActivityPresetById(presetId);
    if (!existingPreset || existingPreset.userId.toHexString() !== userId) {
        throw new Error('Activity preset not found or access denied');
    }

    // Increment usage count
    await incrementPresetUsage(presetId);

    return convertDocumentToClient(existingPreset);
};

// API Handlers for the project's API structure
export const activityPresetsApiHandlers = {
    [GET_ACTIVITY_PRESETS_API]: {
        process: async (params: unknown, context: ApiHandlerContext): Promise<GetActivityPresetsResponse> => {
            if (!context.userId) throw new Error('User not authenticated');
            return getActivityPresetsServer(context.userId);
        }
    },
    [CREATE_ACTIVITY_PRESET_API]: {
        process: async (params: unknown, context: ApiHandlerContext): Promise<CreateActivityPresetResponse> => {
            if (!context.userId) throw new Error('User not authenticated');
            const payload = params as CreateActivityPresetPayload;
            return createActivityPresetServer(context.userId, payload);
        }
    },
    [UPDATE_ACTIVITY_PRESET_API]: {
        process: async (params: unknown, context: ApiHandlerContext): Promise<UpdateActivityPresetResponse> => {
            if (!context.userId) throw new Error('User not authenticated');
            const payload = params as UpdateActivityPresetPayload;
            return updateActivityPresetServer(context.userId, payload);
        }
    },
    [DELETE_ACTIVITY_PRESET_API]: {
        process: async (params: unknown, context: ApiHandlerContext): Promise<DeleteActivityPresetResponse> => {
            if (!context.userId) throw new Error('User not authenticated');
            const payload = params as DeleteActivityPresetPayload;
            return deleteActivityPresetServer(context.userId, payload);
        }
    }
}; 