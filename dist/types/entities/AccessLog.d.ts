import type { User } from './User';
export interface AccessLog {
    id: number;
    userId: number;
    ipAddress: string;
    coordinates?: string;
    createdAt: string;
    user?: User;
}
//# sourceMappingURL=AccessLog.d.ts.map