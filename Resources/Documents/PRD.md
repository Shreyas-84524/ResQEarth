# ResQEarth Product Requirements Document

**Product:** ResQEarth — Smart Disaster Intelligence, Preparedness and Emergency Warning Platform  
**Audience:** ESE evaluators, project team, designers, developers, and testers  
**Status:** Requirements baseline; documentation only

## 1. Executive summary

ResQEarth is a responsive disaster-management and environmental-risk web platform for a Second-Year Engineering Environmental Science project. It brings weather and environmental observations, live/near-live disaster feeds, verified official alerts, an explainable ResQEarth risk score, preparedness knowledge, Indian disaster history, government-response education, and consent-based emergency communication into one experience.

The product serves public visitors, registered citizens, and authorized administrators. It covers **mitigation, preparedness, early warning, response, and recovery/awareness** while clearly separating **OFFICIAL ALERT**, **RESQEARTH CALCULATED RISK**, and **MANUAL ADMIN WARNING**.

## 2. Problem statement and background

Disaster information is fragmented across specialist agencies, weather services, news/event feeds, and static educational resources. People may struggle to understand what is near them, why a condition appears risky, and what to do before, during, or after an event. Environmental Science education also benefits from demonstrating how hazards, exposure, environmental factors, public awareness, government response, and information technology interact.

ResQEarth provides an educational, integrated view. It does not replace emergency authorities, promise complete coverage, or claim that a calculated score is an official forecast.

## 3. Product vision

Make disaster and environmental-risk information understandable, location-relevant, actionable, and transparent through a polished mobile-first platform suitable for public awareness and an ESE project demonstration.

## 4. Goals

- Present multi-source disaster and environmental information on one accessible MapLibre map.
- Explain environmental causes, impacts, preparation, response, and recovery for natural and man-made disasters.
- Produce a deterministic 0–100 risk score with visible contributions and limitations.
- Allow citizens to choose geolocation/manual location and communication preferences.
- Demonstrate a protected administrator-created regional warning and two-part SMS flow.
- Preserve source, freshness, and official-versus-calculated distinctions.
- Remain useful when permissions are denied or some providers fail.
- Demonstrate the role of IT in resilient, environmentally aware communities.

## 5. Non-goals

- Certified life-safety operation or guaranteed delivery.
- Replacing NDMA, NDRF, IMD, CWC, INCOIS, emergency services, or local authorities.
- Public creation of admin accounts.
- Firebase Phone Authentication in the MVP.
- Machine-learning prediction, crowdsourced incident verification, dispatch operations, or native mobile apps.
- Claiming legal compliance, scientific certainty, complete data coverage, or government endorsement.

## 6. ESE relevance

ResQEarth directly addresses disaster management, natural hazards, man-made disasters, environmental monitoring, weather and flood behavior, climate-related hazards, pollution incidents, environmental and human impacts, mitigation, preparedness, response, recovery, public awareness, government mechanisms, and sustainable/resilient communities. It demonstrates IT through geospatial visualization, multi-source monitoring, risk communication, warning delivery, and evidence-linked educational content.

## 7. Target users and personas

| User | Need | Representative persona |
|---|---|---|
| Public visitor | Quickly understand current conditions and learn preparedness | A commuter checking weather and nearby events without creating an account. |
| Citizen | Receive relevant, consented warnings and understand local risk | A resident who saves a city, enables browser alerts, and provides a phone for SMS. |
| Student/educator | Explore ESE concepts, history, impacts, and agencies | A student preparing an environmental-science demonstration. |
| Admin | Monitor data and demonstrate a controlled regional warning | A project administrator targeting a labeled simulation to test recipients. |

Roles are exactly `citizen` and `admin`; anonymous visitors have no stored role.

## 8. User journeys

### 8.1 Public journey

1. Visitor opens the polished hero dashboard.
2. The page presents ResQEarth's mission, selected location, weather/environment cards, live disaster overview, map, important events, preparedness links, government resources, and login/signup calls to action.
3. Visitor selects a location manually or optionally permits temporary location use where offered.
4. Visitor filters map events and opens a disaster knowledge page.
5. Freshness, attribution, and official/calculated labels remain visible.

### 8.2 Citizen journey

