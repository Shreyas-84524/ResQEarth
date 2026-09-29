export type AgencyJurisdiction = "national" | "scientific-early-warning" | "specialized-force" | "state-sdma";

export interface GovernmentAgency {
  id: string;
  name: string;
  acronym: string;
  jurisdiction: AgencyJurisdiction;
  parentMinistryOrDepartment: string;
  headquarters: string;
  tollFreeHelpline: string;
  emergencyControlRoomNumber: string;
  websiteUrl: string;
  mandateAndRole: string;
  specializedHazardFocus: string[];
  operationalCapabilities: string[];
  capStandardParticipation: boolean;
  publicContactEmail: string;
}

export interface StateSdmaInfo {
  stateOrUtName: string;
  agencyName: string;
  acronym: string;
  headquartersCity: string;
  emergencyHelpline: string;
  stateControlRoomPhone: string;
  websiteUrl: string;
  primaryDisasterVulnerabilities: string[];
}

export interface GovernmentDirectoryFilterOptions {
  jurisdiction?: AgencyJurisdiction | "all";
  hazardFocus?: string | "all";
  searchQuery?: string;
}
