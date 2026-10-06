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
  MapUnifiedDisasterLayer,
  useUnifiedDisasters,
} from "@/features/disasters";
import {
  DisasterCard,
  type DisasterCardData,
} from "@/components/common/disaster-card";
import {
  RiskOverviewCard,
  PerHazardRiskGrid,
  useDisasterRisk,
} from "@/features/risk";
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
    disasters: unifiedDisasters,
    geoJson: unifiedGeoJson,
    selectedDisaster,
    setSelectedDisaster,
  } = useUnifiedDisasters();
  const {
    assessment: riskAssessment,
    isLoading: isRiskLoading,
    refresh: handleRiskRefresh,
  } = useDisasterRisk();
  const [activeNotificationDismissed, setActiveNotificationDismissed] =
    React.useState(false);

  // Live unified multi-hazard cards across USGS, NASA EONET, NDMA SACHET, IMD & Open-Meteo
  const liveUnifiedCards: DisasterCardData[] = React.useMemo(() => {
    return unifiedDisasters.slice(0, 3).map((d) => ({
      id: d.id,
      type: d.categoryTitle,
      title: d.title,
      description:
        d.description ||
        `${d.categoryTitle} monitored by ${d.sourceName}.${d.isOfficialAlert ? " Official statutory warning." : ""}`,
      severity: d.severity,
      sourceType: d.sourceType,
      sourceName: d.sourceName,
      sourceUrl: d.sourceUrl,
      locationName: d.region,
      latitude: d.latitude,
      longitude: d.longitude,
      distanceKm: d.distanceKm,
      occurredAt: d.occurredAt,
      slug:
        d.disasterType === "flood" || d.disasterType === "urban-flood"
          ? "flood"
          : d.disasterType === "cyclone" || d.disasterType === "severe-storm" || d.disasterType === "high-wind"
          ? "cyclone"
          : d.disasterType === "earthquake"
          ? "earthquake"
          : d.disasterType === "landslide"
          ? "landslide"
          : d.disasterType === "heat-wave" || d.disasterType === "cold-wave"
          ? "heat-wave"
          : d.disasterType === "chemical-leak"
          ? "chemical-leak"
          : "earthquake",
    }));
  }, [unifiedDisasters]);

  const displayDisasterEvents = React.useMemo(() => {
    if (liveUnifiedCards.length === 0) return SAMPLE_DISASTER_EVENTS;
    return liveUnifiedCards;
  }, [liveUnifiedCards]);

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

        {/* 3. Hero Section (design.md Section 9, 10) */}
        <section className="relative overflow-hidden rounded-[20px] border border-[#EEF1EE] bg-gradient-to-br from-[#FAFBFA] via-white to-[#E8FAD9]/30 p-8 sm:p-12 lg:p-16 shadow-[0_6px_24px_rgba(0,0,0,0.04)]">
          {/* Subtle decorative background organic shape */}
          <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-[#E8FAD9]/50 blur-2xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 h-80 w-80 rounded-full bg-[#BDF58E]/20 blur-2xl pointer-events-none" />

          <div className="relative z-10 mx-auto max-w-4xl text-center space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#BDF58E] bg-[#E8FAD9] px-4 py-1.5 text-xs font-semibold text-[#137D43]">
              <span>🌿</span>
              <span className="tracking-wide">SMALL ACTIONS • BIG IMPACT</span>
              <span>🌿</span>
            </div>

            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-[#0A0A0A] leading-[1.05]">
              Rescue Earth <span className="text-[#0B8F2F] font-extrabold block sm:inline">• Protect Life</span>
            </h1>

            <p className="text-base sm:text-lg text-[#4D514F] leading-relaxed max-w-2xl mx-auto">
              Transparent disaster intelligence, real-time environmental observations, explainable 0–100 calculated risk, and community early warning.
            </p>

            {/* Hero CTAs per design.md Section 8 */}
            <div className="flex flex-wrap items-center justify-center gap-3.5 pt-2">
              <Button size="lg" asChild className="bg-[#0B8F2F] text-white hover:bg-[#08752A] rounded-full px-7 py-3.5 text-base font-semibold shadow-sm hover:-translate-y-0.5 transition-all duration-[180ms]">
                <Link href="/map" className="inline-flex items-center gap-2">
                  <Map className="h-4 w-4" />
                  Explore Live Disaster Map
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>

              <Button size="lg" variant="outline" asChild className="bg-white text-[#0A0A0A] border-[1.5px] border-[#0A0A0A] hover:bg-[#FAFBFA] rounded-full px-7 py-3.5 text-base font-semibold hover:-translate-y-0.5 transition-all duration-[180ms]">
                <Link href="/disasters" className="inline-flex items-center gap-2">
                  <Flame className="h-4 w-4 text-[#0B8F2F]" />
                  Disaster Preparedness
                </Link>
              </Button>

              {isAuthenticated ? (
                <Button size="lg" variant="secondary" asChild className="bg-[#FAFBFA] text-[#0A0A0A] border border-[#E7EAE7] rounded-full px-6 py-3.5 hover:bg-[#E8FAD9]/50">
                  <Link href="/dashboard" className="inline-flex items-center gap-2">
                    <LayoutDashboard className="h-4 w-4 text-[#0B8F2F]" />
                    Citizen Dashboard
                  </Link>
                </Button>
              ) : (
                <Button size="lg" variant="secondary" asChild className="bg-[#FAFBFA] text-[#0A0A0A] border border-[#E7EAE7] rounded-full px-6 py-3.5 hover:bg-[#E8FAD9]/50">
                  <Link href="/signup" className="inline-flex items-center gap-2">
                    <UserPlus className="h-4 w-4 text-[#0B8F2F]" />
                    Register for Alerts
                  </Link>
                </Button>
              )}
            </div>

            {/* Engine & Pipeline Telemetry Chips */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6 border-t border-[#EEF1EE] text-left text-xs">
              <div className="rounded-[12px] bg-white/80 backdrop-blur-sm p-3 border border-[#EEF1EE]">
                <span className="text-[10px] uppercase font-semibold text-[#4D514F]">
                  Surveillance Nodes
                </span>
                <p className="font-semibold text-[#0A0A0A] mt-0.5">
                  USGS • NASA • Open-Meteo
                </p>
              </div>

              <div className="rounded-[12px] bg-white/80 backdrop-blur-sm p-3 border border-[#EEF1EE]">
                <span className="text-[10px] uppercase font-semibold text-[#4D514F]">
                  Regional Anchor
                </span>
                <p className="font-semibold text-[#0A0A0A] mt-0.5 truncate">
                  Western India (Mumbai)
                </p>
              </div>

              <div className="rounded-[12px] bg-white/80 backdrop-blur-sm p-3 border border-[#EEF1EE]">
                <span className="text-[10px] uppercase font-semibold text-[#4D514F]">
                  Risk Engine
                </span>
                <p className="font-bold text-[#0B8F2F] mt-0.5">
                  Deterministic v1.0 (0–100)
                </p>
              </div>

              <div className="rounded-[12px] bg-white/80 backdrop-blur-sm p-3 border border-[#EEF1EE]">
                <span className="text-[10px] uppercase font-semibold text-[#4D514F]">
                  User Clearance
                </span>
                <p className="font-semibold uppercase text-[#0A0A0A] mt-0.5">
                  {isAuthenticated ? (role ?? "citizen") : "Public Visitor"}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 4. Impact Feature Strip per design.md Section 11 */}
        <section className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:divide-x divide-[#EEF1EE] bg-white rounded-[16px] border border-[#EEF1EE] p-6 shadow-[0_6px_24px_rgba(0,0,0,0.04)]">
            <div className="flex items-start gap-3.5 sm:px-3">
              <div className="h-11 w-11 shrink-0 rounded-full bg-[#E8FAD9] text-[#0B8F2F] flex items-center justify-center">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#0A0A0A]">Cleaner Environment</h3>
                <p className="text-xs text-[#4D514F] mt-0.5">Less pollution, healthier lives, multi-source telemetry.</p>
              </div>
            </div>

            <div className="flex items-start gap-3.5 sm:px-3">
              <div className="h-11 w-11 shrink-0 rounded-full bg-[#E8FAD9] text-[#0B8F2F] flex items-center justify-center">
                <Bell className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#0A0A0A]">Stronger Communities</h3>
                <p className="text-xs text-[#4D514F] mt-0.5">People + Nature = Progress. Citizen alerts & SOS.</p>
              </div>
            </div>

            <div className="flex items-start gap-3.5 sm:px-3">
              <div className="h-11 w-11 shrink-0 rounded-full bg-[#E8FAD9] text-[#0B8F2F] flex items-center justify-center">
                <BookOpen className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#0A0A0A]">Sustainable Future</h3>
                <p className="text-xs text-[#4D514F] mt-0.5">Reduce. Reuse. Recycle. 22 Disaster SOPs.</p>
              </div>
            </div>

            <div className="flex items-start gap-3.5 sm:px-3">
              <div className="h-11 w-11 shrink-0 rounded-full bg-[#E8FAD9] text-[#0B8F2F] flex items-center justify-center">
                <Map className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#0A0A0A]">Global Impact</h3>
                <p className="text-xs text-[#4D514F] mt-0.5">Local actions, worldwide change. GIS Surveillance.</p>
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

            {/* Explainable Risk Overview Card */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-muted-foreground px-1">
                <span className="font-semibold uppercase tracking-wider text-[11px]">
                  Deterministic Assessment
                </span>
                <span className="font-mono text-[11px]">ResQEarth v1.0</span>
              </div>
              <RiskOverviewCard
                assessment={riskAssessment}
                isLoading={isRiskLoading}
                onRefresh={handleRiskRefresh}
                showBreakdown={true}
              />
            </div>
          </div>

          {/* Per-Hazard Breakdown Grid */}
          <div className="space-y-2 pt-2">
            <div className="flex items-center justify-between text-xs text-muted-foreground px-1">
              <span className="font-semibold uppercase tracking-wider text-[11px]">
                Multi-Hazard Readiness Matrix
              </span>
              <span className="font-mono text-[11px]">5-Dimension Surveillance</span>
            </div>
            <PerHazardRiskGrid hazardBreakdown={riskAssessment.hazardBreakdown} />
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
            showLegend={true}
            showFullscreenControl={true}
            showScaleControl={true}
            showZoomControls={true}
          >
            <MapUnifiedDisasterLayer
              geoJson={unifiedGeoJson}
              disasters={unifiedDisasters}
              selectedDisaster={selectedDisaster}
              onSelectDisaster={setSelectedDisaster}
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

        {/* 8.5. Environmental Impact Statistics Card per design.md Section 15 */}
        <section className="relative overflow-hidden rounded-[20px] bg-gradient-to-r from-[#04411F] via-[#08752A] to-[#0B8F2F] text-white p-8 sm:p-12 lg:p-16 shadow-[0_10px_30px_rgba(4,65,31,0.15)]">
          <div className="relative z-10 max-w-4xl mx-auto space-y-8 text-center">
            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-[0.15em] text-[#BDF58E]">
                OUR ENVIRONMENTAL IMPACT & COVERAGE
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
                Empowering Communities Through Science & Technology
              </h2>
              <p className="text-sm text-white/80 max-w-2xl mx-auto leading-relaxed">
                Dedicated to reducing environmental vulnerability, enhancing hazard preparedness, and protecting lives through open disaster intelligence.
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-4">
              <div className="space-y-1">
                <p className="text-3xl sm:text-5xl font-extrabold text-[#BDF58E]">22</p>
                <p className="text-xs font-semibold text-white/90 uppercase tracking-wider">Hazard Guides</p>
                <p className="text-[11px] text-white/70">Natural & Man-Made</p>
              </div>

              <div className="space-y-1">
                <p className="text-3xl sm:text-5xl font-extrabold text-[#BDF58E]">17</p>
                <p className="text-xs font-semibold text-white/90 uppercase tracking-wider">Indian Case Studies</p>
                <p className="text-[11px] text-white/70">1984–2024 Archive</p>
              </div>

              <div className="space-y-1">
                <p className="text-3xl sm:text-5xl font-extrabold text-[#BDF58E]">11+</p>
                <p className="text-xs font-semibold text-white/90 uppercase tracking-wider">Statutory Bodies</p>
                <p className="text-[11px] text-white/70">NDMA, NDRF, IMD, CWC</p>
              </div>

              <div className="space-y-1">
                <p className="text-3xl sm:text-5xl font-extrabold text-[#BDF58E]">100%</p>
                <p className="text-xs font-semibold text-white/90 uppercase tracking-wider">Explainable Risk</p>
                <p className="text-[11px] text-white/70">Deterministic 0–100</p>
              </div>
            </div>

            <div className="pt-2">
              <Button asChild size="lg" className="bg-white text-[#04411F] hover:bg-[#FAFBFA] rounded-full px-8 py-3.5 font-bold shadow-md hover:-translate-y-0.5 transition-all duration-[180ms]">
                <Link href="/about" className="inline-flex items-center gap-2">
                  Get Involved & Learn More →
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* 9. Verified Government Response Directory Callout */}
        <section className="rounded-[16px] border border-[#EEF1EE] bg-[#FAFBFA] p-6 sm:p-8 lg:p-10 shadow-[0_6px_24px_rgba(0,0,0,0.04)]">
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
