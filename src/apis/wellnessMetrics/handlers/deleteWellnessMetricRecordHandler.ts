import { ObjectId } from 'mongodb';
import { ApiHandlerContext } from '../../types';
import { DeleteWellnessMetricRecordPayload, DeleteWellnessMetricRecordResponse } from '../types';
import { wellnessMetrics as metricsCollection } from '../../../server/database/collections';

export const process = async (
    payload: DeleteWellnessMetricRecordPayload,
    context: ApiHandlerContext
): Promise<DeleteWellnessMetricRecordResponse> => {
    if (!context.userId) throw new Error('User not authenticated');
    const userId = new ObjectId(context.userId);

    // Get the record to verify ownership
    const record = await metricsCollection.getWellnessMetricRecordById(new ObjectId(payload.recordId));
    if (!record || record.userId.toHexString() !== userId.toHexString()) {
        throw new Error('Wellness metric record not found or access denied');
    }

    const success = await metricsCollection.deleteWellnessMetricRecord(new ObjectId(payload.recordId));
    return { success };
}; 