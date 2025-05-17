import { ObjectId } from 'mongodb';
import { ApiHandlerContext } from '../../types';
import { GetActivitiesPayload, GetActivitiesResponse, ActivityClient } from '../types';
import { activities as activitiesCollection } from '../../../server/database/collections';

export const process = async (
    payload: GetActivitiesPayload | undefined,
    context: ApiHandlerContext
): Promise<GetActivitiesResponse> => {
    if (!context.userId) throw new Error('User not authenticated');
    const userId = new ObjectId(context.userId);
    const startDate = payload?.startDate ? new Date(payload.startDate) : undefined;
    const endDate = payload?.endDate ? new Date(payload.endDate) : undefined;
    const userActivitiesFromDb = await activitiesCollection.getActivitiesByUserId(
        userId,
        startDate,
        endDate
    );
    const clientActivities: ActivityClient[] = userActivitiesFromDb.map(a => ({
        ...a,
        _id: a._id.toHexString(),
        userId: a.userId.toHexString(),
        activityTypeId: a.activityTypeId.toHexString(),
        fields: Object.fromEntries(
            Object.entries(a.fields).map(([key, value]) =>
                value instanceof Date ? [key, value.toISOString()] : [key, value]
            )
        ) as Record<string, string | number | boolean | Date | null>,
        startTime: a.startTime.toISOString(),
        createdAt: a.createdAt.toISOString(),
        updatedAt: a.updatedAt.toISOString(),
    }));
    return { activities: clientActivities };
}; 