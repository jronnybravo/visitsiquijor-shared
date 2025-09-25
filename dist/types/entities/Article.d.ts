import type { Administrator } from './Administrator';
export interface Article {
    id: number;
    title: string;
    slug: string;
    content: string;
    media?: any[];
    createdByAdministratorId: number;
    createdByAdministrator?: Administrator;
    createdAt: string;
    updatedAt: string;
    deletedAt?: string;
    defaultImageUrl: string;
}
//# sourceMappingURL=Article.d.ts.map