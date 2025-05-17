import { ObjectId } from 'mongodb';
import { ApiHandlerContext } from '../../types';
import { GetWellnessMetricByIdPayload, GetWellnessMetricByIdResponse, WellnessMetricClient } from '../types';
import { wellnessMetrics as metricsCollection } from '../../../server/database/collections';

export const process = async (
    payload: GetWellnessMetricByIdPayload,
    context: ApiHandlerContext
): Promise<GetWellnessMetricByIdResponse> => {
    if (!context.userId) throw new Error('User not authenticated');
    const userId = new ObjectId(context.userId);

    const dbMetric = await metricsCollection.getWellnessMetricById(new ObjectId(payload.metricId));

    if (!dbMetric || dbMetric.userId.toHexString() !== userId.toHexString()) {
        return { wellnessMetric: null };
    }

    const clientMetric: WellnessMetricClient = {
        ...dbMetric,
        _id: dbMetric._id.toHexString(),
        userId: dbMetric.userId.toHexString(),
        createdAt: dbMetric.createdAt.toISOString(),
        updatedAt: dbMetric.updatedAt.toISOString(),
    };

    return { wellnessMetric: clientMetric };
}; 