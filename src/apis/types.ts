import { NextApiRequest, NextApiResponse } from 'next';
import { User } from '@/server/types';

export type ApiHandlers = Record<string, {
  process: ((params: unknown, context: ApiHandlerContext) => Promise<unknown>);
}>

export type ErrorResponse = {
  error: string;
};

export interface ApiHandlerContext {
  req: NextApiRequest;
  res: NextApiResponse;
  state: {
    user: User;
  };
  userId?: string; // Optional: User may not be authenticated (legacy)
  getCookieValue: (name: string) => string | undefined;
  setCookie: (name: string, value: string, options?: Record<string, unknown>) => void;
  clearCookie: (name: string, options?: Record<string, unknown>) => void;
}
