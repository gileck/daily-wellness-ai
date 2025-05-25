import { ObjectId } from 'mongodb';
import { ApiHandlerContext } from '../../types';
import { GetWellnessMetricRecordsPayload, GetWellnessMetricRecordsResponse, WellnessMetricRecord } from '../types';
import { wellnessMetrics as metricsCollection } from '../../../server/database/collections';

export const process = async (
    payload: GetWellnessMetricRecordsPayload = {},
    context: ApiHandlerContext
): Promise<GetWellnessMetricRecordsResponse> => {
    if (!context.userId) throw new Error('User not authenticated');
    const userId = new ObjectId(context.userId);

    const options = {
        metricId: payload.metricId ? new ObjectId(payload.metricId) : undefined,
        startDate: payload.startDate ? new Date(payload.startDate) : undefined,
        endDate: payload.endDate ? new Date(payload.endDate) : undefined,
        limit: payload.limit || 50,
    };

    const dbRecords = await metricsCollection.getWellnessMetricRecords(userId, options);

    const records: WellnessMetricRecord[] = dbRecords.map(record => ({
        _id: record._id.toHexString(),
        userId: record.userId.toHexString(),
        metricId: record.metricId.toHexString(),
        metricName: record.metricName,
        value: record.value,
        notes: record.notes,
        timestamp: record.timestamp,
        createdAt: record.createdAt,
    }));

    return { records };
}; 