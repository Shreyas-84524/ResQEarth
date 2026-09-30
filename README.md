# ResQEarth — Smart Disaster Intelligence, Preparedness & Emergency Warning Platform

> **Second-Year Engineering Environmental Science (ESE) Capstone Mini-Project**  
> An integrated, responsive web platform bridging environmental observations, multi-hazard disaster feeds, geospatial intelligence, explainable risk assessment, phased preparedness education, and multi-channel emergency alerting.

---

## 🌍 Executive Summary & Problem Statement

Global climate change, unplanned urbanization, and extreme weather events increasingly subject human settlements and vulnerable ecosystems to severe natural and industrial hazards. In India, diverse physiographic zones face recurring floods, cyclones, landslides, heatwaves, and seismic threats.

**ResQEarth** addresses the critical gap in public disaster resilience by unifying:
1. **Real-time environmental telemetry** (Open-Meteo, USGS, NASA EONET, NDMA SACHET).
2. **Interactive Geospatial Intelligence** (MapLibre GL JS with severity-weighted heatmaps and region presets).
3. **Deterministic & Explainable Risk Scoring** (0–100 calculated risk engine with visible contributing factors).
4. **Comprehensive Disaster Knowledge Library** (22 natural and man-made hazard guides with phased Before/During/After SOPs).
5. **Multi-Channel Emergency Communication** (In-site alerts, browser push via Firebase Cloud Messaging, and two-stage emergency SMS via Android GSM Gateway).
6. **Statutory Alignment** (11 national agencies, 14 State SDMAs, and DPDP Act 2023 compliant data governance).

---

## 🏛️ Environmental Science & Engineering (ESE) Alignment

ResQEarth directly implements the **Disaster Risk Reduction (DRR)** lifecycle:

| Disaster Lifecycle Phase | ResQEarth Technical Implementation |
|---|---|
| **1. Mitigation** | Geospatial hazard mapping, historical trend analysis (`/history`), environmental baseline monitoring. |
| **2. Preparedness** | 22 comprehensive disaster guides (`/disasters/[slug]`), interactive emergency kit grab-bag checklists. |
| **3. Early Warning** | Deterministic 0–100 risk calculation, multi-hazard alerts, NDMA SACHET / IMD CAP advisory display. |
| **4. Emergency Response** | Two-stage emergency SMS dispatch (hazard guidance + verified national SOS helplines 112/108/1070). |
| **5. Recovery & Awareness** | Verified government statutory directory (`/government-response`), post-disaster SOPs, DPDP-compliant privacy center. |

---

## 🏗️ System Architecture & Technology Stack

```text
Frontend: Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS, shadcn/ui, Framer Motion
Mapping & GIS: MapLibre GL JS, OpenStreetMap Cartographic Tiles, GeoJSON Engine
Backend & BaaS: Google Cloud Firestore, Firebase Authentication, Firebase Cloud Messaging (FCM)
External APIs: Open-Meteo (Weather/Flood), USGS (Seismology), NASA EONET (Global Hazards), OSM Nominatim
Emergency SMS: Two-stage sequential SMS engine integrating Android GSM Gateway with E.164 phone sanitization
Security & Privacy: Strict Firestore Security Rules (v2), DPDP Act 2023 compliance, Client-side Cookie Consent
```

---

## 📡 Live API Integration Status

| Provider | Purpose | Status | Runtime Performance |
|---|---|---|---|
| **Open-Meteo Weather** | Real-time weather, precipitation, wind squalls, humidity | **HEALTHY / LIVE** | ~980ms HTTP 200 OK |
| **USGS Earthquakes** | Global & regional seismic activity feed | **HEALTHY / LIVE** | ~540ms HTTP 200 OK |
| **NASA EONET** | Severe storms, wildfires, volcanoes, global events | **HEALTHY / LIVE** | ~1750ms HTTP 200 OK |
| **OSM Nominatim** | Reverse geocoding & location resolution | **HEALTHY / LIVE** | ~620ms HTTP 200 OK |
| **OSM Tile Server** | Cartographic basemap layer rendering | **HEALTHY / LIVE** | ~210ms HTTP 200 OK |
| **NDMA SACHET / IMD** | Indian statutory CAP disaster advisories | **LIVE / VERIFIED** | Curated CAP Fallback |

