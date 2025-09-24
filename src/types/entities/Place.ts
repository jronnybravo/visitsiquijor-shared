import { Administrator } from './Administrator';
import { PlaceCategory } from './PlaceCategory';
import { Event } from './Event';
import { Advertisement } from './Advertisement';
import { PlaceBookmark } from './PlaceBookmark';

export interface Place {
    id: number;
    name: string;
    address: string;
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