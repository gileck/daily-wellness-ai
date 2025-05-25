import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { login } from '../index';
import {
    ApiHandlerContext,
    LoginRequest,
    LoginResponse,
} from '../types';
import * as users from '@/server/database/collections/users/users';
import { JWT_SECRET, JWT_EXPIRES_IN, COOKIE_NAME, COOKIE_OPTIONS, sanitizeUser } from '../server';

// Login endpoint
export const loginUser = async (
    request: LoginRequest,
    context: ApiHandlerContext
): Promise<LoginResponse> => {
    try {
        // Validate input
        if (!request.email || !request.password) {
            return { error: "Email and password are required" };
        }

        // Find user by email
        const user = await users.findUserByEmail(request.email);
        if (!user) {
            return { error: "Invalid email or password" };
        }

        // Verify password
        const isPasswordValid = await bcrypt.compare(request.password, user.password_hash);
        if (!isPasswordValid) {
            return { error: "Invalid email or password" };
        }

        // Generate JWT token
        const token = jwt.sign(
            { userId: user._id.toHexString() },
            JWT_SECRET,
            { expiresIn: JWT_EXPIRES_IN }
        );

        // Set auth cookie
        // console.log('Setting cookie with:', { COOKIE_NAME, token: token.substring(0, 20) + '...', COOKIE_OPTIONS });
        context.setCookie(COOKIE_NAME, token, COOKIE_OPTIONS);
        // console.log('Cookie set successfully');

        return { user: sanitizeUser(user) };
    } catch (error: unknown) {
        console.error("Login error:", error);
        return { error: error instanceof Error ? error.message : "Login failed" };
    }
};

// Export API endpoint name
export { login }; 