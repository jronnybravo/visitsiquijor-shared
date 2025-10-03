interface Coordinates {
    latitude: number;
    longitude: number;
}
interface ProcessedLocation {
    name: string;
    type: string;
    municipality?: string;
    barangay?: string;
    road?: string;
    postcode?: string;
    coordinates: Coordinates;
    description?: string;
    displayName: string;
    fullAddress?: string;
    category: 'municipality' | 'barangay' | 'tourist_spot' | 'landmark' | 'road';
    source: 'nominatim' | 'overpass';
}
/**
 * Comprehensive location fetching from multiple sources
 */
export declare function fetchComprehensiveLocations(): Promise<ProcessedLocation[]>;
/**
 * Save comprehensive locations to JSON file
 */
export declare function generateComprehensiveDatabase(): Promise<void>;
export {};
//# sourceMappingURL=OnlineLocationFetcher.d.ts.map