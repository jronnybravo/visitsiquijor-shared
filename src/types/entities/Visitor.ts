import type { User } from './User';
import type { CardRequest } from './CardRequest';

export interface Visitor extends User {
    cardRequests?: CardRequest[];
}