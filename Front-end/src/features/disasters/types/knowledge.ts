export type DisasterKnowledgeCategory = "natural" | "man-made";

export interface DisasterPhaseGuidance {
  before: string[];
  during: string[];
  after: string[];
}

export interface EmergencyKitItem {
  item: string;
  reason: string;
  essential: boolean;
}

export interface OfficialResourceLink {
  name: string;
  url: string;
  agency: string;
  description?: string;
}

export interface OfficialHelplineItem {
  agency: string;
  phone: string;
  note?: string;
}

export interface ScientificReference {
  title: string;
  source: string;
  year?: string;
  link?: string;
}

export interface DisasterGuide {
  slug: string;
  title: string;
  category: DisasterKnowledgeCategory;
  shortDescription: string;
  iconName: string;
  severityBaseline: "LOW" | "GUARDED" | "MODERATE" | "HIGH" | "CRITICAL";
  bannerDescription: string;
  definition: string;
  causes: string[];
  environmentalFactors: string[];
  warningSigns: string[];
  humanImpacts: string[];
  environmentalImpacts: string[];
  preventionStrategies: string[];
  phases: DisasterPhaseGuidance;
  emergencyKit: EmergencyKitItem[];
  whatNotToDo: string[];
  officialHelplines: OfficialHelplineItem[];
  officialResources: OfficialResourceLink[];
  references: ScientificReference[];
}

export interface DisasterGuideFilterOptions {
  category?: DisasterKnowledgeCategory | "all";
  searchQuery?: string;
}
