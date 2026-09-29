import {
  extractCentroidAndType,
  normalizeEonetEvent,
  normalizeEonetFeed,
  globalDisastersToGeoJson,
  clearGlobalDisasterCache,
} from "../services/global-disaster-service";
import {
  mapEonetCategoryToCanonicalType,
  calculateEonetSeverity,
  getGlobalDisasterMarkerRadius,
} from "../constants/global-disaster-config";
import type {
  EonetGeoJsonFeature,
  EonetGeoJsonResponse,
} from "../types/global-disaster";

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`Assertion failed: ${message}`);
  }
}

console.log("--- Starting Global Disaster Service & NASA EONET Unit Tests ---");

// 1. Category Mapping to Canonical Types
const fireCat = mapEonetCategoryToCanonicalType("wildfires", "Bridge Fire Complex");
assert(fireCat.disasterType === "wildfire", "wildfires category maps to wildfire");
assert(fireCat.categoryKey === "wildfires", "categoryKey is wildfires");

const stormCat = mapEonetCategoryToCanonicalType("severeStorms", "Tropical Cyclone Biparjoy");
assert(stormCat.disasterType === "cyclone", "cyclone title maps to cyclone disasterType");
assert(stormCat.categoryTitle === "Tropical Cyclone", "categoryTitle is Tropical Cyclone");

const volcanoCat = mapEonetCategoryToCanonicalType("volcanoes", "Mount Semeru Eruption");
assert(volcanoCat.disasterType === "volcano", "volcanoes category maps to volcano");

const floodCat = mapEonetCategoryToCanonicalType("floods", "Monsoon Inundation in Assam");
assert(floodCat.disasterType === "flood", "floods category maps to flood");

const landslideCat = mapEonetCategoryToCanonicalType("landslides", "Wayanad Landslide");
assert(landslideCat.disasterType === "landslide", "landslides category maps to landslide");
console.log("✓ PASS: Category mapping tests");

// 2. Severity Classification Rules
assert(calculateEonetSeverity("severeStorms", "Super Typhoon Yagi", 130, "kts") === "CRITICAL", "Super Typhoon maps to CRITICAL");
assert(calculateEonetSeverity("severeStorms", "Category 4 Cyclone", 110, "kts") === "HIGH", "Cat 4 storm maps to HIGH");
assert(calculateEonetSeverity("severeStorms", "Tropical Storm Debby", 45, "kts") === "GUARDED", "Tropical storm maps to GUARDED");
assert(calculateEonetSeverity("volcanoes", "Major Explosive Eruption") === "HIGH", "Explosive eruption maps to HIGH");
assert(calculateEonetSeverity("wildfires", "Park Fire Complex") === "HIGH", "Complex wildfire maps to HIGH");
assert(calculateEonetSeverity("floods", "Seasonal River Overflow") === "MODERATE", "Regular flood maps to MODERATE");
console.log("✓ PASS: Severity classification tests");

// 3. Dynamic Marker Radius Scaling
assert(getGlobalDisasterMarkerRadius("CRITICAL") === 22, "CRITICAL gets radius 22");
assert(getGlobalDisasterMarkerRadius("HIGH") === 17, "HIGH gets radius 17");
assert(getGlobalDisasterMarkerRadius("MODERATE") === 13, "MODERATE gets radius 13");
assert(getGlobalDisasterMarkerRadius("GUARDED") === 10, "GUARDED gets radius 10");
assert(getGlobalDisasterMarkerRadius("LOW") === 8, "LOW gets radius 8");
console.log("✓ PASS: Dynamic marker radius scaling tests");

// 4. Geometry Centroid Extraction
// 4a. Point Geometry
const pointCentroid = extractCentroidAndType({
  type: "Point",
  coordinates: [73.5, 18.2],
  date: "2026-09-29T10:00:00Z",
});
assert(Boolean(pointCentroid), "Point geometry parsed");
assert(pointCentroid!.coordinates[0] === 73.5 && pointCentroid!.coordinates[1] === 18.2, "Point coordinates preserved");
assert(pointCentroid!.geometryType === "Point", "Point geometryType preserved");

