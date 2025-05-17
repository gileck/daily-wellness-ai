import { NextApiRequest, NextApiResponse } from "next";
import { parse, serialize } from 'cookie';
import jwt from 'jsonwebtoken';
import { apiHandlers } from "./apis";
import { withCache } from "@/server/cache";
import { CacheResult } from "@/server/cache/types";
import type { ApiOptions } from "@/client/utils/apiClient";
import { AuthTokenPayload } from "./auth/types";
import { ErrorResponse } from "./types";
// Import database connections
import '@/server/database/mongoose'; // Import to ensure connection is initialized

// Constants
const JWT_SECRET = process.env.JWT_SECRET
if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is not set")
}
const COOKIE_NAME = 'auth_token';

export const processApiCall = async (
  req: NextApiRequest,
  res: NextApiResponse
): Promise<CacheResult<unknown> | ErrorResponse> => {
  try {
    const name = req.body.name as keyof typeof apiHandlers;
    const params = req.body.params;
    const options = req.body.options as ApiOptions;

    // Extract and verify JWT token from cookies
    let userId = undefined;
    const cookies = parse(req.headers.cookie || '');
    const token = cookies[COOKIE_NAME];

    if (token) {
      try {
        // Verify and decode the token
        const decoded = jwt.verify(token, JWT_SECRET) as AuthTokenPayload;
        userId = decoded.userId;
      } catch (err) {
        // Invalid token - clear it
        console.warn('Invalid auth token:', err);
        res.setHeader('Set-Cookie', serialize(COOKIE_NAME, '', {
          path: '/',
          expires: new Date(0)
        }));
      }
    }

    // Create context with auth info and cookie helpers
    const context = {
      req,
      res,
      state: {
        user: { userId, email: '' } // Add email if available
      },
      userId,
      getCookieValue: (name: string) => cookies[name],
      setCookie: (name: string, value: string, options: Record<string, unknown>) => {
        res.setHeader('Set-Cookie', serialize(name, value, options as Record<string, string | number | boolean>));
      },
      clearCookie: (name: string, options: Record<string, unknown>) => {
        res.setHeader('Set-Cookie', serialize(name, '', {
          ...(options as Record<string, string | number | boolean>),
          path: '/',
          expires: new Date(0)
        }));
      }
    };

    const apiHandler = apiHandlers[name];
    if (!apiHandler) {
      throw new Error(`API handler not found for name: ${name}`);
    }

    // Create a wrapped function that handles context internally
    const processWithContext = () => {
      const processFunc = apiHandler.process;

      try {
        // Now all process functions expect two parameters
        return (processFunc as (params: unknown, context: unknown) => Promise<unknown>)(params, context);
      } catch (error) {
        console.error(`Error processing API call ${name}:`, error);
        throw error;
      }
    };

    const result = await withCache(
      processWithContext,
      {
        key: name,
        params: { ...params, userId },
      },
      {
        bypassCache: options?.bypassCache || false,
        disableCache: options?.disableCache || false
      }
    );

    return result;
  } catch (error) {
    console.error('Error in processApiCall:', error);
    return { error: error instanceof Error ? error.message : 'An unknown error occurred' };
  }
};