1. Visitor signs up with name, phone, email, password, password confirmation, and explicit communication choices.
2. Firebase authenticates with email/password; a Firestore profile is created with `role=citizen`.
3. Citizen permits geolocation or chooses a manual location.
4. Dashboard shows nearby events, local warnings, and an explainable risk score.
5. Citizen optionally enables FCM and SMS and may change/withdraw preferences.
6. Citizen opens a warning from the site, browser notification, or SMS deep link and reads mobile-safe precautions.

### 8.3 Admin journey

1. A pre-provisioned admin authenticates and passes server-side role checks.
2. `/admin` shows active alerts, events, high-risk regions, affected-user estimates, delivery attempts, notification statistics, provider status, risk overview, and map.
3. Admin creates a simulated/manual warning, chooses target and expiry, previews eligible users, and confirms activation.
4. Citizens see an in-site warning; consented test users receive browser/SMS attempts.
5. Results and actions are audited; the admin may cancel the alert.

## 9. Functional requirements

### 9.1 Public shell and navigation

| ID | Requirement | Acceptance criteria |
|---|---|---|
| FR-PUB-001 | The public homepage shall show branding, mission, selected location, environmental/weather summary, disaster overview, map, important events, preparedness and government links, and auth CTAs. | All named sections render at desktop and 360 px without authentication. |
| FR-PUB-002 | Global navigation shall expose Home, Disasters, History, Government Response, About, and relevant auth actions. | Each link reaches the canonical route; current page is conveyed accessibly. |
| FR-PUB-003 | Dynamic cards shall display source and freshness. | Each dynamic section shows source and update time or an explicit unavailable state. |
| FR-PUB-004 | Provenance labels shall distinguish official alerts, calculated risk, and manual-admin warnings. | No calculated/manual item uses an official label; labels appear in list/detail views. |

### 9.2 Authentication and roles

| ID | Requirement | Acceptance criteria |
|---|---|---|
| FR-AUTH-001 | Signup shall collect name, phone, email, password, and confirm password. | Invalid or mismatched values block submission with field-specific accessible errors. |
| FR-AUTH-002 | Firebase Authentication shall use email/password only. | Successful signup creates an Auth user; phone authentication is absent. |
| FR-AUTH-003 | Signup shall create `users/{uid}` with role `citizen`, timestamps, consent, and optional location. | Stored profile contains no password; role is always `citizen` from public signup. |
| FR-AUTH-004 | Users shall log in/out and recover from auth errors safely. | Login routes correctly; logout clears protected session state; messages reveal no secrets. |
| FR-AUTH-005 | Admin accounts shall not be creatable through public signup. | Client manipulation cannot assign `admin`; backend/rules reject role escalation. |
| FR-AUTH-006 | Protected operations shall verify identity and authorization server-side. | A citizen/anonymous direct request to an admin endpoint receives a safe denial and no mutation. |

### 9.3 Location, map, and weather

| ID | Requirement | Acceptance criteria |
|---|---|---|
| FR-LOC-001 | The app shall request browser geolocation contextually and support manual selection. | Grant updates the selected location; denial/timeout exposes a usable manual selector. |
| FR-LOC-002 | Persisting last known location shall be optional and disclosed. | A user can use the app without saving a location and can replace/remove it. |
| FR-MAP-001 | MapLibre GL JS shall render an approved OpenStreetMap-compatible basemap with attribution. | Map loads with visible attribution and no proprietary lock-in assumption. |
| FR-MAP-002 | The map shall support pan, drag, controls, wheel/touch zoom, current location, markers, popups, clusters, filters, and relevant heatmaps. | Required interactions work with mouse/touch; event information is also available in a list. |
| FR-MAP-003 | Multiple provider events shall appear through one normalized GeoJSON contract. | At least the MVP sources render without provider-specific UI branches. |
| FR-MAP-004 | Unknown event location shall not produce a false marker or proximity claim. | Such events remain available in a list with “location unavailable.” |
| FR-WX-001 | Weather cards shall support temperature, feels-like, humidity, rainfall, precipitation probability, wind speed/gusts, and condition when available. | Available fields render with units; missing fields do not display fabricated values. |
| FR-WX-002 | Weather failure shall not crash the map or knowledge portal. | A weather-specific failure/stale state appears while other features remain usable. |

### 9.4 Disaster intelligence and risk

