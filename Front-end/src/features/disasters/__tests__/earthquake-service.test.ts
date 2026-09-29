import {
  normalizeUsgsFeature,
  normalizeUsgsFeed,
  earthquakesToGeoJson,
  clearEarthquakeCache,
} from "../services/earthquake-service";
import {
  calculateEarthquakeSeverity,
  getEarthquakeMarkerRadius,
} from "../constants/earthquake-config";
import type {
  UsgsEarthquakeFeature,
  UsgsEarthquakeFeedResponse,
} from "../types/earthquake";

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`Assertion failed: ${message}`);
  }
}

console.log("--- Starting Earthquake Service & Normalization Unit Tests ---");

// 1. Severity Calculation Mapping
assert(calculateEarthquakeSeverity(2.1) === "LOW", "M 2.1 maps to LOW severity");
assert(calculateEarthquakeSeverity(3.8) === "GUARDED", "M 3.8 maps to GUARDED severity");
assert(calculateEarthquakeSeverity(5.2) === "MODERATE", "M 5.2 maps to MODERATE severity");
assert(calculateEarthquakeSeverity(6.4) === "HIGH", "M 6.4 maps to HIGH severity");
assert(calculateEarthquakeSeverity(7.8) === "CRITICAL", "M 7.8 maps to CRITICAL severity");
console.log("✓ PASS: Earthquake severity mapping tests");

// 2. Dynamic Marker Radius Scaling
assert(getEarthquakeMarkerRadius(0.8) === 5, "M 0.8 gets base radius 5");
assert(getEarthquakeMarkerRadius(2.5) === 7, "M 2.5 gets radius 7");
assert(getEarthquakeMarkerRadius(4.2) === 10, "M 4.2 gets radius 10");
assert(getEarthquakeMarkerRadius(5.5) === 14, "M 5.5 gets radius 14");
assert(getEarthquakeMarkerRadius(6.7) === 18, "M 6.7 gets radius 18");
assert(getEarthquakeMarkerRadius(7.5) === 24, "M 7.5 gets maximum radius 24");
console.log("✓ PASS: Earthquake marker radius scaling tests");

// 3. Valid Feature Normalization & Distance Calculation
const mockFeature: UsgsEarthquakeFeature = {
  type: "Feature",
  id: "us7000m99z",
  properties: {
    mag: 5.4,
    place: "65 km SW of Koyna Nagar, India",
    time: 1727654400000,
    updated: 1727658000000,
    url: "https://earthquake.usgs.gov/earthquakes/eventpage/us7000m99z",
    detail: "https://earthquake.usgs.gov/earthquakes/feed/v1.0/detail/us7000m99z.geojson",
    felt: 142,
    alert: "green",
    status: "reviewed",
    tsunami: 0,
    sig: 450,
    magType: "mww",
    type: "earthquake",
    title: "M 5.4 - 65 km SW of Koyna Nagar, India",
  },
  geometry: {
    type: "Point",
    coordinates: [73.5, 17.2, 12.5], // [lon, lat, depth_km]
  },
};

// Test normalized relative to Mumbai coordinates [72.8777, 19.0760]
const normalized = normalizeUsgsFeature(mockFeature, 19.076, 72.8777);

assert(Boolean(normalized), "Feature normalized successfully");
assert(normalized!.id === "usgs-us7000m99z", "ID formatted with usgs- prefix");
assert(normalized!.magnitude === 5.4, "Magnitude preserved");
assert(normalized!.depthKm === 12.5, "Depth in km preserved");
assert(normalized!.latitude === 17.2, "Latitude parsed from coordinate array");
assert(normalized!.longitude === 73.5, "Longitude parsed from coordinate array");
assert(normalized!.place === "65 km SW of Koyna Nagar, India", "Place preserved");
assert(normalized!.severity === "MODERATE", "Severity calculated as MODERATE");
assert(normalized!.status === "reviewed", "Status parsed as reviewed");
assert(normalized!.tsunamiAlert === false, "Tsunami alert is false");
assert(normalized!.feltReports === 142, "Felt reports count preserved");
assert(
  typeof normalized!.distanceKm === "number" &&
    normalized!.distanceKm > 150 &&
    normalized!.distanceKm < 300,
  "Distance to Mumbai calculated within expected range (~218km)"
);
console.log("✓ PASS: Valid USGS feature normalization & Haversine distance tests");

