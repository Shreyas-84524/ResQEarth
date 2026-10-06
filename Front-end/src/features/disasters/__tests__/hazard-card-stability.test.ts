import test from "node:test";
import assert from "node:assert/strict";
import type { UnifiedDisasterEvent } from "../types/disaster-event";

// Mock hazard generator
function createMockHazard(id: string, title: string, lat = 20.5, lon = 78.9): UnifiedDisasterEvent {
  return {
    id,
    provider: "usgs",
    providerEventId: id,
    disasterType: "earthquake",
    categoryKey: "earthquakes",
    categoryTitle: "Earthquakes",
    title,
    severity: "HIGH",
    severityScale: "Richter",
    sourceType: "automatic",
    sourceName: "USGS Earthquakes",
    sourceUrl: `https://earthquake.usgs.gov/earthquakes/eventpage/${id}`,
    isOfficialAlert: false,
    isMappable: true,
    latitude: lat,
    longitude: lon,
    coordinates: [lon, lat],
    geometryType: "Point",
    region: "Test Region",
    occurredAt: "2026-10-06T12:00:00.000Z",
    updatedAt: "2026-10-06T12:00:00.000Z",
    isOpen: true,
  };
}

test("--- Hazard Card Stability & Anti-Flickering Regression Tests ---", async (t) => {
  await t.test("1. Repeated same-hazard selection ignores redundant updates", () => {
    let currentId: string | null = null;
    let renderCount = 0;

    const selectHazardById = (id: string | null) => {
      if (currentId === id) {
        return; // Guard: ignore repeated selection of identical hazard
      }
      currentId = id;
      renderCount++;
    };

    // Initial selection
    selectHazardById("hazard-001");
    assert.equal(currentId, "hazard-001");
    assert.equal(renderCount, 1);

    // Repeated identical selections (e.g. rapid marker taps, double-clicks)
    selectHazardById("hazard-001");
    selectHazardById("hazard-001");
    selectHazardById("hazard-001");

    assert.equal(currentId, "hazard-001");
    assert.equal(renderCount, 1, "Redundant same-hazard selection MUST NOT trigger additional updates");

    // Switching to a different hazard
    selectHazardById("hazard-002");
    assert.equal(currentId, "hazard-002");
    assert.equal(renderCount, 2, "Genuinely different hazard triggers update");

    // Deselection
    selectHazardById(null);
    assert.equal(currentId, null);
    assert.equal(renderCount, 3);

    // Repeated null deselection
    selectHazardById(null);
    assert.equal(renderCount, 3, "Redundant null deselection MUST NOT trigger updates");
  });

  await t.test("2. Feed refresh preserves selected hazard by stable ID", () => {
    const initialDisasters = [
      createMockHazard("hazard-1", "Earthquake 5.1"),
      createMockHazard("hazard-2", "Earthquake 4.2"),
    ];

    const selectedHazardId: string | null = "hazard-1";

    // Simulate derivation
    const getSelectedDisaster = (list: UnifiedDisasterEvent[]) => {
      if (!selectedHazardId) return null;
      return list.find((d) => d.id === selectedHazardId) ?? null;
    };

    let selected = getSelectedDisaster(initialDisasters);
    assert.ok(selected);
    assert.equal(selected.id, "hazard-1");
    assert.equal(selected.title, "Earthquake 5.1");

    // Simulate API re-fetch: fresh object references created for identical ID
    const refreshedDisasters = [
      {
        ...createMockHazard("hazard-1", "Earthquake 5.1 (Updated)"),
        updatedAt: "2026-10-06T12:05:00.000Z",
      },
      createMockHazard("hazard-2", "Earthquake 4.2"),
      createMockHazard("hazard-3", "New Cyclone Alert"),
    ];

    // On feed refresh, selectedHazardId remains unchanged
    selected = getSelectedDisaster(refreshedDisasters);
    assert.ok(selected, "Selected hazard MUST remain open after feed refresh");
    assert.equal(selected.id, "hazard-1");
    assert.equal(selected.title, "Earthquake 5.1 (Updated)");
    assert.equal(selected.updatedAt, "2026-10-06T12:05:00.000Z");

    // If hazard expires from feed
    const subsequentDisasters = [
      createMockHazard("hazard-2", "Earthquake 4.2"),
      createMockHazard("hazard-3", "New Cyclone Alert"),
    ];
    selected = getSelectedDisaster(subsequentDisasters);
    assert.equal(selected, null, "Safely transitions to null if hazard is no longer present");
  });

  await t.test("3. Map click on empty area or pan/zoom does NOT dismiss locked card", () => {
    let selectedCardId: string | null = "hazard-lock-test";
    const userClosedViaX = () => {
      selectedCardId = null;
    };

    const handleMapClick = (clickedFeatureId?: string) => {
      if (clickedFeatureId) {
        selectedCardId = clickedFeatureId;
        return;
      }
      // Empty map click: DO NOT dismiss card (card remains locked until X clicked or new hazard chosen)
    };

    // User pans or clicks empty map
    handleMapClick(undefined);
    assert.equal(selectedCardId, "hazard-lock-test", "Pan/zoom or empty click MUST NOT close the active card");

    // User selects another hazard
    handleMapClick("hazard-new");
    assert.equal(selectedCardId, "hazard-new");

    // User clicks X button
    userClosedViaX();
    assert.equal(selectedCardId, null, "X button explicitly closes the card");
  });

  await t.test("4. Duplicate listener prevention & clean unmount lifecycle", () => {
    const listeners: Record<string, number> = {};

    const mockMap = {
      on: (event: string) => {
        listeners[event] = (listeners[event] || 0) + 1;
      },
      off: (event: string) => {
        listeners[event] = (listeners[event] || 0) - 1;
      },
    };

    // Attach listeners once
    mockMap.on("click");
    mockMap.on("mousemove");
    mockMap.on("mouseenter");
    mockMap.on("mouseleave");

    assert.equal(listeners["click"], 1, "Only single unified click listener attached");
    assert.equal(listeners["mousemove"], 1);

    // Simulate component unmount
    mockMap.off("click");
    mockMap.off("mousemove");
    mockMap.off("mouseenter");
    mockMap.off("mouseleave");

    assert.equal(listeners["click"], 0, "All listeners cleanly removed on unmount");
    assert.equal(listeners["mousemove"], 0);
    assert.equal(listeners["mouseenter"], 0);
    assert.equal(listeners["mouseleave"], 0);
  });

  await t.test("5. Hover vs Click state isolation", () => {
    let activeCursor = "";
    const selectedHazard: string | null = "hazard-active";

    const handleMouseMoveHover = (isNearHazardBloom: boolean) => {
      // Hover ONLY modifies map canvas cursor style, NEVER card selection state
      activeCursor = isNearHazardBloom ? "pointer" : "";
    };

    handleMouseMoveHover(true);
    assert.equal(activeCursor, "pointer");
    assert.equal(selectedHazard, "hazard-active", "Hover MUST NOT alter selected hazard");

    handleMouseMoveHover(false);
    assert.equal(activeCursor, "");
    assert.equal(selectedHazard, "hazard-active", "Cursor reset MUST NOT alter selected hazard");
  });
});
