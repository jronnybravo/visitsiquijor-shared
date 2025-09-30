import type { Administrator } from './Administrator';

export interface Role {
    id: number;
    name: string;
    description: string;
    createdByAdministratorId?: number;
    permissions: string[];
    createdByAdministrator?: Administrator;
    administrators?: Administrator[];
}