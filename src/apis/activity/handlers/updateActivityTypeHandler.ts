import { ObjectId } from 'mongodb';
import { ApiHandlerContext } from '../../types';
import { UpdateActivityTypePayload, UpdateActivityTypeResponse, ActivityTypeClient } from '../types';
import { activityTypes as activityTypesCollection } from '../../../server/database/collections';

// The handler will receive the structured payload from the client
interface UpdateHandlerPayload {
    activityTypeId: string;
    updates: UpdateActivityTypePayload;
}

export const process = async (
    payload: UpdateHandlerPayload, // Changed payload type
    context: ApiHandlerContext
): Promise<UpdateActivityTypeResponse> => {
    if (!context.userId) throw new Error('User not authenticated');

    const activityTypeId = new ObjectId(payload.activityTypeId);

    const activityTypeToUpdate = await activityTypesCollection.getActivityTypeById(activityTypeId);
    if (!activityTypeToUpdate || activityTypeToUpdate.userId.toHexString() !== context.userId) {
        throw new Error('ActivityType not found or user not authorized');
    }

    // Ensure color is part of the updates if provided, and other fields from UpdateActivityTypePayload
    const updateData: UpdateActivityTypePayload = {
        ...payload.updates,
        // color is already part of UpdateActivityTypePayload (via Partial<ActivityTypeBase>)
    };

    const success = await activityTypesCollection.updateActivityType(
        activityTypeId,
        updateData // Pass the updates directly
    );

    if (!success) {
        throw new Error('Failed to update activity type.');
    }

    const updatedActivity = await activityTypesCollection.getActivityTypeById(activityTypeId);
    if (!updatedActivity) {
        throw new Error('Failed to retrieve updated activity type.');
    }

    const activityTypeClient: ActivityTypeClient = {
        ...updatedActivity,
        _id: updatedActivity._id.toHexString(),
        userId: updatedActivity.userId.toHexString(),
    };

    return { activityType: activityTypeClient };
}; 