| ID | Requirement | Acceptance criteria |
|---|---|---|
| FR-DATA-001 | Replaceable adapters shall support weather, flood/river, earthquake, global event, and Indian official categories. | Provider parsing is isolated behind a common validated event contract. |
| FR-DATA-002 | Candidate providers shall include Open-Meteo, Open-Meteo Flood/GloFAS, USGS, NASA EONET/GDACS, and NDMA SACHET/IMD, subject to endpoint/terms verification. | Configuration can disable one provider without breaking aggregation. |
| FR-DATA-003 | Events shall retain provider ID, source, type, geometry, severity, event/update times, and freshness. | Detail/popups show attribution and dates; duplicates from the same provider are suppressed. |
| FR-NEAR-001 | The system shall compute user-to-event distance with a backend-authoritative method. | Known test coordinates match expected Haversine distances within documented tolerance. |
| FR-NEAR-002 | Default proximity ranges shall support 10, 25, 50, and 100 km. | A configured radius changes nearby-event inclusion without code changes. |
| FR-RISK-001 | The MVP shall use deterministic, versioned rules to calculate 0–100. | Repeating identical inputs/model version produces the same score. |
| FR-RISK-002 | Levels shall be LOW 0–20, GUARDED 21–40, MODERATE 41–60, HIGH 61–80, CRITICAL 81–100. | Boundary tests map every score correctly. |
| FR-RISK-003 | The score shall itemize weather, flood, nearby event, official alert, and regional contributions where applicable. | UI shows contributions totaling the clamped score and input freshness. |
| FR-RISK-004 | Calculated scores shall never be represented as official forecasts. | Every score displays “RESQEARTH CALCULATED RISK” and a limitation statement. |
| FR-RISK-005 | Missing/stale inputs shall be disclosed. | The result lists unavailable/stale inputs and does not equate missing data with low risk. |

### 9.5 Alerts and warnings

| ID | Requirement | Acceptance criteria |
|---|---|---|
| FR-ALERT-001 | A unified model shall represent `official`, `automatic`, and `manual-admin` alerts. | All alert types share fields and display distinct source labels. |
| FR-ALERT-002 | Alerts shall include title, description, disaster type, severity, source, region/coordinates/radius, instructions, timestamps, creator, and status. | Schema validation rejects missing required fields and invalid expiry/radius. |
| FR-ALERT-003 | Automatic candidates may arise from risk threshold, nearby severe event, or official regional coverage. | Each trigger is testable and records the reason/input IDs. |
| FR-ALERT-004 | Duplicate suppression, expiration, preferences, region matching, event IDs, and already-notified recipients shall be applied. | Reprocessing the same candidate does not resend within its dedupe window. |
| FR-ALERT-005 | Active warnings shall appear in-site even when notification permission is denied. | A target citizen sees the warning after refresh/realtime update without FCM permission. |
| FR-ALERT-006 | Expired/cancelled warnings shall stop new dispatch and be marked accordingly. | Expiration/cancellation updates lists and prevents subsequent channel jobs. |

### 9.6 Admin Control Center

| ID | Requirement | Acceptance criteria |
|---|---|---|
| FR-ADMIN-001 | `/admin` shall require `role=admin` at UI, backend, and data-rule layers. | Anonymous/citizen access is denied even via direct URL/API request. |
| FR-ADMIN-002 | The dashboard shall summarize active alerts, recent events, high-risk regions, affected-user estimates, SMS/notification statistics, provider status, risk, and map. | Each module has data, empty, loading, and failure states. |
| FR-ADMIN-003 | Admin shall create a manual warning with type, severity, region/city/state or point/radius, title, message, instructions, and expiration. | Invalid inputs cannot activate an alert; a valid labeled simulation can. |
| FR-ADMIN-004 | Targets shall support all users, state, city, region, and radius around point. | Preview explains target mode and eligible count before confirmation. |
| FR-ADMIN-005 | Manual warning creation/cancellation shall be audited. | Audit includes actor, action, alert ID, timestamp, target summary, and outcome. |
| FR-ADMIN-006 | Server-side logic shall determine recipients. | Altering client preview/count cannot add unauthorized or ineligible recipients. |

### 9.7 FCM and SMS

