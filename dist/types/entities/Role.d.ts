import type { Administrator } from './Administrator';
export interface Role {
    id: number;
    name: string;
    description: string;
    createdByAdministratorId?: number;
    permissions: any[];
    createdByAdministrator?: Administrator;
    administrators?: Administrator[];
}
//# sourceMappingURL=Role.d.ts.map