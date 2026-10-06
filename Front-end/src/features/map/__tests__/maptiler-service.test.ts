import {
  getMapTilerApiKey,
  isMapTilerKeyConfigured,
  getMapTilerStyleUrl,
  MAPTILER_STYLE_PRESETS,
  MAPTILER_ATTRIBUTION,
  MAPTILER_CONFIG_ERROR_MESSAGE,
  MAPTILER_API_KEY_ENV_NAME,
  DEFAULT_MAPTILER_STYLE,
  type MapTilerStyleId,
} from "../services/maptiler-service";

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`Assertion failed: ${message}`);
  }
}

console.log("--- Starting MapTiler Configuration & Service Unit Tests ---");

const originalEnvKey = process.env[MAPTILER_API_KEY_ENV_NAME];

try {
  // 1. Unconfigured / Missing Key Behavior
  delete process.env[MAPTILER_API_KEY_ENV_NAME];

  assert(DEFAULT_MAPTILER_STYLE === "outdoor-v2", "Default style is outdoor-v2");
  assert(getMapTilerApiKey() === "", "Returns empty string when env var is undefined");
  assert(isMapTilerKeyConfigured() === false, "isMapTilerKeyConfigured returns false when missing");
  assert(getMapTilerStyleUrl() === null, "getMapTilerStyleUrl returns null when unconfigured");
  console.log("✓ PASS: Missing key returns unconfigured state without throwing");

  // 2. Placeholder Rejection
  const placeholders = [
    "",
    "   ",
    "your_key_here",
    "your-key-here",
    "placeholder",
    "maptiler_key",
    "api_key",
    "todo",
    "changeme",
    "short",
  ];

  for (const placeholder of placeholders) {
    process.env[MAPTILER_API_KEY_ENV_NAME] = placeholder;
    assert(
      isMapTilerKeyConfigured() === false,
      `Placeholder "${placeholder}" correctly identified as unconfigured`
    );
    assert(
      getMapTilerStyleUrl() === null,
      `Placeholder "${placeholder}" returns null style url`
    );
  }
  console.log("✓ PASS: Placeholder keys rejected gracefully");

  // 3. Valid API Key Handling
  const validMockKey = "maptiler_test_valid_key_123456789";
  process.env[MAPTILER_API_KEY_ENV_NAME] = `  ${validMockKey}  `;

  assert(getMapTilerApiKey() === validMockKey, "Trims whitespace from configured key");
  assert(isMapTilerKeyConfigured() === true, "Valid key recognized as configured");

  const defaultUrl = getMapTilerStyleUrl();
  assert(typeof defaultUrl === "string", "Style URL returned as string");
  assert(defaultUrl!.includes("api.maptiler.com/maps/outdoor-v2/style.json"), "Default style is outdoor-v2");
  assert(defaultUrl!.includes(`key=${validMockKey}`), "API key embedded in style URL");
  console.log("✓ PASS: Valid key generates outdoor-v2 vector style endpoint");

  // 4. Style Presets Catalog
  const styles: MapTilerStyleId[] = [
    "outdoor-v2",
    "streets-v2",
    "dataviz",
    "dataviz-dark",
    "hybrid",
  ];

  for (const styleId of styles) {
    const preset = MAPTILER_STYLE_PRESETS[styleId];
    assert(preset !== undefined, `Preset ${styleId} is defined`);
    assert(preset.id === styleId, `Preset id matches ${styleId}`);
    assert(typeof preset.name === "string" && preset.name.length > 0, `Preset ${styleId} has name`);
    assert(typeof preset.description === "string" && preset.description.length > 0, `Preset ${styleId} has description`);

    const styleUrl = getMapTilerStyleUrl(styleId);
    assert(styleUrl !== null, `Style URL generated for ${styleId}`);
    assert(styleUrl!.includes(`maps/${styleId}/style.json`), `URL points to ${styleId}`);
    assert(styleUrl!.includes(`key=${validMockKey}`), `URL contains key for ${styleId}`);
  }
  console.log("✓ PASS: Style presets catalog and custom style URL generation");

  // 5. Attribution & Configuration Notice Integrity
  assert(
    MAPTILER_ATTRIBUTION.includes("MapTiler") && MAPTILER_ATTRIBUTION.includes("OpenStreetMap"),
    "Attribution covers both MapTiler and OpenStreetMap contributors"
  );
  assert(
    MAPTILER_CONFIG_ERROR_MESSAGE.includes("NEXT_PUBLIC_MAPTILER_API_KEY"),
    "Config error message explicitly references NEXT_PUBLIC_MAPTILER_API_KEY"
  );
  console.log("✓ PASS: Attribution and configuration error messaging");

  console.log("\nAll MapTiler Service unit tests passed successfully!\n");
} finally {
  // Restore original environment
  if (originalEnvKey !== undefined) {
    process.env[MAPTILER_API_KEY_ENV_NAME] = originalEnvKey;
  } else {
    delete process.env[MAPTILER_API_KEY_ENV_NAME];
  }
}
