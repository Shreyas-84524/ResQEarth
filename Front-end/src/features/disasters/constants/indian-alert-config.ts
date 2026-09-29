import type { RiskLevel } from "@/types";
import type {
  CanonicalDisasterType,
  UnifiedDisasterCategory,
} from "../types/disaster-event";

export const INDIAN_ALERT_CONFIG = {
  sachetBaseUrl: "https://sachet.ndma.gov.in",
  sachetFeedUrl: "https://sachet.ndma.gov.in/CapFeed",
  imdBaseUrl: "https://mausam.imd.gov.in",
  imdNowcastRssUrl: "https://mausam.imd.gov.in/imd_latest/contents/dist_nowcast_rss.php",
  imdWarningsUrl: "https://mausam.imd.gov.in/api/warnings_district_api.php",
  cacheTtlMs: 5 * 60 * 1000, // 5 minutes cache
  timeoutMs: 8000, // 8 seconds timeout
  sourceNameNdma: "NDMA SACHET (National Disaster Management Authority)",
  sourceNameImd: "India Meteorological Department (IMD)",
  disclaimer: "Official alerts published by statutory authorities under the Disaster Management Act, 2005.",
} as const;

export interface IndianAlertAgencyMetadata {
  id: string;
  name: string;
  shortName: string;
  website: string;
  portalUrl: string;
  jurisdiction: "national" | "state" | "regional";
}

export const INDIAN_DISASTER_AGENCIES: Record<string, IndianAlertAgencyMetadata> = {
  ndma: {
    id: "ndma",
    name: "National Disaster Management Authority",
    shortName: "NDMA",
    website: "https://ndma.gov.in",
    portalUrl: "https://sachet.ndma.gov.in",
    jurisdiction: "national",
  },
  imd: {
    id: "imd",
    name: "India Meteorological Department",
    shortName: "IMD",
    website: "https://mausam.imd.gov.in",
    portalUrl: "https://city.imd.gov.in",
    jurisdiction: "national",
  },
  cwc: {
    id: "cwc",
    name: "Central Water Commission",
    shortName: "CWC",
    website: "https://cwc.gov.in",
    portalUrl: "https://ffs.india-water.gov.in",
    jurisdiction: "national",
  },
  incois: {
    id: "incois",
    name: "Indian National Centre for Ocean Information Services",
    shortName: "INCOIS",
    website: "https://incois.gov.in",
    portalUrl: "https://incois.gov.in/portal/osf/osf.jsp",
    jurisdiction: "national",
  },
  sdma_mh: {
    id: "sdma_mh",
    name: "Maharashtra State Disaster Management Authority",
    shortName: "MSDMA",
    website: "https://rfd.maharashtra.gov.in",
    portalUrl: "https://dmc.maharashtra.gov.in",
    jurisdiction: "state",
  },
  sdma_od: {
    id: "sdma_od",
    name: "Odisha State Disaster Management Authority",
    shortName: "OSDMA",
    website: "https://osdma.org",
    portalUrl: "https://osdma.org/early-warning",
    jurisdiction: "state",
  },
  sdma_kl: {
    id: "sdma_kl",
    name: "Kerala State Disaster Management Authority",
    shortName: "KSDMA",
    website: "https://sdma.kerala.gov.in",
    portalUrl: "https://sdma.kerala.gov.in/alerts",
    jurisdiction: "state",
  },
  sdma_uk: {
    id: "sdma_uk",
    name: "Uttarakhand State Disaster Management Authority",
    shortName: "USDMA",
    website: "https://usdma.uk.gov.in",
    portalUrl: "https://dmmc.uk.gov.in",
    jurisdiction: "state",
  },
  sdma_as: {
    id: "sdma_as",
    name: "Assam State Disaster Management Authority",
    shortName: "ASDMA",
    website: "https://asdma.assam.gov.in",
    portalUrl: "https://asdma.assam.gov.in/schemes/early-warning-system",
    jurisdiction: "state",
  },
};

/**
 * Maps Indian CAP Alert severity strings to standard ResQEarth RiskLevel
 */
export function mapIndianCapSeverity(capSeverity: string = ""): RiskLevel {
  const norm = capSeverity.toLowerCase().trim();
  switch (norm) {
    case "extreme":
    case "red":
      return "CRITICAL";
    case "severe":
    case "orange":
    case "amber":
      return "HIGH";
    case "moderate":
    case "yellow":
      return "MODERATE";
    case "minor":
    case "green":
      return "GUARDED";
    default:
      return "MODERATE";
  }
}

/**
 * Maps Indian CAP Alert event category to canonical ResQEarth DisasterType
 */
export function mapIndianCapEventToCanonicalType(
  event: string = "",
  headline: string = ""
): {
  disasterType: CanonicalDisasterType;
  categoryKey: UnifiedDisasterCategory;
  categoryTitle: string;
} {
  const combined = `${event} ${headline}`.toLowerCase();

  if (combined.includes("flood") || combined.includes("inundation") || combined.includes("waterlog")) {
    const isUrban = combined.includes("urban") || combined.includes("waterlog") || combined.includes("drain");
    return {
      disasterType: isUrban ? "urban-flood" : "flood",
      categoryKey: "floods",
      categoryTitle: isUrban ? "Urban Flood Advisory" : "Flood Warning",
    };
  }

  if (combined.includes("cyclone") || combined.includes("deep depression") || combined.includes("squall")) {
    return {
      disasterType: "cyclone",
      categoryKey: "severeStorms",
      categoryTitle: "Cyclone Advisory",
    };
  }

  if (combined.includes("thunderstorm") || combined.includes("lightning") || combined.includes("squall")) {
    return {
      disasterType: "severe-storm",
      categoryKey: "severeStorms",
      categoryTitle: "Severe Thunderstorm / Lightning",
    };
  }

  if (combined.includes("heavy rain") || combined.includes("very heavy rain") || combined.includes("downpour")) {
    return {
      disasterType: "heavy-rain",
      categoryKey: "weatherAlerts",
      categoryTitle: "Heavy Rainfall Alert",
    };
  }

  if (combined.includes("heat wave") || combined.includes("high temperature") || combined.includes("loo")) {
    return {
      disasterType: "heat-wave",
      categoryKey: "weatherAlerts",
      categoryTitle: "Heat Wave Advisory",
    };
  }

  if (combined.includes("cold wave") || combined.includes("frost") || combined.includes("ground frost")) {
    return {
      disasterType: "cold-wave",
      categoryKey: "weatherAlerts",
      categoryTitle: "Cold Wave Advisory",
    };
  }

  if (combined.includes("landslide") || combined.includes("debris flow") || combined.includes("rockfall")) {
    return {
      disasterType: "landslide",
      categoryKey: "landslides",
      categoryTitle: "Landslide Hazard Warning",
    };
  }

  if (combined.includes("earthquake") || combined.includes("tremor")) {
    return {
      disasterType: "earthquake",
      categoryKey: "earthquakes",
      categoryTitle: "Earthquake Advisory",
    };
  }

  if (combined.includes("tsunami") || combined.includes("storm surge") || combined.includes("high wave")) {
    return {
      disasterType: "tsunami",
      categoryKey: "severeStorms",
      categoryTitle: "Tsunami / High Wave Alert",
    };
  }

  if (combined.includes("chemical") || combined.includes("gas leak") || combined.includes("toxic")) {
    return {
      disasterType: "chemical-leak",
      categoryKey: "officialAlerts",
      categoryTitle: "Chemical Emergency Advisory",
    };
  }

  return {
    disasterType: "other",
    categoryKey: "officialAlerts",
    categoryTitle: event || "Official Government Warning",
  };
}
