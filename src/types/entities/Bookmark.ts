import type { BookmarkTarget } from '../enums';

export interface Bookmark {
    userId: number;
    target: BookmarkTarget;
    createdAt: string;
}