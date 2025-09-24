import type { Event } from './Event';
import type { CategoryType } from '../enums';

export interface EventCategory {
    id: number;
    type: CategoryType;
    name: string;
    description: string;
    parentId?: number;
    priority?: number;
    createdAt: string;
    updatedAt: string;
    deletedAt?: string;
    events?: Event[];
}