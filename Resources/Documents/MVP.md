# ResQEarth MVP Definition

**Product:** ResQEarth — Smart Disaster Intelligence, Preparedness and Emergency Warning Platform  
**Purpose:** Define the smallest credible working submission under an extremely short deadline.  
**Constraint:** This is a development plan only; no implementation is included in this documentation task.

## 1. MVP objective

Deliver a responsive, deployed educational web application that demonstrates the essential ResQEarth loop:

```text
Environmental/disaster data
        → unified map and event view
        → explainable local risk
        → labeled regional warning
        → in-site + browser + two-part SMS path
        → mobile preparedness guidance
```

The submission must demonstrate Environmental Science learning, robust provenance, safe limitations, citizen/admin separation, and graceful failures. It is not a certified or production emergency system.

## 2. MVP success definition

The MVP succeeds only when a public visitor can explore current conditions and ESE content, a citizen can authenticate and use location-aware features, and a pre-provisioned administrator can create a clearly labeled manual regional warning that reaches an eligible test citizen in-site and exercises browser/SMS paths. All dynamic information must expose source/freshness; **OFFICIAL ALERT**, **RESQEARTH CALCULATED RISK**, and **MANUAL ADMIN WARNING** must remain distinct.

P0 completeness, not feature count or visual novelty, determines success.

## 3. Prioritized scope

### P0 — Required for MVP

- Canonical project shell under `Front-end/` and `Backend/`.
- Firebase Web connection plus trusted server connection; email/password signup/login/logout.
- Firestore profile creation with roles exactly `citizen` and `admin`; public signup always `citizen`.
- Polished public homepage with mission, selected location, weather/environment cards, disaster overview, MapLibre map, important events, preparedness/government links, and auth CTAs.
- Browser geolocation with a complete manual-location fallback.
- MapLibre GL JS map with compliant OSM-compatible tiles, attribution, navigation, current location, unified event markers/popups, basic clustering/filtering, and an accessible list.
- Core live integrations: Open-Meteo weather, USGS earthquakes, and at least one global disaster feed (NASA EONET or GDACS). Include a flood/river source and one Indian official-alert source only if a usable endpoint and terms can be verified within the deadline; otherwise use a clearly labeled curated/demo fixture and record the limitation—never fabricate “live” status.
- Provider adapter boundary and normalized disaster event model.
- Deterministic 0–100 explainable risk engine with the agreed five bands and visible contributions.
- Protected `/admin` overview and manual warning creation for all/state/city/region/radius targeting, with preview and audit.
- In-site warnings for eligible citizens.
- Basic opt-in FCM permission/token/foreground-background/click path using test notifications.
- Existing/free SMS gateway integration through the backend only, including consent, eligibility, two-message warning design, mobile disaster link, and attempt status.
- Mobile-ready disaster library for core pages: flood, cyclone, earthquake, landslide, heat wave, and chemical leak; category index and expandable structured content.
- Validated emergency contacts, linked references, and explicit official-information disclaimer.
- Curated Indian disaster history timeline with basic filters.
- Verified government-body cards for NDMA, NDRF, IMD, CWC, INCOIS, Ministry of Home Affairs, and Ministry of Earth Sciences; omit any logo lacking approved source/usage.
- `/about`, `/privacy`, `/terms`, and `/cookies`, plus cookie choices: Accept All, Essential Only, Manage Preferences.
- Responsive and keyboard-usable critical journeys at the required viewport matrix.
- Loading, empty, partial, stale, provider-failure, denied permission, offline, notification-denied, SMS-failure, and unknown-location behavior.
- Security rules, server validation, secret isolation, admin authorization, rate/deduplication controls, and audit logging.
- GitHub version control and production deployment to Antideploy, with hosting assumptions isolated.

### P1 — Important if time permits after every P0 gate passes

- Richer heatmaps and multi-dimensional map filters.
- Alert and delivery analytics with charts.
- Automatic risk-threshold/nearby-event alert creation; manual admin flow remains the P0 delivery proof.
- Improved polygon/geohash targeting and hazard-specific radii.
- Stronger server/cache revalidation and provider circuit-breaker observability.
- Richer admin and citizen dashboards.
- More disaster categories and deeper knowledge pages.
- Larger, more interactive historical dataset.
- More official/flood providers after validation.
- Notification preference granularity by disaster type and quiet settings.

