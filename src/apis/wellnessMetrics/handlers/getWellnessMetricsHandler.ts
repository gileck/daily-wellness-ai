import { ObjectId } from 'mongodb';
import { ApiHandlerContext } from '../../types';
import { GetWellnessMetricsResponse, WellnessMetricClient } from '../types';
import { wellnessMetrics as metricsCollection } from '../../../server/database/collections';

export const process = async (
    _payload: undefined, // No payload for getting all for a user
    context: ApiHandlerContext
): Promise<GetWellnessMetricsResponse> => {
    if (!context.userId) throw new Error('User not authenticated');
    const userId = new ObjectId(context.userId);

    const dbMetrics = await metricsCollection.getWellnessMetricsByUserId(userId);
    const clientMetrics: WellnessMetricClient[] = dbMetrics.map(metric => ({
        ...metric,
        _id: metric._id.toHexString(),
        userId: metric.userId.toHexString(),
        createdAt: metric.createdAt.toISOString(),
        updatedAt: metric.updatedAt.toISOString(),
    }));

    return { wellnessMetrics: clientMetrics };
}; 