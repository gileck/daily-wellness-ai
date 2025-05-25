import { ObjectId } from 'mongodb';
import { ApiHandlerContext } from '../../types';
import { TrackWellnessMetricPayload, TrackWellnessMetricResponse } from '../types';
import { wellnessMetrics as metricsCollection } from '../../../server/database/collections';

export const process = async (
    payload: TrackWellnessMetricPayload,
    context: ApiHandlerContext
): Promise<TrackWellnessMetricResponse> => {
    if (!context.userId) throw new Error('User not authenticated');
    const userId = new ObjectId(context.userId);

    // Verify the metric exists and belongs to the user
    const metric = await metricsCollection.getWellnessMetricById(new ObjectId(payload.metricId));
    if (!metric || metric.userId.toHexString() !== userId.toHexString()) {
        throw new Error('Wellness metric not found or access denied');
    }

    // Create the record
    await metricsCollection.addWellnessMetricRecord({
        userId,
        metricId: new ObjectId(payload.metricId),
        metricName: metric.name,
        value: payload.value,
        notes: payload.notes,
        timestamp: payload.timestamp || new Date(),
    });

    return { success: true };
}; 