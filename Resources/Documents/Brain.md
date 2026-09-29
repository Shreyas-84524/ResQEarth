# ResQEarth — Persistent AI Working Memory

> **This file is the persistent working memory for AI coding agents working on ResQEarth.**

> Before performing any implementation task, read this file together with `architecture.md`, `PRD.md`, and `MVP.md` when relevant. Update this file after meaningful implementation decisions, architecture changes, completed phases, discovered issues, or important project-state changes.

**Current factual state:** Phase 1.2 Design System complete (PASS); reusable UI primitives, domain cards, severity indicators, and global tokens implemented in `Front-end/`.  
**Last context update:** 2026-09-29  
**Quick-start for the next agent:** Read **Last Session Handoff**, **Current Work Position**, **Current Blockers**, and the applicable source-of-truth document before changing files.

## 1. Project Identity

```text
Project Name: ResQEarth
Project Type: Web Application
Academic Context: Second-Year Engineering ESE Project
Primary Domain: Disaster Management + Environmental Science
Primary Goal: Disaster awareness, preparedness, warning and response support
```

ResQEarth is a responsive disaster-management and environmental-risk platform. It brings environmental observations, multi-source disaster events, geospatial awareness, explainable risk indicators, preparedness guidance, and emergency communication into one web experience.

The system supports the lifecycle **mitigation → preparedness → early warning → response → recovery/awareness** for natural and man-made disasters. It serves public visitors, authenticated citizens, and authorized administrators while emphasizing mobile use, accessibility, provenance, privacy, and graceful failure.

ResQEarth is submitted primarily as an Environmental Science project. Technical choices must reinforce environmental monitoring, hazard education, community preparedness, government-response awareness, and the role—and limits—of IT in resilient communities.

## 2. Core Project Objective

ResQEarth is intended to provide:

- live or near-live environmental and weather information;
- disaster-event visualization and geospatial awareness;
- local disaster-risk estimation with visible contributing factors;
- government/official alert visibility with source attribution;
- consent-based browser notifications and SMS disaster warnings;
- disaster precautions and emergency contact information;
- historical Indian disaster information; and
- verified government disaster-response resources.

ResQEarth is **an educational and decision-support platform**. It is **not an official government emergency-warning authority** and does not replace authorities or established emergency services. Internally calculated risks must always be labeled **RESQEARTH CALCULATED RISK** and never represented as an **OFFICIAL ALERT**.

## 3. Current Root Folder Structure

```text
/
├── Resources/
│   ├── Images/
│   └── Documents/
├── Front-end/
└── Backend/
```

Rules:

- Do not rename `Resources`, `Front-end`, or `Backend`.
- Documentation belongs under `Resources/Documents/`.
- Reference images, approved logos, and documentation assets belong under `Resources/Images/` where appropriate.
- Frontend implementation belongs only under `Front-end/`.
- Trusted services, integrations, alert processing, and backend code belong only under `Backend/`.
- Do not create alternate canonical roots such as `frontend`, `backend`, `docs`, or `assets`.

## 4. Documentation Source of Truth

```text
Resources/Documents/architecture.md
Resources/Documents/PRD.md
Resources/Documents/MVP.md
Resources/Documents/Brain.md
```

| File | Role |
|---|---|
| `architecture.md` | Technical architecture, component boundaries, data contracts, security, failure behavior, and deployment design. |
| `PRD.md` | Full product requirements, user journeys, requirement IDs, and acceptance criteria. |
| `MVP.md` | Immediate build scope, P0/P1/P2 priorities, acceptance gates, demo flow, and scope-stop conditions. |
| `Brain.md` | Live AI implementation context, decisions, status, blockers, validation memory, and handoff. |

`Brain.md` must not contradict the other three documents. If a conflict appears:

1. Identify and report the conflict; do not silently choose.
2. Prefer an explicit newer user instruction.
3. Otherwise preserve the existing documented architecture.
4. Update affected source documents only when the task explicitly requests or requires those documentation changes.
5. Record a confirmed architectural change in the Important Decisions log.

## 5. Current Technology Stack

### Frontend

```text
Next.js
React
TypeScript
Tailwind CSS
shadcn/ui
Framer Motion
Lucide React
React Hook Form
Zod
MapLibre GL JS
Recharts
Firebase Web SDK
```

### Backend and platform

```text
Firebase Authentication
Cloud Firestore
Firebase Cloud Messaging
Secure backend/server routes
SMS Gateway integration
External disaster APIs
```

**Version control:** GitHub  
**Target deployment:** Antideploy

The trusted backend may use Firebase Functions or another lightweight TypeScript server runtime. Hosting-specific details must remain isolated. External providers and the SMS gateway must be replaceable through adapters where practical.

## 6. Authentication Model

Signup fields:

```text
Name
Phone Number
Email
Password
Confirm Password
```

