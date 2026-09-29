export type HistoricalDisasterCategory =
  | "cyclone"
  | "earthquake"
  | "flood"
  | "tsunami"
  | "landslide"
  | "industrial"
  | "chemical"
  | "heat-wave"
  | "drought";

export interface HistoricalDisasterEvent {
  id: string;
  title: string;
  year: number;
  dateString: string;
  disasterType: HistoricalDisasterCategory;
  state: string;
  affectedRegions: string[];
  severitySummary: string;
  humanCasualties: string;
  economicOrInfrastructureLoss: string;
  environmentalImpact: string;
  meteorologicalOrGeologicalTrigger: string;
  responseHighlights: string[];
  policyAndInstitutionalLessonsLearned: string[];
  relevanceToEseCurriculum: string;
  officialReferences: {
    title: string;
    source: string;
    url?: string;
  }[];
}

export interface HistoryFilterOptions {
  disasterType?: HistoricalDisasterCategory | "all";
  state?: string | "all";
  decade?: string | "all";
  searchQuery?: string;
}
