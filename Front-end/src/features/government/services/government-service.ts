import {
  NATIONAL_GOVERNMENT_AGENCIES,
  STATE_SDMAS_DIRECTORY,
} from "../data/government-agencies";
import type {
  GovernmentAgency,
  StateSdmaInfo,
  GovernmentDirectoryFilterOptions,
} from "../types";

/**
 * Retrieve all national statutory agencies and scientific institutions.
 */
export function getAllGovernmentAgencies(): GovernmentAgency[] {
  return NATIONAL_GOVERNMENT_AGENCIES;
}

/**
 * Find a specific national agency by ID or Acronym (case-insensitive).
 */
export function getAgencyById(id: string): GovernmentAgency | undefined {
  if (!id) return undefined;
  const normalized = id.trim().toLowerCase();
  return NATIONAL_GOVERNMENT_AGENCIES.find(
    (a) => a.id.toLowerCase() === normalized || a.acronym.toLowerCase() === normalized
  );
}

/**
 * Retrieve all state and UT disaster management authorities.
 */
export function getAllStateSdmas(): StateSdmaInfo[] {
  return STATE_SDMAS_DIRECTORY;
}

/**
 * Find state SDMA by state name or acronym.
 */
export function getStateSdmaByName(query: string): StateSdmaInfo | undefined {
  if (!query) return undefined;
  const normalized = query.trim().toLowerCase();
  return STATE_SDMAS_DIRECTORY.find(
    (s) =>
      s.stateOrUtName.toLowerCase() === normalized ||
      s.acronym.toLowerCase() === normalized
  );
}

/**
 * Filter national agencies by jurisdiction, hazard focus, and search keywords.
 */
export function filterGovernmentAgencies(
  options: GovernmentDirectoryFilterOptions = {}
): GovernmentAgency[] {
  const { jurisdiction = "all", hazardFocus = "all", searchQuery = "" } = options;
  const normalizedQuery = searchQuery.trim().toLowerCase();

  let agencies = NATIONAL_GOVERNMENT_AGENCIES;

  if (jurisdiction !== "all") {
    agencies = agencies.filter((a) => a.jurisdiction === jurisdiction);
  }

  if (hazardFocus !== "all") {
    agencies = agencies.filter((a) =>
      a.specializedHazardFocus.some((h) => h.toLowerCase().includes(hazardFocus.toLowerCase()))
    );
  }

  if (!normalizedQuery) {
    return agencies;
  }

  return agencies.filter((a) => {
    const inName = a.name.toLowerCase().includes(normalizedQuery);
    const inAcronym = a.acronym.toLowerCase().includes(normalizedQuery);
    const inMandate = a.mandateAndRole.toLowerCase().includes(normalizedQuery);
    const inHazards = a.specializedHazardFocus.some((h) => h.toLowerCase().includes(normalizedQuery));
    const inCapabilities = a.operationalCapabilities.some((c) =>
      c.toLowerCase().includes(normalizedQuery)
    );
    const inPhone =
      a.tollFreeHelpline.includes(normalizedQuery) ||
      a.emergencyControlRoomNumber.includes(normalizedQuery);

    return inName || inAcronym || inMandate || inHazards || inCapabilities || inPhone;
  });
}

/**
 * Filter/search state SDMAs by state name, acronym, or hazard vulnerability.
 */
export function searchStateSdmas(searchQuery = ""): StateSdmaInfo[] {
  const normalizedQuery = searchQuery.trim().toLowerCase();
  if (!normalizedQuery) {
    return STATE_SDMAS_DIRECTORY;
  }

  return STATE_SDMAS_DIRECTORY.filter((s) => {
    const inState = s.stateOrUtName.toLowerCase().includes(normalizedQuery);
    const inAcronym = s.acronym.toLowerCase().includes(normalizedQuery);
    const inCity = s.headquartersCity.toLowerCase().includes(normalizedQuery);
    const inHazards = s.primaryDisasterVulnerabilities.some((v) =>
      v.toLowerCase().includes(normalizedQuery)
    );

    return inState || inAcronym || inCity || inHazards;
  });
}