### P2 — Post-MVP

- AI/ML disaster prediction and AI image analysis.
- Native mobile applications.
- Offline PWA preparedness packs.
- Volunteer coordination and emergency-resource crowdsourcing.
- Multilingual content.
- Advanced geofencing and evacuation routing.
- Real authority system integrations and production alert certification.
- Advanced forecasting, sensor networks, and research-validated models.

## 4. Required screens

| Screen | P0 content |
|---|---|
| Public home | Hero, mission, selected location, weather, live/curated event summary, map/list, key events, preparedness, government links, auth CTAs, freshness/provenance. |
| Signup | Name, phone, email, password, confirmation, SMS/notification disclosures and consent; accessible validation. |
| Login | Email/password, safe errors, link to signup. |
| Citizen dashboard | Local weather, nearby events, in-site alerts, explainable risk, location and channel preferences. |
| Disaster index | Natural/man-made categories and core disaster links. |
| Disaster detail | Full structured safety/impact content, sources, emergency contacts, mobile-first SMS landing. |
| History | Indian disaster timeline and type/year/state/category filters. |
| Government response | Verified organizations, responsibilities, importance, official links, approved logos only. |
| Admin Control Center | Summary, map, active alerts/events/provider status, delivery attempts, warning creation/preview. |
| About | Problem, motivation, ESE relevance, lifecycle, objectives, technology, limitations/disclaimer. |
| Privacy | Actual data collection/use/consent/storage practices without unsupported legal claims. |
| Terms | Educational nature, third-party/risk limitations, responsibilities, availability, misuse, emergency disclaimer. |
| Cookies/preferences | Storage explanation and three consent actions; no assumed optional tracking. |
| Failure/empty states | Contextual states within each screen; no generic blank dashboard. |

## 5. Required routes

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

Core P0 disaster slugs are `flood`, `cyclone`, `earthquake`, `landslide`, `heat-wave`, and `chemical-leak`. FCM/SMS deep links use these canonical routes and must reject unsafe external redirect values.

## 6. Required backend components

1. Firebase token verification and role authorization middleware.
2. Zod schemas for profiles, locations, normalized events, risk requests/results, alert creation, targeting, and notification requests.
3. Provider-adapter interface and P0 adapters.
4. Disaster normalization/deduplication service.
5. Deterministic risk calculation service with `modelVersion`.
6. Haversine distance and simple region/radius targeting service.
7. Alert processor with validation, dedupe key, lifecycle, expiration, and eligible-user resolution.
8. FCM dispatch/token maintenance service.
9. SMS adapter, two-message renderer, idempotent dispatch, and delivery logging.
10. Audit and provider-health/freshness logging.

The backend may use Firebase Functions or another lightweight TypeScript runtime. It must remain inside `Backend/` and expose no service secret to `Front-end/`.

## 7. Required Firebase components

- Firebase Authentication with email/password.
- Cloud Firestore and deny-by-default Security Rules.
- Firebase Cloud Messaging for the browser-notification demonstration.
- Trusted Admin SDK access only in the backend.
- Separate environment configuration; development/demo/production data must not be casually mixed.
- Auth/rules emulator or equivalent tests before deployment.

Phone is alert-contact data, not Firebase Phone Authentication. Admin accounts are provisioned outside public signup through a trusted audited process.

## 8. Required APIs and data sources

| Category | P0 decision | Fallback/limitation |
|---|---|---|
| Weather | Open-Meteo candidate | Last-success cache or unavailable card with timestamp. |
| Earthquake | USGS GeoJSON candidate | Cached/synthetic test fixture for tests only; never label fixture live. |
| Global events | NASA EONET or GDACS candidate | Use whichever validates fastest; adapter permits later swap. |
| Flood/river | Open-Meteo Flood/GloFAS candidate | Integrate if endpoint/terms work; otherwise reviewed demo data labeled curated. |
| Indian official alerts | NDMA SACHET/IMD candidate | Integrate only after source/access verification; use official links and explicit unavailability otherwise. |
| Basemap | MapLibre-compatible OSM source | Confirm usage limits and render required attribution. |
| History/knowledge/agencies | Reviewed local structured data | Include citations/revision dates; never invent logos or sources. |

