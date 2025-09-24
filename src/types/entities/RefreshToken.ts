import { User } from './User';

export interface RefreshToken {
    id: number;
    userId: number;
    createdAt: string;
    updatedAt: string;
    deletedAt?: string;
    user?: User;
    isActive: boolean;
}