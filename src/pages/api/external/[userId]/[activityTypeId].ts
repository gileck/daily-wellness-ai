import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { userId, activityTypeId } = req.query;
        const { timestamp, notes, ...fieldValues } = req.body;

        return res.status(200).json({
            success: true,
            message: 'External API test successful!',
            received: {
                userId,
                activityTypeId,
                fieldValues,
                notes,
                timestamp
            }
        });

    } catch (error) {
        console.error('Error in external track activity:', error);
        return res.status(500).json({
            error: error instanceof Error ? error.message : 'Internal server error while tracking activity.'
        });
    }
} 