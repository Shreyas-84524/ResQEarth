import type { RiskLevel } from "@/types";
import type {
  GlobalDisasterCategory,
  CanonicalDisasterType,
} from "../types/global-disaster";

export const EONET_CONFIG = {
  baseUrl: "https://eonet.gsfc.nasa.gov/api/v3",
  eventsGeoJsonUrl: "https://eonet.gsfc.nasa.gov/api/v3/events/geojson",
  eventsJsonUrl: "https://eonet.gsfc.nasa.gov/api/v3/events",
  categoriesUrl: "https://eonet.gsfc.nasa.gov/api/v3/categories",
  defaultDays: 30,
  defaultStatus: "open" as const,
  cacheTtlMs: 10 * 60 * 1000, // 10 minutes cache
  timeoutMs: 45000, // 45s timeout for resilient EONET fetching
  sourceName: "NASA Earth Observatory (EONET v3)",
  sourceUrl: "https://eonet.gsfc.nasa.gov",
} as const;

export interface CategoryMetadata {
  key: GlobalDisasterCategory;
  title: string;
  disasterType: CanonicalDisasterType;
  color: string;
  badgeVariant: "default" | "secondary" | "destructive" | "outline";
}

export const GLOBAL_DISASTER_CATEGORIES: Record<string, CategoryMetadata> = {
  wildfires: {
    key: "wildfires",
    title: "Wildfires",
    disasterType: "wildfire",
    color: "#ea580c", // orange-600
    badgeVariant: "destructive",
  },
  severeStorms: {
    key: "severeStorms",
    title: "Severe Storms & Cyclones",
    disasterType: "cyclone",
    color: "#0284c7", // sky-600
    badgeVariant: "default",
  },
  volcanoes: {
    key: "volcanoes",
    title: "Volcanoes",
    disasterType: "volcano",
    color: "#dc2626", // red-600
    badgeVariant: "destructive",
  },
  floods: {
    key: "floods",
    title: "Floods",
    disasterType: "flood",
    color: "#2563eb", // blue-600
    badgeVariant: "default",
  },
  landslides: {
    key: "landslides",
    title: "Landslides",
    disasterType: "landslide",
    color: "#d97706", // amber-600
    badgeVariant: "secondary",
  },
  tempExtremes: {
    key: "tempExtremes",
    title: "Extreme Temperature",
    disasterType: "extreme-temperature",
    color: "#f59e0b", // amber-500
    badgeVariant: "secondary",
  },
  earthquakes: {
    key: "earthquakes",
    title: "Earthquakes",
    disasterType: "earthquake",
    color: "#9333ea", // purple-600
    badgeVariant: "default",
  },
  seaLakeIce: {
    key: "seaLakeIce",
    title: "Sea & Lake Ice",
    disasterType: "other",
    color: "#06b6d4", // cyan-500
    badgeVariant: "outline",
  },
  waterColor: {
    key: "waterColor",
    title: "Water Color Events",
    disasterType: "other",
    color: "#10b981", // emerald-500
    badgeVariant: "outline",
  },
};

/**
 * Maps raw EONET category ID to canonical ResQEarth DisasterType
 */
