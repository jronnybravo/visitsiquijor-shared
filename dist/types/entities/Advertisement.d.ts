import type { Place } from './Place';
import type { Administrator } from './Administrator';
export interface Advertisement {
    id: number;
    name: string;
    description: string;
    placeId?: number;
    startsOn: string;
    endsOn?: string;
    media?: any[];
    createdByAdministratorId: number;
    createdAt: string;
    updatedAt: string;
    deletedAt?: string;
    place?: Place;
    createdByAdministrator?: Administrator;
}
//# sourceMappingURL=Advertisement.d.ts.map