Authentication uses **Firebase Email + Password**. The phone number is stored for consented disaster-warning SMS use and is **not used as Firebase Phone Authentication in the MVP**. Passwords are managed by Firebase Authentication and must never be stored in Firestore.

Roles are exactly:

```text
citizen
admin
```

Public signup always creates `citizen`. Admin accounts are provisioned through a trusted, audited path and must not be creatable or assignable through public signup. Authorization must be enforced by backend checks and Firestore Security Rules, not only by UI visibility.

## 7. User Profile Model

```text
users/{uid}

name
email
phone
role
createdAt
notificationConsent
smsConsent
lastKnownLocation
```

User-scoped preferences and notification tokens should be nested under the user as defined in `architecture.md`. Avoid unnecessary location history and never imply continuous tracking. Location access requires consent. Geolocation denial, timeout, and unavailable states must be supported, and manual location selection must remain available. Stored location should be optional, purpose-limited, and timestamped.

## 8. Public Website Experience

An unauthenticated visitor must still see:

- ResQEarth hero, branding, and mission;
- current selected location;
- weather and environmental statistics;
- live/near-live disaster-map overview and major events;
- preparedness and disaster knowledge links;
- verified government-resource links; and
- Login and Signup calls to action.

The homepage must immediately communicate **environmental monitoring + disaster awareness**. Dynamic content must show source and freshness or a clear unavailable/stale state.

## 9. Authenticated Citizen Experience

Authenticated citizens gain:

- location-aware disaster information and nearby-event detection;
- deterministic, explained risk score;
- personalized in-site warnings;
- opt-in browser notifications and SMS eligibility;
- richer map interaction; and
- direct disaster-precaution links.

The map should support panning, dragging, wheel zoom, zoom controls, touch gestures, current location, markers, popups, clusters, category/severity/time filters, and heatmaps where appropriate. Essential event information must also be available outside the map in an accessible list.

## 10. Map Architecture

Canonical GIS technology: **MapLibre GL JS**.

```text
External API
    ↓
Provider Adapter
    ↓
Normalized DisasterEvent
    ↓
Map Data Layer / GeoJSON
    ↓
MapLibre GL JS
```

Use a compliant OpenStreetMap-compatible basemap with visible attribution. Keep tile/provider selection replaceable. Provider-specific payloads must never directly control map or UI implementation. Coordinates use WGS84 with explicit longitude/latitude ordering. Unknown locations must not produce false markers or proximity claims.

## 11. Disaster Data Sources

| Category | Intended provider(s) | Current note |
|---|---|---|
| Weather | Open-Meteo | Endpoint verification/integration pending. |
| Flood/river | Open-Meteo Flood API / GloFAS | Endpoint availability/terms pending. |
| Earthquakes | USGS Earthquake GeoJSON | Integration pending. |
| Global natural events | NASA EONET and/or GDACS | Final MVP selection pending validation. |
| Indian official information/alerts | NDMA SACHET and IMD | Access, reuse terms, and endpoint details pending. |

Exact credentials and endpoints may still be pending. Provider adapters isolate fetch, validation, normalization, health, and provenance. One failed provider must not break the entire site. Official alerts retain source attribution and the **OFFICIAL ALERT** label; calculated indicators use **RESQEARTH CALCULATED RISK**. Curated/demo fixtures must be explicitly labeled and never presented as live data.

## 12. Normalized Disaster Event Model

Conceptual minimum:

```text
DisasterEvent

id
type
title
description
latitude
longitude
severity
source
sourceUrl
startedAt
updatedAt
status
region
metadata
```

The architecture also anticipates provider/providerEventId, sourceType, geometry/centroid, affected regions, expiry, fetch time, and freshness. The model may evolve through an explicit decision, but provider-specific payloads must not leak across the application. Provider event IDs support idempotency and deduplication.

## 13. Supported Disaster Categories

### Natural

- Flood
- Urban Flood
- Cyclone
- Earthquake
- Tsunami
- Landslide
- Heat Wave
- Cold Wave
- Drought
- Lightning
- Forest Fire / Wildfire
- Avalanche
- Severe Storm / Thunderstorm

### Man-made

- Industrial Accident
- Chemical Leak
- Biological Emergency
- Nuclear / Radiological Emergency
- Urban Fire
- Building Collapse
- Oil Spill
- Transport Accident
- Major Pollution Incident

## 14. Disaster Risk Engine

The MVP risk engine is **deterministic, rule-based, explainable, and versioned**—not primarily machine learning.

Possible input categories: rainfall, precipitation probability, river discharge, severe weather, nearby disasters, official warnings, recent regional incidents, distance, severity, and other reviewed regional conditions.

```text
0–20   LOW
21–40  GUARDED
41–60  MODERATE
61–80  HIGH
81–100 CRITICAL
```

The output must include a clamped score, band, calculation/input timestamps, model version, missing/stale-input note, and visible contributions. Example:

