import {
  normalizeNominatimAddress,
  findNearestPresetCity,
  manualCityToNormalizedLocation,
  clearGeocodeCache,
} from "../services/reverse-geocoding";
import { PRESET_INDIAN_CITIES } from "../constants/geolocation-defaults";
import type { NominatimReverseResponse } from "../types/geolocation";

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`Assertion failed: ${message}`);
  }
}

console.log("--- Starting Reverse Geocoding Unit Tests ---");

// 1. Nominatim Response Normalization
const mockNominatimResponse: NominatimReverseResponse = {
  place_id: 12345,
  licence: "Data © OpenStreetMap contributors",
  osm_type: "node",
  osm_id: 67890,
  lat: "19.0760",
  lon: "72.8777",
  display_name: "Bandra West, Mumbai Suburban, Maharashtra, 400050, India",
  address: {
    suburb: "Bandra West",
    city_district: "Mumbai Suburban",
    city: "Mumbai",
    state: "Maharashtra",
    country: "India",
    postcode: "400050",
    country_code: "in",
  },
};

const normalized = normalizeNominatimAddress(
  mockNominatimResponse,
  19.076,
  72.8777,
  25,
  "gps"
);

assert(normalized.locality === "Bandra West", "Normalized locality matches suburb");
assert(normalized.city === "Mumbai", "Normalized city matches Mumbai");
assert(normalized.district === "Mumbai Suburban", "Normalized district matches city_district");
assert(normalized.state === "Maharashtra", "Normalized state matches Maharashtra");
assert(normalized.country === "India", "Normalized country matches India");
assert(normalized.latitude === 19.076, "Normalized latitude matches");
assert(normalized.longitude === 72.8777, "Normalized longitude matches");
assert(normalized.accuracyMeters === 25, "Accuracy preserved");
assert(normalized.source === "gps", "Source matches gps");
assert(normalized.postalCode === "400050", "Postal code preserved");
assert(normalized.formattedAddress.includes("Bandra West"), "Formatted address contains locality");
console.log("✓ PASS: normalizeNominatimAddress tests");

// 2. Offline Nearest Preset City Lookup
// Coordinates close to Mumbai
const nearestToNaviMumbai = findNearestPresetCity(19.033, 73.0297);
assert(nearestToNaviMumbai.city.name === "Mumbai", "Navi Mumbai coordinates map closest to Mumbai");
assert(nearestToNaviMumbai.distanceKm < 30, "Distance to Mumbai is under 30km");

// Coordinates close to Pune
const nearestToPimpri = findNearestPresetCity(18.6298, 73.7997);
assert(nearestToPimpri.city.name === "Pune", "Pimpri coordinates map closest to Pune");
assert(nearestToPimpri.distanceKm < 20, "Distance to Pune is under 20km");

// Coordinates close to Delhi
const nearestToNoida = findNearestPresetCity(28.5355, 77.391);
assert(nearestToNoida.city.name === "Delhi (NCR)", "Noida coordinates map closest to Delhi");
console.log("✓ PASS: findNearestPresetCity offline fallback tests");

// 3. Manual City to Normalized Location
const punePreset = PRESET_INDIAN_CITIES.find((c) => c.name === "Pune")!;
const manualPune = manualCityToNormalizedLocation(punePreset);
assert(manualPune.city === "Pune", "Manual city is Pune");
assert(manualPune.state === "Maharashtra", "Manual state is Maharashtra");
assert(manualPune.source === "manual", "Source is set to manual");
assert(manualPune.latitude === 18.5204, "Latitude matches Pune coordinates");
assert(manualPune.longitude === 73.8567, "Longitude matches Pune coordinates");
console.log("✓ PASS: manualCityToNormalizedLocation tests");

// 4. Cache Clearing
clearGeocodeCache();
console.log("✓ PASS: clearGeocodeCache tests");

console.log("\nAll Reverse Geocoding unit tests passed successfully!\n");
