import type { User } from './User';
export interface RefreshToken {
    id: number;
    userId: number;
    token: string;
    expiresAt?: string;
    createdAt: string;
    updatedAt: string;
    deletedAt?: string;
    user?: User;
    isActive: boolean;
}
//# sourceMappingURL=RefreshToken.d.ts.map