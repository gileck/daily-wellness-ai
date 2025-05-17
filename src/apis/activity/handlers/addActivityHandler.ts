import { ObjectId } from 'mongodb';
import { ApiHandlerContext } from '../../types';
import { AddActivityPayload, AddActivityResponse } from '../types';
import {
    activityTypes as activityTypesCollection,
    activities as activitiesCollection
} from '../../../server/database/collections';

export const process = async (
    payload: AddActivityPayload,
    context: ApiHandlerContext
): Promise<AddActivityResponse> => {
    if (!context.userId) throw new Error('User not authenticated');
    const userId = new ObjectId(context.userId);

    const activityType = await activityTypesCollection.getActivityTypeById(new ObjectId(payload.activityTypeId));
    if (!activityType || (activityType.userId.toHexString() !== context.userId && !activityType.isPredefined)) {
        throw new Error('Invalid or unauthorized activityTypeId');
    }

    const activityId = await activitiesCollection.addActivity({
        userId,
        activityTypeId: new ObjectId(payload.activityTypeId),
        startTime: new Date(payload.startTime),
        fields: payload.fields,
    });
    return { activityId: activityId.toHexString() };
}; 