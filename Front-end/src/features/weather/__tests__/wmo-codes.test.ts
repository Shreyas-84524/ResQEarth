import {
  getWmoWeatherInterpretation,
  WMO_WEATHER_CODES,
  DEFAULT_WEATHER_INTERPRETATION,
} from "../constants/wmo-codes";

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`Assertion failed: ${message}`);
  }
}

console.log("--- Starting WMO Weather Interpretation Unit Tests ---");

// 1. Standard WMO Codes
const clearSky = getWmoWeatherInterpretation(0);
assert(clearSky.label === "Clear Sky", "Code 0 maps to Clear Sky");
assert(clearSky.severity === "low", "Clear sky has low hazard severity");
assert(clearSky.iconCategory === "clear", "Icon category is clear");

const heavyRain = getWmoWeatherInterpretation(65);
assert(heavyRain.label === "Heavy Rain", "Code 65 maps to Heavy Rain");
assert(heavyRain.severity === "high", "Heavy rain has high hazard severity");
assert(heavyRain.iconCategory === "rain", "Icon category is rain");

const severeStorm = getWmoWeatherInterpretation(99);
assert(severeStorm.label === "Severe Thunderstorm with Heavy Hail", "Code 99 maps to Severe Thunderstorm");
assert(severeStorm.severity === "critical", "Severe storm with hail has critical severity");
assert(severeStorm.iconCategory === "thunderstorm", "Icon category is thunderstorm");

const denseFog = getWmoWeatherInterpretation(45);
assert(denseFog.label === "Fog", "Code 45 maps to Fog");
assert(denseFog.severity === "moderate", "Fog has moderate severity");
assert(denseFog.iconCategory === "fog", "Icon category is fog");

console.log("✓ PASS: Standard WMO weather code mapping tests");

// 2. Unknown and Boundary WMO Codes
const unknownCode = getWmoWeatherInterpretation(999);
assert(
  unknownCode.label === DEFAULT_WEATHER_INTERPRETATION.label,
  "Unknown code 999 falls back to default interpretation"
);

const undefinedCode = getWmoWeatherInterpretation(undefined);
assert(
  undefinedCode.label === DEFAULT_WEATHER_INTERPRETATION.label,
  "Undefined code falls back to default interpretation"
);

const nullCode = getWmoWeatherInterpretation(null as unknown as number);
assert(
  nullCode.label === DEFAULT_WEATHER_INTERPRETATION.label,
  "Null code falls back to default interpretation"
);

console.log("✓ PASS: Unknown and boundary code fallback tests");

// 3. Complete Code Dictionary Integrity
const allCodes = Object.keys(WMO_WEATHER_CODES).map(Number);
assert(allCodes.length >= 20, "At least 20 WMO codes explicitly defined");

for (const code of allCodes) {
  const interp = WMO_WEATHER_CODES[code];
  assert(interp.code === code, `Code property matches key ${code}`);
  assert(typeof interp.label === "string" && interp.label.length > 0, `Label exists for code ${code}`);
  assert(typeof interp.description === "string" && interp.description.length > 0, `Description exists for code ${code}`);
  assert(["low", "moderate", "high", "critical"].includes(interp.severity), `Valid severity for code ${code}`);
  assert(Boolean(interp.icon), `Icon component defined for code ${code}`);
}

console.log("✓ PASS: WMO dictionary integrity and completeness tests");
console.log("\nAll WMO Weather Interpretation tests passed successfully!\n");
