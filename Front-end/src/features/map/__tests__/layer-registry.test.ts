import {
  MAP_SOURCES,
  MAP_LAYERS,
  DEFAULT_LAYER_CATALOG,
  DEFAULT_CLUSTER_CONFIG,
} from "../constants/map-layers";

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`Assertion failed: ${message}`);
  }
}

console.log("--- Starting Layer Registry & Constants Unit Tests ---");

// 1. Source IDs
assert(typeof MAP_SOURCES.HAZARDS_POINT === "string", "Point hazard source defined");
assert(typeof MAP_SOURCES.HAZARDS_CLUSTER === "string", "Cluster hazard source defined");
assert(typeof MAP_SOURCES.EARTHQUAKES === "string", "Earthquakes source defined");
assert(typeof MAP_SOURCES.FLOOD_ZONES === "string", "Flood zones source defined");
console.log("✓ PASS: Map sources defined");

// 2. Layer IDs
assert(typeof MAP_LAYERS.HAZARD_CIRCLES === "string", "Hazard circles layer defined");
assert(typeof MAP_LAYERS.CLUSTERS === "string", "Clusters layer defined");
assert(typeof MAP_LAYERS.CLUSTER_COUNT === "string", "Cluster count layer defined");
assert(typeof MAP_LAYERS.HAZARD_HEATMAP === "string", "Hazard heatmap layer defined");
console.log("✓ PASS: Map layers defined");

// 3. Layer Catalog
assert(DEFAULT_LAYER_CATALOG.length >= 5, "Layer catalog has at least 5 layers");
for (const layer of DEFAULT_LAYER_CATALOG) {
  assert(typeof layer.id === "string" && layer.id.length > 0, `Layer ${layer.name} has ID`);
  assert(typeof layer.name === "string" && layer.name.length > 0, `Layer ${layer.id} has name`);
  assert(typeof layer.color === "string" && layer.color.startsWith("#"), `Layer ${layer.name} has hex color`);
  assert(typeof layer.visible === "boolean", `Layer ${layer.name} has visible boolean`);
}
console.log("✓ PASS: Layer catalog structure and types");

// 4. Cluster Configuration
assert(DEFAULT_CLUSTER_CONFIG.clusterRadius > 0, "Cluster radius is positive");
assert(DEFAULT_CLUSTER_CONFIG.clusterMaxZoom <= 20, "Cluster maxZoom is valid");
assert(DEFAULT_CLUSTER_CONFIG.colorSteps.length >= 3, "At least 3 cluster color steps");
console.log("✓ PASS: Cluster configuration presets");

console.log("\nAll 16 Layer Registry & Constants tests passed successfully!\n");
