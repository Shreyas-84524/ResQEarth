import { createAccuracyCircleGeoJson } from "../services/accuracy-circle";

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`Assertion failed: ${message}`);
  }
}

console.log("--- Starting GPS Accuracy Circle Unit Tests ---");

// 1. Accuracy Circle Feature Structure
const circleFeature = createAccuracyCircleGeoJson([72.8777, 19.076], 200, 32);

assert(circleFeature.type === "Feature", "Feature type is Feature");
assert(circleFeature.geometry.type === "Polygon", "Geometry type is Polygon");
assert(Array.isArray(circleFeature.geometry.coordinates), "Coordinates is an array");
const coords = circleFeature.geometry.coordinates as [number, number][][];
assert(coords[0].length === 33, "Circle contains 32 points + 1 closing coordinate");
assert(coords[0][0][0] === coords[0][32][0], "First and last longitude match (closed loop)");
assert(coords[0][0][1] === coords[0][32][1], "First and last latitude match (closed loop)");
assert(
  circleFeature.properties.title.includes("200m"),
  "Properties include accuracy label in meters"
);
console.log("✓ PASS: createAccuracyCircleGeoJson structure and loop closure");

// 2. Minimum radius clamping for tiny accuracy numbers
const tinyCircle = createAccuracyCircleGeoJson([72.8777, 19.076], 2, 16);
const tinyCoords = tinyCircle.geometry.coordinates as [number, number][][];
assert(tinyCoords[0].length === 17, "Clamped tiny circle has 17 points");
console.log("✓ PASS: Minimum radius clamping");

console.log("\nAll GPS Accuracy Circle unit tests passed successfully!\n");
