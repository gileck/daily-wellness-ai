import type { NextApiRequest, NextApiResponse } from 'next';
import { process as externalTrackActivityProcess } from '@/apis/trackedActivities/handlers/externalTrackActivityHandler';
import { getActivityTypeById } from '@/server/database/collections/activityTypes';
import { ObjectId } from 'mongodb';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { userId, activityTypeId } = req.query;
        const { timestamp, notes, ...fieldValues } = req.body;

        if (!userId || !activityTypeId) {
            return res.status(400).json({
                error: 'Missing required fields: userId and activityTypeId are required.'
            });
        }

        if (typeof userId !== 'string' || typeof activityTypeId !== 'string') {
            return res.status(400).json({
                error: 'Invalid userId or activityTypeId format.'
            });
        }

        // Validate ObjectId format
        if (!ObjectId.isValid(userId) || !ObjectId.isValid(activityTypeId)) {
            return res.status(400).json({
                error: 'Invalid userId or activityTypeId format.'
            });
        }

        // Get activity type to validate fields
        const activityType = await getActivityTypeById(new ObjectId(activityTypeId));
        if (!activityType) {
            return res.status(404).json({ error: 'Activity type not found.' });
        }

        if (activityType.userId.toString() !== userId && !activityType.isPredefined) {
            return res.status(403).json({
                error: 'Activity type not accessible by this user.'
            });
        }

        // Transform field values to the expected format
        const values = activityType.fields.map(field => ({
            fieldName: field.name,
            value: fieldValues[field.name] ?? null
        }));

        // Call the existing handler
        const result = await externalTrackActivityProcess({
            userId,
            activityTypeId,
            timestamp: timestamp ? new Date(timestamp) : undefined,
            values,
            notes
        });

        return res.status(200).json({
            success: true,
            message: 'Activity tracked successfully',
            activityId: result.trackedActivity?._id
        });

    } catch (error) {
        console.error('Error in external track activity:', error);
        return res.status(500).json({
            error: error instanceof Error ? error.message : 'Internal server error while tracking activity.'
        });
    }
} 