import { UserEmail } from './UserEmail';
import { RefreshToken } from './RefreshToken';
import { PlaceBookmark } from './PlaceBookmark';
import { EventBookmark } from './EventBookmark';
import { AccessLog } from './AccessLog';
import { Role } from './Role';
import { Place } from './Place';
import { Event } from './Event';
import { Card } from './Card';
import { Advertisement } from './Advertisement';
import { Article } from './Article';

export interface User {
    id: number;
    firstName: string;
    lastName: string;
    createdAt: string;
    updatedAt: string;
    deletedAt?: string;
    emails?: UserEmail[];
    refreshTokens?: RefreshToken[];
    placeBookmarks?: PlaceBookmark[];
    eventBookmarks?: EventBookmark[];
    accessLogs?: AccessLog[];
    roleId: number;
    role?: Role;
    createdRoles?: Role[];
    createdPlaces?: Place[];
    createdEvents?: Event[];
    printedCards?: Card[];
    advertisements?: Advertisement[];
    createdArticles?: Article[];
    cards?: Card[];
    fullName: string;
    age: number;
    isAdult: boolean;
}