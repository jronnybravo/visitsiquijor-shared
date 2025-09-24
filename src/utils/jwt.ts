import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';

export interface JwtPayload {
    userId: string;
    username: string;
}

export const generateToken = (payload: JwtPayload): string => {
    return jwt.sign(payload, JWT_SECRET, {
        expiresIn: JWT_EXPIRES_IN,
    } as jwt.SignOptions);
};

export const verifyToken = (token: string): JwtPayload => {
    try {
        return jwt.verify(token, JWT_SECRET) as JwtPayload;
    } catch (error) {
        throw new Error('Invalid or expired token');
    }
};

export const extractTokenFromHeader = (authHeader: string | undefined): string => {
    if (!authHeader) {
        throw new Error('Authorization header is missing');
    }

    if (!authHeader.startsWith('Bearer ')) {
        throw new Error('Authorization header must start with Bearer');
    }

    const token = authHeader.substring(7);
    if (!token) {
        throw new Error('Token is missing from authorization header');
    }

    return token;
};
