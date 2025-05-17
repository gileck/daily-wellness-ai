import { ObjectId } from 'mongodb';
import { ApiHandlerContext } from '../../types';
import { DeleteActivityPayload, DeleteActivityResponse } from '../types';
import { activities as activitiesCollection } from '../../../server/database/collections';

export const process = async (
    payload: DeleteActivityPayload,
    context: ApiHandlerContext
): Promise<DeleteActivityResponse> => {
    if (!context.userId) throw new Error('User not authenticated');
    const activityToDelete = await activitiesCollection.getActivityById(new ObjectId(payload.activityId));
    if (!activityToDelete || activityToDelete.userId.toHexString() !== context.userId) {
        throw new Error('Activity not found or user not authorized');
    }
    const success = await activitiesCollection.deleteActivity(new ObjectId(payload.activityId));
    return { success };
}; 