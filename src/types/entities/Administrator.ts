import type { User } from './User';
import type { Role } from './Role';
import type { Place } from './Place';
import type { Event } from './Event';
import type { Card } from './Card';
import type { Advertisement } from './Advertisement';
import type { Article } from './Article';

export interface Administrator extends User {
    roleId: number;
    permissions?: string[];
    role?: Role;
    createdRoles?: Role[];
    createdPlaces?: Place[];
    createdEvents?: Event[];
    printedCards?: Card[];
    advertisements?: Advertisement[];
    createdArticles?: Article[];
}