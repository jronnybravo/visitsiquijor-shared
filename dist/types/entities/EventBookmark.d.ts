import type { Bookmark } from './Bookmark';
import type { User } from './User';
import type { Event } from './Event';
export interface EventBookmark extends Bookmark {
    user?: User;
    event?: Event;
    eventId: number;
}
//# sourceMappingURL=EventBookmark.d.ts.map