import type { Place } from './Place';
import type { Administrator } from './Administrator';
import type { IMedia } from '../../interfaces';

export interface Advertisement {
    id: number;
    name: string;
    description: string;
    placeId?: number;
    startsOn: string;
    endsOn?: string;
    media?: IMedia[];
    createdByAdministratorId: number;
    createdAt: string;
    updatedAt: string;
    deletedAt?: string;
    place?: Place;
    createdByAdministrator?: Administrator;
    images: any;
    videos: any;
    defaultImageUrl: string;
}