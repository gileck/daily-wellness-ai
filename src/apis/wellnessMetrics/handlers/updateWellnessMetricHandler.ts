import { ObjectId } from 'mongodb';
import { ApiHandlerContext } from '../../types';
import { UpdateWellnessMetricPayload, UpdateWellnessMetricResponse } from '../types';
import { wellnessMetrics as metricsCollection } from '../../../server/database/collections';

export const process = async (
    payload: UpdateWellnessMetricPayload,
    context: ApiHandlerContext
): Promise<UpdateWellnessMetricResponse> => {
    if (!context.userId) throw new Error('User not authenticated');
    const userId = new ObjectId(context.userId);

    const metricToUpdate = await metricsCollection.getWellnessMetricById(new ObjectId(payload.metricId));
    if (!metricToUpdate || metricToUpdate.userId.toHexString() !== userId.toHexString()) {
        throw new Error('Wellness metric not found or user not authorized');
    }

    // Prevent changing isPredefined or predefinedId for existing metrics
    const { isPredefined, predefinedId, ...validUpdates } = payload.updates;
    if (isPredefined !== undefined || predefinedId !== undefined) {
        console.warn('Attempted to update isPredefined or predefinedId, which is not allowed.');
    }

    const success = await metricsCollection.updateWellnessMetric(
        new ObjectId(payload.metricId),
        validUpdates
    );
    return { success };
}; 