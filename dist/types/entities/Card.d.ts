import type { Visitor } from './Visitor';
import type { Administrator } from './Administrator';
export interface Card {
    id: number;
    visitorId: number;
    requestedByVisitorId: number;
    requestDatetime?: string;
    requestCoordinates?: string;
    printedByAdministratorId: number;
    printedAt?: string;
    claimedAt?: string;
    createdAt: string;
    deletedAt?: string;
    visitor?: Visitor;
    requestedByVisitor?: Visitor;
    printedByAdministrator?: Administrator;
}
//# sourceMappingURL=Card.d.ts.map