import type { Administrator } from './Administrator';
import type { Place } from './Place';
import type { EventCategory } from './EventCategory';
import type { EventBookmark } from './EventBookmark';
import type { IMedia } from '../../interfaces';

export interface Event {
    id: number;
    name: string;
    description?: string;
    placeId?: number;
    address?: string;
    coordinates?: string;
    organizer?: string;
    startsOn: string;
    endsOn?: string;
    featureStartsOn?: string;
    featureEndsOn?: string;
    media?: IMedia[];
    createdByAdministratorId?: number;
    createdAt: string;
    updatedAt: string;
    deletedAt?: string;
    createdByAdministrator?: Administrator;
    place?: Place;
    categories?: EventCategory[];
    bookmarks?: EventBookmark[];
    isHappeningToday: boolean;
    isUpcoming: boolean;
    images: any;
    videos: any;
    defaultImageUrl: string;
    isFeatured: boolean;
}