```text
Flood Risk: 76 / 100

Heavy Rainfall           +28
River Discharge          +22
Official Warning         +14
Recent Incidents          +8
Other Factors             +4
```

Do not call the score an official warning or forecast. Missing data must never silently imply safety.

## 15. Nearby Disaster Detection

Calculate geographic distance between user coordinates and disaster coordinates. The MVP uses backend-authoritative Haversine distance for point events. Polygon or nearest-geometry logic is a future refinement; centroid-only results must be described as approximate.

Configurable radii:

```text
10 km
25 km
50 km
100 km
```

Radius may differ later by disaster type and severity. Validate coordinate ranges and suppress proximity claims when location is unknown.

## 16. Alert Types

Canonical `sourceType` values:

```text
official
automatic
manual-admin
```

Conceptual alert object:

```text
id
title
description
disasterType
severity
source
sourceType
region
latitude
longitude
radiusKm
instructions
createdAt
expiresAt
createdBy
status
```

The complete model also supports `targetMode`, event IDs, and a dedupe key. Lifecycle states are draft, active, expired, cancelled, or superseded. Provenance must remain visible.

## 17. Automatic Alert Logic

An automatic alert candidate may be generated when:

```text
official alert affects region
OR
severe disaster is nearby
OR
risk threshold is crossed
```

Required safeguards: server validation, duplicate suppression/idempotency, expiration, notification consent, SMS consent, region matching, source event tracking, and already-notified-user tracking. Automatic risk-triggered creation is P1; calculated risk display and the manual-admin demonstration are P0.

## 18. Firebase Cloud Messaging

FCM provides consent-based browser notifications. The design supports an explained permission request, token registration/storage, token refresh/invalidation, foreground notifications, background service-worker notifications, and click-through to allowlisted internal routes such as `/disasters/flood`.

Do not prompt automatically on first load or repeatedly nag a user who denied permission. Notification denial must not block the site or in-site warnings. A provider acceptance response is not proof a human saw the warning.

## 19. Admin Control Center

Canonical protected route: `/admin`.

Only a server-verified `role = admin` may access admin data or actions. Expected capabilities:

- view active alerts, current disasters, high-risk regions, and map;
- create/cancel a manual warning;
- target all users, state, city, region, or radius around a point;
- choose disaster type/severity and define message, precautions, and expiration;
- preview eligible-user coverage before confirmation;
- review SMS/FCM attempts and notification statistics; and
- inspect provider/API service health and freshness.

Admin actions and role changes require audit records. Client previews and hidden controls are not security boundaries.

## 20. Manual Alert Demo Flow

This is a core ESE demonstration workflow:

```text
Admin
  ↓
Create Manual Alert
  ↓
Select Disaster Type
  ↓
Select Region / Map Point
  ↓
Select Radius
  ↓
Set Severity
  ↓
Enter Warning
  ↓
Enter Precautions
  ↓
Preview / Find Eligible Users
  ↓
Confirm and Create Alert
  ↓
In-site Warning + FCM Notification + SMS Warning
  ↓
Record Outcomes and Audit
```

Demo warnings must be unmistakably labeled **SIMULATION / COLLEGE DEMO**. Backend logic determines recipients.

## 21. SMS Gateway

Use the existing/free SMS-gateway infrastructure through a secure backend adapter.

```text
Frontend/Admin
    ↓
Secure Backend
    ↓
SMS Service and Two-Part Template
    ↓
Gateway
    ↓
Android SIM
    ↓
Citizen Phone
```

Never expose the gateway API key, secret, privileged endpoint credentials, or raw token in frontend JavaScript, source control, URLs, or routine logs. SMS dispatch must check consent and eligibility, use idempotency/bounded retries, mask phone numbers in operational views, and record attempt status without claiming guaranteed delivery.

## 22. Two-Message SMS Design

**SMS 1 — warning, precautions, and guide:**

```text
⚠ FLOOD WARNING

High flood risk has been detected in your area.

Avoid flooded roads and low-lying areas.

Safety Guide:
https://site/disasters/flood
```

**SMS 2 — emergency contacts:**

```text
EMERGENCY NUMBERS

112 - National Emergency
100 - Police
101 - Fire
108 - Ambulance

More Information:
https://site
```

All emergency numbers, wording, and destination URLs must be verified before production or a public demonstration. The two parts require a common alert/dispatch identifier and must not duplicate on retry.

## 23. Disaster Knowledge Portal

Canonical routes:

```text
/disasters
/disasters/[slug]
```

Each disaster page includes overview, definition, causes, environmental factors, warning signs, human impact, environmental impact, before/during/after guidance, emergency kit, what not to do, verified emergency numbers, government resources, useful links, and references. Direct SMS links must load quickly on mobile without authentication or map success.

P0 core slugs: `flood`, `cyclone`, `earthquake`, `landslide`, `heat-wave`, and `chemical-leak`.

