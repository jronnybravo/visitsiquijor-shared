import type { Administrator } from './Administrator';
import type { PlaceCategory } from './PlaceCategory';
import type { Event } from './Event';
import type { Advertisement } from './Advertisement';
import type { PlaceBookmark } from './PlaceBookmark';
import type { IMedia } from '../../interfaces';
export interface Place {
    id: number;
    name: string;
    description?: string;
    address: string;
    coordinates?: string;
    featureStartsOn?: string;
    featureEndsOn?: string;
    media?: IMedia[];
    createdByAdministratorId?: number;
    createdAt: string;
    updatedAt: string;
    deletedAt?: string;
    createdByAdministrator?: Administrator;
    categories?: PlaceCategory[];
    events?: Event[];
    advertisements?: Advertisement[];
    bookmarks?: PlaceBookmark[];
    images: any;
    videos: any;
    defaultImageUrl: string;
    isFeatured: boolean;
}
//# sourceMappingURL=Place.d.ts.map