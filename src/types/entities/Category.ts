import { Place } from './Place';
import { Event } from './Event';

export interface Category {
    id: number;
    name: string;
    description: string;
    createdAt: string;
    updatedAt: string;
    deletedAt?: string;
    places?: Place[];
    events?: Event[];
}