// 4b. LineString Geometry (e.g. storm track)
const lineCentroid = extractCentroidAndType({
  type: "LineString",
  coordinates: [
    [70.0, 15.0],
    [72.0, 17.0],
    [74.0, 19.0],
  ],
  date: "2026-09-29T12:00:00Z",
});
assert(Boolean(lineCentroid), "LineString geometry parsed");
assert(Math.round(lineCentroid!.coordinates[0]) === 72 && Math.round(lineCentroid!.coordinates[1]) === 17, "LineString centroid computed as mean");
assert(lineCentroid!.geometryType === "LineString", "LineString geometryType preserved");

// 4c. Polygon Geometry (e.g. wildfire burn perimeter)
const polyCentroid = extractCentroidAndType({
  type: "Polygon",
  coordinates: [
    [
      [70.0, 10.0],
      [72.0, 10.0],
      [72.0, 12.0],
      [70.0, 12.0],
    ],
  ],
});
assert(Boolean(polyCentroid), "Polygon geometry parsed");
assert(polyCentroid!.coordinates[0] === 71.0 && polyCentroid!.coordinates[1] === 11.0, "Polygon centroid computed as mean of ring vertices");
assert(polyCentroid!.geometryType === "Polygon", "Polygon geometryType preserved");

// 4d. EONET Raw Geometry Array with Temporal History
const rawGeometryArray = [
  { date: "2026-09-27T00:00:00Z", type: "Point", coordinates: [68.0, 12.0] },
  { date: "2026-09-28T00:00:00Z", type: "Point", coordinates: [69.5, 14.5] },
  { date: "2026-09-29T00:00:00Z", type: "Point", coordinates: [71.0, 17.0], magnitudeValue: 75, magnitudeUnit: "kts" },
];
const temporalCentroid = extractCentroidAndType(rawGeometryArray);
assert(Boolean(temporalCentroid), "Temporal geometry array parsed");
assert(temporalCentroid!.coordinates[0] === 71.0 && temporalCentroid!.coordinates[1] === 17.0, "Latest coordinates chosen from temporal history");
assert(temporalCentroid!.date === "2026-09-29T00:00:00Z", "Latest timestamp chosen");
assert(temporalCentroid!.magnitudeValue === 75, "Magnitude value extracted");
console.log("✓ PASS: Geometry centroid extraction (Point, LineString, Polygon, Temporal array) tests");

// 5. Malformed Geometry Handling & Out-of-Range Rejection
assert(extractCentroidAndType(null) === null, "null geometry returns null");
assert(extractCentroidAndType({ type: "Point", coordinates: [200, 10] }) === null, "Out-of-range longitude (>180) rejected");
assert(extractCentroidAndType({ type: "Point", coordinates: [70, 95] }) === null, "Out-of-range latitude (>90) rejected");
assert(extractCentroidAndType({ type: "LineString", coordinates: [] }) === null, "Empty LineString rejected");
console.log("✓ PASS: Malformed & out-of-range geometry rejection tests");

// 6. Valid NASA EONET Feature Normalization & Distance Calculation
const mockEonetFeature: EonetGeoJsonFeature = {
  type: "Feature",
  id: "EONET_6241",
  properties: {
    id: "EONET_6241",
    title: "Tropical Cyclone Asna",
    description: "Deep depression tracking westward in the Arabian Sea",
    link: "https://eonet.gsfc.nasa.gov/api/v3/events/EONET_6241",
    closed: null,
    categories: [{ id: "severeStorms", title: "Severe Storms" }],
    sources: [
      { id: "JTWC", url: "https://www.metoc.navy.mil/jtwc/" },
      { id: "IMD", url: "https://mausam.imd.gov.in/" },
    ],
    date: "2026-09-28T18:00:00Z",
    magnitudeValue: 45,
    magnitudeUnit: "kts",
  },
  geometry: {
    type: "Point",
    coordinates: [68.5, 21.0], // Arabian Sea off Gujarat
  },
};

