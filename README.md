# ResQEarth — Smart Disaster Intelligence, Preparedness & Emergency Alerting Platform

> **Second-Year Engineering Environmental Science (ESE) Capstone Mini-Project**  
> An integrated, responsive web platform bridging real-time multi-source environmental observations, interactive GIS geospatial intelligence, explainable risk assessment, structured disaster preparedness education, and two-stage emergency SMS alerting.

**Live Production Deployment:** [https://resqearth.antideploy.app](https://resqearth.antideploy.app)  
**Primary Domain:** Disaster Management & Environmental Science  
**Target Region:** India (with Global Seismic & Weather Observation Support)  

---

## Table of Contents

1. [Executive Summary & Problem Statement](#1-executive-summary--problem-statement)
2. [Main Objectives](#2-main-objectives)
3. [Key Features Overview](#3-key-features-overview)
4. [Live Disaster Intelligence Sources](#4-live-disaster-intelligence-sources)
5. [MapLibre GL JS & GIS Architecture](#5-maplibre-gl-js--gis-architecture)
6. [Unified Hazard Feed & Pipeline](#6-unified-hazard-feed--pipeline)
7. [Visualization Modes (Markers, Heatmap, Hybrid)](#7-visualization-modes-markers-heatmap-hybrid)
8. [Interactive Hazard Detail Cards](#8-interactive-hazard-detail-cards)
9. [Real-Time Weather Integration](#9-real-time-weather-integration)
10. [Explainable ResQEarth Risk Engine](#10-explainable-resqearth-risk-engine)
11. [Firebase Authentication & Data Model](#11-firebase-authentication--data-model)
12. [Admin Regional Emergency Alert System](#12-admin-regional-emergency-alert-system)
13. [Emergency SMS Gateway Architecture](#13-emergency-sms-gateway-architecture)
14. [Disaster Knowledge Portal](#14-disaster-knowledge-portal)
15. [Indian Disaster History & Government Directory](#15-indian-disaster-history--government-directory)
16. [Technology Stack](#16-technology-stack)
17. [High-Level System Architecture](#17-high-level-system-architecture)
18. [Project Folder Structure](#18-project-folder-structure)
19. [Environment Variables](#19-environment-variables)
20. [Local Setup & Installation](#20-local-setup--installation)
21. [Build, Test & Validation Commands](#21-build-test--validation-commands)
22. [Production Deployment Information](#22-production-deployment-information)
23. [Known Limitations](#23-known-limitations)
24. [Environmental Science & Engineering (ESE) Alignment](#24-environmental-science--engineering-ese-alignment)
25. [Statutory & Academic Disclaimer](#25-statutory--academic-disclaimer)
26. [Future Roadmap](#26-future-roadmap)


---

## 1. Executive Summary & Problem Statement

Global climate change, unplanned urbanization, and extreme weather events increasingly subject human settlements and vulnerable ecosystems to severe natural and industrial hazards. In India, diverse physiographic zones face recurring floods, cyclonic storm surges, tectonic earthquakes, landslides, and extreme heatwaves.

Citizens and local responders frequently face:
- **Fragmented Data**: Disparate portals for weather, seismology, and disaster bulletins.
- **Opaque Risk Assessment**: Warnings without transparent contributing factors or scientific context.
- **Delayed Notification**: Internet-dependent alerts that fail when data networks are congested.
- **Information Chasm**: Lack of actionable Before/During/After preparedness protocols linked to live warnings.

**ResQEarth** addresses these challenges by consolidating live environmental telemetry, interactive GIS mapping, a deterministic explainable risk engine, and an out-of-band two-stage emergency SMS alerting mechanism into a single accessible web platform.

---

## 2. Main Objectives

- **Unify Disaster Feeds**: Aggregate and normalize live global and national hazard telemetry into a single canonical `UnifiedDisasterEvent[]` data model.
- **Provide Spatial Intelligence**: Render interactive multi-hazard maps with MapLibre GL JS supporting vector markers, severity heatmaps, and hybrid modes.
- **Deliver Explainable Risk**: Calculate deterministic composite risk scores (0–100) with clear factor attribution (precipitation, wind, seismic proximity, coastal vulnerability).
- **Educate & Prepare**: Offer comprehensive disaster survival guides across 22 hazard categories with interactive emergency grab-bag checklists.
- **Enable Rapid Alerting**: Support authorized administrative broadcast of targeted emergency SMS warnings paired with verified national SOS helplines (112, 108, 1070).
- **Enforce Provenance Separation**: Clearly distinguish between statutory government alerts, calculated mathematical risk scores, and academic demonstration simulations.

---

## 3. Key Features Overview

| Feature Category | Description | Implementation Status |
|---|---|---|
| **Live Hazard Intelligence** | Real-time ingestion of USGS earthquakes, NASA EONET events, Open-Meteo weather, and NDMA/IMD alerts | **LIVE / VERIFIED** |
| **Interactive GIS Map** | MapLibre GL JS 5.2 engine with vector basemaps, region presets, and GPS geolocation | **LIVE / VERIFIED** |
| **Unified Data Pipeline** | Single source of truth powering both the Unified Hazard Feed and the Live Map synchronously | **LIVE / VERIFIED** |
| **3 GIS Display Modes** | Precision Markers, Severity-Weighted Heatmap, and Combined Hybrid Visualization | **LIVE / VERIFIED** |
| **Hazard Detail Cards** | Floating interactive overlay with telemetry, nearby hazard disambiguation, and zero-flicker locking | **LIVE / VERIFIED** |
| **Explainable Risk Engine** | 0–100 deterministic risk scoring with visible multi-factor contribution breakdowns | **DERIVED / CALCULATED** |
| **Authentication & RBAC** | Firebase Auth (Email/Password) with Citizen and Admin role-based authorization | **LIVE / VERIFIED** |
| **Admin Control Center** | Protected operations dashboard for service health monitoring and regional alert targeting | **LIVE / VERIFIED** |
| **Emergency SMS Pipeline** | Server-side two-message emergency SMS dispatch via GSM Gateway with E.164 sanitization | **LIVE / VERIFIED** |
| **Knowledge Portal** | 22 disaster categories with phased Before/During/After safety standard operating procedures (SOPs) | **LIVE / VERIFIED** |
| **History & Directory** | Chronological timeline of Indian disasters and verified statutory government agency directory | **LIVE / VERIFIED** |

---

## 4. Live Disaster Intelligence Sources

ResQEarth aggregates data from authoritative open meteorological, geological, and disaster monitoring APIs without requiring proprietary keys for core data feeds:

| Provider | Purpose | Coverage | Update Frequency | Status |
|---|---|---|---|---|
| **Open-Meteo API** | Real-time weather, temperature, precipitation, wind gusts, pressure, WMO codes | Global (0.1° resolution) | Hourly / Live | **LIVE** |
| **USGS Earthquake Hazards** | Global real-time seismic event feed (M2.5+ & all significant events) | Global | Near Real-Time (~1 min) | **LIVE** |
| **NASA EONET v3** | Natural event tracker (wildfires, severe storms, volcanoes, tropical cyclones) | Global | Continuous | **LIVE** |
| **NDMA SACHET / IMD** | Statutory Indian disaster alerts and Common Alerting Protocol (CAP) bulletins | India | Real-Time / Curated Fallback | **LIVE** |
| **OSM Nominatim** | Reverse geocoding for user coordinates and city preset resolution | Global | On-Demand | **LIVE** |
| **MapTiler / OSM Tiles** | High-performance cartographic vector and raster map tiles | Global | Continuous CDN | **LIVE** |

> **Telemetry Ingestion Architecture:** External feeds are ingested by dedicated service adapters (`unified-disaster-service.ts`, `earthquake-service.ts`, `global-disaster-service.ts`, `weather-service.ts`), normalized into the canonical `UnifiedDisasterEvent` schema, and cached in-memory with client-side TTL management to respect upstream rate limits.

---

## 5. MapLibre GL JS & GIS Architecture

The spatial visualization engine is built on **MapLibre GL JS 5.2**, configured with hardware-accelerated WebGL rendering and client-side dynamic loading (`next/dynamic` with SSR disabled):

- **Vector & Raster Basemaps**: Supports OpenStreetMap standard, CartoDB Voyager, and CartoDB Dark Matter themes via MapTiler/OSM tile configurations.
- **Pre-Configured Surveillance Zones**:
  - **Mumbai Metropolitan**: High-density coastal urban area prone to monsoon waterlogging and tidal surges (`[72.8777, 19.0760]`, zoom 11).
  - **Maharashtra State**: State-wide coverage spanning Western Ghats, Marathwada, and Konkan (`[75.7139, 19.7515]`, zoom 6.8).
  - **India (National View)**: Multi-hazard overview across all states and Union Territories (`[78.9629, 20.5937]`, zoom 4.6).
  - **Himalayan Seismic Belt**: Zone V tectonic and landslide surveillance (`[77.5000, 31.0000]`, zoom 6.5).
  - **Bay of Bengal Cyclone Belt**: Coastal storm surge and cyclone tracking (`[85.8000, 19.8000]`, zoom 6.2).
- **On-Demand Geolocation**: User GPS position is requested only upon explicit user interaction (Locate button), plotting a blue coordinate marker with an accuracy error buffer circle.

---

## 6. Unified Hazard Feed & Pipeline

The Unified Hazard Feed and the Live Map are powered by the **exact same canonical dataset**:

```text
External Providers (USGS, NASA EONET, Open-Meteo, NDMA)
                         │
                         ▼
        unified-disaster-service.ts (Normalization)
                         │
                         ▼
            UnifiedDisasterEvent[] (Canonical Dataset)
            ├── Unified Hazard Feed (Sidebar Panel)
            └── GeoJSON FeatureCollection (MapLibre Source: resqearth-unified-hazards)
```

- **Zero Divergence**: 100% of mappable hazards with valid WGS84 coordinates are rendered on the map and listed in the feed.
- **Synchronized Navigation**: Clicking any hazard card in the sidebar triggers a smooth `map.flyTo()` animation to the hazard centroid and automatically opens its interactive detail card.
- **Multi-Hazard Filtering**: Real-time filtering by category (All, Floods, Cyclones, Earthquakes, Wildfires), minimum severity level (LOW to CRITICAL), and statutory alert status.

---

## 7. Visualization Modes (Markers, Heatmap, Hybrid)

ResQEarth provides three distinct cartographic presentation modes accessible via the top-right GIS toolbar:

```text
┌─────────────────┬────────────────────────────────────────────────────────────────────────┐
│ Mode            │ Rendering Technique & Visual Behavior                                  │
├─────────────────┼────────────────────────────────────────────────────────────────────────┤
│ 1. Markers      │ Precision 6-tier vector circle layers categorized by hazard type:      │
│                 │ • Floods: Blue (#3b82f6)          • Cyclones: Cyan (#06b6d4)           │
│                 │ • Earthquakes: Red (#ef4444)      • Wildfires: Orange (#f97316)        │
│                 │ • Landslides: Emerald (#10b981)   • Heatwaves: Yellow (#eab308)        │
│                 │ Features animated pulse rings for Critical/High alerts and outer rings │
│                 │ for official government bulletins.                                     │
├─────────────────┼────────────────────────────────────────────────────────────────────────┤
│ 2. Heatmap      │ Continuous kernel density bloom weighted by disaster severity:         │
│                 │ (Weight: LOW=0.25, MODERATE=0.5, HIGH=0.8, CRITICAL=1.0).              │
│                 │ Visualizes cumulative geographic hazard intensity and cluster density. │
├─────────────────┼────────────────────────────────────────────────────────────────────────┤
│ 3. Hybrid       │ Seamless multi-scale combination: low-zoom kernel density bloom fades  │
│                 │ into precision vector markers between zoom levels 7 and 9, preventing  │
│                 │ visual clutter while preserving pinpoint accuracy.                     │
└─────────────────┴────────────────────────────────────────────────────────────────────────┘
```

---

## 8. Interactive Hazard Detail Cards

Clicking any vector marker, cluster, or heatmap density center opens `<MapHazardDetailCard>`, a responsive floating information overlay:

- **Comprehensive Telemetry**: Displays category icon, severity badge (`CRITICAL`, `HIGH`, `MODERATE`, `LOW`), event status, headline, occurrence time with relative age, distance from user (km), and narrative description.
- **Provenance Badging**: Clearly marks alerts as **OFFICIAL ALERT** (NDMA/IMD) or **AUTO TELEMETRY** (USGS/NASA).
- **Nearby Hazard Disambiguation**: Identifies overlapping hazards within a 35 km radius and provides an interactive `+X nearby hazards` accordion to switch active focus seamlessly.
- **Expandable Technical Details**: Inspect raw coordinates, provider IDs, depth, and magnitude scales.
- **Deep Links**: Direct link to the external source portal and context-aware link to the relevant safety guide (`/disasters/[slug]`).
- **Anti-Flicker Architecture**: Selection state is locked by stable hazard `id`, derived reactively from canonical state, immune to map pan/zoom/drag actions, and verified for 0 flicker across continuous browser testing.

---

## 9. Real-Time Weather Integration

Powered by the **Open-Meteo Weather API**, ResQEarth delivers comprehensive localized atmospheric observations:

- **Parameters Tracked**: Temperature (°C), Apparent (Feels Like) Temperature, Relative Humidity (%), Wind Speed (km/h), Wind Direction (°), Barometric Pressure (hPa), and Precipitation Rate (mm/h).
- **WMO Code Translation**: Maps World Meteorological Organization weather codes (0–99) to human-readable weather descriptions and contextual icons.
- **Compact & Full Views**: Available as a compact status badge in the map header and as a full telemetry card on the homepage.

---

## 10. Explainable ResQEarth Risk Engine

ResQEarth calculates a localized, explainable **Composite Disaster Risk Index (0–100)** using a deterministic mathematical model based on environmental telemetry and proximity:

$$\text{Risk Score} = \min\left(100, \sum \text{Factor Contributions} + \text{Vulnerability Baseline}\right)$$

### Factor Breakdown & Scoring Weights

| Contributing Factor | Scoring Criteria | Weight Points |
|---|---|---|
| **Precipitation & Inundation** | Rainfall > 15 mm/h (High) to > 50 mm/h (Critical) | 0 to 35 pts |
| **Wind & Squall Hazard** | Wind speeds > 40 km/h (Moderate) to > 90 km/h (Critical) | 0 to 25 pts |
| **Thermal Extremes** | Extreme heat > 40°C or freezing cold < 0°C | 0 to 15 pts |
| **Seismic Proximity** | Earthquake M4.5+ within 100 km (High) to M6.0+ within 50 km (Critical) | 0 to 30 pts |
| **Active Global Events** | NASA EONET storm or wildfire within 250 km radius | 0 to 20 pts |
| **Official Government Alerts** | Statutory advisory from NDMA / IMD affecting region | 0 to 25 pts |
| **Coastal Vulnerability** | Coastal zone baseline adjustment (Konkan / Mumbai / Coromandel) | +5 pts baseline |

### Canonical Risk Bands

| Score Range | Risk Level | Badge Color | Operational Meaning |
|---|---|---|---|
| **0 – 20** | `LOW` | Green | Normal baseline conditions; routine surveillance. |
| **21 – 40** | `GUARDED` | Blue | Minor environmental anomalies; advisory awareness. |
| **41 – 60** | `MODERATE` | Yellow | Elevated weather/hazard indicators; heightened preparedness. |
| **61 – 80** | `HIGH` | Orange | Severe hazard indicators present; prepare emergency kit. |
| **81 – 100** | `CRITICAL` | Red | Imminent extreme danger; follow official evacuation orders. |

---

## 11. Firebase Authentication & Data Model

ResQEarth integrates **Firebase Web SDK (v11.3)** for citizen identity management, role-based authorization, and preferences storage:

- **Authentication**: Firebase Email + Password authentication for Citizen accounts.
- **Roles**: Strict separation between `citizen` (public signup) and `admin` (provisioned account).
- **Firestore Collections Structure**:
  - `users/{uid}`: Citizen profile, phone number, notification consent, SMS consent, and optional last known location.
  - `alerts/{alertId}`: Active and historical emergency warning broadcasts with spatial bounding and expiry.
  - `delivery_logs/{logId}`: Audit trail of emergency SMS dispatch attempts with masked phone numbers for privacy.
- **Firestore Security Rules (v2)**: Production rules enforce document ownership, restrict admin operations to verified tokens, and protect user PII in compliance with the **Digital Personal Data Protection (DPDP) Act 2023**.

---

## 12. Admin Regional Emergency Alert System

The `/admin` route provides a protected command center for emergency broadcast simulations:

- **RBAC Route Guard**: Server-side and client-side verification ensuring only authenticated users with `role: "admin"` can access administrative tools.
- **System Health Monitor**: Live latency and freshness monitors for all external APIs (Open-Meteo, USGS, NASA EONET).
- **Manual Warning Builder**: Select disaster category, input geographic epicenter coordinates, adjust targeting radius (10–100 km), specify severity level, and author localized precautions.
- **Spatial Recipient Preview**: Queries registered citizen database, filters for users located within the spatial radius, and counts recipients with explicit SMS consent.
- **Simulation Badge**: All administrative demo warnings are unmistakably watermarked as **ACADEMIC DEMO / SIMULATION** to prevent false alarms.

---

## 13. Emergency SMS Gateway Architecture

ResQEarth utilizes an out-of-band **Two-Message Sequential SMS Workflow** integrated with a local/cloud Android GSM Gateway to deliver critical alerts even during internet data disruptions:

```text
┌────────────────────────────────────────────────────────────────────────┐
│ Admin Broadcast Trigger (/admin)                                       │
└──────────────────────────────────┬─────────────────────────────────────┘
                                   │
                                   ▼
┌────────────────────────────────────────────────────────────────────────┐
│ Secure Server-Side Proxy (/api/sms/send)                               │
│ • Validates Admin Authorization                                        │
│ • Normalizes Phone Numbers to E.164 (+91 XXXXX XXXXX)                  │
│ • Verifies Explicit User SMS Consent                                   │
└──────────────────────────────────┬─────────────────────────────────────┘
                                   │
                  ┌────────────────┴────────────────┐
                  ▼                                 ▼
┌──────────────────────────────────┐ ┌──────────────────────────────────┐
│ SMS Part 1: Warning & Safety SOP │ │ SMS Part 2: Verified Helplines   │
├──────────────────────────────────┤ ├──────────────────────────────────┤
│ ⚠ RESQEARTH EMERGENCY ALERT      │ │ 🆘 RESQEARTH EMERGENCY CONTACTS  │
│ Type: FLOOD                      │ │                                  │
│ Severity: CRITICAL               │ │ National Emergency: 112          │
│ Region: Mumbai Suburban          │ │ Ambulance / Medical: 108         │
│                                  │ │ Disaster Helpline: 1070          │
│ Move to higher ground. Avoid low │ │ Women Helpline: 1091             │
│ lying roads and open drains.     │ │                                  │
│                                  │ │ Alert Ref: #FL-2026-MUM          │
│ Safety Guide:                    │ │ Stay calm and follow authorities.│
│ https://resqearth.antideploy.app │ └──────────────────────────────────┘
│ /disasters/flood                 │
└──────────────────────────────────┘
```

- **Privacy & Sanitization**: Phone numbers are masked (`+91 98*** **321`) in operational logs and delivery stores.
- **Idempotency**: Prevents duplicate SMS dispatch to the same recipient during concurrent runs.

---

## 14. Disaster Knowledge Portal

The `/disasters` knowledge library provides exhaustive, evidence-based safety guidance for **22 natural and man-made hazard categories**:

- **Natural Hazards (13)**: Floods, Flash Floods, Tropical Cyclones, Earthquakes, Landslides, Heatwaves, Cold Waves, Drought, Tsunami, Wildfires, Avalanches, Cloudbursts, Urban Flooding.
- **Man-Made & Industrial Hazards (9)**: Chemical Leaks (Toxic Gas), Industrial Explosions, Nuclear Emergencies, Dam Failure, Oil Spills, Urban Fires, Building Collapse, Stampedes, Transportation Accidents.
- **Structured Content Architecture for Each Guide**:
  - **Before (Preparedness & Planning)**: Structural mitigation, home safety inspections, emergency kit checklist.
  - **During (Survival SOPs)**: Immediate actionable steps (e.g., Drop, Cover & Hold On; Turn Around Don't Drown).
  - **After (Recovery & Health)**: Water purification, hazard inspection, electrical safety, disease prevention.
  - **What NOT To Do**: Critical warnings against common dangerous misconceptions.
  - **Emergency Kit Checklist**: Grab-bag essentials (water, non-perishable rations, torch, first aid, whistle, power bank, copies of documents).

---

## 15. Indian Disaster History & Government Directory

### Indian Disaster History (`/history`)
A curated chronological educational archive documenting major disaster events in modern Indian history, analyzing root causes, casualties, economic impact, and institutional reforms:
- **1984 Bhopal Gas Tragedy** (Toxic Methyl Isocyanate release → Environmental Protection Act 1986).
- **1999 Odisha Super Cyclone** (Category 5 storm → Formation of OSDMA & NDMA).
- **2001 Bhuj Earthquake** (M7.7 intraplate rupture → National Building Code revisions).
- **2004 Indian Ocean Tsunami** (Megathrust earthquake → National Disaster Management Act 2005).
- **2005 Mumbai Inundation** (Cloudburst + Mithi river blockage → Stormwater management overhaul).
- **2013 Kedarnath Flash Floods** (Glacial lake burst → Eco-sensitive zone guidelines).
- **2018 Kerala Floods** (Monsoon reservoir management → Integrated dam safety protocols).
- **2024 Wayanad Landslides** (Extreme downpours on deforested slopes → Western Ghats soil conservation).

### Statutory Government Directory (`/government-response`)
Comprehensive directory of verified statutory agencies with official mandates, helplines, and portal links:
- **National Agencies**: NDMA, NDRF, IMD, CWC (Central Water Commission), INCOIS, GSI (Geological Survey of India), FSI (Forest Survey of India), SASE (Snow & Avalanche Study Establishment), MoES, MHA, NIDM.
- **State Authorities**: 14 State Disaster Management Authorities (Maharashtra SDMA, Odisha SDMA, Gujarat GSDMA, Kerala SDMA, Tamil Nadu SDMA, etc.).

---

## 16. Technology Stack

```text
┌───────────────────────┬─────────────────────────────────────────────────────────────────┐
│ Layer                 │ Technology & Tools                                              │
├───────────────────────┼─────────────────────────────────────────────────────────────────┤
│ Frontend Framework    │ Next.js 15.2.1 (App Router), React 19, TypeScript 5.7           │
│ Styling & Components  │ Tailwind CSS 3.4, shadcn/ui, Framer Motion 12, Lucide React     │
│ GIS & Mapping         │ MapLibre GL JS 5.2.0, MapTiler Vector Basemaps, OpenStreetMap   │
│ Backend & Cloud BaaS  │ Cloud Firestore (v2 rules), Firebase Authentication             │
│ Form & Validation     │ React Hook Form 7.54, Zod 3.24                                  │
│ Charts & Analytics    │ Recharts 2.15                                                   │
│ External APIs         │ Open-Meteo, USGS Earthquakes, NASA EONET v3, OSM Nominatim      │
│ Emergency Alerts      │ Sequential Two-Message SMS Engine via Android GSM Gateway       │
│ Testing & Linting     │ Node.js Native Test Runner (tsx --test), ESLint 9, TypeScript    │
│ Production Hosting    │ Antideploy Container Infrastructure (Node.js 20 LTS)            │
└───────────────────────┴─────────────────────────────────────────────────────────────────┘
```

---

## 17. High-Level System Architecture

```text
                                  ┌────────────────────────────────┐
                                  │      Client Browser (User)     │
                                  └───────────────┬────────────────┘
                                                  │
                                                  ▼
                        ┌──────────────────────────────────────────────────┐
                        │              Next.js 15 App Router               │
                        │                                                  │
                        │  ┌──────────────┐ ┌──────────────┐ ┌──────────┐  │
                        │  │  Home Page   │ │   Live Map   │ │  Admin   │  │
                        │  │ (Dashboard)  │ │ (MapLibreGL) │ │ (/admin) │  │
                        │  └──────┬───────┘ └──────┬───────┘ └────┬─────┘  │
                        └─────────┼────────────────┼──────────────┼────────┘
                                  │                │              │
                                  ▼                ▼              ▼
                        ┌──────────────────────────────────────────────────┐
                        │            Feature & Logic Services              │
                        │                                                  │
                        │  • Unified Disaster Service (Data Normalizer)    │
                        │  • Explainable Risk Engine (0-100 Scorer)        │
                        │  • Weather Observation Service (Open-Meteo)      │
                        │  • Geolocation & Reverse Geocoder (Nominatim)    │
                        │  • Emergency SMS Broadcast Service               │
                        └─────────┬───────────────────────────────┬────────┘
                                  │                               │
                ┌─────────────────┴───────────────┐               │
                ▼                                 ▼               ▼
┌───────────────────────────────┐ ┌───────────────────┐ ┌───────────────────┐
│     External Live Feeds       │ │ Firebase BaaS     │ │ Android GSM       │
│ • Open-Meteo (Weather/Flood)  │ │ • Authentication  │ │ Gateway Adapter   │
│ • USGS (Earthquakes M2.5+)    │ │ • Cloud Firestore │ │ • SMS Part 1      │
│ • NASA EONET (Storms/Fires)   │ │ • Security Rules  │ │ • SMS Part 2      │
│ • NDMA / IMD (Official CAP)   │ └───────────────────┘ └───────────────────┘
│ • MapTiler / OSM (Tiles)      │
└───────────────────────────────┘
```

---

## 18. Project Folder Structure

```text
ESE Mini Project/
├── Resources/
│   ├── Documents/
│   │   ├── Brain.md             # Living persistent project state & audit log
│   │   ├── architecture.md      # Technical architecture & subsystem design
│   │   ├── PRD.md               # Product Requirements Document
│   │   ├── MVP.md               # Minimum Viable Product specification
│   │   ├── API.md               # API contracts & normalization specifications
│   │   └── design.md            # Design system, tokens & UX guidelines
│   └── Images/                  # Project diagrams & visual assets
├── Front-end/
│   ├── public/                  # Static assets & icons
│   ├── src/
│   │   ├── app/                 # Next.js 15 App Router pages
│   │   │   ├── (auth)/          # Login & Signup routes
│   │   │   ├── admin/           # Protected Admin Control Center
│   │   │   ├── disasters/       # Disaster knowledge portal & slug guides
│   │   │   ├── history/         # Indian disaster history archive
│   │   │   ├── government-response/ # Statutory agency directory
│   │   │   ├── map/             # Interactive GIS Live Map
│   │   │   ├── privacy/         # DPDP Act 2023 privacy policy
│   │   │   ├── terms/           # Terms of service
│   │   │   ├── cookies/         # Cookie policy
│   │   │   └── page.tsx         # Homepage & environmental dashboard
│   │   ├── components/          # Reusable UI & layout components
│   │   │   ├── common/          # Disaster cards, badges, banners, legends
│   │   │   ├── layout/          # Navbar, Footer, Route containers
│   │   │   └── ui/              # shadcn/ui primitive components
│   │   ├── features/            # Domain-driven feature modules
│   │   │   ├── auth/            # Firebase Auth hooks, forms, role guards
│   │   │   ├── disasters/       # Multi-hazard layers, cards, list panels
│   │   │   ├── map/             # MapLibre container, viewport, styles
│   │   │   ├── risk/            # Explainable 0-100 risk scoring engine
│   │   │   ├── weather/         # Open-Meteo telemetry & WMO interpreters
│   │   │   └── notifications/   # In-site warning banners
│   │   ├── lib/                 # Firebase app init & utility functions
│   │   ├── services/            # SMS gateway & external service clients
│   │   └── types/               # Global TypeScript interface definitions
│   ├── package.json             # Frontend dependencies & scripts
│   ├── tsconfig.json            # TypeScript configuration
│   └── tailwind.config.ts       # Tailwind CSS design tokens
└── README.md                    # Root project documentation
```

---

## 19. Environment Variables

Create a `.env.local` file inside the `Front-end/` directory based on `.env.example`.

> **Security Invariant:** Never commit real API keys, Firebase credentials, or SMS secrets to version control. Placeholders are shown below:

```bash
# Application URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_ENV=development

# Firebase Web Client Configuration (Firebase Console -> Project Settings)
NEXT_PUBLIC_FIREBASE_API_KEY=your-firebase-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project-id.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your-measurement-id

# MapTiler / MapLibre Basemap Configuration
NEXT_PUBLIC_MAPTILER_API_KEY=your-maptiler-api-key
NEXT_PUBLIC_MAP_TILE_URL=https://tile.openstreetmap.org/{z}/{x}/{y}.png
NEXT_PUBLIC_MAP_ATTRIBUTION="&copy; OpenStreetMap contributors"

# External Disaster API Endpoints
NEXT_PUBLIC_OPEN_METEO_BASE_URL=https://api.open-meteo.com/v1
NEXT_PUBLIC_OPEN_METEO_FLOOD_BASE_URL=https://flood-api.open-meteo.com/v1
NEXT_PUBLIC_USGS_BASE_URL=https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary
NEXT_PUBLIC_EONET_BASE_URL=https://eonet.gsfc.nasa.gov/api/v3
NEXT_PUBLIC_SACHET_BASE_URL=https://sachet.ndma.gov.in
NEXT_PUBLIC_NOMINATIM_BASE_URL=https://nominatim.openstreetmap.org

# Emergency SMS Gateway (Server-Side Only - Never Exposed to Client)
SMS_GATEWAY_URL=http://your-sms-gateway-ip:8080
SMS_GATEWAY_API_KEY=your-sms-gateway-secret-token
```

---

## 20. Local Setup & Installation

### Prerequisites
- **Node.js**: `v18.20.0` or higher (LTS recommended)
- **npm**: `v9.0.0` or higher
- **Git**: Installed and configured

### Step-by-Step Installation

```bash
# 1. Clone the repository
git clone https://github.com/Shreyas-84524/ResQEarth.git
cd "ResQEarth/Front-end"

# 2. Install all dependencies
npm install

# 3. Create and configure local environment file
cp .env.example .env.local
# (Edit .env.local with your preferred credentials or use defaults for offline/mock mode)

# 4. Start the local development server
npm run dev
```

Open your browser and navigate to `http://localhost:3000`.

---

## 21. Build, Test & Validation Commands

```bash
# Run static type checking with TypeScript compiler
npm run type-check

# Run Next.js and ESLint code quality verification
npm run lint

# Execute full automated unit and integration test suite (56 tests)
npm test

# Build production-ready Next.js standalone application (41 routes)
npm run build

# Start the compiled production build locally
npm start
```

---

## 22. Production Deployment Information

ResQEarth is continuously deployed on **Antideploy Container Platform**:

- **Production URL**: [https://resqearth.antideploy.app](https://resqearth.antideploy.app)
- **Runtime**: Node.js 20 LTS standalone container
- **Health Check**: Automated HTTP 200 health check verification on `/`
- **Secrets Management**: 20 production secrets and environment variables synchronized securely via platform secrets engine.

---

## 23. Known Limitations

1. **NASA EONET Ingestion Latency**: Upstream cold fetches of the NASA EONET v3 GeoJSON event catalog (~800 KB) occasionally take 30–45s on cold starts. ResQEarth mitigates this with client-side caching and fallback mock events.
2. **SMS Gateway Cellular Dependency**: SMS dispatch requires an active Android SIM gateway with cellular reception; if the gateway is offline, dispatch status is gracefully logged as failed without crashing the UI.
3. **Client Geolocation Permissions**: High-accuracy GPS positioning requires explicit browser permission; if denied, the platform defaults to the Mumbai Metropolitan surveillance preset.

---

## 24. Environmental Science & Engineering (ESE) Alignment

ResQEarth is submitted as a Second-Year Engineering Environmental Science capstone project, directly addressing the core pillars of the **Disaster Risk Reduction (DRR)** lifecycle:

```text
┌──────────────────────────────┬───────────────────────────────────────────────────────────┐
│ ESE Curriculum Pillar        │ ResQEarth Engineering Implementation                      │
├──────────────────────────────┼───────────────────────────────────────────────────────────┤
│ 1. Hazard Mitigation         │ Vulnerability mapping, historical disaster trend analysis │
│                              │ (/history), coastal baseline risk factors.                │
├──────────────────────────────┼───────────────────────────────────────────────────────────┤
│ 2. Community Preparedness    │ 22 comprehensive hazard guides, interactive emergency kit │
│                              │ checklists, phased Before/During/After standard protocols.│
├──────────────────────────────┼───────────────────────────────────────────────────────────┤
│ 3. Early Warning Systems     │ Explainable composite 0-100 risk scoring, multi-source    │
│                              │ telemetry integration, automated threshold detection.     │
├──────────────────────────────┼───────────────────────────────────────────────────────────┤
│ 4. Emergency Response        │ Out-of-band two-stage emergency SMS broadcast with direct │
│                              │ integration to national SOS helplines (112, 108, 1070).   │
├──────────────────────────────┼───────────────────────────────────────────────────────────┤
│ 5. Environmental Governance  │ Sourced directory of 11 statutory national agencies and   │
│                              │ 14 State SDMAs (/government-response).                    │
└──────────────────────────────┴───────────────────────────────────────────────────────────┘
```

---

## 25. Statutory & Academic Disclaimer

> **IMPORTANT NOTICE:**
> 
> 1. **Academic Decision-Support Platform**: ResQEarth is developed strictly for educational, academic assessment, and research purposes.
> 2. **Not an Official Warning Authority**: ResQEarth is **not** an official government agency and does **not** replace statutory sirens, official evacuation orders, or emergency decrees issued by the National Disaster Management Authority (NDMA), India Meteorological Department (IMD), or local District Disaster Management Authorities (DDMA).
> 3. **Calculated Risk vs. Official Alert**: All internally computed scores are prominently labeled **RESQEARTH CALCULATED RISK** and must not be construed as official government declarations.

---

## 26. Future Roadmap

- [ ] **Offline PWA Support**: Progressive Web App caching with Service Worker background synchronization for offline field use.
- [ ] **Crowdsourced Citizen Reporting**: Geo-tagged incident reporting allowing verified citizens to report localized flooding, tree falls, and roadblocks with photo attachments.
- [ ] **Multilingual Localization**: Full support for Indian regional languages (Hindi, Marathi, Bengali, Tamil, Telugu, Gujarati).
- [ ] **LoRaWAN Mesh Integration**: Emergency broadcast bridge connecting to long-range low-power LoRa mesh radios for zero-cellular disaster zones.
- [ ] **AI Hazard Forecasting**: Machine learning models predicting localized urban inundation 3–6 hours in advance based on radar reflectivity and terrain slope data.

---

**Developed with ❤️ for Academic Excellence & Disaster Resilience.**