| ID | Requirement | Acceptance criteria |
|---|---|---|
| FR-FCM-001 | Notification permission shall follow an explanation and explicit user action. | No browser prompt appears automatically on first page load. |
| FR-FCM-002 | Token registration, refresh, invalidation, foreground/background handling, and click routing shall be supported. | A sandbox message reaches supported states and opens an allowlisted internal route. |
| FR-FCM-003 | Denial or unsupported FCM shall not block the site. | In-site warnings and preferences remain usable. |
| FR-SMS-001 | SMS gateway credentials and calls shall remain server-side. | Secret scanning and bundle inspection find no gateway credential/client call. |
| FR-SMS-002 | A warning shall support two messages: warning/precautions/guide link, then validated emergency contacts/project link. | Test recipient receives two ordered, correlated parts with a mobile-valid URL. |
| FR-SMS-003 | Only consented, eligible users shall be targeted. | Non-consented/out-of-region fixtures produce no SMS attempt. |
| FR-SMS-004 | Attempts/status shall be recorded where available with masked identifiers. | Admin can see queued/sent/failed status without raw secrets/full phone exposure. |
| FR-SMS-005 | Retries shall be bounded and idempotent. | A timeout/retry does not create duplicate message parts for the same dispatch key. |

### 9.8 Knowledge, history, government, and informational pages

| ID | Requirement | Acceptance criteria |
|---|---|---|
| FR-KNOW-001 | `/disasters` shall list natural and man-made disaster categories and link to `/disasters/[slug]`. | Core MVP slugs are directly reachable and filterable by category. |
| FR-KNOW-002 | Each disaster detail shall cover overview, definition, causes, environmental factors, warning signs, impacts, before/during/after actions, kit, what not to do, contacts, government resources, links, and references. | Content template contains every required section or a reviewed “not applicable” explanation. |
| FR-KNOW-003 | Disaster pages shall be fast and mobile-safe for SMS deep links. | A direct 360 px load exposes warning title and critical precautions without map dependency. |
| FR-HIST-001 | `/history` shall show curated major Indian events and filter by type, year, state, and category. | Each entry contains date, name, location, type, cause, human/environmental impact, lessons, and sources. |
| FR-GOV-001 | `/government-response` shall educate about verified Indian bodies and link to official sites. | Cards contain full/short name, role, responsibilities, importance, official link; unapproved logos are absent. |
| FR-ABOUT-001 | `/about` shall explain the project, problem, motivation, ESE relevance, objectives, lifecycle, technology, environmental relevance, awareness role, and limitations. | A prominent official-systems disclaimer is visible. |
| FR-PRIV-001 | `/privacy` shall describe collection/use of profile, location, auth, token, consent, and preference data. | It states actual practices and does not make unverified compliance claims. |
| FR-TERMS-001 | `/terms` shall cover education, third-party APIs, data/risk limitations, responsibilities, emergencies, availability, and misuse. | No misleading guarantee or certification claim appears. |
| FR-COOKIE-001 | `/cookies` and a consent UI shall offer Accept All, Essential Only, and Manage Preferences. | Essential storage is described; optional analytics defaults off/absent for MVP; choice persists. |

## 10. Quality requirements

### 10.1 Responsive and accessibility

| ID | Requirement | Acceptance criteria |
|---|---|---|
| NFR-RESP-001 | Key screens shall work at 360×800, 390×844, 430×932, 768×1024, 1366×768, and 1920×1080. | No hidden critical action, unreadable overlap, or horizontal page overflow; intentional table scrollers are labeled. |
| NFR-A11Y-001 | Semantic HTML, keyboard operation, labels, focus indicators, readable contrast, and screen-reader critical content are required. | Core journeys complete without a mouse and automated checks have no critical violations. |
| NFR-A11Y-002 | Severity shall not depend on color alone. | Every severity display contains visible text plus an icon/pattern or structural cue. |
| NFR-A11Y-003 | Map information shall have a non-map alternative. | Events/warnings can be opened from a synchronized accessible list. |

### 10.2 Security and privacy

| ID | Requirement | Acceptance criteria |
|---|---|---|
| NFR-SEC-001 | Firestore rules shall deny by default and enforce ownership/roles/field constraints. | Emulator tests reject cross-user reads, citizen role changes, and unauthorized alert writes. |
| NFR-SEC-002 | Inputs shall be validated with Zod at trust boundaries and output safely escaped. | Malformed and XSS payload tests fail safely and persist no unsafe content. |
| NFR-SEC-003 | Secrets shall use server environment/secret storage. | Repository and client bundles contain no private keys/gateway credentials. |
| NFR-SEC-004 | Privileged endpoints shall use auth, authorization, rate limits, safe errors, least privilege, and auditing. | Repeated/unauthorized calls are limited/denied with correlation IDs and no internal details. |
| NFR-PRIV-001 | Consent shall be granular, recorded, changeable, and respected. | Turning off SMS/notifications prevents new channel targeting. |
| NFR-PRIV-002 | The MVP shall not create continuous precise location history. | Data inspection finds only optional last known/manual location with timestamp/source. |

