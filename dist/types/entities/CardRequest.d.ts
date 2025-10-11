import type { Visitor } from './Visitor';
import type { Administrator } from './Administrator';
export interface CardRequest {
    id: number;
    visitorId: number;
    requestCoordinates?: string;
    printedByAdministratorId?: number;
    printedAt?: string;
    claimedAt?: string;
    createdAt: string;
    deletedAt?: string;
    visitor?: Visitor;
    printedByAdministrator?: Administrator;
    claimed: boolean;
    printed: boolean;
}
//# sourceMappingURL=CardRequest.d.ts.map