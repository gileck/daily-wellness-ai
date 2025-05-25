import { ObjectId } from 'mongodb';
import { ApiHandlerContext } from '../../types';
import { UpdateWellnessMetricRecordPayload, UpdateWellnessMetricRecordResponse } from '../types';
import { wellnessMetrics as metricsCollection } from '../../../server/database/collections';

export const process = async (
    payload: UpdateWellnessMetricRecordPayload,
    context: ApiHandlerContext
): Promise<UpdateWellnessMetricRecordResponse> => {
    if (!context.userId) throw new Error('User not authenticated');
    const userId = new ObjectId(context.userId);

    // Get the record to verify ownership
    const record = await metricsCollection.getWellnessMetricRecordById(new ObjectId(payload.recordId));
    if (!record || record.userId.toHexString() !== userId.toHexString()) {
        throw new Error('Wellness metric record not found or access denied');
    }

    const success = await metricsCollection.updateWellnessMetricRecord(
        new ObjectId(payload.recordId),
        payload.updates
    );
    return { success };
}; 