No credentials or endpoints may be fabricated. A provider failure returns partial results and source statuses rather than a failed entire application.

## 9. Required Firestore collections

```text
users/{uid}
users/{uid}/preferences/default
users/{uid}/notificationTokens/{tokenId}
disasterEvents/{eventId}
riskAssessments/{assessmentId}
alerts/{alertId}
alerts/{alertId}/deliveryAttempts/{attemptId}
smsDeliveryLogs/{logId}
auditLogs/{logId}
serviceStatus/{serviceId}
```

P0 fields follow `architecture.md`. Passwords, gateway credentials, private Firebase keys, and unmasked routine-log phone numbers are prohibited. Optional `lastKnownLocation` records source, timestamp, and appropriate precision; continuous location history is out of scope.

## 10. Required admin capabilities

- Server-authorized access to `/admin` for `role=admin` only.
- Review active alerts, recent normalized events, high-risk summaries, target estimates, SMS/FCM attempts, provider health, risk overview, and a map.
- Create a manual warning with disaster type, severity, state/city/region or point/radius, title, message, precautions, and expiry.
- Select target: all users, state, city, region, or radius around point.
- Preview recipient count/coverage and confirm a visibly labeled simulation.
- Cancel an active manual alert.
- Record actor, action, alert, target summary, time, and outcome in audit logs.

Client controls never grant authority and client-provided eligible-user lists are not trusted.

## 11. Required SMS workflow

```text
Admin confirms labeled warning
→ backend validates role and alert
→ targeting resolves eligible consented test users
→ dedupe/idempotency check
→ SMS 1: warning + essential precautions + disaster-guide link
→ SMS 2: validated emergency contacts + project link
→ gateway/Android SIM attempt
→ masked status logged
→ admin sees queued/sent/failed outcome
```

The guide URL must be HTTPS in production and load without authentication. Emergency numbers/content must be checked against authoritative sources before demonstration. A gateway acceptance status is not described as guaranteed human receipt.

## 12. Required warning flow

1. Admin signs in with a pre-provisioned test account.
2. Admin enters a flood warning, point and radius, severity, instructions, and expiry.
3. Backend verifies token/role and validates values.
4. Backend previews target count using region filters then exact distance where relevant.
5. Admin confirms; backend transaction creates one `manual-admin` alert with a dedupe key and audit record.
6. Eligible citizen sees the active in-site warning.
7. If consent/token exists, backend sends an FCM test notification.
8. If SMS consent exists, backend sends two idempotent SMS parts through the configured gateway.
9. Results are independently logged; failures do not remove the in-site warning.
10. Expiry/cancellation stops future sends and changes status.

Automatic risk-triggered warning creation is P1; calculated risk display itself is P0.

## 13. Required risk behavior

The deterministic engine accepts available weather, flood/river, nearby events, official alerts, and regional conditions. It returns a clamped 0–100 score, model version, calculation/input timestamps, level, confidence/coverage note, and itemized contributions.

```text
0–20   LOW
21–40  GUARDED
41–60  MODERATE
61–80  HIGH
81–100 CRITICAL
```

The UI always uses **RESQEARTH CALCULATED RISK** and never calls the result an official forecast. Missing/stale data is disclosed and cannot silently imply safety.

## 14. Required ESE content

The MVP must explicitly connect features and written content to:

- disaster management lifecycle and mitigation/preparedness/response/recovery;
- natural hazards and man-made disasters;
- environmental monitoring, weather, floods, and climate-related hazards;
- pollution, industrial/chemical events, and environmental impact;
- warning signs, safe behavior, emergency kits, and public awareness;
- Indian disaster history and lessons learned;
- NDMA, NDRF, IMD, CWC, INCOIS, relevant ministries, and response mechanisms;
- the role and limits of IT in environmental protection and resilient communities.

Knowledge pages must identify sources and distinguish general educational guidance from official event instructions.

## 15. Required error states

