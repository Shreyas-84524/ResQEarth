import type { NormalizedLocation, ManualCityPreset } from "../types/geolocation";

/**
 * Standard Default Location: Mumbai Metropolitan, Maharashtra, India
 */
export const DEFAULT_FALLBACK_LOCATION: NormalizedLocation = {
  locality: "South Mumbai / Fort",
  city: "Mumbai",
  district: "Mumbai City",
  state: "Maharashtra",
  country: "India",
  formattedAddress: "South Mumbai / Fort, Mumbai City, Maharashtra, India",
  latitude: 19.0760,
  longitude: 72.8777,
  accuracyMeters: 500,
  source: "fallback",
  timestamp: new Date().toISOString(),
  postalCode: "400001",
};

/**
 * Storage Key for Current Session Persistence
 */
export const LOCATION_STORAGE_KEY = "resqearth_session_location_v1";

/**
 * OpenStreetMap Nominatim Reverse Geocoding Configuration
 */
export const NOMINATIM_CONFIG = {
  baseUrl: "https://nominatim.openstreetmap.org/reverse",
  userAgent: "ResQEarth-Disaster-Intelligence/1.0 (academic-ese-project@resqearth.local)",
  rateLimitDelayMs: 1000,
  timeoutMs: 6000,
  cacheTtlMs: 1000 * 60 * 60 * 24, // 24 hours
};

/**
 * Curated Preset Indian Cities and Disaster-Prone Zones for Manual Selection
 */
export const PRESET_INDIAN_CITIES: ManualCityPreset[] = [
  {
    id: "mumbai",
    name: "Mumbai",
    district: "Mumbai Suburban",
    state: "Maharashtra",
    country: "India",
    coordinates: [72.8777, 19.0760],
    isHighRiskZone: true,
    primaryHazard: "Urban Monsoon Inundation & Coastal High Tide",
  },
  {
    id: "pune",
    name: "Pune",
    district: "Pune",
    state: "Maharashtra",
    country: "India",
    coordinates: [73.8567, 18.5204],
    isHighRiskZone: false,
    primaryHazard: "Mutha River Basin Flood & Heavy Ghat Rains",
  },
  {
    id: "nagpur",
    name: "Nagpur",
    district: "Nagpur",
    state: "Maharashtra",
    country: "India",
    coordinates: [79.0882, 21.1458],
    isHighRiskZone: true,
    primaryHazard: "Severe Heat Wave & Flash Flooding",
  },
  {
    id: "nashik",
    name: "Nashik",
    district: "Nashik",
    state: "Maharashtra",
    country: "India",
    coordinates: [73.7898, 19.9975],
    isHighRiskZone: false,
    primaryHazard: "Godavari River Inundation",
  },
  {
    id: "delhi",
    name: "Delhi (NCR)",
    district: "Central Delhi",
    state: "Delhi",
    country: "India",
    coordinates: [77.2090, 28.6139],
    isHighRiskZone: true,
    primaryHazard: "Yamuna Flood, Seismic Zone IV & Severe Air Inversion",
  },
  {
    id: "bhubaneswar",
    name: "Bhubaneswar",
    district: "Khordha",
    state: "Odisha",
    country: "India",
    coordinates: [85.8245, 20.2961],
    isHighRiskZone: true,
    primaryHazard: "Tropical Cyclone & Coastal Storm Surge",
  },
  {
    id: "chennai",
    name: "Chennai",
    district: "Chennai",
    state: "Tamil Nadu",
    country: "India",
    coordinates: [80.2707, 13.0827],
    isHighRiskZone: true,
    primaryHazard: "Northeast Monsoon Urban Floods & Coastal Surge",
  },
  {
    id: "kolkata",
    name: "Kolkata",
    district: "Kolkata",
    state: "West Bengal",
    country: "India",
    coordinates: [88.3639, 22.5726],
    isHighRiskZone: true,
    primaryHazard: "Bay of Bengal Super Cyclones & Gangetic Tidal Floods",
  },
  {
    id: "kochi",
    name: "Kochi",
    district: "Ernakulam",
    state: "Kerala",
    country: "India",
    coordinates: [76.2673, 9.9312],
    isHighRiskZone: true,
    primaryHazard: "Extreme Inundation, Landslides & Coastal Erosion",
  },
  {
    id: "bengaluru",
    name: "Bengaluru",
    district: "Bengaluru Urban",
    state: "Karnataka",
    country: "India",
    coordinates: [77.5946, 12.9716],
    isHighRiskZone: false,
    primaryHazard: "Localized Urban Waterlogging & Heavy Thunderstorms",
  },
  {
    id: "hyderabad",
    name: "Hyderabad",
    district: "Hyderabad",
    state: "Telangana",
    country: "India",
    coordinates: [78.4867, 17.3850],
    isHighRiskZone: false,
    primaryHazard: "Musi River Overflow & Urban Flash Floods",
  },
  {
    id: "ahmedabad",
    name: "Ahmedabad",
    district: "Ahmedabad",
    state: "Gujarat",
    country: "India",
    coordinates: [72.5714, 23.0225],
    isHighRiskZone: true,
    primaryHazard: "Extreme Summer Heat Wave & Sabarmati Surge",
  },
  {
    id: "guwahati",
    name: "Guwahati",
    district: "Kamrup Metropolitan",
    state: "Assam",
    country: "India",
    coordinates: [91.7362, 26.1445],
    isHighRiskZone: true,
    primaryHazard: "Brahmaputra River Floods & Seismic Zone V",
  },
  {
    id: "shimla",
    name: "Shimla",
    district: "Shimla",
    state: "Himachal Pradesh",
    country: "India",
    coordinates: [77.1734, 31.1048],
    isHighRiskZone: true,
    primaryHazard: "Cloudbursts, Landslides & Flash Flooding",
  },
  {
    id: "dehradun",
    name: "Dehradun",
    district: "Dehradun",
    state: "Uttarakhand",
    country: "India",
    coordinates: [78.0322, 30.3165],
    isHighRiskZone: true,
    primaryHazard: "Flash Floods, Debris Flows & Seismic Zone IV",
  },
  {
    id: "patna",
    name: "Patna",
    district: "Patna",
    state: "Bihar",
    country: "India",
    coordinates: [85.1376, 25.5941],
    isHighRiskZone: true,
    primaryHazard: "Ganga River Basin Floods & Severe Inundation",
  },
];
