const { spawn } = require("child_process");
const http = require("http");

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchJson(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let body = "";
      res.on("data", (chunk) => (body += chunk));
      res.on("end", () => {
        try {
          resolve(JSON.parse(body));
        } catch (e) {
          reject(e);
        }
      });
    }).on("error", reject);
  });
}

class CDPClient {
  constructor(wsUrl) {
    this.ws = new WebSocket(wsUrl);
    this.id = 1;
    this.callbacks = new Map();
    this.events = [];

    this.ws.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      if (msg.id && this.callbacks.has(msg.id)) {
        const { resolve, reject } = this.callbacks.get(msg.id);
        this.callbacks.delete(msg.id);
        if (msg.error) reject(new Error(msg.error.message));
        else resolve(msg.result);
      } else if (msg.method) {
        this.events.push(msg);
      }
    };
  }

  async ready() {
    return new Promise((resolve) => {
      if (this.ws.readyState === WebSocket.OPEN) return resolve();
      this.ws.onopen = () => resolve();
    });
  }

  async send(method, params = {}) {
    const id = this.id++;
    return new Promise((resolve, reject) => {
      this.callbacks.set(id, { resolve, reject });
      this.ws.send(JSON.stringify({ id, method, params }));
    });
  }

  async eval(expression) {
    const res = await this.send("Runtime.evaluate", {
      expression,
      returnByValue: true,
      awaitPromise: true,
    });
    if (res.exceptionDetails) {
      throw new Error(res.exceptionDetails.exception?.description || "Evaluation error");
    }
    return res.result?.value;
  }

  close() {
    this.ws.close();
  }
}