## 24. Disaster History Page

Canonical route: `/history`.

The page presents a sourced timeline of major Indian disasters to teach causes, impacts, environmental consequences, and lessons. Filters may include disaster type, year, state, and severity/category. Curated local structured data is approved for the MVP; each entry requires date, event name, location, type, cause, human/environmental impact, lessons, and sources.

## 25. Government Response Page

Canonical route: `/government-response`.

Initial bodies: NDMA, NDRF, IMD, CWC, INCOIS, Ministry of Home Affairs, and Ministry of Earth Sciences. Each entry contains full name, abbreviation, responsibilities, disaster importance, and verified official website. Use an official logo only after its source and usage are approved; do not fabricate logos.

## 26. Other Required Public Pages

```text
/about
/privacy
/terms
/cookies
```

Cookie choices:

```text
Accept All
Essential Only
Manage Preferences
```

About explains the ESE purpose, lifecycle, technology, environmental relevance, limitations, and emergency disclaimer. Privacy and Terms must describe actual behavior and limitations without unsupported legal-compliance claims. No unnecessary tracking is assumed for the MVP.

## 27. ESE Alignment

Keep ResQEarth strongly aligned with:

- disaster management, natural hazards, and man-made hazards;
- environmental monitoring and air/water/weather/environment interactions;
- flood risk, climate-related disasters, pollution, and environmental impacts;
- mitigation, preparedness, response, recovery, and public awareness;
- Indian government/scientific institutions and response mechanisms;
- the role and limits of IT in environmental protection; and
- sustainable, resilient communities.

When two features have similar technical value, prefer the feature with stronger ESE relevance.

## 28. Current Implementation Plan

Approved structure: **5 major phases × 8 sub-phases = 40 implementation steps**.

```text
Phase 1 — Foundation, UI, Firebase & Authentication
Phase 2 — Maps, Environmental APIs & Disaster Intelligence
Phase 3 — Alerts, Admin Control Center & SMS Gateway
Phase 4 — ESE Knowledge Portal, History & Government Resources
Phase 5 — Production Hardening, Testing & Submission
```

### Current Work Position

```text
Current Major Phase: Phase 1 — Foundation, UI, Firebase & Authentication
Current Sub-Phase: Phase 1.2 Design System and Global Layout
Current Status: PASS
Last Completed Sub-Phase: Phase 1.2 Design System and Global Layout
Next Intended Sub-Phase: Phase 1.3 Firebase Project Connection
```

## 29. Implementation Status Table

Allowed statuses: `NOT STARTED`, `IN PROGRESS`, `BLOCKED`, `PASS`, `NEEDS REVIEW`.

