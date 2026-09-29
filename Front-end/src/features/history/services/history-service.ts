import { INDIAN_HISTORICAL_DISASTERS } from "../data/indian-disasters";
import type { HistoricalDisasterEvent, HistoryFilterOptions } from "../types";

/**
 * Returns all historical disaster events sorted in descending chronological order (newest first).
 */
export function getAllHistoricalEvents(): HistoricalDisasterEvent[] {
  return [...INDIAN_HISTORICAL_DISASTERS].sort((a, b) => b.year - a.year);
}

/**
 * Get a specific historical disaster event by its identifier.
 */
export function getHistoricalEventById(id: string): HistoricalDisasterEvent | undefined {
  if (!id) return undefined;
  return INDIAN_HISTORICAL_DISASTERS.find((e) => e.id.toLowerCase() === id.toLowerCase());
}

/**
 * Filter historical events by type, state, decade, and keyword search.
 */
export function filterHistoricalEvents(
  options: HistoryFilterOptions = {}
): HistoricalDisasterEvent[] {
  const { disasterType = "all", state = "all", decade = "all", searchQuery = "" } = options;
  const normalizedQuery = searchQuery.trim().toLowerCase();

  let events = getAllHistoricalEvents();

  if (disasterType !== "all") {
    events = events.filter((e) => e.disasterType === disasterType);
  }

  if (state !== "all") {
    events = events.filter((e) => e.state.toLowerCase() === state.toLowerCase());
  }

  if (decade !== "all") {
    const decadeStart = parseInt(decade, 10);
    if (!isNaN(decadeStart)) {
      events = events.filter((e) => e.year >= decadeStart && e.year < decadeStart + 10);
    }
  }

  if (!normalizedQuery) {
    return events;
  }

  return events.filter((e) => {
    const inTitle = e.title.toLowerCase().includes(normalizedQuery);
    const inState = e.state.toLowerCase().includes(normalizedQuery);
    const inSummary = e.severitySummary.toLowerCase().includes(normalizedQuery);
    const inTrigger = e.meteorologicalOrGeologicalTrigger.toLowerCase().includes(normalizedQuery);
    const inLessons = e.policyAndInstitutionalLessonsLearned.some((l) =>
      l.toLowerCase().includes(normalizedQuery)
    );
    const inRegions = e.affectedRegions.some((r) => r.toLowerCase().includes(normalizedQuery));

    return inTitle || inState || inSummary || inTrigger || inLessons || inRegions;
  });
}

/**
 * Extract all unique decades represented in the dataset.
 */
export function getHistoricalDecades(): string[] {
  const years = INDIAN_HISTORICAL_DISASTERS.map((e) => e.year);
  const decades = Array.from(new Set(years.map((y) => Math.floor(y / 10) * 10))).sort((a, b) => b - a);
  return decades.map((d) => `${d}s`);
}

/**
 * Extract all unique Indian states present in the dataset.
 */
export function getHistoricalStates(): string[] {
  const states = Array.from(new Set(INDIAN_HISTORICAL_DISASTERS.map((e) => e.state))).sort();
  return states;
}

/**
 * Extract distinct disaster types present in the historical catalog.
 */
export function getHistoricalDisasterTypes(): string[] {
  const types = Array.from(new Set(INDIAN_HISTORICAL_DISASTERS.map((e) => e.disasterType))).sort();
  return types;
}

/**
 * Summary metrics of the historical archive.
 */
export function getHistoricalStatistics() {
  const totalEvents = INDIAN_HISTORICAL_DISASTERS.length;
  const years = INDIAN_HISTORICAL_DISASTERS.map((e) => e.year);
  const minYear = Math.min(...years);
  const maxYear = Math.max(...years);

  const typeCounts: Record<string, number> = {};
  for (const event of INDIAN_HISTORICAL_DISASTERS) {
    typeCounts[event.disasterType] = (typeCounts[event.disasterType] || 0) + 1;
  }

  return {
    totalEvents,
    yearSpan: `${minYear} – ${maxYear}`,
    typeCounts,
    uniqueStatesCount: getHistoricalStates().length,
  };
}
