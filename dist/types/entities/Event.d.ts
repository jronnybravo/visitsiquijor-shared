import type { Administrator } from './Administrator';
import type { Place } from './Place';
import type { EventCategory } from './EventCategory';
import type { EventBookmark } from './EventBookmark';
export interface Event {
    id: number;
    name: string;
    description?: string;
    placeId?: number;
    address?: string;
    coordinates?: string;
    organizer?: string;
    startsOn: string;
    endsOn: string;
    featureStartsOn?: string;
    featureEndsOn?: string;
    media?: any[];
    createdByAdministratorId?: number;
    createdAt: string;
    updatedAt: string;
    deletedAt?: string;
    createdByAdministrator?: Administrator;
    place?: Place;
    categories?: EventCategory[];
    bookmarks?: EventBookmark[];
    isHappening: boolean;
    isUpcoming: boolean;
    isFeatured: boolean;
    defaultImageUrl: string;
}
//# sourceMappingURL=Event.d.ts.map