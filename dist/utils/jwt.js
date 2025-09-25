"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.extractTokenFromHeader = exports.verifyToken = exports.generateToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';
const generateToken = (payload) => {
    return jsonwebtoken_1.default.sign(payload, JWT_SECRET, {
        expiresIn: JWT_EXPIRES_IN,
    });
};
exports.generateToken = generateToken;
const verifyToken = (token) => {
    try {
        return jsonwebtoken_1.default.verify(token, JWT_SECRET);
    }
    catch (error) {
        throw new Error('Invalid or expired token');
    }
};
exports.verifyToken = verifyToken;
const extractTokenFromHeader = (authHeader) => {
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
exports.extractTokenFromHeader = extractTokenFromHeader;
//# sourceMappingURL=jwt.js.map