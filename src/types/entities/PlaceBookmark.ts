import type { Bookmark } from './Bookmark';
import type { User } from './User';
import type { Place } from './Place';

export interface PlaceBookmark extends Bookmark {
    user?: User;
    place?: Place;
    placeId: number;
}