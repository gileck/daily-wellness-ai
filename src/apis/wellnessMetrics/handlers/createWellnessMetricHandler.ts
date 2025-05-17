import { ObjectId } from 'mongodb';
import { ApiHandlerContext } from '../../types';
import { CreateWellnessMetricPayload, CreateWellnessMetricResponse } from '../types';
import { wellnessMetrics as metricsCollection } from '../../../server/database/collections';

export const process = async (
    payload: CreateWellnessMetricPayload,
    context: ApiHandlerContext
): Promise<CreateWellnessMetricResponse> => {
    if (!context.userId) throw new Error('User not authenticated');
    const userId = new ObjectId(context.userId);

    // Check if a predefined metric with this predefinedId already exists for the user
    if (payload.isPredefined && payload.predefinedId) {
        const existingMetric = await metricsCollection.getWellnessMetricByPredefinedId(userId, payload.predefinedId);
        if (existingMetric) {
            // If it exists, enable it and return its ID, rather than creating a duplicate
            if (!existingMetric.enabled) {
                await metricsCollection.updateWellnessMetric(existingMetric._id, { enabled: true, name: payload.name }); // Update name in case predefined changed
            }
            return { wellnessMetricId: existingMetric._id.toHexString() };
        }
    }

    const wellnessMetricId = await metricsCollection.addWellnessMetric({
        userId,
        name: payload.name,
        isPredefined: payload.isPredefined,
        predefinedId: payload.predefinedId,
        enabled: payload.enabled === undefined ? true : payload.enabled,
    });
    return { wellnessMetricId: wellnessMetricId.toHexString() };
}; 