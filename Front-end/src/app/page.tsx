"use client";

import * as React from "react";
import Link from "next/link";
import {
  ShieldCheck,
  MapPin,
  Map,
  Flame,
  Building2,
  Waves,
  Wind,
  Activity,
  Mountain,
  SunMedium,
  Biohazard,
  CheckCircle2,
  ArrowRight,
  Shield,
  AlertTriangle,
  Radio,
  Bell,
  BookOpen,
  LayoutDashboard,
  UserPlus,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { RouteContainer } from "@/components/layout/route-container";
import {
  WeatherOverviewCard,
  useWeather,
} from "@/features/weather";
import {
  MapEarthquakeLayer,
  useEarthquakes,
  MapGlobalDisasterLayer,
  useGlobalDisasters,
} from "@/features/disasters";
import {
  DisasterCard,
  type DisasterCardData,
} from "@/components/common/disaster-card";
import {
  RiskIndicator,
  type RiskAssessmentData,
} from "@/components/common/risk-indicator";
import {
  NotificationBanner,
  type WarningBannerData,
} from "@/components/common/notification-banner";
import {
  MapView,
  LocationProvider,
  LocationStatusCard,
  useGeolocation,
} from "@/features/map";
import { useAuth } from "@/features/auth";

// Sample explainable calculated risk data matching architecture specification
const SAMPLE_RISK_DATA: RiskAssessmentData = {
  score: 68,
  level: "HIGH",
  disasterType: "Urban Flood & Inundation",
  regionName: "Mithi River Catchment & Western Suburbs",
  calculatedAt: new Date().toISOString(),
  modelVersion: "v1.0.0-deterministic",
  contributions: [
    { name: "Heavy Rainfall (4.2 mm/hr)", points: 28, description: "Observed local precipitation rate" },
    { name: "River Discharge Forecast (GloFAS)", points: 22, description: "Upstream basin saturation" },
    { name: "Official Weather Advisory (IMD)", points: 14, description: "Yellow alert issued for coastal belt" },
    { name: "Recent Proximity Incidents", points: 4, description: "Waterlogging reported within 15 km" },
  ],
  missingInputs: ["Tidal High-Water Gauge Telemetry"],
};

// Sample disaster preview events for monitored hazards
const SAMPLE_DISASTER_EVENTS: DisasterCardData[] = [
  {
    id: "evt-001",
    type: "Cyclone",
    title: "Deep Depression over East-Central Arabian Sea",
    description:
      "Severe weather system tracking north-northwestward with sustained surface winds of 55–65 km/h. Coastal fisherman advisories active.",
    severity: "HIGH",
    sourceType: "official",
    sourceName: "India Meteorological Department (IMD)",
    sourceUrl: "https://mausam.imd.gov.in",
    locationName: "Coastal Konkan, Maharashtra",
    latitude: 18.9,
    longitude: 72.8,
    distanceKm: 42,
    occurredAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    slug: "cyclone",
  },
  {
    id: "evt-002",
    type: "Flood",
    title: "River Basin Discharge Warning",
    description:
      "Elevated river flow and localized surface water pooling observed in low-lying suburban drainage basins following intense overnight downpours.",
    severity: "MODERATE",
    sourceType: "automatic",
    sourceName: "ResQEarth Hydrological Risk Model",
    locationName: "Thane & Raigad Basins",
    latitude: 19.2,
    longitude: 73.0,
    distanceKm: 18,
    occurredAt: new Date(Date.now() - 3600000 * 5).toISOString(),
    slug: "flood",
  },
  {
    id: "evt-003",
    type: "Earthquake",
    title: "M 4.1 Minor Seismic Event",
    description:
      "Focal depth of 10 km recorded in Koyna-Warna tectonic zone. No structural damage reported; monitored by regional seismic stations.",
    severity: "GUARDED",
    sourceType: "official",
    sourceName: "National Centre for Seismology / USGS",
    sourceUrl: "https://earthquake.usgs.gov",
    locationName: "Satara District, Maharashtra",
    latitude: 17.4,
    longitude: 73.7,
    distanceKm: 145,
    occurredAt: new Date(Date.now() - 3600000 * 12).toISOString(),
    slug: "earthquake",
  },
];

// Sample urgent notification banner
const SAMPLE_WARNING_BANNER: WarningBannerData = {
  id: "alert-top-01",
  title: "Monsoon Inundation & Coastal Weather Warning",
  message:
    "Heavy to very heavy rainfall expected across coastal belts during high tide. Avoid waterlogged subways and heed local municipal advisories.",
  precautions: "Stay indoors during squally winds; keep emergency kit accessible.",
  disasterType: "Flood",
  severity: "HIGH",
  sourceType: "official",
  sourceName: "IMD Mumbai & Disaster Management Cell",
  region: "Mumbai & Coastal Maharashtra",
  guideSlug: "flood",
};

function HomePageContent() {
  const { isAuthenticated, role } = useAuth();
  const { location } = useGeolocation();
  const {
    weather,
    isLoading: isRefreshingWeather,
    error: weatherError,
    refresh: handleWeatherRefresh,
  } = useWeather();
  const {
    earthquakes,
    geoJson: earthquakeGeoJson,
    selectedEarthquake,
    setSelectedEarthquake,
  } = useEarthquakes();
  const {
    disasters: globalDisasters,
    geoJson: globalGeoJson,
    selectedDisaster: selectedGlobalDisaster,
    setSelectedDisaster: setSelectedGlobalDisaster,
  } = useGlobalDisasters();
  const [activeNotificationDismissed, setActiveNotificationDismissed] =
    React.useState(false);

  // Live earthquake cards from USGS feed
  const liveEarthquakeCards: DisasterCardData[] = React.useMemo(() => {
    return earthquakes.slice(0, 2).map((eq) => ({
      id: eq.id,
      type: "Earthquake",
      title: eq.title,
      description: `M ${eq.magnitude.toFixed(1)} seismic event at focal depth ${eq.depthKm} km near ${eq.place}.${eq.tsunamiAlert ? " Tsunami alert active." : ""}`,
      severity: eq.severity,
      sourceType: "official" as const,
      sourceName: "USGS Earthquake Hazards Program",
      sourceUrl: eq.sourceUrl,
      locationName: eq.place,
      latitude: eq.latitude,
      longitude: eq.longitude,
      distanceKm: eq.distanceKm,
      occurredAt: eq.occurredAt,
      slug: "earthquake",
    }));
  }, [earthquakes]);

  // Live global hazard cards from NASA EONET
  const liveGlobalCards: DisasterCardData[] = React.useMemo(() => {
    return globalDisasters.slice(0, 2).map((d) => ({
      id: d.id,
      type: d.categoryTitle,
      title: d.title,
      description: `${d.categoryTitle} tracked by ${d.primarySource.name || "NASA EONET"}.${d.description ? ` ${d.description}` : ""}`,
      severity: d.severity,
      sourceType: "automatic" as const,
      sourceName: `NASA EONET (${d.primarySource.name || "NASA"})`,
      sourceUrl: d.sourceUrl,
      locationName: d.title,
      latitude: d.latitude,
      longitude: d.longitude,
      distanceKm: d.distanceKm,
      occurredAt: d.occurredAt,
      slug: d.categoryKey === "wildfires" ? "wildfire" : d.categoryKey === "severeStorms" ? "cyclone" : d.categoryKey === "floods" ? "flood" : "earthquake",
    }));
  }, [globalDisasters]);

  const displayDisasterEvents = React.useMemo(() => {
    const liveItems = [...liveEarthquakeCards, ...liveGlobalCards];
    if (liveItems.length === 0) return SAMPLE_DISASTER_EVENTS;
    const sampleFill = SAMPLE_DISASTER_EVENTS.filter(
      (s) => !liveItems.some((l) => l.type.toLowerCase() === s.type.toLowerCase())
    );
    return [...liveItems, ...sampleFill].slice(0, 3);
  }, [liveEarthquakeCards, liveGlobalCards]);

  return (
    <div className="flex flex-col space-y-12 sm:space-y-16 lg:space-y-20 pb-16">
        {/* 1. Emergency Helpline & Provenance Bar */}
      <div className="border-b border-border/80 bg-muted/40 py-2.5 px-4 text-xs">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 text-muted-foreground">
            <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-semibold text-foreground">
              National Emergency Services:
            </span>
            <span className="font-mono font-bold text-destructive">112</span>
            <span className="hidden sm:inline text-muted-foreground/60">|</span>
            <span className="hidden sm:inline">
              Police: <strong className="text-foreground">100</strong>
            </span>
            <span className="hidden sm:inline text-muted-foreground/60">|</span>
            <span className="hidden sm:inline">
              Fire: <strong className="text-foreground">101</strong>
            </span>
            <span className="hidden sm:inline text-muted-foreground/60">|</span>
            <span className="hidden sm:inline">
              Ambulance: <strong className="text-foreground">108</strong>
            </span>
          </div>

          <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
            <Badge variant="outline" className="text-[10px] px-1.5 py-0 bg-background">
              ESE Mini Project
            </Badge>
            <span>Educational Decision-Support System</span>
          </div>
        </div>
      </div>

      <RouteContainer className="space-y-12 sm:space-y-16 lg:space-y-20">
        {/* 2. Urgent Notification Banner (Dismissible) */}
        {!activeNotificationDismissed && (
          <NotificationBanner
            data={SAMPLE_WARNING_BANNER}
            onDismiss={() => setActiveNotificationDismissed(true)}
          />
        )}

        {/* 3. Hero Section */}
        <section className="relative overflow-hidden rounded-2xl border border-border/80 bg-gradient-to-b from-primary/5 via-card to-background p-6 sm:p-10 lg:p-14 shadow-sm">
          <div className="relative z-10 mx-auto max-w-4xl text-center space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3.5 py-1 text-xs font-semibold text-primary">
              <Radio className="h-3.5 w-3.5 animate-pulse text-primary" />
              <span>Multi-Source Disaster Intelligence & Emergency Early Warning</span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-foreground leading-[1.15]">
              Resilient Communities Through Transparent Environmental Intelligence
            </h1>

            <p className="text-base sm:text-lg text-muted-foreground leading-relaxed max-w-3xl mx-auto">
              ResQEarth combines near-real-time environmental telemetry, multi-provider hazard tracking, explainable 0–100 deterministic risk scores, and consent-based citizen alerts across India.
            </p>

            {/* Hero CTAs */}
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <Button size="lg" asChild className="gap-2 shadow-sm">
                <Link href="/map">
                  <Map className="h-4 w-4" />
                  Explore Live Disaster Map
                </Link>
              </Button>

              <Button size="lg" variant="outline" asChild className="gap-2">
                <Link href="/disasters">
                  <Flame className="h-4 w-4 text-orange-500" />
                  Disaster Preparedness
                </Link>
              </Button>

              {isAuthenticated ? (
                <Button size="lg" variant="secondary" asChild className="gap-2">
                  <Link href="/dashboard">
                    <LayoutDashboard className="h-4 w-4 text-primary" />
                    My Citizen Dashboard
                  </Link>
                </Button>
              ) : (
                <Button size="lg" variant="secondary" asChild className="gap-2">
                  <Link href="/signup">
                    <UserPlus className="h-4 w-4 text-primary" />
                    Register for Alerts
                  </Link>
                </Button>
              )}
            </div>

            {/* Engine & Pipeline Telemetry Chips */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-6 border-t border-border/60 text-left text-xs">
              <div className="rounded-lg bg-card/80 p-2.5 border border-border/60">
                <span className="text-[10px] uppercase font-semibold text-muted-foreground">
                  Surveillance Nodes
                </span>
                <p className="font-mono font-bold text-foreground mt-0.5">
                  USGS • NASA EONET • Open-Meteo
                </p>
              </div>

              <div className="rounded-lg bg-card/80 p-2.5 border border-border/60">
                <span className="text-[10px] uppercase font-semibold text-muted-foreground">
                  Regional Focus
                </span>
                <p className="font-semibold text-foreground mt-0.5 truncate">
                  Western India (Mumbai)
                </p>
              </div>

              <div className="rounded-lg bg-card/80 p-2.5 border border-border/60">
                <span className="text-[10px] uppercase font-semibold text-muted-foreground">
                  Risk Engine
                </span>
                <p className="font-mono font-bold text-primary mt-0.5">
                  Deterministic v1.0
                </p>
              </div>

              <div className="rounded-lg bg-card/80 p-2.5 border border-border/60">
                <span className="text-[10px] uppercase font-semibold text-muted-foreground">
                  User Clearance
                </span>
                <p className="font-semibold uppercase text-foreground mt-0.5">
                  {isAuthenticated ? (role ?? "citizen") : "Public Visitor"}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 4. Core Value Proposition Grid */}
        <section className="space-y-6">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <Badge variant="outline" className="text-xs uppercase tracking-wider font-semibold">
              Mission Architecture
            </Badge>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              Built for the Full Disaster Lifecycle
            </h2>
            <p className="text-sm text-muted-foreground">
              Mitigation, preparedness, early warning, response support, and community recovery.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="border-border/80 transition-all hover:border-primary/40 hover:shadow-sm">
              <CardHeader className="pb-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 mb-2">
                  <Map className="h-5 w-5" />
                </div>
                <CardTitle className="text-base font-bold">
                  Geospatial Surveillance
                </CardTitle>
                <CardDescription className="text-xs">
                  MapLibre GL JS vector rendering with multi-layer overlays for earthquakes, floods, and severe weather storms.
                </CardDescription>
              </CardHeader>
              <CardContent className="text-xs text-muted-foreground space-y-1">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                  <span>Interactive MapLibre Base Layer</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                  <span>Dynamic proximity & cluster filtering</span>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/80 transition-all hover:border-primary/40 hover:shadow-sm">
              <CardHeader className="pb-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 mb-2">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <CardTitle className="text-base font-bold">
                  Explainable Risk Engine
                </CardTitle>
                <CardDescription className="text-xs">
                  Deterministic 0–100 risk scoring with transparent factor weightings. No unexplainable black-box AI calculations.
                </CardDescription>
              </CardHeader>
              <CardContent className="text-xs text-muted-foreground space-y-1">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                  <span>Itemized point contributions</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                  <span>Disclosed missing or stale inputs</span>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/80 transition-all hover:border-primary/40 hover:shadow-sm">
              <CardHeader className="pb-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-500/10 text-orange-600 dark:text-orange-400 mb-2">
                  <Bell className="h-5 w-5" />
                </div>
                <CardTitle className="text-base font-bold">
                  Consented Citizen Alerts
                </CardTitle>
                <CardDescription className="text-xs">
                  Multi-channel emergency broadcasts via browser push notifications (FCM) and two-part SMS warnings with deep links.
                </CardDescription>
              </CardHeader>
              <CardContent className="text-xs text-muted-foreground space-y-1">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                  <span>Two-part SMS with emergency contacts</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                  <span>Strict privacy & consent controls</span>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/80 transition-all hover:border-primary/40 hover:shadow-sm">
              <CardHeader className="pb-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400 mb-2">
                  <Building2 className="h-5 w-5" />
                </div>
                <CardTitle className="text-base font-bold">
                  Government Alignment
                </CardTitle>
                <CardDescription className="text-xs">
                  Verified alignment with National Disaster Management Authority (NDMA), NDRF, IMD, and Central Water Commission.
                </CardDescription>
              </CardHeader>
              <CardContent className="text-xs text-muted-foreground space-y-1">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                  <span>Verified government portals</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                  <span>Strict provenance labeling</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* 4.5. Real-Time Location Telemetry Card */}
        <LocationStatusCard />

        {/* 5. Live Surveillance & Local Risk Assessment Dashboard */}
        <section className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-border/80 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs uppercase font-semibold">
                  Live Surveillance
                </Badge>
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <MapPin className="h-3.5 w-3.5 text-primary" />
                  Selected Region: <strong>{location.city || "Mumbai"}, {location.state || "Maharashtra"}</strong>
                </span>
              </div>
              <h2 className="text-2xl font-bold tracking-tight text-foreground mt-1">
                Regional Environmental & Risk Overview
              </h2>
              <p className="text-xs text-muted-foreground">
                Near-live telemetry from Open-Meteo and explainable deterministic calculations.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleWeatherRefresh}
                disabled={isRefreshingWeather}
                className="gap-1.5 text-xs"
              >
                <RefreshCw
                  className={`h-3.5 w-3.5 ${
                    isRefreshingWeather ? "animate-spin text-primary" : ""
                  }`}
                />
                Refresh Telemetry
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
            {/* Live Open-Meteo WeatherOverviewCard Component */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-muted-foreground px-1">
                <span className="font-semibold uppercase tracking-wider text-[11px]">
                  Ambient Weather Feed
                </span>
                <span className="font-mono text-[11px]">Source: Open-Meteo</span>
              </div>
              <WeatherOverviewCard
                data={weather}
                isLoading={isRefreshingWeather}
                error={weatherError}
                onRefresh={handleWeatherRefresh}
              />
            </div>

            {/* Real RiskIndicator Component */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-muted-foreground px-1">
                <span className="font-semibold uppercase tracking-wider text-[11px]">
                  Deterministic Assessment
                </span>
                <span className="font-mono text-[11px]">ResQEarth v1.0</span>
              </div>
              <RiskIndicator data={SAMPLE_RISK_DATA} showBreakdown={true} />
            </div>
          </div>
        </section>

        {/* 6. Live-Map Geospatial Hazard Surveillance Map */}
        <section className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-foreground">
                Geospatial Hazard Surveillance Map
              </h2>
              <p className="text-xs text-muted-foreground">
                Interactive MapLibre GL JS engine with OpenStreetMap basemap, category filtering, and Mumbai anchor.
              </p>
            </div>

            <Button asChild size="sm" className="gap-1.5 self-start sm:self-auto">
              <Link href="/map">
                <Map className="h-4 w-4" />
                Launch Fullscreen Map
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </Button>
          </div>

          {/* Interactive MapLibre Container */}
          <MapView
            className="h-[380px] sm:h-[440px] w-full"
            showFilterChips={true}
            showRegionPicker={true}
            showLegend={true}
            showNavigationControls={true}
            showFullscreenControl={true}
            showScaleControl={true}
            showGeolocateControl={true}
          >
            <MapEarthquakeLayer
              geoJson={earthquakeGeoJson}
              earthquakes={earthquakes}
              selectedEarthquake={selectedEarthquake}
              onSelectEarthquake={setSelectedEarthquake}
              visible={true}
            />
            <MapGlobalDisasterLayer
              geoJson={globalGeoJson}
              disasters={globalDisasters}
              selectedDisaster={selectedGlobalDisaster}
              onSelectDisaster={setSelectedGlobalDisaster}
              visible={true}
            />
          </MapView>
        </section>

        {/* 7. Active Regional Hazard Events Stream */}
        <section className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/80 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <Badge variant="destructive" className="text-xs uppercase font-semibold">
                  Monitored Hazards
                </Badge>
                <span className="text-xs text-muted-foreground">
                  {displayDisasterEvents.length} Active Feeds in Vicinity
                </span>
              </div>
              <h2 className="text-2xl font-bold tracking-tight text-foreground mt-1">
                Recent Disaster Events & Advisories
              </h2>
            </div>

            <Button variant="ghost" size="sm" asChild className="gap-1 text-xs self-start sm:self-auto">
              <Link href="/disasters">
                View All Hazards
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {displayDisasterEvents.map((event) => (
              <DisasterCard
                key={event.id}
                data={event}
                onSelect={() => {}}
                onOpenGuide={() => {}}
              />
            ))}
          </div>
        </section>

        {/* 8. Disaster Preparedness & Knowledge Portal Highlights */}
        <section className="space-y-6">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <Badge variant="outline" className="text-xs uppercase tracking-wider font-semibold">
              Disaster Preparedness
            </Badge>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              Educational Safety Guides & Protocols
            </h2>
            <p className="text-sm text-muted-foreground">
              Essential precautions, emergency kit checklists, warning signs, and official response instructions.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <Link
              href="/disasters/flood"
              className="group block rounded-xl border border-border/80 bg-card p-5 transition-all hover:border-primary hover:shadow-md"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  <Waves className="h-5 w-5" />
                </div>
                <Badge variant="outline" className="text-[10px] uppercase font-semibold">
                  Natural
                </Badge>
              </div>
              <h3 className="font-bold text-base text-foreground group-hover:text-primary transition-colors">
                Urban & River Floods
              </h3>
              <p className="text-xs text-muted-foreground mt-1.5 line-clamp-2 leading-relaxed">
                Precipitation thresholds, waterlogging survival tactics, electrical hazard precautions, and potable water safety.
              </p>
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-primary mt-3">
                Read Flood Safety Guide <ArrowRight className="h-3 w-3" />
              </span>
            </Link>

            <Link
              href="/disasters/cyclone"
              className="group block rounded-xl border border-border/80 bg-card p-5 transition-all hover:border-primary hover:shadow-md"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-teal-500/10 text-teal-600 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  <Wind className="h-5 w-5" />
                </div>
                <Badge variant="outline" className="text-[10px] uppercase font-semibold">
                  Natural
                </Badge>
              </div>
              <h3 className="font-bold text-base text-foreground group-hover:text-primary transition-colors">
                Tropical Cyclones
              </h3>
              <p className="text-xs text-muted-foreground mt-1.5 line-clamp-2 leading-relaxed">
                Storm surge zones, window taping myths vs facts, high-wind anchoring, and post-storm shelter protocols.
              </p>
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-primary mt-3">
                Read Cyclone Safety Guide <ArrowRight className="h-3 w-3" />
              </span>
            </Link>

            <Link
              href="/disasters/earthquake"
              className="group block rounded-xl border border-border/80 bg-card p-5 transition-all hover:border-primary hover:shadow-md"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-500/10 text-red-600 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  <Activity className="h-5 w-5" />
                </div>
                <Badge variant="outline" className="text-[10px] uppercase font-semibold">
                  Natural
                </Badge>
              </div>
              <h3 className="font-bold text-base text-foreground group-hover:text-primary transition-colors">
                Earthquakes
              </h3>
              <p className="text-xs text-muted-foreground mt-1.5 line-clamp-2 leading-relaxed">
                Drop, Cover, and Hold On techniques, aftershock awareness, gas leak isolation, and building evacuation checklists.
              </p>
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-primary mt-3">
                Read Earthquake Safety Guide <ArrowRight className="h-3 w-3" />
              </span>
            </Link>

            <Link
              href="/disasters/landslide"
              className="group block rounded-xl border border-border/80 bg-card p-5 transition-all hover:border-primary hover:shadow-md"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  <Mountain className="h-5 w-5" />
                </div>
                <Badge variant="outline" className="text-[10px] uppercase font-semibold">
                  Natural
                </Badge>
              </div>
              <h3 className="font-bold text-base text-foreground group-hover:text-primary transition-colors">
                Landslides & Debris Flow
              </h3>
              <p className="text-xs text-muted-foreground mt-1.5 line-clamp-2 leading-relaxed">
                Slope destabilization warning signs, retaining wall cracks, rapid hillside evacuation, and drainage maintenance.
              </p>
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-primary mt-3">
                Read Landslide Guide <ArrowRight className="h-3 w-3" />
              </span>
            </Link>

            <Link
              href="/disasters/heat-wave"
              className="group block rounded-xl border border-border/80 bg-card p-5 transition-all hover:border-primary hover:shadow-md"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-500/10 text-orange-600 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  <SunMedium className="h-5 w-5" />
                </div>
                <Badge variant="outline" className="text-[10px] uppercase font-semibold">
                  Natural
                </Badge>
              </div>
              <h3 className="font-bold text-base text-foreground group-hover:text-primary transition-colors">
                Extreme Heat Waves
              </h3>
              <p className="text-xs text-muted-foreground mt-1.5 line-clamp-2 leading-relaxed">
                Wet-bulb temperature thresholds, heat stroke first aid, hydration protocols, and vulnerable population protection.
              </p>
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-primary mt-3">
                Read Heat Wave Guide <ArrowRight className="h-3 w-3" />
              </span>
            </Link>

            <Link
              href="/disasters/chemical-leak"
              className="group block rounded-xl border border-border/80 bg-card p-5 transition-all hover:border-primary hover:shadow-md"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-yellow-500/10 text-yellow-600 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  <Biohazard className="h-5 w-5" />
                </div>
                <Badge variant="outline" className="text-[10px] uppercase font-semibold">
                  Man-Made
                </Badge>
              </div>
              <h3 className="font-bold text-base text-foreground group-hover:text-primary transition-colors">
                Industrial & Chemical Emergencies
              </h3>
              <p className="text-xs text-muted-foreground mt-1.5 line-clamp-2 leading-relaxed">
                Upwind evacuation principles, shelter-in-place sealing, eye protection, and hazardous gas inhalation first response.
              </p>
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-primary mt-3">
                Read Chemical Safety Guide <ArrowRight className="h-3 w-3" />
              </span>
            </Link>
          </div>
        </section>

        {/* 9. Verified Government Response Directory Callout */}
        <section className="rounded-2xl border border-border/80 bg-muted/30 p-6 sm:p-8 lg:p-10">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-3 max-w-2xl">
              <Badge variant="outline" className="text-xs uppercase font-semibold bg-background">
                Institutional Directory
              </Badge>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                Verified Indian Disaster Management Authorities
              </h2>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                ResQEarth works in educational harmony with statutory institutions including the National Disaster Management Authority (NDMA), NDRF emergency rescue teams, IMD meteorological advisories, and the Central Water Commission (CWC).
              </p>

              <div className="flex flex-wrap gap-2 pt-2">
                <span className="rounded-md bg-background px-2.5 py-1 text-xs font-medium border border-border">
                  NDMA (Disaster Policy)
                </span>
                <span className="rounded-md bg-background px-2.5 py-1 text-xs font-medium border border-border">
                  NDRF (Search & Rescue)
                </span>
                <span className="rounded-md bg-background px-2.5 py-1 text-xs font-medium border border-border">
                  IMD (Weather & Cyclones)
                </span>
                <span className="rounded-md bg-background px-2.5 py-1 text-xs font-medium border border-border">
                  CWC (River & Flood Flow)
                </span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row lg:flex-col gap-3 shrink-0">
              <Button asChild className="gap-2 justify-center">
                <Link href="/government-response">
                  <Building2 className="h-4 w-4" />
                  View Government Directory
                </Link>
              </Button>

              <Button variant="outline" asChild className="gap-2 justify-center">
                <Link href="/history">
                  <BookOpen className="h-4 w-4" />
                  Indian Disaster History
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* 10. Citizen Registration & Notification Callout */}
        {!isAuthenticated && (
          <section className="rounded-2xl border border-primary/20 bg-primary/5 p-6 sm:p-10 text-center space-y-4">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Shield className="h-6 w-6" />
            </div>

            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              Stay Alerted in Your District
            </h2>

            <p className="text-sm text-muted-foreground max-w-xl mx-auto leading-relaxed">
              Create a citizen account to save your local monitoring preferences, enable browser push notifications, and opt into SMS alerts.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <Button asChild size="lg" className="gap-2">
                <Link href="/signup">
                  <UserPlus className="h-4 w-4" />
                  Create Free Citizen Profile
                </Link>
              </Button>

              <Button variant="outline" asChild size="lg">
                <Link href="/login">Citizen Login</Link>
              </Button>
            </div>
          </section>
        )}

        {/* 11. Prominent Official-Source & Educational Disclaimer */}
        <section className="rounded-xl border border-amber-200 dark:border-amber-900/60 bg-amber-50/70 dark:bg-amber-950/20 p-5 text-xs text-amber-900 dark:text-amber-200 space-y-2">
          <div className="flex items-center gap-2 font-bold text-sm text-amber-950 dark:text-amber-100">
            <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0" />
            <span>ResQEarth Academic Project Disclaimer & Official Directives</span>
          </div>

          <p className="leading-relaxed">
            ResQEarth is an academic Second-Year Engineering Environmental Science (ESE) demonstration project designed for disaster awareness, hazard education, and decision support. It is <strong>NOT</strong> an official government warning authority. Internally calculated risk indices are labelled <strong>RESQEARTH CALCULATED RISK</strong> and do not replace official bulletins from NDMA, IMD, or local disaster management cells.
          </p>

          <p className="leading-relaxed text-[11px] opacity-90">
            During any real natural or man-made disaster emergency, citizens must strictly adhere to instructions issued by local civil defense authorities, law enforcement, and verified national hotlines. Dial <strong>112</strong> for immediate life-safety assistance.
          </p>
        </section>
      </RouteContainer>
    </div>
  );
}

export default function HomePage() {
  return (
    <LocationProvider>
      <HomePageContent />
    </LocationProvider>
  );
}
