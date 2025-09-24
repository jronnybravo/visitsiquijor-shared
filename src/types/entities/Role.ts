import { Administrator } from './Administrator';

export interface Role {
    id: number;
    description: string;
    permissions: string[];
    createdByAdministrator?: Administrator;
    administrators?: Administrator[];
}