### 10.3 Performance, resilience, and freshness

| ID | Requirement | Acceptance criteria |
|---|---|---|
| NFR-PERF-001 | Public content and SMS-linked disaster pages shall prioritize fast initial rendering. | Critical content renders independently of map/provider completion under the agreed test profile. |
| NFR-PERF-002 | Heavy map and admin modules shall avoid blocking basic content. | Knowledge/legal routes do not download map code unless needed. |
| NFR-FAIL-001 | One provider failure shall not crash aggregated views. | Successful sources render with an unavailable-source notice. |
| NFR-FAIL-002 | Loading, empty, partial, stale, API failure, location denied, offline, notification denied, SMS failure, and unknown-location states are required. | Each state has a fixture/test and meaningful accessible copy. |
| NFR-FAIL-003 | Stale/cached data shall show `Last successfully updated`. | Users can distinguish current, stale, and unavailable data. |
| NFR-DEP-001 | Deployment shall target Antideploy while remaining host-portable. | Hosting details are environment/config isolated; GitHub remains version source. |

## 11. Data and privacy requirements

Personal data is limited to name, email, phone, optional approximate/selected location, authentication identifiers, notification tokens, channel consent, and essential preferences. Passwords are managed by Firebase Authentication and never stored by ResQEarth. Tokens, phone numbers, and coordinates receive restricted access and must not appear in analytics or routine logs. Retention, deletion, and production legal review are prerequisites for real public operation.

Firestore datasets are `users`, user-scoped `preferences`, user-scoped `notificationTokens`, `disasterEvents`, `riskAssessments`, `alerts` with delivery attempts, `smsDeliveryLogs`, `auditLogs`, and `serviceStatus`, as detailed in `architecture.md`.

## 12. User stories

- As a visitor, I want to see nearby environmental/disaster conditions without signing up so I can learn quickly.
- As a visitor, I want to know the source and update time so I can judge information quality.
- As a citizen, I want manual location selection if I deny GPS so the app remains useful.
- As a citizen, I want the risk score explained so it does not feel like an unsupported prediction.
- As a citizen, I want to control browser and SMS consent independently.
- As a citizen receiving an SMS, I want a short warning and a mobile guide so I can act quickly.
- As a screen-reader user, I want warning severity in text and map events in a list.
- As an admin, I want to preview a region/radius warning before activation so mistakes are reduced.
- As an admin, I want delivery and provider status so I do not assume messages succeeded.
- As an educator, I want Indian history, agencies, impacts, and lifecycle content tied to ESE concepts.

## 13. Cross-feature acceptance scenarios

### AC-01 Public partial-data dashboard

Given USGS succeeds and a weather provider fails, when the homepage loads, then earthquake events and the map/list render, weather shows an isolated failure/stale state, source status is visible, and navigation remains usable.

### AC-02 Citizen onboarding with denied location

Given a new valid signup, when the citizen denies geolocation, then a `citizen` profile exists without a password, manual location selection is offered, and no admin route is accessible.

### AC-03 Explainable risk

Given fixed weather, river, event, and official-alert fixtures, when the risk engine runs, then it returns the expected 0–100 score, level, contribution sum, model version, timestamps, missing-input notes, and calculated-risk label.

### AC-04 Manual warning demonstration

Given an authenticated admin and consented test citizens, when a valid radius warning is previewed and confirmed, then one active `manual-admin` alert is created, an audit record is written, in-radius citizens see it, out-of-radius citizens do not, and duplicate activation is suppressed.

### AC-05 Multi-channel failure

Given an active alert, when FCM succeeds and SMS fails, then the in-site warning remains visible, channel outcomes are recorded independently, the UI does not claim SMS delivery, and bounded retry rules apply.

### AC-06 SMS mobile guide

Given a two-part test SMS, when the recipient opens the guide link at 360×800, then the correct disaster page loads directly with source/disclaimer, critical before/during/after guidance, accessible emergency contacts, and no dependency on authentication or map success.