| Phase | Sub-Phase | Status | Notes |
|---:|---|---|---|
| 1 | 1.1 Project Bootstrap | PASS | Next.js 15, TypeScript, Tailwind CSS, shadcn/ui, Framer Motion, Lucide React, React Hook Form, Zod, Recharts, MapLibre GL JS, Firebase Web SDK initialized and validated. |
| 1 | 1.2 Design System and Global Layout | PASS | Global tokens, HSL palette, dark/light theme, typography, responsive utilities, UI primitives (Button, Input, Textarea, Label, Card, Badge, Alert, Dialog, Select, Skeleton, EmptyState, ErrorState, PageHeader), accessible Severity components (Low to Critical with dual text+icon), and domain cards (WeatherCard, DisasterCard, RiskIndicator, MapOverlay, AdminDashboardCard, NotificationBanner). |
| 1 | 1.3 Firebase Project Connection | NOT STARTED | Environment-based client/server setup; no committed secrets. |
| 1 | 1.4 Signup and Profile Creation | NOT STARTED | Email/password Auth; citizen profile and consent fields. |
| 1 | 1.5 Login, Logout and Auth State | NOT STARTED | Safe errors and protected-session behavior. |
| 1 | 1.6 Roles and Route Authorization | NOT STARTED | Citizen/admin isolation in UI, backend, and Firestore Rules. |
| 1 | 1.7 Public Homepage Shell | NOT STARTED | Hero, mission, dashboard regions, content/CTA placeholders with real states. |
| 1 | 1.8 Foundation Validation | NOT STARTED | Build/type/lint/auth/rules/responsive checks; Phase 1 regression pass. |
| 2 | 2.1 MapLibre Base Map | NOT STARTED | Approved tiles, attribution, controls, accessible map/list structure. |
| 2 | 2.2 Geolocation and Manual Location | NOT STARTED | Consent, denial/timeout handling, manual selection. |
| 2 | 2.3 Provider Adapter Framework | NOT STARTED | Fetch/validate/normalize/health/provenance boundary. |
| 2 | 2.4 Weather Integration | NOT STARTED | Open-Meteo cards, units, source, freshness, fallback. |
| 2 | 2.5 Earthquake and Global Event Integrations | NOT STARTED | USGS plus NASA EONET or GDACS after verification. |
| 2 | 2.6 Flood and Indian Source Evaluation | NOT STARTED | Integrate only verified sources; label unavailable/curated data honestly. |
| 2 | 2.7 Unified Events, Map Layers and Nearby Detection | NOT STARTED | Normalized GeoJSON, markers, clusters, filters, Haversine distance. |
| 2 | 2.8 Explainable Risk Engine and Phase Validation | NOT STARTED | Versioned rules, contribution UI, boundaries, partial-provider tests. |
| 3 | 3.1 Unified Alert Model and Lifecycle | NOT STARTED | Source types, statuses, dedupe, expiry, Firestore model. |
| 3 | 3.2 In-Site Citizen Warnings | NOT STARTED | Target-aware warning list/detail independent of FCM. |
| 3 | 3.3 Admin Control Center Shell | NOT STARTED | Protected dashboard, health, events, alerts, map, empty/failure states. |
| 3 | 3.4 Manual Warning Form and Preview | NOT STARTED | Validated type/severity/target/message/instructions/expiry and preview. |
| 3 | 3.5 Regional and Radius Targeting | NOT STARTED | Server-authoritative eligibility, consent, exact-distance filtering. |
| 3 | 3.6 Firebase Cloud Messaging | NOT STARTED | Permission, token lifecycle, foreground/background, safe click routes. |
| 3 | 3.7 SMS Gateway and Two-Part Dispatch | NOT STARTED | Server-only adapter, templates, idempotency, masked status. |
| 3 | 3.8 End-to-End Warning Demo and Phase Validation | NOT STARTED | Admin → citizen → in-site/FCM/SMS; audit, expiry, failure, dedupe tests. |
| 4 | 4.1 Disaster Content Schema and Index | NOT STARTED | Natural/man-made taxonomy, sourced content model, `/disasters`. |
| 4 | 4.2 Core Natural-Disaster Pages | NOT STARTED | Flood, cyclone, earthquake, landslide, heat wave. |
| 4 | 4.3 Core Man-Made Disaster Pages | NOT STARTED | Chemical leak plus priority man-made guidance. |
| 4 | 4.4 Emergency Contacts and Mobile SMS Landing UX | NOT STARTED | Verified contacts, fast direct links, 360 px usability. |
| 4 | 4.5 Indian Disaster History Timeline | NOT STARTED | Curated sourced data and required filters. |
| 4 | 4.6 Government Response Directory | NOT STARTED | Verified bodies/sites; approved logos only. |
| 4 | 4.7 About, Privacy, Terms and Cookies | NOT STARTED | Actual behavior, disclaimer, three cookie actions, no legal overclaims. |
| 4 | 4.8 ESE Content Review and Phase Validation | NOT STARTED | Lifecycle/impact/government/IT alignment, citations, mobile/accessibility. |
| 5 | 5.1 Security Hardening | NOT STARTED | Rules, authz, validation, rate limits, XSS, secrets, least privilege. |
| 5 | 5.2 Resilience, Caching and Observability | NOT STARTED | Partial/stale/offline states, last success, safe logs, provider health. |
| 5 | 5.3 Performance Optimization | NOT STARTED | Fast public/SMS routes, lazy heavy modules, bounded payloads. |
| 5 | 5.4 Accessibility Validation | NOT STARTED | Keyboard, focus, semantics, contrast, text severity, map alternatives. |
| 5 | 5.5 Responsive and Cross-Browser Validation | NOT STARTED | Required viewport matrix and supported browsers/devices. |
| 5 | 5.6 Automated and End-to-End Test Completion | NOT STARTED | Unit, contract, integration, security, and demo-flow suites. |
| 5 | 5.7 Antideploy Production Deployment | NOT STARTED | Environment verification, build, HTTPS/FCM/server feature smoke tests. |
| 5 | 5.8 Submission Audit and Handoff | NOT STARTED | P0 checklist, demo rehearsal, documentation/context, known limitations. |

Do not mark a row `PASS` based only on code presence. Update status, notes, Current Work Position, validation summary, and handoff together after meaningful progress.

## 30. API Status Table

Allowed statuses: `PENDING`, `AVAILABLE`, `CONNECTED`, `TESTED`, `FAILED`, `NOT USED`.

