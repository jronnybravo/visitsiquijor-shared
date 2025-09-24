import { Place } from './Place';
import { Administrator } from './Administrator';

export interface Advertisement {
    id: number;
    name: string;
    description: string;
    startsOn: string;
    createdByAdministratorId: number;
    createdAt: string;
    updatedAt: string;
    deletedAt?: string;
    place?: Place | null;
    createdByAdministrator?: Administrator;
}