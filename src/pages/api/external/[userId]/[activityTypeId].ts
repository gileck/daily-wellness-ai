import type { NextApiRequest, NextApiResponse } from 'next';
import { process as externalTrackActivityProcess } from '@/apis/trackedActivities/handlers/externalTrackActivityHandler';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { userId, activityTypeId } = req.query;
        const { timestamp, notes, ...fieldValues } = req.body;

        if (!userId || !activityTypeId) {
            return res.status(400).json({ error: 'Missing userId or activityTypeId in URL' });
        }

        // Convert fieldValues to the expected format
        const values = Object.entries(fieldValues).map(([fieldName, value]) => ({
            fieldName,
            value
        }));

        const result = await externalTrackActivityProcess({
            userId: userId as string,
            activityTypeId: activityTypeId as string,
            timestamp: timestamp ? new Date(timestamp) : new Date(),
            values,
            notes
        });

        const success = result.success;
        const error = result.error;

        return res.status(200).json({
            success,
            ...(error && { error }),
        });

    } catch (error) {
        console.error('Error in external track activity:', error);
        return res.status(200).json({
            success: false,
            error: error instanceof Error ? error.message : 'Internal server error while tracking activity.'
        });
    }
} 