| Provider | Purpose | Status | Credentials Needed | Notes |
|---|---|---|---|---|
| Open-Meteo | Weather | PENDING | No/Unknown | Intended P0 provider; endpoint/terms not yet verified in repository. |
| Open-Meteo Flood / GloFAS | Flood/river data | PENDING | No/Unknown | Access and MVP feasibility not yet verified. |
| USGS | Earthquakes | PENDING | No expected, unverified | GeoJSON integration not started. |
| NASA EONET | Global natural events | PENDING | TBD | Candidate; final selection not made. |
| GDACS | Global disaster events | PENDING | TBD | Candidate; final selection not made. |
| NDMA SACHET | Indian official alerts | PENDING | TBD | Endpoint/access/reuse details pending. |
| IMD | Indian weather/official information | PENDING | TBD | Endpoint/access/reuse details pending. |
| Map tile provider | OSM-compatible basemap | PENDING | TBD | Provider, usage limits, and attribution must be approved. |
| Firebase | Auth, Firestore, FCM | PENDING | Project configuration required | No Firebase implementation/configuration exists yet. |
| SMS Gateway | Two-part SMS alerts | PENDING | Existing gateway details required | Credentials must remain backend-only; integration not started. |
| Antideploy | Production hosting | PENDING | Deployment access/configuration required | Required runtime/FCM/HTTPS capabilities not yet verified. |

Never invent credentials or upgrade a status without evidence. `AVAILABLE` means access/terms were verified; `CONNECTED` means configured in the project; `TESTED` requires a recorded successful test.

## 31. Current Blockers

No blockers currently prevent proceeding to Phase 1.2 (Design System and Global Layout). Known prerequisites/pending inputs for later phases are:

- Firebase project credentials/configuration for Phase 1.3 (Firebase Project Connection);
- exact external disaster API endpoints and any access tokens for Phase 2;
- SMS gateway endpoint/credentials/test-recipient details for Phase 3.7;
- Antideploy deployment environment configuration for Phase 5.7;
- official agency logos and verified permissions for Phase 4.6.

When a blocker becomes active, state the affected sub-phase, evidence, attempted safe alternatives, owner/input needed, and next action. Never bypass a missing credential with a fabricated value.

## 32. Important Decisions

Entries are chronological records. Never delete a decision that explains the current architecture; mark it superseded and reference the replacement.

### Decision D-001

**Date:** 2026-09-29  
**Decision:** Build a responsive web application instead of a Flutter/native application.  
**Reason:** Deadline, feasibility, direct mobile-link access, and broad browser availability.  
**Impact:** Implementation is divided into `Front-end/` and `Backend/`; native apps are P2.

### Decision D-002

**Date:** 2026-09-29  
**Decision:** Use Firebase Authentication, Cloud Firestore, and Firebase Cloud Messaging as the primary platform services.  
**Reason:** The approved architecture needs identity, profiles/data, security rules, and browser notifications within MVP constraints.  
**Impact:** Privileged Firebase operations remain server-side; public signup uses email/password.

### Decision D-003

**Date:** 2026-09-29  
**Decision:** Use GitHub for version control and target Antideploy for deployment.  
**Reason:** Project requirements.  
**Impact:** Hosting-specific assumptions remain isolated so the provider can be replaced if necessary.

### Decision D-004

**Date:** 2026-09-29  
**Decision:** Use MapLibre GL JS with a compliant OSM-compatible basemap and provider-independent event layers.  
**Reason:** Multi-source GIS visualization without coupling the UI to one disaster provider.  
**Impact:** All provider payloads pass through adapters and normalization before map rendering.

### Decision D-005

**Date:** 2026-09-29  
**Decision:** Use Firebase email/password authentication; keep phone as SMS contact data, not Firebase Phone Auth in the MVP.  
**Reason:** Simpler approved identity flow while retaining consented emergency communication.  
**Impact:** Signup collects phone but Firebase Auth receives email/password only.

### Decision D-006

**Date:** 2026-09-29  
**Decision:** Use a deterministic, explainable, versioned risk engine for the MVP.  
**Reason:** Auditability, educational clarity, and deadline suitability.  
**Impact:** Scores expose contributions and never use official-warning language; ML is P2.

### Decision D-007

**Date:** 2026-09-29  
**Decision:** Send disaster communication as two SMS messages: warning/precautions/guide, then verified emergency contacts.  
**Reason:** Separate immediate hazard guidance from reusable contact information.  
**Impact:** Dispatch is correlated, idempotent, consent-aware, server-only, and logged.

### Decision D-008

**Date:** 2026-09-29  
**Decision:** Cover both natural and man-made disasters.  
**Reason:** Full ESE disaster-management scope and project requirements.  
**Impact:** Taxonomy, knowledge portal, filters, risk inputs, and admin forms support both categories.

### Decision D-009

**Date:** 2026-09-29  
**Decision:** Make protected manual regional warnings a core demo feature.  
**Reason:** It provides a controllable end-to-end demonstration of targeting, in-site warning, FCM, and SMS.  
**Impact:** Manual-admin flow is P0; automatic risk-triggered creation is P1.

### Decision D-010

**Date:** 2026-09-29  
**Decision:** Preserve strict provenance categories: official, automatic, and manual-admin.  
**Reason:** Prevent misleading risk and alert communication.  
**Impact:** Source labels, audit information, timestamps, and limitations are required throughout the UI/data model.

## 33. AI Coding Rules

