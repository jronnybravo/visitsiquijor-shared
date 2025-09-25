import type { Administrator } from './Administrator';
import type { PlaceCategory } from './PlaceCategory';
import type { Event } from './Event';
import type { Advertisement } from './Advertisement';
import type { PlaceBookmark } from './PlaceBookmark';
export interface Place {
    id: number;
    name: string;
    description?: string;
    address: string;
    coordinates?: string;
    featureStartsOn?: string;
    featureEndsOn?: string;
    media?: any[];
    createdByAdministratorId?: number;
    createdAt: string;
    updatedAt: string;
    deletedAt?: string;
    createdByAdministrator?: Administrator;
    categories?: PlaceCategory[];
    events?: Event[];
    advertisements?: Advertisement[];
    bookmarks?: PlaceBookmark[];
    isFeatured: boolean;
    defaultImageUrl: string;
}
//# sourceMappingURL=Place.d.ts.map