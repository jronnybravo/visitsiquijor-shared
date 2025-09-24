import { Administrator } from './Administrator';

export interface Card {
    id: number;
    visitorId: number;
    printedByAdministratorId: number;
    createdAt: string;
    deletedAt?: string;
    printedByAdministrator?: Administrator;
}