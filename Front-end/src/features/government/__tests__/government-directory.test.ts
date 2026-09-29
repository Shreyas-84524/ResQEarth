import {
  getAllGovernmentAgencies,
  getAgencyById,
  getAllStateSdmas,
  getStateSdmaByName,
  filterGovernmentAgencies,
  searchStateSdmas,
} from "../services/government-service";
import {
  NATIONAL_GOVERNMENT_AGENCIES,
  STATE_SDMAS_DIRECTORY,
} from "../data/government-agencies";

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`Assertion failed: ${message}`);
  }
}

console.log("--- Starting Government Disaster Response Directory Tests (Sub-Phase 4.6) ---");

// 1. National Agencies Count
const nationalAgencies = getAllGovernmentAgencies();
assert(nationalAgencies.length >= 10, `Expected >= 10 national agencies, got ${nationalAgencies.length}`);
console.log(`✓ PASS: Loaded ${nationalAgencies.length} national statutory agencies`);

// 2. State SDMAs Count
const stateSdmas = getAllStateSdmas();
assert(stateSdmas.length >= 12, `Expected >= 12 state SDMAs, got ${stateSdmas.length}`);
console.log(`✓ PASS: Loaded ${stateSdmas.length} State Disaster Management Authorities`);

// 3. Direct ID and Acronym lookups
const ndma = getAgencyById("ndma");
assert(ndma !== undefined && ndma.acronym === "NDMA", "Found NDMA by id");

const imd = getAgencyById("IMD");
assert(imd !== undefined && imd.jurisdiction === "scientific-early-warning", "Found IMD by acronym");

const incois = getAgencyById("incois");
assert(incois !== undefined && incois.headquarters.includes("Hyderabad"), "Found INCOIS in Hyderabad");

const osdma = getStateSdmaByName("Odisha");
assert(osdma !== undefined && osdma.acronym === "OSDMA", "Found Odisha SDMA");
console.log("✓ PASS: National agency & SDMA lookup methods");

// 4. Filtering by Jurisdiction
const scientificAgencies = filterGovernmentAgencies({ jurisdiction: "scientific-early-warning" });
assert(scientificAgencies.length >= 4, `Expected >= 4 scientific agencies, got ${scientificAgencies.length}`);
assert(scientificAgencies.some((a) => a.acronym === "IMD"), "Includes IMD");
assert(scientificAgencies.some((a) => a.acronym === "CWC"), "Includes CWC");
assert(scientificAgencies.some((a) => a.acronym === "INCOIS"), "Includes INCOIS");
assert(scientificAgencies.some((a) => a.acronym === "GSI"), "Includes GSI");

const tacticalForces = filterGovernmentAgencies({ jurisdiction: "specialized-force" });
assert(tacticalForces.some((a) => a.acronym === "NDRF"), "Includes NDRF");
assert(tacticalForces.some((a) => a.acronym === "ICG"), "Includes Indian Coast Guard");
console.log("✓ PASS: Jurisdiction filtering");

// 5. Keyword search filtering
const radarSearch = filterGovernmentAgencies({ searchQuery: "Doppler" });
assert(radarSearch.some((a) => a.acronym === "IMD"), "Found IMD for Doppler keyword");

const cbrnSearch = filterGovernmentAgencies({ searchQuery: "CBRN" });
assert(cbrnSearch.some((a) => a.acronym === "NDRF"), "Found NDRF for CBRN keyword");

const landslideSdmas = searchStateSdmas("Landslide");
assert(landslideSdmas.some((s) => s.stateOrUtName === "Kerala"), "Found Kerala SDMA for Landslide");
assert(landslideSdmas.some((s) => s.stateOrUtName === "Uttarakhand"), "Found Uttarakhand USDMA for Landslide");
console.log("✓ PASS: Search filtering for agencies and state SDMAs");

// 6. Schema completeness validation for National Agencies
for (const agency of NATIONAL_GOVERNMENT_AGENCIES) {
  assert(agency.id.length >= 2, `Invalid id for ${agency.name}`);
  assert(agency.name.length >= 3, `Invalid name for ${agency.id}`);
  assert(agency.acronym.length >= 2, `Invalid acronym for ${agency.id}`);
  assert(
    ["national", "scientific-early-warning", "specialized-force", "state-sdma"].includes(
      agency.jurisdiction
    ),
    `Invalid jurisdiction for ${agency.id}`
  );
  assert(agency.parentMinistryOrDepartment.length >= 5, `Missing parent ministry for ${agency.id}`);
  assert(agency.headquarters.length >= 5, `Missing headquarters for ${agency.id}`);
  assert(agency.tollFreeHelpline.length >= 3, `Missing toll-free helpline for ${agency.id}`);
  assert(agency.emergencyControlRoomNumber.length >= 5, `Missing control room for ${agency.id}`);
  assert(agency.websiteUrl.startsWith("http"), `Invalid URL for ${agency.id}`);
  assert(agency.mandateAndRole.length >= 30, `Mandate too short for ${agency.id}`);
  assert(agency.specializedHazardFocus.length >= 1, `Missing hazard focus for ${agency.id}`);
  assert(agency.operationalCapabilities.length >= 2, `Expected >= 2 capabilities for ${agency.id}`);
  assert(agency.publicContactEmail.includes("@"), `Invalid email for ${agency.id}`);
}

// 7. Schema completeness validation for State SDMAs
for (const sdma of STATE_SDMAS_DIRECTORY) {
  assert(sdma.stateOrUtName.length >= 3, `Invalid state name: ${sdma.stateOrUtName}`);
  assert(sdma.agencyName.length >= 5, `Invalid agency name: ${sdma.agencyName}`);
  assert(sdma.acronym.length >= 2, `Invalid acronym: ${sdma.acronym}`);
  assert(sdma.headquartersCity.length >= 3, `Invalid city: ${sdma.headquartersCity}`);
  assert(sdma.emergencyHelpline.length >= 3, `Invalid helpline: ${sdma.emergencyHelpline}`);
  assert(sdma.stateControlRoomPhone.length >= 5, `Invalid phone: ${sdma.stateControlRoomPhone}`);
  assert(sdma.websiteUrl.startsWith("http"), `Invalid URL for ${sdma.acronym}`);
  assert(sdma.primaryDisasterVulnerabilities.length >= 2, `Expected >= 2 vulnerabilities for ${sdma.acronym}`);
}

console.log("✓ PASS: Complete schema & statutory verification across all national agencies and SDMAs");
console.log("=== ALL GOVERNMENT DIRECTORY TESTS PASSED ===");
