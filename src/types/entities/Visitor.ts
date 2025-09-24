import { Card } from './Card';

export interface Visitor {
    id: number;
    cards?: Card[];
}