// Normalize relative to Mumbai [72.8777, 19.0760]
const normalizedStorm = normalizeEonetEvent(mockEonetFeature, 19.076, 72.8777);
assert(Boolean(normalizedStorm), "EONET storm feature normalized successfully");
assert(normalizedStorm!.id === "eonet-EONET_6241", "ID prefixed with eonet-");
assert(normalizedStorm!.disasterType === "cyclone", "DisasterType is cyclone");
assert(normalizedStorm!.categoryKey === "severeStorms", "Category key preserved");
assert(normalizedStorm!.latitude === 21.0, "Latitude preserved");
assert(normalizedStorm!.longitude === 68.5, "Longitude preserved");
assert(normalizedStorm!.isOpen === true, "isOpen is true");
assert(normalizedStorm!.sources.length === 2, "Sources array preserved");
assert(normalizedStorm!.primarySource.name === "JTWC", "Primary source extracted");
assert(
  typeof normalizedStorm!.distanceKm === "number" &&
    normalizedStorm!.distanceKm > 400 &&
    normalizedStorm!.distanceKm < 600,
  "Distance to Mumbai computed accurately (~490 km)"
);
console.log("✓ PASS: EONET feature normalization & Haversine distance tests");

// 7. Full Feed Normalization & Chronological Sorting
const mockFeed: EonetGeoJsonResponse = {
  type: "FeatureCollection",
  title: "EONET Events",
  features: [
    {
      ...mockEonetFeature,
      id: "older-fire",
      properties: {
        ...mockEonetFeature.properties,
        id: "older-fire",
        title: "Forest Fire - Satpura",
        categories: [{ id: "wildfires", title: "Wildfires" }],
        date: "2026-09-20T10:00:00Z",
      },
    },
    {
      ...mockEonetFeature,
      id: "newest-eruption",
      properties: {
        ...mockEonetFeature.properties,
        id: "newest-eruption",
        title: "Barren Island Volcano Eruption",
        categories: [{ id: "volcanoes", title: "Volcanoes" }],
        date: "2026-09-29T15:00:00Z",
      },
    },
    {
      type: "Feature",
      id: "bad-feature",
      properties: mockEonetFeature.properties,
      geometry: null, // should be safely skipped
    },
  ],
};

const feedResults = normalizeEonetFeed(mockFeed, 19.076, 72.8777);
assert(feedResults.length === 2, "2 valid features parsed and 1 null geometry skipped");
assert(feedResults[0].id === "eonet-newest-eruption", "Newest event placed first");
assert(feedResults[1].id === "eonet-older-fire", "Older event placed second");
console.log("✓ PASS: Feed normalization & chronological sorting tests");

// 8. GeoJSON FeatureCollection Generation for MapLibre
const geoJson = globalDisastersToGeoJson(feedResults);
assert(geoJson.type === "FeatureCollection", "GeoJSON type is FeatureCollection");
assert(geoJson.features.length === 2, "GeoJSON contains 2 features");
assert(geoJson.features[0].geometry.type === "Point", "GeoJSON geometry is Point");
assert(geoJson.features[0].properties!.category === "global-disaster", "Category property is global-disaster");
assert(typeof geoJson.features[0].properties!.markerRadius === "number", "markerRadius property attached");
console.log("✓ PASS: GeoJSON conversion for MapLibre tests");

// 9. Cache Management
clearGlobalDisasterCache();
console.log("✓ PASS: clearGlobalDisasterCache tests");

console.log("\nAll Global Disaster Service & NASA EONET unit tests passed successfully!\n");
