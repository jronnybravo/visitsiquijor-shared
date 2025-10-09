import type { Administrator } from './Administrator';
import type { ArticleStatus } from '../enums';
import type { IMedia } from '../../interfaces';
export interface Article {
    id: number;
    title: string;
    slug: string;
    content: string;
    featureStartsOn?: string;
    featureEndsOn?: string;
    featured: boolean;
    media?: IMedia[];
    createdByAdministratorId: number;
    createdByAdministrator?: Administrator;
    status: ArticleStatus;
    createdAt: string;
    updatedAt: string;
    deletedAt?: string;
    excerpt: string;
    images: any;
    videos: any;
    defaultImageUrl: string;
    isFeatured: boolean;
}
//# sourceMappingURL=Article.d.ts.map