// 4. Tsunami Alert Flagging
const tsunamiFeature: UsgsEarthquakeFeature = {
  ...mockFeature,
  id: "us7000tsunami",
  properties: {
    ...mockFeature.properties,
    mag: 7.2,
    tsunami: 1,
    title: "M 7.2 - Off Coast of Northern Sumatra",
  },
};

const normalizedTsunami = normalizeUsgsFeature(tsunamiFeature);
assert(normalizedTsunami!.tsunamiAlert === true, "Tsunami alert flag parsed as true");
assert(normalizedTsunami!.severity === "CRITICAL", "M 7.2 calculated as CRITICAL severity");
console.log("✓ PASS: Tsunami alert flag and high-severity recognition tests");

// 5. Malformed Feature Handling & Resilience
const missingGeometry = {
  type: "Feature",
  id: "bad1",
  properties: mockFeature.properties,
} as unknown as UsgsEarthquakeFeature;
assert(normalizeUsgsFeature(missingGeometry) === null, "Missing geometry rejected");

const outOfRangeCoords: UsgsEarthquakeFeature = {
  ...mockFeature,
  geometry: {
    type: "Point",
    coordinates: [200, 95, 10], // Invalid coordinates
  },
};
assert(normalizeUsgsFeature(outOfRangeCoords) === null, "Out-of-range coordinates rejected");

const emptyProps: UsgsEarthquakeFeature = {
  type: "Feature",
  id: "partial1",
  properties: {} as UsgsEarthquakeFeature["properties"],
  geometry: {
    type: "Point",
    coordinates: [75.0, 20.0, 5.0],
  },
};
const normalizedPartial = normalizeUsgsFeature(emptyProps);
assert(Boolean(normalizedPartial), "Partial properties normalized safely with defaults");
assert(normalizedPartial!.magnitude === 0, "Default magnitude is 0");
assert(normalizedPartial!.place === "Location unspecified", "Default place provided");
console.log("✓ PASS: Malformed & partial feature rejection and resilience tests");

// 6. Full Feed Normalization & Sorting
const mockFeed: UsgsEarthquakeFeedResponse = {
  type: "FeatureCollection",
  metadata: {
    generated: Date.now(),
    url: "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson",
    title: "USGS Earthquakes Feed",
    status: 200,
    api: "1.0",
    count: 3,
  },
  features: [
    {
      ...mockFeature,
      id: "older-event",
      properties: { ...mockFeature.properties, time: 1727600000000, mag: 3.2 },
    },
    {
      ...mockFeature,
      id: "newest-event",
      properties: { ...mockFeature.properties, time: 1727690000000, mag: 6.1 },
    },
    outOfRangeCoords, // should be skipped
  ],
};

const feedResults = normalizeUsgsFeed(mockFeed, 19.076, 72.8777);
assert(feedResults.length === 2, "Valid 2 events parsed and invalid skipped");
assert(feedResults[0].id === "usgs-newest-event", "Events sorted newest first");
assert(feedResults[1].id === "usgs-older-event", "Older event placed second");
console.log("✓ PASS: Full feed normalization & chronological sorting tests");

// 7. GeoJSON FeatureCollection Generation for MapLibre
const geoJson = earthquakesToGeoJson(feedResults);
assert(geoJson.type === "FeatureCollection", "GeoJSON type is FeatureCollection");
assert(geoJson.features.length === 2, "GeoJSON contains 2 features");
assert(geoJson.features[0].geometry.type === "Point", "Geometry is Point");
assert(geoJson.features[0].properties!.category === "earthquake", "Category property is earthquake");
assert(typeof geoJson.features[0].properties!.markerRadius === "number", "markerRadius property attached");
console.log("✓ PASS: GeoJSON conversion for MapLibre layers tests");

// 8. Cache Clearing
clearEarthquakeCache();
console.log("✓ PASS: clearEarthquakeCache tests");

console.log("\nAll Earthquake Service unit tests passed successfully!\n");
