import type { Place } from './Place';
import type { CategoryType } from '../enums';
export interface PlaceCategory {
    id: number;
    type: CategoryType;
    name: string;
    description: string;
    parentId?: number;
    priority?: number;
    createdAt: string;
    updatedAt: string;
    deletedAt?: string;
    places?: Place[];
}
//# sourceMappingURL=PlaceCategory.d.ts.map