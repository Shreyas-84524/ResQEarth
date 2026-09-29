import {
  isValidCoordinate,
  pointsToFeatureCollection,
  computeBoundingBox,
  calculateHaversineDistanceKm,
  createCirclePolygonGeoJson,
  createEmptyFeatureCollection,
} from "../services/geojson-helper";

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`Assertion failed: ${message}`);
  }
}

console.log("--- Starting GeoJSON Helper Unit Tests ---");

// 1. Coordinate Validation
assert(isValidCoordinate(72.8777, 19.0760) === true, "Valid Mumbai coordinates pass");
assert(isValidCoordinate(0, 0) === true, "Origin coordinates pass");
assert(isValidCoordinate(180, 90) === true, "Boundary coordinates pass");
assert(isValidCoordinate(-180, -90) === true, "Negative boundary coordinates pass");
assert(isValidCoordinate(181, 10) === false, "Out of range longitude rejected");
assert(isValidCoordinate(10, 91) === false, "Out of range latitude rejected");
assert(isValidCoordinate(NaN, 10) === false, "NaN longitude rejected");
assert(isValidCoordinate(10, NaN) === false, "NaN latitude rejected");
console.log("✓ PASS: Coordinate validation tests");

// 2. Empty Feature Collection
const empty = createEmptyFeatureCollection();
assert(empty.type === "FeatureCollection", "Creates FeatureCollection");
assert(Array.isArray(empty.features) && empty.features.length === 0, "Features array is empty");
console.log("✓ PASS: Empty FeatureCollection tests");

// 3. pointsToFeatureCollection
const samplePoints = [
  { id: "evt-01", longitude: 72.8777, latitude: 19.076, title: "Mumbai Flood", category: "flood", severity: "HIGH" },
  { id: "evt-02", longitude: 73.8567, latitude: 18.5204, title: "Pune Rain", category: "weather", severity: "MODERATE" },
  { id: "evt-invalid", longitude: 999, latitude: 999, title: "Invalid", category: "none", severity: "LOW" },
];

const fc = pointsToFeatureCollection(samplePoints);
assert(fc.type === "FeatureCollection", "Generated type is FeatureCollection");
assert(fc.features.length === 2, "Filters out invalid coordinates (2/3 retained)");
assert(fc.features[0].geometry.type === "Point", "Geometry is Point");
const coords0 = fc.features[0].geometry.coordinates as number[];
assert(coords0[0] === 72.8777, "Correct longitude");
assert(coords0[1] === 19.076, "Correct latitude");
assert(fc.features[0].properties.title === "Mumbai Flood", "Preserves properties");
assert(fc.features[0].properties.severity === "HIGH", "Preserves severity");
console.log("✓ PASS: pointsToFeatureCollection conversion tests");

// 4. computeBoundingBox
const coords: [number, number][] = [
  [72.8, 18.9],
  [73.1, 19.3],
  [72.7, 19.1],
];

const bbox = computeBoundingBox(coords);
assert(bbox !== null, "BBox computed successfully");
if (bbox) {
  assert(bbox[0] === 72.7, "Min longitude correct");
  assert(bbox[1] === 18.9, "Min latitude correct");
  assert(bbox[2] === 73.1, "Max longitude correct");
  assert(bbox[3] === 19.3, "Max latitude correct");
}
assert(computeBoundingBox([]) === null, "Empty array returns null");
console.log("✓ PASS: computeBoundingBox tests");

// 5. calculateHaversineDistanceKm
// Distance between Mumbai (72.8777, 19.0760) and Pune (73.8567, 18.5204) is ~120 km
const distMumbaiPune = calculateHaversineDistanceKm(
  [72.8777, 19.0760],
  [73.8567, 18.5204]
);
assert(distMumbaiPune > 115 && distMumbaiPune < 125, `Mumbai-Pune distance expected ~120km, got ${distMumbaiPune}km`);

// Distance between identical points is 0
const distZero = calculateHaversineDistanceKm([72.8777, 19.0760], [72.8777, 19.0760]);
assert(distZero === 0, "Identical points distance is 0 km");
console.log("✓ PASS: calculateHaversineDistanceKm tests");

// 6. createCirclePolygonGeoJson
const circleFeature = createCirclePolygonGeoJson([72.8777, 19.0760], 10, 32);
assert(circleFeature.type === "Feature", "Circle feature is Feature");
assert(circleFeature.geometry.type === "Polygon", "Geometry is Polygon");
const circleCoords = circleFeature.geometry.coordinates as [number, number][][];
assert(circleCoords[0].length === 33, "Circle has 32 points + 1 closing point");
assert(circleCoords[0][0][0] === circleCoords[0][32][0], "Loop is closed");
console.log("✓ PASS: createCirclePolygonGeoJson tests");

console.log("\nAll 29 GeoJSON helper tests passed successfully!\n");
