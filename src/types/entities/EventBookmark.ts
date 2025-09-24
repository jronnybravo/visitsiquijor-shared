import type { User } from './User';
import type { Event } from './Event';

export interface EventBookmark {
    createdAt: string;
    user?: User;
    event?: Event;
    eventId: number;
}