1. Read `Brain.md` before implementation.
2. Read `architecture.md`, `PRD.md`, and `MVP.md` when the task touches their scope.
3. Never silently change architecture; surface conflicts and obtain/obey explicit direction.
4. Never rename the canonical folders.
5. Do not expose secrets in client code, source control, URLs, output, or logs.
6. Do not hardcode credentials; use approved environment/secret storage.
7. Do not fabricate API data and present it as live.
8. Do not create fake official disaster alerts; label simulations clearly.
9. Do not call ResQEarth risk scores official alerts or forecasts.
10. Preserve `citizen`/`admin` isolation; public signup is never admin.
11. Enforce permissions in backend authorization and Firestore Security Rules, not only frontend guards.
12. Handle API failures independently and expose partial/stale/freshness states.
13. Mobile UX is mandatory, especially SMS-linked disaster pages.
14. Avoid unnecessary dependencies; verify need, license, maintenance, and bundle impact.
15. Avoid duplicate implementations, service wrappers, models, and sources of truth.
16. Prefer shared, typed, reusable services and components with clear feature boundaries.
17. Do not introduce mocks/fixtures into production paths without explicit visible labeling.
18. Do not remove or regress completed features while implementing later phases.
19. Test previous critical flows after major changes.
20. Update `Brain.md` after meaningful progress, decisions, blockers, tests, or handoff changes.

Additional operating rules:

- Follow P0/P1/P2 scope and the stop conditions in `MVP.md`.
- Never treat missing data as evidence of safety.
- Preserve source attribution, timestamps, and emergency disclaimers.
- Do not send an unlabeled warning to a real recipient during development/testing.
- Do not mark tests or status as passed without evidence from the current project state.

## 34. Definition of Done for Each Sub-Phase

A sub-phase is not complete merely because code exists. It is complete only when:

```text
Implementation completed
        ↓
Build/type checks pass
        ↓
Relevant functionality manually/automatically tested
        ↓
Errors fixed
        ↓
No obvious regression introduced
        ↓
Documentation/context updated
        ↓
Status changed to PASS
```

Record exact commands/tests and meaningful results under Latest Validation Summary or Last Session Handoff. If external verification is unavailable, use `NEEDS REVIEW` or `BLOCKED`, not `PASS`.

## 35. Change Management

If a future user instruction changes architecture:

1. Implement only the requested change.
2. Identify affected components, data, tests, security, and documentation.
3. Preserve unaffected functionality and existing user work.
4. Update `Brain.md` with factual state.
5. Update `architecture.md`, `PRD.md`, and `MVP.md` only when required by task scope or explicitly requested.
6. Add a dated decision entry, marking any replaced decision superseded.

Do not rewrite the whole project unnecessarily. Prefer small, reversible, reviewed changes and validate impacted flows.

## 36. Known Limitations

- Disaster-data quality, coverage, latency, severity scales, and freshness depend on external sources.
- Browser geolocation can be denied, unavailable, inaccurate, or stale.
- SMS delivery depends on gateway, network, and Android SIM availability and is not guaranteed.
- Browser notifications require permission and supported browser/FCM behavior.
- Risk scores are indicative educational decision support, not official forecasts.
- External APIs may have outages, schema changes, quotas, and rate limits.
- Official Indian alert APIs may have access/reuse limitations.
- Centroid-based distance may misrepresent large-area disasters.
- Emergency contacts, official logos, and government data require source/usage verification.
- Antideploy compatibility with all planned runtime and FCM requirements is not yet verified.
- ResQEarth is an educational project, not a certified emergency authority.

Update this list only with confirmed limitations; resolve or mark superseded items rather than silently deleting useful history.

## 37. Testing Memory

### Latest Validation Summary

```text
Validation Date: 2026-09-29
Scope: Phase 1.2 Design System & UI Components

TypeScript (tsc --noEmit): PASS (zero errors)
ESLint (next lint): PASS (zero warnings or errors)
Production Build (next build): PASS (Next.js 15.5.26 production build succeeded, all components compiled into bundle)
Design System Completeness: PASS (All requested UI primitives and domain components built and typed)
Accessibility & Non-Color Severity: PASS (Severity badges and indicators feature text + icon + color + ARIA labels)
Responsive Verification: PASS (Mobile-to-desktop responsive classes and flex/grid layouts applied)

Authentication: NOT TESTED (Scheduled for Phase 1.4/1.5)
Map: NOT TESTED (Scheduled for Phase 2.1)
Weather: NOT TESTED (Scheduled for Phase 2.4)
Risk Engine: NOT TESTED (Scheduled for Phase 2.8)
Admin: NOT TESTED (Scheduled for Phase 3.3)
FCM: NOT TESTED (Scheduled for Phase 3.6)
SMS: NOT TESTED (Scheduled for Phase 3.7)
Deployment: NOT TESTED (Scheduled for Phase 5.7)
```

