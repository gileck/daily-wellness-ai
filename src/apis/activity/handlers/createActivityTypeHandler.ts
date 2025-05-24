import { ObjectId } from 'mongodb';
import { ApiHandlerContext } from '../../types';
import { CreateActivityTypePayload, CreateActivityTypeResponse, ActivityTypeClient, ActivityTypeDBSchema } from '../types';
import { activityTypes as activityTypesCollection } from '../../../server/database/collections';

export const process = async (
    payload: CreateActivityTypePayload,
    context: ApiHandlerContext
): Promise<CreateActivityTypeResponse> => {
    if (!context.userId) throw new Error('User not authenticated');
    const userId = new ObjectId(context.userId);

    const newActivityData: Omit<ActivityTypeDBSchema, '_id'> = {
        userId,
        name: payload.name,
        type: payload.type,
        fields: payload.fields,
        color: payload.color,
        icon: payload.icon,
        isPredefined: payload.isPredefined || false,
        predefinedId: payload.predefinedId,
        enabled: payload.enabled === undefined ? true : payload.enabled,
    };

    const activityTypeId = await activityTypesCollection.addActivityType(newActivityData);

    const newActivity = await activityTypesCollection.getActivityTypeById(activityTypeId);

    if (!newActivity) {
        throw new Error('Failed to create or retrieve the new activity type.');
    }

    const activityTypeClient: ActivityTypeClient = {
        ...newActivity,
        _id: newActivity._id.toHexString(),
        userId: newActivity.userId.toHexString(),
    };

    return { activityType: activityTypeClient };
}; 