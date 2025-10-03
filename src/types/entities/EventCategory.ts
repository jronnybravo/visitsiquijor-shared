import type { Category } from './Category';
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
    parent?: Category;
    children?: Category[];
    events?: Event[];
}