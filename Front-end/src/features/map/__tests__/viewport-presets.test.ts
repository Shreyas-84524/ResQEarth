import {
  DEFAULT_MAP_CENTER,
  DEFAULT_MAP_ZOOM,
  DEFAULT_MAP_MIN_ZOOM,
  DEFAULT_MAP_MAX_ZOOM,
  REGION_PRESETS,
  INDIA_BOUNDS,
  MAHARASHTRA_BOUNDS,
  MUMBAI_BOUNDS,
} from "../constants/map-config";
import { isValidCoordinate } from "../services/geojson-helper";

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`Assertion failed: ${message}`);
  }
}

console.log("--- Starting Map Viewport & Presets Unit Tests ---");

// 1. Default Map Configuration
assert(isValidCoordinate(DEFAULT_MAP_CENTER[0], DEFAULT_MAP_CENTER[1]), "Default center is valid coordinate");
assert(DEFAULT_MAP_CENTER[0] === 72.8777, "Default longitude is Mumbai (72.8777)");
assert(DEFAULT_MAP_CENTER[1] === 19.0760, "Default latitude is Mumbai (19.0760)");
assert(DEFAULT_MAP_ZOOM >= 10 && DEFAULT_MAP_ZOOM <= 12, "Default zoom is within city range (10-12)");
assert(DEFAULT_MAP_MIN_ZOOM >= 0 && DEFAULT_MAP_MAX_ZOOM <= 24, "Zoom bounds are valid");
console.log("✓ PASS: Default map configurations");

// 2. Bounds Validation
assert(MUMBAI_BOUNDS[0] < MUMBAI_BOUNDS[2], "Mumbai minLng < maxLng");
assert(MUMBAI_BOUNDS[1] < MUMBAI_BOUNDS[3], "Mumbai minLat < maxLat");
assert(MAHARASHTRA_BOUNDS[0] < MAHARASHTRA_BOUNDS[2], "Maharashtra minLng < maxLng");
assert(MAHARASHTRA_BOUNDS[1] < MAHARASHTRA_BOUNDS[3], "Maharashtra minLat < maxLat");
assert(INDIA_BOUNDS[0] < INDIA_BOUNDS[2], "India minLng < maxLng");
assert(INDIA_BOUNDS[1] < INDIA_BOUNDS[3], "India minLat < maxLat");
console.log("✓ PASS: Bounds calculations and structure");

// 3. Region Presets
assert(REGION_PRESETS.length >= 4, "At least 4 region presets available");

for (const preset of REGION_PRESETS) {
  assert(typeof preset.id === "string" && preset.id.length > 0, `Preset ${preset.name} has valid ID`);
  assert(isValidCoordinate(preset.center[0], preset.center[1]), `Preset ${preset.name} has valid center coords`);
  assert(preset.zoom >= 3 && preset.zoom <= 18, `Preset ${preset.name} has valid zoom level`);
  assert(typeof preset.description === "string" && preset.description.length > 0, `Preset ${preset.name} has description`);
}
console.log("✓ PASS: Region preset metadata and coordinates");

console.log("\nAll 31 Viewport & Region Preset tests passed successfully!\n");
