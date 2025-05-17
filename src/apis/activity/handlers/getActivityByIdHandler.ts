import { ObjectId } from 'mongodb';
import { ApiHandlerContext } from '../../types';
import { GetActivityByIdPayload, GetActivityByIdResponse, ActivityClient } from '../types';
import { activities as activitiesCollection } from '../../../server/database/collections';

export const process = async (
    payload: GetActivityByIdPayload,
    context: ApiHandlerContext
): Promise<GetActivityByIdResponse> => {
    if (!context.userId) throw new Error('User not authenticated');
    const activityFromDb = await activitiesCollection.getActivityById(new ObjectId(payload.activityId));

    if (activityFromDb && activityFromDb.userId.toHexString() !== context.userId) {
        return { activity: null };
    }

    if (activityFromDb) {
        const clientActivity: ActivityClient = {
            ...activityFromDb,
            _id: activityFromDb._id.toHexString(),
            userId: activityFromDb.userId.toHexString(),
            activityTypeId: activityFromDb.activityTypeId.toHexString(),
            fields: Object.fromEntries(
                Object.entries(activityFromDb.fields).map(([key, value]) =>
                    value instanceof Date ? [key, value.toISOString()] : [key, value]
                )
            ) as Record<string, string | number | boolean | Date | null>,
            startTime: activityFromDb.startTime.toISOString(),
            createdAt: activityFromDb.createdAt.toISOString(),
            updatedAt: activityFromDb.updatedAt.toISOString(),
        };
        return { activity: clientActivity };
    }
    return { activity: null };
}; 