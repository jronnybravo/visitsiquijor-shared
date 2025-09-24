import { User } from './User';

export interface AccessLog {
    id: number;
    userId: number;
    ipAddress: string;
    createdAt: string;
    user?: User;
}