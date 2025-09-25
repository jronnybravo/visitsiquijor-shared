export interface JwtPayload {
    userId: string;
    username: string;
}
export declare const generateToken: (payload: JwtPayload) => string;
export declare const verifyToken: (token: string) => JwtPayload;
export declare const extractTokenFromHeader: (authHeader: string | undefined) => string;
//# sourceMappingURL=jwt.d.ts.map