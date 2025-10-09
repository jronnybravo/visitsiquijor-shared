import type { User } from './User';
import type { Card } from './Card';

export interface Visitor extends User {
    cards?: Card[];
    requestedCards?: Card[];
}