| State | Minimum P0 response |
|---|---|
| Loading | Accessible progress/skeleton; stable layout. |
| Empty | Explain no matching data, without implying no danger. |
| Partial data | Render successful sources and name unavailable ones. |
| Stale data | Show stale indicator and `Last successfully updated`. |
| API failure | Isolate failure, retry safely, retain static content/cache. |
| Location denied/unavailable | Show manual location selector. |
| No network | Show connection state and available cached/static guidance. |
| Notification denied/unsupported | Keep in-site warnings; explain preference path. |
| SMS failure | Log failure; do not claim delivery; allow bounded safe retry. |
| Unknown event location | List event, suppress distance/radius claims. |
| Unauthorized admin | Deny at server/data layer and show safe navigation. |

## 16. Required security and privacy

- Verify Firebase ID tokens server-side.
- Enforce `citizen`/`admin` authorization in backend and Firestore Rules, not only UI.
- Default public signup to `citizen`; no client role assignment.
- Validate all boundaries with Zod and safely escape rendered content.
- Store environment secrets outside Git and client bundles; SMS credentials remain backend-only.
- Rate-limit sensitive/provider-proxy/alert endpoints and use safe errors/correlation IDs.
- Use transactional deduplication/idempotency for alerts and sends.
- Audit admin actions and restrict log access.
- Collect only needed profile/contact/location/token/preferences data.
- Request granular SMS and notification consent; honor withdrawal before new dispatch.
- Do not store continuous precise location history.
- Do not claim legal compliance before review.
- Use test accounts/numbers and clearly label simulated warnings.

## 17. Required testing

### Unit

- Signup/alert schemas; risk boundaries and contribution totals.
- Provider normalization and duplicate IDs.
- Haversine known-coordinate cases and radius boundaries.
- Alert dedupe key and expiry.
- Two-SMS rendering and safe mobile URL.

### Integration

- Firebase Auth → citizen profile; retry after partial creation.
- Security Rules deny cross-user/admin escalation.
- Provider partial failure and last-success freshness.
- Admin alert transaction, targeting, audit, FCM token path, and SMS sandbox.

### End-to-end

- Public homepage and navigation.
- Citizen signup/login/logout, denied geolocation, manual selection, risk display.
- Admin direct-access denial for citizen.
- Admin manual warning → target citizen in-site alert → FCM/SMS attempts.
- SMS link opens the correct mobile disaster page.
- Cookie preference choices persist.

### Quality gates

- Required viewport matrix: 360×800, 390×844, 430×932, 768×1024, 1366×768, 1920×1080.
- Keyboard-only critical flows and automated accessibility scan with no critical violations.
- Secret scan, production build, deployment smoke test, and no unlabeled real recipient/event.

## 18. MVP acceptance checklist

### Foundation and identity

- [ ] Only canonical `Resources/`, `Front-end/`, and `Backend/` root project folders are used.
- [ ] Firebase configuration is environment-based; no secret is committed.
- [ ] Signup validates all required fields and creates a `citizen` profile.
- [ ] Login/logout work and admin accounts cannot be publicly created.
- [ ] Citizen and admin routes/endpoints/rules enforce roles.

### Public intelligence

- [ ] Homepage contains all required public sections and provenance/freshness.
- [ ] Weather values use correct units and have failure/stale states.
- [ ] MapLibre map, attribution, controls, markers, popups, clusters/basic filters, and accessible event list work.
- [ ] Core provider data normalizes to one contract; one-provider failure is survivable.
- [ ] Geolocation and manual fallback both work.
- [ ] Risk score, band, contributions, model/time, missing inputs, and calculated-risk disclaimer appear.

### Warning demonstration

- [ ] Admin can preview/create/cancel one labeled manual warning and an audit record exists.
- [ ] Target matching differentiates an eligible and ineligible fixture user.
- [ ] Eligible citizen sees the in-site warning.
- [ ] FCM consent, token, foreground/background, and click path work in a supported test browser.
- [ ] Two consent-aware SMS parts attempt through the backend and status is recorded without secrets.
- [ ] Duplicate confirmation/retry does not create duplicate alert/message parts.

### ESE content and quality

- [ ] Core disaster pages include every required content section, sources, and mobile layout.
- [ ] History filters and complete curated entries work.
- [ ] Government cards use verified information/links and no fabricated logo.
- [ ] About maps the project to ESE and shows the emergency disclaimer.
- [ ] Privacy, Terms, Cookies, and three consent actions reflect actual behavior.
- [ ] Named error states, viewport checks, keyboard checks, security tests, and deployment smoke test pass.

