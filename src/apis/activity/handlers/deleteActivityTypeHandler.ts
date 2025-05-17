import { ObjectId } from 'mongodb';
import { ApiHandlerContext } from '../../types';
import { DeleteActivityTypePayload, DeleteActivityTypeResponse } from '../types';
import { activityTypes as activityTypesCollection } from '../../../server/database/collections';

export const process = async (
    payload: DeleteActivityTypePayload,
    context: ApiHandlerContext
): Promise<DeleteActivityTypeResponse> => {
    if (!context.userId) throw new Error('User not authenticated');
    const activityTypeToDelete = await activityTypesCollection.getActivityTypeById(new ObjectId(payload.activityTypeId));
    if (!activityTypeToDelete || activityTypeToDelete.userId.toHexString() !== context.userId) {
        throw new Error('ActivityType not found or user not authorized');
    }
    const success = await activityTypesCollection.deleteActivityType(
        new ObjectId(payload.activityTypeId)
    );
    return { success };
}; 