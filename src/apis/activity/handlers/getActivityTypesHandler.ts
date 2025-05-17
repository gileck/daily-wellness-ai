import { ObjectId } from 'mongodb';
import { ApiHandlerContext } from '../../types';
import { GetActivityTypesResponse, ActivityTypeClient } from '../types';
import { activityTypes as activityTypesCollection } from '../../../server/database/collections';

export const process = async (
    _payload: undefined,
    context: ApiHandlerContext
): Promise<GetActivityTypesResponse> => {
    if (!context.userId) throw new Error('User not authenticated');
    const userId = new ObjectId(context.userId);
    const typesFromDb = await activityTypesCollection.getActivityTypesByUserId(userId);
    const clientTypes: ActivityTypeClient[] = typesFromDb.map(t => ({
        ...t,
        _id: t._id.toHexString(),
        userId: t.userId.toHexString(),
        createdAt: t.createdAt.toISOString(),
        updatedAt: t.updatedAt.toISOString(),
    }));
    return { activityTypes: clientTypes };
}; 