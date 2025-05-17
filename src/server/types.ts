import { NextApiRequest, NextApiResponse } from 'next';

export interface User {
    userId: string;
    email: string;
}

export interface ApiHandlerContext {
    req: NextApiRequest;
    res: NextApiResponse;
    state: {
        user: User;
    };
} 