Never convert `NOT RUN` or `NOT TESTED` to `PASS` without actual evidence. Future entries should record date, environment, command/scenario, result, and any issue/reference.

## 38. Last Session Handoff

```text
Last Work Performed:
Implemented Phase 1.2 Design System in `Front-end/` on branch `phase-1`. Created comprehensive design tokens, global styles, accessible UI primitives, severity indicators, and reusable domain components.

Files/Components Created & Updated:
- Resources/Documents/design.md (UI source of truth documentation)
- Front-end/src/app/globals.css (Updated with theme colors, status colors, 5-level risk tokens, and provenance badge tokens)
- Front-end/tailwind.config.ts (Extended with risk, status, and provenance color utilities)
- Front-end/src/components/ui/button.tsx (Button with variants, sizes, risk variants, and loading spinner)
- Front-end/src/components/ui/input.tsx & textarea.tsx (Accessible input & textarea with focus rings and error states)
- Front-end/src/components/ui/label.tsx (Label with required indicator)
- Front-end/src/components/ui/card.tsx (Card, Header, Title, Description, Content, Footer)
- Front-end/src/components/ui/badge.tsx (Badge with default, status, provenance, and risk severity variants)
- Front-end/src/components/ui/alert.tsx (Alert, Title, Description with severity and provenance variants)
- Front-end/src/components/ui/dialog.tsx (Accessible Modal Dialog with backdrop and ESC key listener)
- Front-end/src/components/ui/select.tsx (Accessible Select component with chevron and error state)
- Front-end/src/components/ui/skeleton.tsx (Pulse loading skeleton)
- Front-end/src/components/ui/empty-state.tsx (Standard empty state with icon and action)
- Front-end/src/components/ui/error-state.tsx (Error state with retry button and error ID)
- Front-end/src/components/ui/page-header.tsx (PageHeader and SectionHeader)
- Front-end/src/components/ui/severity-badge.tsx (Severity badge with dual text + icon + color)
- Front-end/src/components/ui/severity-indicator.tsx (Detailed severity indicator with progress bar and guidance)
- Front-end/src/components/ui/index.ts (Barrel export for UI primitives)
- Front-end/src/components/common/weather-card.tsx (Weather card with metrics, Open-Meteo source badge, and loading/stale states)
- Front-end/src/components/common/disaster-card.tsx (Disaster card with type icon, severity badge, provenance, and links)
- Front-end/src/components/common/risk-indicator.tsx (0-100 gauge, contributing factors breakdown, and RESQEARTH CALCULATED RISK disclaimer)
- Front-end/src/components/common/map-overlay.tsx (Map overlay controls, category filter chips, legend, and OSM attribution)
- Front-end/src/components/common/admin-dashboard-card.tsx (Admin dashboard metric card with trend and status badge)
- Front-end/src/components/common/notification-banner.tsx (In-site warning banner with severity styling and precautions preview)
- Front-end/src/components/common/index.ts (Barrel export for common components)

Features Completed:
Phase 1.2 Design System.

Tests Run:
- npm run type-check (tsc --noEmit): PASS (zero errors)
- npm run lint (next lint): PASS (zero warnings, zero errors)
- npm run build (next build): PASS (compiled successfully)

Known Issues:
None.

Current Blockers:
None for Phase 1.3. (Firebase project credentials needed for Phase 1.3 configuration).

Next Recommended Task:
Phase 1.3 — Firebase Project Connection (Client/server SDK setup, environment-based configuration, no committed secrets).

Warnings for Next Agent:
Reuse existing components from `@/components/ui` and `@/components/common`. Do not duplicate styles or hardcode credentials.
```

Update this section at the end of every significant coding session. It is one of the first sections a new AI agent must check.

## 39. Immediate Next Action

```text
Current State:
Phase 1.2 Design System complete (PASS) on branch `phase-1`. UI primitives, domain cards, severity indicators, and design tokens are fully built, typed, and validated.

Next Action:
Proceed with Phase 1.3 Firebase Project Connection.
```

## 40. Brain.md Maintenance Rule

> **`Brain.md` is a living file. Update it only with factual project state, confirmed decisions, test results, blockers, and implementation progress. Do not fill it with speculative ideas, verbose code explanations, transient debugging logs, or assumptions presented as facts.**

> **Never delete historical decisions that still help explain the current architecture. Mark superseded decisions as superseded and reference the newer decision.**

Maintenance checklist:

- Keep Current Work Position, status table, API table, blockers, validation, and handoff factual and synchronized.
- Add decisions only for confirmed choices with date, reason, and impact.
- Do not duplicate detailed architecture/requirements already maintained in source documents; summarize and link conceptually.
- Preserve concise AI readability and remove stale transient notes only after their durable outcome is recorded.
- When evidence is missing, write `PENDING`, `NOT TESTED`, `NEEDS REVIEW`, or `BLOCKED`; never infer success.