## 14. Out of scope for the initial MVP

AI/ML prediction, AI image analysis, native mobile apps, offline PWA, volunteer coordination, resource crowdsourcing, multilingual content, advanced polygon geofencing, real authority system integration, production-grade forecasting, continuous tracking, and verified emergency dispatch are post-MVP. Advanced heatmaps, analytics, automation, regional targeting, caching, and broad disaster/history coverage are P1 unless explicitly promoted after P0 is complete.

## 15. Future enhancements

- Multilingual and low-bandwidth content.
- Polygon/geohash targeting and hazard-specific radii.
- More official and environmental sensor sources.
- Offline preparedness packs and installable PWA.
- Research-reviewed forecasting or ML with governance.
- Volunteer/resource workflows with moderation.
- Authority partnership and verified production alert channels.
- Better analytics, dashboards, and historical visualizations.

## 16. Risks and mitigations

| Risk | Mitigation |
|---|---|
| Users confuse risk with official warning | Persistent provenance labels, disclaimer, distinct language and visual treatment. |
| Provider outage/schema change | Adapters, validation, fixtures, partial responses, last-success cache. |
| Inaccurate location/targeting | Manual override, precision disclosure, backend checks, preview, conservative wording. |
| Unauthorized admin action | Trusted provisioning, token/role/rules checks, rate limits, audits. |
| SMS/FCM delay or failure | Independent channel status; never guarantee delivery; in-site warning remains. |
| Privacy exposure | Minimize collection, granular consent, restricted rules, masked logs, retention plan. |
| Deadline-driven scope expansion | P0 gates and explicit stop conditions in `MVP.md`. |
| Incorrect safety content/numbers | Cite sources and validate with authoritative references before production/demo. |
| Logo/data reuse violation | Verify usage/attribution; omit unapproved assets. |
| Hosting mismatch | Verify Antideploy features early; preserve portable build/service contracts. |

## 17. Dependencies

- Firebase project with Authentication, Firestore, and FCM capability.
- A secure backend runtime compatible with Antideploy or a separately hosted provider-neutral service.
- Approved MapLibre-compatible tiles and attribution.
- Available, permissible provider endpoints for Open-Meteo, flood/GloFAS, USGS, NASA EONET/GDACS, NDMA SACHET/IMD.
- Existing/free SMS gateway infrastructure and Android SIM, with sandbox/test controls.
- Verified ESE content, Indian disaster history sources, government links, emergency contacts, and logo rights.
- GitHub repository and deployment credentials stored outside source.

## 18. Success criteria

The MVP is successful when all P0 acceptance checks in `MVP.md` pass, the core admin-to-citizen warning demonstration works with test labeling and recorded channel outcomes, a user can understand why a risk score exists, provider failure is survivable, mobile disaster guidance is usable, and reviewers can trace the project to ESE learning outcomes. Success is not measured by claiming real-world predictive accuracy or guaranteed emergency delivery.

## 19. Demo scenario

1. Open the public homepage on desktop and show mission, location, weather, map, events, source freshness, and ESE links.
2. Simulate one provider outage to demonstrate partial data.
3. Sign up/login as a citizen, deny geolocation, select a city manually, and view nearby events plus an explained calculated risk.
4. Show disaster knowledge, history, government-response, About, Privacy, Terms, and cookie preferences; resize to mobile.
5. Log in with a pre-provisioned admin test account.
6. Create a clearly labeled simulated flood warning for a test radius; preview recipients and confirm.
7. Return to the citizen view to show the in-site warning and browser-notification path.
8. Send the two-part SMS through the configured test gateway; show delivery-attempt status without exposing numbers/secrets.
9. Open the SMS guide link on mobile and show precautions and validated emergency contacts.
10. Close with the official-information disclaimer and ESE lifecycle mapping.

## 20. Routes baseline

```text
/
/signup
/login
/dashboard
/disasters
/disasters/[slug]
/history
/government-response
/about
/privacy
/terms
/cookies
/admin
```

Additional internal API endpoints and auth callback/service-worker paths are implementation details and must follow `architecture.md`. The canonical roles, risk bands, alert source types, data collections, and provider strategy must not diverge across documents.

---

**Emergency disclaimer:** ResQEarth is an educational project that supplements verified information. During an emergency, users must follow official authorities and established emergency services. ResQEarth calculations and delivery attempts are not guarantees.
