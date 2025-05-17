import { ObjectId } from 'mongodb';
import { ApiHandlerContext } from '../../types';
import { DeleteWellnessMetricPayload, DeleteWellnessMetricResponse } from '../types';
import { wellnessMetrics as metricsCollection } from '../../../server/database/collections';

export const process = async (
    payload: DeleteWellnessMetricPayload,
    context: ApiHandlerContext
): Promise<DeleteWellnessMetricResponse> => {
    if (!context.userId) throw new Error('User not authenticated');
    const userId = new ObjectId(context.userId);

    const metricToDelete = await metricsCollection.getWellnessMetricById(new ObjectId(payload.metricId));
    if (!metricToDelete || metricToDelete.userId.toHexString() !== userId.toHexString()) {
        throw new Error('Wellness metric not found or user not authorized');
    }

    // For predefined metrics, 'deleting' might mean setting enabled=false if we want to keep the user's record
    // For custom metrics (isPredefined=false), we can actually delete.
    // Current collection logic does a hard delete. This is fine for now.
    // If soft delete for predefined is needed later, this handler would change.

    const success = await metricsCollection.deleteWellnessMetric(new ObjectId(payload.metricId));
    return { success };
}; 