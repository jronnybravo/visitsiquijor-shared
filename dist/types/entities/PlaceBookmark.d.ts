import type { User } from './User';
import type { Place } from './Place';
export interface PlaceBookmark {
    createdAt: string;
    user?: User;
    place?: Place;
    placeId: number;
}
//# sourceMappingURL=PlaceBookmark.d.ts.map