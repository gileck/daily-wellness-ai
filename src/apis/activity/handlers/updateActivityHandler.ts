import { ObjectId } from 'mongodb';
import { ApiHandlerContext } from '../../types';
import { UpdateActivityPayload, UpdateActivityResponse } from '../types';
import { activities as activitiesCollection } from '../../../server/database/collections';

export const process = async (
    payload: UpdateActivityPayload,
    context: ApiHandlerContext
): Promise<UpdateActivityResponse> => {
    if (!context.userId) throw new Error('User not authenticated');
    const activityToUpdate = await activitiesCollection.getActivityById(new ObjectId(payload.activityId));
    if (!activityToUpdate || activityToUpdate.userId.toHexString() !== context.userId) {
        throw new Error('Activity not found or user not authorized');
    }

    const success = await activitiesCollection.updateActivity(
        new ObjectId(payload.activityId),
        payload.updates
    );
    return { success };
}; 