import { Administrator } from './Administrator';

export interface Article {
    id: number;
    title: string;
    content: string;
    createdByAdministratorId: number;
    createdByAdministrator?: Administrator;
    createdAt: string;
    updatedAt: string;
    deletedAt?: string;
    defaultImageUrl: string;
}