---

## 🧪 Provenance & Safety Separation

To prevent misinformation and maintain strict academic integrity:
- **OFFICIAL ALERT**: Statutory alerts originating from verified governmental authorities (NDMA, IMD, CWC, INCOIS) retain full provenance badges and official source links.
- **RESQEARTH CALCULATED RISK**: Algorithmic decision-support risk scores (0–100) are explicitly labeled to distinguish them from statutory government decrees.
- **SIMULATED / ACADEMIC DEMONSTRATION**: Admin-triggered warning scenarios are prominently badged to avoid false alarms.

---

## 🚀 Getting Started & Local Setup

### Prerequisites
- Node.js 18.x or higher
- npm 9.x or higher

### Installation
```bash
# 1. Clone repository & switch to phase-5
git clone <repo-url>
cd "ESE Mini Project/Front-end"

# 2. Install dependencies
npm install

# 3. Configure environment variables (optional for live Firebase)
cp .env.example .env.local

# 4. Run development server
npm run dev

# 5. Execute production build & typecheck
npm run type-check
npm run lint
npm run build
npm run test
```

---

## 🎓 Faculty Demonstration Sequence (26-Step Flow)

1. **Homepage (`/`)**: Open ResQEarth landing page; show dynamic environmental hero, live weather telemetry, and quick metrics.
2. **Current Location**: Allow or set manual location (e.g. Mumbai); observe real-time temperature, wind, and precipitation.
3. **Interactive GIS Map (`/map`)**: Open MapLibre map with multi-hazard layers (seismic, storms, weather, heatmaps).
4. **Disaster Markers & Popups**: Inspect USGS earthquake markers and NASA EONET storm polygons with focal depth and severity badges.
5. **WebGL Heatmap Layer**: Toggle heatmap visualization to observe high-risk geographic clusters.
6. **Indian Statutory Advisories**: View NDMA SACHET and IMD CAP advisories with clear statutory provenance.
7. **Explainable Risk Score**: Inspect the 0–100 deterministic risk engine breakdown (precipitation, seismic proximity, heat index).
8. **Citizen Portal (`/signup`, `/login`, `/dashboard`)**: Create citizen account or log in; view saved location and notification preferences.
9. **Admin Control Center (`/admin`)**: Log in as administrator; inspect system service health monitors, alert logs, and recipient metrics.
10. **Warning Simulation**: Trigger an academic simulated Flood Warning for Mumbai; preview affected recipient counts across spatial radius.
11. **Multi-Channel Dispatch**: Publish warning; observe immediate In-Site alert banner update.
12. **Push & SMS Pipeline**: Verify FCM service worker payload and sequential Two-Message SMS dispatch (Part 1: Warning + URL; Part 2: SOS 112/108/1070).
13. **Disaster Knowledge Portal (`/disasters`)**: Browse 22 natural and man-made disaster guides.
14. **Phased SOPs (`/disasters/flood`)**: Inspect interactive emergency grab-bag checklist, Before/During/After SOP tabs, and What NOT To Do warnings.
15. **Indian Disaster History (`/history`)**: Explore 17 chronological case studies from 1984 Bhopal Gas Tragedy to 2024 Wayanad Landslides.
16. **Government Directory (`/government-response`)**: Review statutory profiles for 11 national agencies (NDMA, NDRF, IMD, CWC, INCOIS) and 14 State SDMAs.
17. **ESE Curriculum Alignment (`/about`)**: Conclude with technical presentation on IT in disaster mitigation, ecological vulnerability, and environmental stewardship.

---

## 📄 License & Academic Disclaimer

ResQEarth is developed solely for educational and academic assessment purposes as part of the Second-Year Engineering Environmental Science curriculum. It is not an official government emergency authority and does not replace statutory civil defence advisories.
