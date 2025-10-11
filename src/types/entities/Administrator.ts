import type { User } from './User';
import type { Role } from './Role';
import type { Place } from './Place';
import type { Event } from './Event';
import type { CardRequest } from './CardRequest';
import type { Advertisement } from './Advertisement';
import type { Article } from './Article';

export interface Administrator extends User {
    roleId: number;
    permissions?: string[];
    role?: Role;
    createdRoles?: Role[];
    createdPlaces?: Place[];
    createdEvents?: Event[];
    printedCards?: CardRequest[];
    advertisements?: Advertisement[];
    createdArticles?: Article[];
}