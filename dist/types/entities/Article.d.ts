import type { Administrator } from './Administrator';
import type { ArticleStatus } from '../enums';
export interface Article {
    id: number;
    title: string;
    slug: string;
    content: string;
    featureStartsOn?: string;
    featureEndsOn?: string;
    createdByAdministratorId: number;
    status: ArticleStatus;
    imageUrl?: string;
    createdAt: string;
    updatedAt: string;
    deletedAt?: string;
    createdByAdministrator?: Administrator;
    excerpt: string;
    isFeatured: boolean;
}
//# sourceMappingURL=Article.d.ts.map