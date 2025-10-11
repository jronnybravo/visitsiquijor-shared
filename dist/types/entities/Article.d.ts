import type { Administrator } from './Administrator';
import type { ArticleStatus } from '../enums';
export interface Article {
    id: number;
    title: string;
    slug: string;
    content: string;
    featureStartsOn?: string;
    featureEndsOn?: string;
    featured: boolean;
    imageUrl?: string | null;
    createdByAdministratorId: number;
    createdByAdministrator?: Administrator;
    status: ArticleStatus;
    createdAt: string;
    updatedAt: string;
    deletedAt?: string;
    excerpt: string;
    isFeatured: boolean;
}
//# sourceMappingURL=Article.d.ts.map