import type { UserEmail } from './UserEmail';
import type { RefreshToken } from './RefreshToken';
import type { PlaceBookmark } from './PlaceBookmark';
import type { EventBookmark } from './EventBookmark';
import type { AccessLog } from './AccessLog';
import type { Gender, UserType } from '../enums';

export interface User {
    id: number;
    username?: string;
    firstName: string;
    lastName: string;
    birthdate?: string;
    address: string;
    nationality?: string;
    gender?: Gender;
    type: UserType;
    imageUrl?: string;
    createdAt: string;
    updatedAt: string;
    deletedAt?: string;
    emails?: UserEmail[];
    refreshTokens?: RefreshToken[];
    placeBookmarks?: PlaceBookmark[];
    eventBookmarks?: EventBookmark[];
    accessLogs?: AccessLog[];
    fullName: string;
    age: number;
    isAdult: boolean;
}