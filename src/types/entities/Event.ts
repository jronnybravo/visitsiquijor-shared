import { Administrator } from './Administrator';
import { EventCategory } from './EventCategory';
import { EventBookmark } from './EventBookmark';

export interface Event {
    id: number;
    name: string;
    startsOn: string;
    endsOn: string;
    createdAt: string;
    updatedAt: string;
    deletedAt?: string;
    createdByAdministrator?: Administrator;
    categories?: EventCategory[];
    bookmarks?: EventBookmark[];
    isHappening: boolean;
    isUpcoming: boolean;
    isFeatured: boolean;
    defaultImageUrl: string;
}