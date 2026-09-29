import type { ExpressionSpecification } from "maplibre-gl";
import { SEVERITY_COLORS, CATEGORY_COLORS } from "../constants/map-layers";

/**
 * Builds a MapLibre match expression mapping feature 'severity' property to hex colors
 */
export function getSeverityColorExpression(fallbackColor: string = "#f59e0b"): ExpressionSpecification {
  return [
    "match",
    ["get", "severity"],
    "LOW",
    SEVERITY_COLORS.LOW,
    "GUARDED",
    SEVERITY_COLORS.GUARDED,
    "MODERATE",
    SEVERITY_COLORS.MODERATE,
    "HIGH",
    SEVERITY_COLORS.HIGH,
    "CRITICAL",
    SEVERITY_COLORS.CRITICAL,
    fallbackColor,
  ];
}

/**
 * Builds a MapLibre match expression mapping feature 'category' to brand category colors
 */
export function getCategoryColorExpression(fallbackColor: string = "#3b82f6"): ExpressionSpecification {
  return [
    "match",
    ["get", "category"],
    "flood",
    CATEGORY_COLORS.flood,
    "cyclone",
    CATEGORY_COLORS.cyclone,
    "earthquake",
    CATEGORY_COLORS.earthquake,
    "wildfire",
    CATEGORY_COLORS.wildfire,
    "landslide",
    CATEGORY_COLORS.landslide,
    "chemical",
    CATEGORY_COLORS.chemical,
    "weather",
    CATEGORY_COLORS.weather,
    fallbackColor,
  ];
}

/**
 * Builds a zoom-interpolated circle radius expression for hazard point markers
 */
export function getHazardRadiusExpression(baseRadius: number = 7): ExpressionSpecification {
  return [
    "interpolate",
    ["linear"],
    ["zoom"],
    3,
    baseRadius * 0.7,
    8,
    baseRadius,
    14,
    baseRadius * 1.8,
  ];
}

/**
 * Builds a cluster circle color step expression based on point_count
 */
export function getClusterColorExpression(
  steps: Array<{ count: number; color: string }> = [
    { count: 10, color: "#3b82f6" },
    { count: 25, color: "#f59e0b" },
    { count: 50, color: "#ea580c" },
    { count: 100, color: "#dc2626" },
  ]
): ExpressionSpecification {
  const expr: (string | number | ExpressionSpecification)[] = ["step", ["get", "point_count"], steps[0].color];
  for (let i = 1; i < steps.length; i++) {
    expr.push(steps[i - 1].count);
    expr.push(steps[i].color);
  }
  return expr as ExpressionSpecification;
}

/**
 * Builds a cluster circle radius step expression based on point_count
 */
export function getClusterRadiusExpression(
  steps: Array<{ count: number; radius: number }> = [
    { count: 10, radius: 18 },
    { count: 25, radius: 24 },
    { count: 50, radius: 30 },
    { count: 100, radius: 36 },
  ]
): ExpressionSpecification {
  const expr: (string | number | ExpressionSpecification)[] = ["step", ["get", "point_count"], steps[0].radius];
  for (let i = 1; i < steps.length; i++) {
    expr.push(steps[i - 1].count);
    expr.push(steps[i].radius);
  }
  return expr as ExpressionSpecification;
}

/**
 * Builds a standard heatmap color gradient expression
 */
export function getHeatmapColorRamp(): ExpressionSpecification {
  return [
    "interpolate",
    ["linear"],
    ["heatmap-density"],
    0,
    "rgba(0, 0, 255, 0)",
    0.2,
    "rgb(0, 200, 255)",
    0.4,
    "rgb(0, 255, 100)",
    0.6,
    "rgb(255, 220, 0)",
    0.8,
    "rgb(255, 100, 0)",
    1.0,
    "rgb(220, 0, 0)",
  ];
}
