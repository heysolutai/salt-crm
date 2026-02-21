import jwt from 'jsonwebtoken';
import { env } from './env.js';

export interface JwtPayload {
    sub: string;
    email: string;
    role: string;
    tenantId: string;
    type?: 'access' | 'refresh';
}

export function generateAccessToken(payload: Omit<JwtPayload, 'type'>): string {
    return jwt.sign(
        { ...payload, type: 'access' },
        env.JWT_SECRET,
        { expiresIn: env.JWT_EXPIRES_IN as any }
    );
}

export function generateRefreshToken(userId: string): string {
    return jwt.sign(
        { sub: userId, type: 'refresh' },
        env.JWT_SECRET,
        { expiresIn: env.JWT_REFRESH_EXPIRES_IN as any }
    );
}

export function verifyToken(token: string): JwtPayload {
    return jwt.verify(token, env.JWT_SECRET) as JwtPayload;
}

export function decodeToken(token: string): JwtPayload | null {
    try {
        return jwt.decode(token) as JwtPayload;
    } catch {
        return null;
    }
}