## 19. Demonstration script

**Preparation:** Use synthetic provider fixtures only for controlled failure tests, a pre-provisioned admin, two citizen fixtures (one inside and one outside the radius), test FCM tokens, and an approved test SMS number. Mark all warnings “SIMULATION / COLLEGE DEMO.”

1. Open `/` at desktop width; explain the ESE mission, weather, map/list, sources, timestamps, disaster lifecycle, and provider status.
2. Disable one provider fixture and show partial data without page failure.
3. Create/login a citizen; deny GPS, manually choose the test city, and show nearby events.
4. Open the calculated risk explanation and point out its contributions, version/time, missing data, and non-official label.
5. Open a core disaster page, history, government response, and About; resize the guide to 360×800.
6. Show Privacy, Terms, and cookie preferences; choose Essential Only.
7. Log in as the pre-provisioned admin and open `/admin`.
8. Draft a simulated flood warning around the inside citizen, preview eligibility, and confirm.
9. Switch to the citizen session; show the in-site warning and FCM notification/link.
10. Show the two SMS parts on the test device and open `/disasters/flood` from the link.
11. Show delivery/audit status, masked identifiers, outside-user exclusion, and dedupe behavior.
12. Cancel or let the alert expire and reiterate that ResQEarth supplements official systems.

## 20. Known deadline compromises

- P0 uses manual-admin warning creation as the reliable end-to-end trigger; automatic alert generation is P1.
- Core knowledge slugs are complete; the full catalog may be expanded after submission.
- History is a reviewed local structured dataset, not another live integration.
- Simple point/radius plus region matching precedes advanced polygons/geofencing.
- Basic dashboard counts precede deep analytics.
- Provider selection favors verified, stable, credential-light sources; inaccessible official/flood feeds are shown as unavailable or curated/demo, never falsely live.
- Risk weights are deterministic educational rules, not predictive science.
- Delivery demonstration uses test recipients and cannot prove production reliability.

Every compromise must be stated in the UI/demo where it affects interpretation.

## 21. Stop conditions to prevent scope creep

Stop adding features and focus on defects, evidence, and deployment when:

1. Any P0 route or core journey is incomplete.
2. Auth, admin authorization, rules, secret isolation, consent, or warning provenance has a known critical defect.
3. Manual warning → eligible citizen → in-site/FCM/SMS test path has not passed.
4. Mobile disaster guidance, partial-provider behavior, or production deployment has not passed.
5. A proposed task belongs to P1/P2 and does not directly unblock a failed P0 acceptance criterion.
6. A new provider/category would reduce time available for safety content, testing, accessibility, or deployment.
7. The only justification is visual polish after the critical user journeys are merely “mostly working.”

Do not add ML, native apps, offline PWA, crowdsourcing, multilingual content, advanced geofencing, or authority integration before every P0 checkbox passes.

## 22. Final completion gate

### MVP IS COMPLETE ONLY IF:

- [ ] Public homepage works
- [ ] Signup works
- [ ] Login works
- [ ] Role routing works
- [ ] Weather loads
- [ ] Map loads
- [ ] Disaster markers load
- [ ] Geolocation works/fails gracefully
- [ ] Risk score is calculated
- [ ] Admin can create a warning
- [ ] Citizen sees the warning
- [ ] Browser notification path works
- [ ] SMS warning path works
- [ ] SMS links to disaster page
- [ ] Disaster precaution page works on mobile
- [ ] History page works
- [ ] Government bodies page works
- [ ] About page works
- [ ] Privacy page works
- [ ] Terms page works
- [ ] Cookie preferences work
- [ ] Mobile layout works
- [ ] Production deployment works

In addition, no critical security/accessibility defect may remain, all simulated warnings must be unmistakably labeled, and calculated risk must never appear as an official forecast.

---

**Emergency disclaimer:** ResQEarth is an educational project. It supplements but does not replace verified government information, local authorities, or established emergency services. Data, calculations, browser notifications, and SMS delivery can be incomplete, delayed, or unavailable.
