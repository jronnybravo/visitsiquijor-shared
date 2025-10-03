import type { CategoryType } from '../enums';
export interface Category {
    id: number;
    type: CategoryType;
    name: string;
    description?: string;
    parentId?: number;
    priority?: number;
    createdAt: string;
    updatedAt: string;
    deletedAt?: string;
    parent?: Category;
    children?: Category[];
}
//# sourceMappingURL=Category.d.ts.map