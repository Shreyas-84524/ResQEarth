import {
  getSeverityColorExpression,
  getCategoryColorExpression,
  getHazardRadiusExpression,
  getClusterColorExpression,
  getClusterRadiusExpression,
  getHeatmapColorRamp,
} from "../services/style-expressions";
import { SEVERITY_COLORS, CATEGORY_COLORS } from "../constants/map-layers";

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`Assertion failed: ${message}`);
  }
}

console.log("--- Starting MapLibre Style Expression Unit Tests ---");

// 1. Severity Color Expression
const sevExpr = getSeverityColorExpression() as unknown[];
assert(Array.isArray(sevExpr), "Severity expression is an array");
assert(sevExpr[0] === "match", "Root operator is match");
assert((sevExpr[1] as string[])[0] === "get" && (sevExpr[1] as string[])[1] === "severity", "Extracts severity property");
assert(sevExpr.includes(SEVERITY_COLORS.LOW), "Includes LOW color");
assert(sevExpr.includes(SEVERITY_COLORS.CRITICAL), "Includes CRITICAL color");
console.log("✓ PASS: getSeverityColorExpression tests");

// 2. Category Color Expression
const catExpr = getCategoryColorExpression() as unknown[];
assert(Array.isArray(catExpr), "Category expression is an array");
assert(catExpr[0] === "match", "Root operator is match");
assert((catExpr[1] as string[])[0] === "get" && (catExpr[1] as string[])[1] === "category", "Extracts category property");
assert(catExpr.includes(CATEGORY_COLORS.flood), "Includes flood color");
assert(catExpr.includes(CATEGORY_COLORS.earthquake), "Includes earthquake color");
console.log("✓ PASS: getCategoryColorExpression tests");

// 3. Hazard Radius Expression
const radExpr = getHazardRadiusExpression(8) as unknown[];
assert(Array.isArray(radExpr), "Radius expression is an array");
assert(radExpr[0] === "interpolate", "Root operator is interpolate");
assert((radExpr[1] as string[])[0] === "linear", "Interpolation type is linear");
assert((radExpr[2] as string[])[0] === "zoom", "Interpolates on zoom");
console.log("✓ PASS: getHazardRadiusExpression tests");

// 4. Cluster Expressions
const clusterColors = getClusterColorExpression() as unknown[];
assert(clusterColors[0] === "step", "Cluster color uses step operator");
assert((clusterColors[1] as string[])[0] === "get" && (clusterColors[1] as string[])[1] === "point_count", "Extracts point_count");

const clusterRadii = getClusterRadiusExpression() as unknown[];
assert(clusterRadii[0] === "step", "Cluster radius uses step operator");
assert((clusterRadii[1] as string[])[0] === "get" && (clusterRadii[1] as string[])[1] === "point_count", "Extracts point_count");
console.log("✓ PASS: Cluster expressions tests");

// 5. Heatmap Color Ramp
const heatRamp = getHeatmapColorRamp() as unknown[];
assert(Array.isArray(heatRamp), "Heatmap ramp is an array");
assert(heatRamp[0] === "interpolate", "Heatmap ramp uses interpolate");
assert(
  (Array.isArray(heatRamp[2]) && (heatRamp[2] as string[])[0] === "heatmap-density") ||
    heatRamp[2] === "heatmap-density",
  "Interpolates on heatmap-density"
);
console.log("✓ PASS: getHeatmapColorRamp tests");

console.log("\nAll 18 Style Expression tests passed successfully!\n");