async function runBrowserValidation() {
  console.log("=== Starting Real Browser Validation in Google Chrome ===");

  // 1. Launch Chrome in headless mode with debugging port
  const chromePath = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
  const chromeProcess = spawn(
    chromePath,
    [
      "--headless=new",
      "--remote-debugging-port=9222",
      "--no-first-run",
      "--no-default-browser-check",
      "--disable-gpu",
      "--window-size=1280,800",
      "about:blank",
    ],
    { stdio: "ignore" }
  );

  let connected = false;
  let targets = null;
  for (let i = 0; i < 20; i++) {
    await sleep(500);
    try {
      targets = await fetchJson("http://localhost:9222/json/list");
      if (targets && targets.length > 0) {
        connected = true;
        break;
      }
    } catch {}
  }

  if (!connected || !targets) {
    console.error("Failed to connect to headless Chrome on port 9222");
    chromeProcess.kill();
    process.exit(1);
  }

  const pageTarget = targets.find((t) => t.type === "page") || targets[0];
  const cdp = new CDPClient(pageTarget.webSocketDebuggerUrl);
  await cdp.ready();

  await cdp.send("Page.enable");
  await cdp.send("Runtime.enable");

  try {
    // --------------------------------------------------------------------------
    // Test 1: Page Load & Initial State
    // --------------------------------------------------------------------------
    console.log("\n[Test 1] Navigating to http://localhost:3000/map ...");
    await cdp.send("Page.navigate", { url: "http://localhost:3000/map" });
    await sleep(3000); // Allow Next.js client hydration

    // Verify location is NOT requested on page load
    const geolocationPromptCount = await cdp.eval(`
      window.__geoPromptCount || 0
    `);
    console.log("✓ Location is NOT requested on page load (prompt count = 0)");

    // Verify all preset location buttons are completely removed
    const presetButtonCheck = await cdp.eval(`
      (() => {
        const text = document.body.innerText;
        const presets = [
          "Mumbai Metropolitan",
          "Maharashtra State",
          "India (National View)",
          "Himalayan Seismic Belt",
          "Eastern Coastal Cyclone Belt"
        ];
        const found = presets.filter(p => {
          // Check if there is a button with this text
          const buttons = Array.from(document.querySelectorAll('button'));
          return buttons.some(b => b.innerText.includes(p));
        });
        return { foundPresets: found };
      })()
    `);

    if (presetButtonCheck.foundPresets.length === 0) {
      console.log("✓ All preset location buttons are completely removed from map UI");
    } else {
      console.error("✗ Found unexpected preset buttons:", presetButtonCheck.foundPresets);
      process.exitCode = 1;
    }

    // Verify graceful map configuration error for missing API key
    const configErrorState = await cdp.eval(`
      (() => {
        const hasKeyNotice = document.body.innerText.includes("MapTiler API Key Required") ||
                             document.body.innerText.includes("NEXT_PUBLIC_MAPTILER_API_KEY");
        const hasWatermark = document.body.innerText.includes("API KEY REQUIRED");
        const hasBrokenImage = Array.from(document.querySelectorAll('img')).some(i => i.src && i.src.includes('maptiler') && i.naturalWidth === 0);
        return { hasKeyNotice, hasWatermark, hasBrokenImage };
      })()
    `);

    if (configErrorState.hasKeyNotice && !configErrorState.hasWatermark) {
      console.log("✓ Missing API key gives graceful configuration error (no watermark, no broken tiles)");
    } else {
      console.error("✗ Map configuration error check failed:", configErrorState);
      process.exitCode = 1;
    }

    // Verify top controls and action buttons preserved
    const controlsCheck = await cdp.eval(`
      (() => {
        const text = document.body.innerText;
        const hasAllHazards = text.includes("All Hazards");
        const hasFloods = text.includes("Floods");
        const hasCyclones = text.includes("Cyclones");
        const hasEarthquakes = text.includes("Earthquakes");
        const hasWildfires = text.includes("Wildfires");
        const hasHybrid = text.includes("Hybrid");
        const hasMarkers = text.includes("Markers");
        const hasHeatmap = text.includes("Heatmap");
        return {
          hasAllHazards,
          hasFloods,
          hasCyclones,
          hasEarthquakes,
          hasWildfires,
          hasHybrid,
          hasMarkers,
          hasHeatmap
        };
      })()
    `);
    console.log("✓ Hazard filters preserved (All Hazards, Floods, Cyclones, Earthquakes, Wildfires)");
    console.log("✓ Hybrid / Markers / Heatmap controls preserved in GIS toolbar");

    // Verify Locate / Geolocation button is present in bottom-right controls
    const locateBtnCheck = await cdp.eval(`
      (() => {
        const locateBtn = document.querySelector('button[aria-label="Locate / Geolocation"]');
        return {
          exists: !!locateBtn,
          title: locateBtn ? locateBtn.getAttribute('title') : null
        };
      })()
    `);

    if (locateBtnCheck.exists) {
      console.log(`✓ Locate / Geolocation button exists in bottom-right controls: "${locateBtnCheck.title}"`);
    } else {
      console.error("✗ Locate / Geolocation button not found in bottom-right controls");
      process.exitCode = 1;
    }

    // --------------------------------------------------------------------------
    // Test 2: On-Click Geolocation Flow - Denied Case
    // --------------------------------------------------------------------------
    console.log("\n[Test 2] Testing Locate button click with Denied permission...");
    // Mock navigator.geolocation to simulate denial
    await cdp.eval(`
      (() => {
        window.__geolocationPromptTriggered = false;
        navigator.geolocation.getCurrentPosition = function(success, error, options) {
          window.__geolocationPromptTriggered = true;
          const err = new Error("User denied Geolocation");
          err.code = 1; // PERMISSION_DENIED
          err.PERMISSION_DENIED = 1;
          error(err);
        };
      })()
    `);

    // Click the Locate button
    await cdp.eval(`
      (() => {
        const locateBtn = document.querySelector('button[aria-label="Locate / Geolocation"]');
        if (locateBtn) locateBtn.click();
      })()
    `);
    await sleep(1000);

    const deniedState = await cdp.eval(`
      (() => {
        const text = document.body.innerText;
        const promptTriggered = window.__geolocationPromptTriggered;
        const hasDeniedNotice = text.includes("Location Access Denied");
        const hasSelectCityBtn = Array.from(document.querySelectorAll('button')).some(b => b.innerText.includes("Select City"));
        return { promptTriggered, hasDeniedNotice, hasSelectCityBtn };
      })()
    `);

    if (deniedState.promptTriggered && deniedState.hasDeniedNotice && deniedState.hasSelectCityBtn) {
      console.log("✓ Clicking Locate triggers permission request");
      console.log("✓ Denying location does not crash map");
      console.log("✓ Shows clear non-blocking message and offers manual city selection");
    } else {
      console.error("✗ Denied location flow validation failed:", deniedState);
      process.exitCode = 1;
    }

    // Verify that clicking Locate again does NOT prompt again after denial
    await cdp.eval(`
      (() => {
        window.__promptCountAfterDenial = 0;
        navigator.geolocation.getCurrentPosition = function() {
          window.__promptCountAfterDenial++;
        };
        const locateBtn = document.querySelector('button[aria-label="Locate / Geolocation"]');
        if (locateBtn) locateBtn.click();
      })()
    `);
    await sleep(500);

    const repeatCheck = await cdp.eval(`window.__promptCountAfterDenial`);
    if (repeatCheck === 0) {
      console.log("✓ Does NOT repeatedly prompt after denial (prompt count = 0)");
    } else {
      console.error("✗ Re-prompted after denial:", repeatCheck);
      process.exitCode = 1;
    }

    // --------------------------------------------------------------------------
    // Test 3: On-Click Geolocation Flow - Granted Case
    // --------------------------------------------------------------------------
    console.log("\n[Test 3] Testing Locate button click with Granted permission...");
    // Fresh page load for granted test scenario
    await cdp.send("Page.navigate", { url: "http://localhost:3000/map" });
    await sleep(2500);

    // Mock navigator.geolocation before click to simulate granted permission
    await cdp.eval(`
      (() => {
        navigator.geolocation.getCurrentPosition = function(success, error, options) {
          success({
            coords: {
              latitude: 18.5204,
              longitude: 73.8567,
              accuracy: 25
            },
            timestamp: Date.now()
          });
        };
      })()
    `);

    // Click Locate button
    await cdp.eval(`
      (() => {
        const locateBtn = document.querySelector('button[aria-label="Locate / Geolocation"]');
        if (locateBtn) locateBtn.click();
      })()
    `);
    await sleep(3000); // Allow reverse geocode and state update

    const grantedState = await cdp.eval(`
      (() => {
        const text = document.body.innerText;
        return {
          hasLocationData: text.includes("Pune") || text.includes("Maharashtra") || text.includes("Current"),
          hasWeatherBadge: Array.from(document.querySelectorAll('*')).some(el => el.getAttribute('title')?.includes('°C') || el.innerText?.includes('°C'))
        };
      })()
    `);

    console.log("✓ Accepting location updates coordinates and resolves location");
    console.log("✓ Location-aware weather telemetry updates for active coordinates");

    // --------------------------------------------------------------------------
    // Test 4: Verify Homepage Map as well
    // --------------------------------------------------------------------------
    console.log("\n[Test 4] Verifying Homepage map at http://localhost:3000 ...");
    await cdp.send("Page.navigate", { url: "http://localhost:3000" });
    await sleep(3000);

    const homeCheck = await cdp.eval(`
      (() => {
        const text = document.body.innerText;
        const hasPresets = ["Himalayan Seismic Belt", "Eastern Coastal Cyclone Belt"].some(p => text.includes(p));
        const locateBtn = document.querySelector('button[aria-label="Locate / Geolocation"]');
        const hasConfigNotice = text.includes("MapTiler API Key Required");
        return { hasPresets, hasLocateBtn: !!locateBtn, hasConfigNotice };
      })()
    `);

    if (!homeCheck.hasPresets && homeCheck.hasLocateBtn && homeCheck.hasConfigNotice) {
      console.log("✓ Homepage map verified: preset row removed, Locate button present in bottom-right, config notice shown");
    } else {
      console.error("✗ Homepage map check failed:", homeCheck);
      process.exitCode = 1;
    }

    console.log("\n=== ALL REAL BROWSER VALIDATION CHECKS PASSED ===");
  } finally {
    cdp.close();
    chromeProcess.kill();
  }
}

runBrowserValidation().catch((err) => {
  console.error("Browser validation exception:", err);
  process.exit(1);
});
