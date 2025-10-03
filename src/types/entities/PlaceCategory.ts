import type { Category } from './Category';
import type { Place } from './Place';

export interface PlaceCategory extends Category {
    places?: Place[];
}