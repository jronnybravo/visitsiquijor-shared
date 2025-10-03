"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchComprehensiveLocations = fetchComprehensiveLocations;
exports.generateComprehensiveDatabase = generateComprehensiveDatabase;
const axios_1 = __importDefault(require("axios"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const SIQUIJOR_BBOX = {
    south: 9.05,
    west: 123.35,
    north: 9.35,
    east: 123.75
};
const MUNICIPALITIES = [
    'Enrique Villanueva',
    'Larena',
    'Lazi',
    'Maria',
    'San Juan',
    'Siquijor'
];
/**
 * Fetch locations from OpenStreetMap Nominatim API
 */
async function fetchFromNominatim(query, limit = 50) {
    try {
        console.log(`🔍 Searching Nominatim for: ${query}`);
        const response = await axios_1.default.get('https://nominatim.openstreetmap.org/search', {
            params: {
                q: query,
                format: 'json',
                addressdetails: 1,
                extratags: 1,
                namedetails: 1,
                limit: limit,
                countrycodes: 'ph',
                bounded: 1,
                viewbox: `${SIQUIJOR_BBOX.west},${SIQUIJOR_BBOX.south},${SIQUIJOR_BBOX.east},${SIQUIJOR_BBOX.north}`,
                dedupe: 1
            },
            headers: {
                'User-Agent': 'VisitSiquijor/1.0 (https://visitsiquijor.com)'
            },
            timeout: 10000
        });
        console.log(`✅ Found ${response.data.length} results from Nominatim`);
        return response.data;
    }
    catch (error) {
        console.error(`❌ Nominatim search failed for "${query}":`, error instanceof Error ? error.message : String(error));
        return [];
    }
}
/**
 * Fetch locations from Overpass API (OpenStreetMap data)
 */
async function fetchFromOverpass(query) {
    try {
        console.log(`🔍 Searching Overpass for: ${query}`);
        const overpassQuery = `
      [out:json][timeout:25];
      (
        ${query}
      );
      out geom;
    `;
        const response = await axios_1.default.post('https://overpass-api.de/api/interpreter', overpassQuery, {
            headers: {
                'Content-Type': 'text/plain',
                'User-Agent': 'VisitSiquijor/1.0 (https://visitsiquijor.com)'
            },
            timeout: 30000
        });
        const elements = response.data.elements || [];
        console.log(`✅ Found ${elements.length} results from Overpass`);
        return elements;
    }
    catch (error) {
        console.error(`❌ Overpass search failed for "${query}":`, error instanceof Error ? error.message : String(error));
        return [];
    }
}
/**
 * Process and categorize locations
 */
function processLocation(location, source) {
    try {
        let name = '';
        let coordinates;
        let type = '';
        let category = 'landmark';
        let municipality = '';
        let barangay = '';
        let road = '';
        let postcode = '';
        if (source === 'nominatim') {
            name = location.name || location.display_name.split(',')[0];
            coordinates = {
                latitude: parseFloat(location.lat),
                longitude: parseFloat(location.lon)
            };
            type = location.type || location.class;
            // Extract detailed address from Nominatim address object
            if (location.address) {
                municipality = location.address.town || location.address.city || '';
                barangay = location.address.village || location.address.hamlet || location.address.neighbourhood || '';
                road = location.address.road || location.address.street || '';
                postcode = location.address.postcode || '';
            }
            // Fallback to parsing display_name if address object isn't available
            if (!municipality) {
                const addressParts = location.display_name.split(',');
                municipality = addressParts.find((part) => MUNICIPALITIES.some(mun => part.trim().toLowerCase().includes(mun.toLowerCase())))?.trim() || '';
            }
        }
        else { // overpass
            name = location.tags?.name || location.tags?.['name:en'] || 'Unnamed';
            coordinates = location.lat && location.lon ? {
                latitude: location.lat,
                longitude: location.lon
            } : location.center ? {
                latitude: location.center.lat,
                longitude: location.center.lon
            } : { latitude: 0, longitude: 0 };
            type = location.tags?.amenity || location.tags?.tourism || location.tags?.place || location.tags?.highway || 'unknown';
            // Extract address from Overpass tags
            municipality = location.tags?.['addr:city'] || '';
            barangay = location.tags?.['addr:suburb'] || location.tags?.['addr:village'] || '';
            road = location.tags?.['addr:street'] || '';
            postcode = location.tags?.['addr:postcode'] || '';
        }
        // Categorize location
        if (MUNICIPALITIES.some(mun => name.toLowerCase().includes(mun.toLowerCase()))) {
            category = 'municipality';
        }
        else if (type === 'village' || type === 'hamlet' || type === 'neighbourhood') {
            category = 'barangay';
        }
        else if (['tourism', 'attraction', 'beach', 'waterfall', 'cave', 'church', 'heritage'].some(t => type.includes(t))) {
            category = 'tourist_spot';
        }
        else if (['highway', 'road', 'street', 'path'].some(t => type.includes(t))) {
            category = 'road';
        }
        else {
            category = 'landmark';
        }
        // Build comprehensive address components
        const addressParts = [name];
        if (road && road !== name)
            addressParts.push(road);
        if (barangay && barangay !== name)
            addressParts.push(`Brgy. ${barangay}`);
        if (municipality && municipality !== name)
            addressParts.push(municipality);
        addressParts.push('Siquijor');
        if (postcode)
            addressParts.push(postcode);
        const fullAddress = addressParts.join(', ');
        const displayName = municipality ? `${name}, ${municipality}` : name;
        return {
            name,
            type,
            municipality,
            barangay,
            road,
            postcode,
            coordinates,
            displayName,
            fullAddress,
            category,
            source
        };
    }
    catch (error) {
        console.error('Error processing location:', error);
        return null;
    }
}
/**
 * Comprehensive location fetching from multiple sources
 */
async function fetchComprehensiveLocations() {
    console.log('🚀 Starting comprehensive location fetching from online APIs...\n');
    const allLocations = [];
    // 1. Search for Siquijor general locations
    console.log('📍 Phase 1: General Siquijor locations');
    const generalQueries = [
        'Siquijor, Philippines',
        'Siquijor Island, Philippines',
        'tourist attractions Siquijor',
        'beaches Siquijor',
        'waterfalls Siquijor',
        'churches Siquijor',
        'schools Siquijor',
        'hospitals Siquijor',
        'markets Siquijor'
    ];
    for (const query of generalQueries) {
        await new Promise(resolve => setTimeout(resolve, 1000)); // Rate limiting
        const results = await fetchFromNominatim(query, 50);
        results.forEach(result => {
            const processed = processLocation(result, 'nominatim');
            if (processed && processed.coordinates.latitude !== 0) {
                allLocations.push(processed);
            }
        });
    }
    // 2. Search each municipality individually
    console.log('\n📍 Phase 2: Municipality-specific searches');
    for (const municipality of MUNICIPALITIES) {
        const municipalityQueries = [
            `${municipality}, Siquijor`,
            `barangay ${municipality}`,
            `attractions ${municipality} Siquijor`,
            `places ${municipality} Siquijor`
        ];
        for (const query of municipalityQueries) {
            await new Promise(resolve => setTimeout(resolve, 1000)); // Rate limiting
            const results = await fetchFromNominatim(query, 30);
            results.forEach(result => {
                const processed = processLocation(result, 'nominatim');
                if (processed && processed.coordinates.latitude !== 0) {
                    allLocations.push(processed);
                }
            });
        }
    }
    // 3. Use Overpass API for specific features
    console.log('\n📍 Phase 3: Overpass API queries');
    const overpassQueries = [
        // Tourist attractions
        `node["tourism"](${SIQUIJOR_BBOX.south},${SIQUIJOR_BBOX.west},${SIQUIJOR_BBOX.north},${SIQUIJOR_BBOX.east});`,
        `way["tourism"](${SIQUIJOR_BBOX.south},${SIQUIJOR_BBOX.west},${SIQUIJOR_BBOX.north},${SIQUIJOR_BBOX.east});`,
        // Amenities
        `node["amenity"](${SIQUIJOR_BBOX.south},${SIQUIJOR_BBOX.west},${SIQUIJOR_BBOX.north},${SIQUIJOR_BBOX.east});`,
        `way["amenity"](${SIQUIJOR_BBOX.south},${SIQUIJOR_BBOX.west},${SIQUIJOR_BBOX.north},${SIQUIJOR_BBOX.east});`,
        // Places
        `node["place"](${SIQUIJOR_BBOX.south},${SIQUIJOR_BBOX.west},${SIQUIJOR_BBOX.north},${SIQUIJOR_BBOX.east});`,
        // Natural features
        `node["natural"](${SIQUIJOR_BBOX.south},${SIQUIJOR_BBOX.west},${SIQUIJOR_BBOX.north},${SIQUIJOR_BBOX.east});`,
        `way["natural"](${SIQUIJOR_BBOX.south},${SIQUIJOR_BBOX.west},${SIQUIJOR_BBOX.north},${SIQUIJOR_BBOX.east});`,
        // Buildings
        `node["building"](${SIQUIJOR_BBOX.south},${SIQUIJOR_BBOX.west},${SIQUIJOR_BBOX.north},${SIQUIJOR_BBOX.east});`,
        // Highways and roads
        `way["highway"](${SIQUIJOR_BBOX.south},${SIQUIJOR_BBOX.west},${SIQUIJOR_BBOX.north},${SIQUIJOR_BBOX.east});`
    ];
    for (const query of overpassQueries) {
        await new Promise(resolve => setTimeout(resolve, 2000)); // Longer delay for Overpass
        const results = await fetchFromOverpass(query);
        results.forEach(result => {
            const processed = processLocation(result, 'overpass');
            if (processed && processed.coordinates.latitude !== 0) {
                allLocations.push(processed);
            }
        });
    }
    // 4. Deduplicate and filter results
    console.log('\n🔄 Deduplicating and filtering results...');
    const uniqueLocations = new Map();
    allLocations.forEach(location => {
        // Create unique key based on coordinates (rounded) and name
        const key = `${Math.round(location.coordinates.latitude * 1000)}-${Math.round(location.coordinates.longitude * 1000)}-${location.name.toLowerCase()}`;
        if (!uniqueLocations.has(key)) {
            // Filter out obviously invalid or too generic names
            const invalidNames = ['unnamed', 'unknown', 'siquijor island', 'central visayas'];
            if (!invalidNames.some(invalid => location.name.toLowerCase().includes(invalid))) {
                uniqueLocations.set(key, location);
            }
        }
    });
    const finalLocations = Array.from(uniqueLocations.values());
    console.log(`\n✅ Comprehensive location fetching completed!`);
    console.log(`📊 Total unique locations found: ${finalLocations.length}`);
    // Group by category for summary
    const categories = finalLocations.reduce((acc, loc) => {
        acc[loc.category] = (acc[loc.category] || 0) + 1;
        return acc;
    }, {});
    console.log('📋 Breakdown by category:');
    Object.entries(categories).forEach(([category, count]) => {
        console.log(`   ${category}: ${count}`);
    });
    return finalLocations;
}
/**
 * Save comprehensive locations to JSON file
 */
async function generateComprehensiveDatabase() {
    try {
        const locations = await fetchComprehensiveLocations();
        // Organize locations by category
        const database = {
            municipalities: locations.filter(l => l.category === 'municipality'),
            barangays: locations.filter(l => l.category === 'barangay'),
            tourist_spots: locations.filter(l => l.category === 'tourist_spot'),
            landmarks: locations.filter(l => l.category === 'landmark'),
            roads: locations.filter(l => l.category === 'road'),
            metadata: {
                generated_at: new Date().toISOString(),
                total_locations: locations.length,
                data_sources: ['nominatim', 'overpass'],
                bbox: SIQUIJOR_BBOX
            }
        };
        // Save to file
        const outputPath = path_1.default.join(__dirname, '..', 'data', 'siquijor-locations-comprehensive.json');
        const dir = path_1.default.dirname(outputPath);
        if (!fs_1.default.existsSync(dir)) {
            fs_1.default.mkdirSync(dir, { recursive: true });
        }
        const jsonContent = JSON.stringify(database, null, 2);
        fs_1.default.writeFileSync(outputPath, jsonContent, 'utf8');
        console.log(`\n💾 Comprehensive database saved to: ${outputPath}`);
        console.log(`📊 File size: ${(jsonContent.length / 1024).toFixed(2)} KB`);
        console.log(`🎉 Successfully generated comprehensive Siquijor locations database!`);
    }
    catch (error) {
        console.error('❌ Error generating comprehensive database:', error);
        throw error;
    }
}
//# sourceMappingURL=OnlineLocationFetcher.js.map