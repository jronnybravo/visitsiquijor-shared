import type { User } from './User';
export interface UserEmail {
    userId: number;
    email: string;
    isPrimary: boolean;
    verifiedAt?: string;
    user?: User;
}
//# sourceMappingURL=UserEmail.d.ts.map