export function mapEonetCategoryToCanonicalType(
  categoryId: string,
  eventTitle: string = ""
): { disasterType: CanonicalDisasterType; categoryKey: GlobalDisasterCategory; categoryTitle: string } {
  const normId = categoryId.toLowerCase().trim();
  const normTitle = eventTitle.toLowerCase().trim();

  if (normId === "wildfires" || normTitle.includes("fire") || normTitle.includes("wildfire")) {
    return { disasterType: "wildfire", categoryKey: "wildfires", categoryTitle: "Wildfire" };
  }
  if (normId === "severestorms" || normTitle.includes("cyclone") || normTitle.includes("typhoon") || normTitle.includes("hurricane") || normTitle.includes("tropical storm")) {
    const isCyclone = normTitle.includes("cyclone") || normTitle.includes("typhoon") || normTitle.includes("hurricane");
    return {
      disasterType: isCyclone ? "cyclone" : "severe-storm",
      categoryKey: "severeStorms",
      categoryTitle: isCyclone ? "Tropical Cyclone" : "Severe Storm",
    };
  }
  if (normId === "volcanoes" || normTitle.includes("volcano") || normTitle.includes("eruption")) {
    return { disasterType: "volcano", categoryKey: "volcanoes", categoryTitle: "Volcano" };
  }
  if (normId === "floods" || normTitle.includes("flood") || normTitle.includes("inundation")) {
    return { disasterType: "flood", categoryKey: "floods", categoryTitle: "Flood" };
  }
  if (normId === "landslides" || normTitle.includes("landslide") || normTitle.includes("mudslide") || normTitle.includes("rockslide")) {
    return { disasterType: "landslide", categoryKey: "landslides", categoryTitle: "Landslide" };
  }
  if (normId === "tempextremes" || normTitle.includes("heat") || normTitle.includes("cold")) {
    return { disasterType: "extreme-temperature", categoryKey: "tempExtremes", categoryTitle: "Extreme Temperature" };
  }
  if (normId === "earthquakes" || normTitle.includes("earthquake")) {
    return { disasterType: "earthquake", categoryKey: "earthquakes", categoryTitle: "Earthquake" };
  }
  if (normId === "sealakeice") {
    return { disasterType: "other", categoryKey: "seaLakeIce", categoryTitle: "Sea & Lake Ice" };
  }
  if (normId === "watercolor") {
    return { disasterType: "other", categoryKey: "waterColor", categoryTitle: "Water Color" };
  }

  return {
    disasterType: "other",
    categoryKey: (categoryId as GlobalDisasterCategory) || "other",
    categoryTitle: categoryId || "Natural Event",
  };
}

/**
 * Calculates a standard ResQEarth RiskLevel severity for EONET natural events.
 * Clearly designated as ResQEarth-derived / EONET classification.
 */
export function calculateEonetSeverity(
  categoryKey: GlobalDisasterCategory,
  title: string = "",
  magnitudeValue?: number | null,
  magnitudeUnit?: string | null
): RiskLevel {
  const normTitle = title.toLowerCase();

  // 1. Tropical Cyclones / Typhoons / Hurricanes with wind speed
  if (categoryKey === "severeStorms") {
    if (normTitle.includes("super typhoon") || normTitle.includes("cat 5") || normTitle.includes("category 5")) {
      return "CRITICAL";
    }
    if (normTitle.includes("category 4") || normTitle.includes("category 3") || normTitle.includes("severe cyclone") || normTitle.includes("very severe")) {
      return "HIGH";
    }
    if (magnitudeValue && magnitudeUnit?.toLowerCase().includes("kts")) {
      if (magnitudeValue >= 115) return "CRITICAL"; // Cat 4+
      if (magnitudeValue >= 85) return "HIGH"; // Cat 2-3
      if (magnitudeValue >= 50) return "MODERATE"; // Tropical storm
      return "GUARDED";
    }
    return "MODERATE";
  }

  // 2. Volcanoes
  if (categoryKey === "volcanoes") {
    if (normTitle.includes("major eruption") || normTitle.includes("explosive")) {
      return "HIGH";
    }
    return "MODERATE";
  }

  // 3. Wildfires
  if (categoryKey === "wildfires") {
    if (normTitle.includes("complex") || normTitle.includes("evacuation") || normTitle.includes("state of emergency")) {
      return "HIGH";
    }
    if (magnitudeValue && magnitudeValue > 50000) {
      return "HIGH"; // Large acreage / area
    }
    return "MODERATE";
  }

  // 4. Floods
  if (categoryKey === "floods") {
    if (normTitle.includes("catastrophic") || normTitle.includes("flash flood emergency") || normTitle.includes("major")) {
      return "HIGH";
    }
    return "MODERATE";
  }

  // 5. Landslides
  if (categoryKey === "landslides") {
    return "MODERATE";
  }

  return "GUARDED";
}

/**
 * Dynamic marker radius in pixels for MapLibre vector layers
 */
export function getGlobalDisasterMarkerRadius(severity: RiskLevel): number {
  switch (severity) {
    case "CRITICAL":
      return 22;
    case "HIGH":
      return 17;
    case "MODERATE":
      return 13;
    case "GUARDED":
      return 10;
    case "LOW":
    default:
      return 8;
  }
}
