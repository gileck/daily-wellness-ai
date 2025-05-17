import { processApiCall } from "@/apis/processApiCall";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const response = await processApiCall(req, res);

    // Check if response has an error
    if ('error' in response) {
      return res.status(500).json(response);
    }

    // Return success response
    return res.status(200).json(response);
  } catch (error) {
    console.error('Unhandled error in API handler:', error);
    return res.status(500).json({
      error: error instanceof Error ? error.message : 'An unknown error occurred'
    });
  }
}

export const config = {
  maxDuration: 60,
};
