"use client";

import * as React from "react";
import Link from "next/link";
import {
  ArrowRight,
  BellRing,
  BookOpen,
  Check,
  Database,
  Radio,
  RefreshCw,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { RouteContainer } from "@/components/layout/route-container";
import { WeatherOverviewCard, useWeather } from "@/features/weather";
import { MapUnifiedDisasterLayer, useUnifiedDisasters } from "@/features/disasters";
import { DisasterCard, type DisasterCardData } from "@/components/common/disaster-card";
import { RiskOverviewCard, useDisasterRisk } from "@/features/risk";
import { NotificationBanner, type WarningBannerData } from "@/components/common/notification-banner";
import { MapView, LocationProvider, useGeolocation } from "@/features/map";
import { useAuth } from "@/features/auth";

const FALLBACK_EVENTS: DisasterCardData[] = [
  {
    id: "evt-001",
    type: "Cyclone",
    title: "Deep depression over the east-central Arabian Sea",
    description: "Severe weather system tracking north-northwest with sustained winds of 55–65 km/h.",
    severity: "HIGH",
    sourceType: "official",
    sourceName: "India Meteorological Department",
    sourceUrl: "https://mausam.imd.gov.in",
    locationName: "Coastal Konkan, Maharashtra",
    distanceKm: 42,
    occurredAt: "2026-09-30T02:30:00.000Z",
    slug: "cyclone",
  },
  {
    id: "evt-002",
    type: "Flood",
    title: "River basin discharge advisory",
    description: "Elevated flow and surface-water pooling observed in low-lying suburban drainage basins.",
    severity: "MODERATE",
    sourceType: "automatic",
    sourceName: "ResQEarth risk model",
    locationName: "Thane and Raigad basins",
    distanceKm: 18,
    occurredAt: "2026-09-29T23:30:00.000Z",
    slug: "flood",
  },
  {
    id: "evt-003",
    type: "Earthquake",
    title: "M 4.1 minor seismic event",
    description: "A shallow event was recorded in the Koyna–Warna tectonic zone. No damage reported.",
    severity: "GUARDED",
    sourceType: "official",
    sourceName: "National Centre for Seismology / USGS",
    sourceUrl: "https://earthquake.usgs.gov",
    locationName: "Satara District, Maharashtra",
    distanceKm: 145,
    occurredAt: "2026-09-29T16:30:00.000Z",
    slug: "earthquake",
  },
];

const ACTIVE_WARNING: WarningBannerData = {
  id: "alert-top-01",
  title: "Monsoon inundation and coastal weather warning",
  message: "Heavy to very heavy rainfall may coincide with high tide across coastal districts.",
  precautions: "Avoid waterlogged routes and follow local municipal advisories.",
  disasterType: "Flood",
  severity: "HIGH",
  sourceType: "official",
  sourceName: "IMD Mumbai & Disaster Management Cell",
  region: "Mumbai & Coastal Maharashtra",
  guideSlug: "flood",
};

function HomePageContent() {
  const { isAuthenticated } = useAuth();
  const { location } = useGeolocation();
  const { weather, isLoading: weatherLoading, error: weatherError, refresh: refreshWeather } = useWeather();
  const {
    disasters,
    geoJson,
    selectedDisaster,
    setSelectedDisaster,
  } = useUnifiedDisasters();
  const { assessment, isLoading: riskLoading, refresh: refreshRisk } = useDisasterRisk();
  const [warningDismissed, setWarningDismissed] = React.useState(false);

  const eventCards = React.useMemo<DisasterCardData[]>(() => {
    if (!disasters.length) return FALLBACK_EVENTS;
    return disasters.slice(0, 3).map((event) => ({
      id: event.id,
      type: event.categoryTitle,
      title: event.title,
      description: event.description || `${event.categoryTitle} monitored by ${event.sourceName}.`,
      severity: event.severity,
      sourceType: event.sourceType,
      sourceName: event.sourceName,
      sourceUrl: event.sourceUrl,
      locationName: event.region,
      latitude: event.latitude,
      longitude: event.longitude,
      distanceKm: event.distanceKm,
      occurredAt: event.occurredAt,
      slug: toGuideSlug(event.disasterType),
    }));
  }, [disasters]);

  const officialCount = React.useMemo(() => disasters.filter((item) => item.isOfficialAlert).length, [disasters]);

  return (
    <div className="pb-8">
      <div className="border-b border-slate-200 bg-slate-950 px-5 py-2.5 text-xs text-slate-300">
        <div className="mx-auto flex max-w-screen-2xl items-center justify-between gap-4 sm:px-3">
          <div className="flex items-center gap-2.5">
            <span className="h-1.5 w-1.5 rounded-full bg-teal-400" />
            <span>Monitoring services operational</span>
            <span className="hidden text-slate-600 sm:inline">/</span>
            <span className="hidden text-slate-400 sm:inline">USGS · NASA EONET · Open-Meteo · NDMA</span>
          </div>
          <div className="shrink-0 font-medium text-white">Emergency <span className="ml-1 font-mono text-red-300">112</span></div>
        </div>
      </div>

      <RouteContainer size="lg" className="space-y-20 lg:space-y-28">
        <section className="surface-grid relative overflow-hidden rounded-2xl bg-slate-950 text-white shadow-[0_24px_70px_rgba(15,23,42,.18)]">
          <div className="absolute -right-24 -top-24 h-80 w-80 rounded-full bg-teal-400/10 blur-3xl" />
          <div className="grid lg:grid-cols-[1.2fr_.8fr]">
            <div className="relative px-7 py-12 sm:px-12 sm:py-16 lg:px-16 lg:py-20">
              <div className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-teal-300">
                <Radio className="h-3.5 w-3.5" /> Live regional intelligence
              </div>
              <h1 className="mt-6 max-w-4xl text-4xl font-semibold leading-[1.04] tracking-[-0.045em] sm:text-6xl lg:text-7xl">
                Know the risk.<br /><span className="text-slate-400">Act with confidence.</span>
              </h1>
              <p className="mt-7 max-w-2xl text-base leading-7 text-slate-300 sm:text-lg">
                Verified hazard feeds, transparent regional risk scoring and practical guidance—brought together in one calm operating picture.
              </p>
              <div className="mt-9 flex flex-wrap gap-3">
                <Button variant="brand" size="lg" asChild>
                  <Link href="/map">Open live map <ArrowRight className="ml-2 h-4 w-4" /></Link>
                </Button>
                <Button size="lg" asChild className="border border-white/15 bg-white/10 text-white shadow-none hover:bg-white/15">
                  <Link href="/disasters"><BookOpen className="mr-2 h-4 w-4" /> Preparedness guides</Link>
                </Button>
              </div>
            </div>

            <div className="relative border-t border-white/10 bg-white/[0.035] p-7 sm:p-10 lg:border-l lg:border-t-0 lg:p-12">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-[0.15em] text-slate-400">Regional overview</p>
                <span className="rounded-md bg-teal-400/10 px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-teal-300">Live</span>
              </div>
              <div className="mt-8 grid grid-cols-2 gap-px overflow-hidden rounded-xl bg-white/10 ring-1 ring-white/10">
                <HeroMetric label="Monitored hazards" value={disasters.length || "—"} />
                <HeroMetric label="Official alerts" value={officialCount || "—"} />
                <HeroMetric label="Calculated risk" value={assessment.score} suffix="/100" />
                <HeroMetric label="Risk band" value={assessment.level} compact />
              </div>
              <div className="mt-8 space-y-4 border-t border-white/10 pt-6 text-sm">
                <SignalRow label="Region" value={location.city || location.locality || "Mumbai"} />
                <SignalRow label="Weather" value={weather ? `${Math.round(weather.temperature)}°C · ${weather.conditionLabel}` : "Acquiring feed"} />
                <SignalRow label="Model" value="Deterministic v1.0" />
              </div>
              <p className="mt-7 text-xs leading-5 text-slate-500">Decision support only. Official instructions from NDMA, IMD and local authorities always take precedence.</p>
            </div>
          </div>
        </section>

        {!warningDismissed && (
          <NotificationBanner data={ACTIVE_WARNING} onDismiss={() => setWarningDismissed(true)} />
        )}

        <section>
          <SectionIntro kicker="Operating picture" title="Your region, interpreted" description="Live environmental conditions and an explainable risk assessment for the selected location." action={
            <Button variant="outline" size="sm" onClick={() => Promise.all([refreshWeather(), refreshRisk()])}>
              <RefreshCw className="mr-2 h-3.5 w-3.5" /> Refresh feeds
            </Button>
          } />
          <div className="mt-7 grid gap-5 xl:grid-cols-2">
            <WeatherOverviewCard data={weather} isLoading={weatherLoading} error={weatherError} onRefresh={refreshWeather} />
            <RiskOverviewCard assessment={assessment} isLoading={riskLoading} onRefresh={refreshRisk} showBreakdown />
          </div>
        </section>

        <section>
          <SectionIntro kicker="Geospatial intelligence" title="Hazards in context" description="Explore active events, proximity and severity on an interactive map." action={
            <Button variant="outline" size="sm" asChild><Link href="/map">Full map workspace <ArrowRight className="ml-2 h-3.5 w-3.5" /></Link></Button>
          } />
          <div className="mt-7 overflow-hidden rounded-2xl border border-slate-200 bg-slate-950 shadow-[0_16px_50px_rgba(15,23,42,.12)]">
            <MapView className="h-[440px] w-full rounded-none border-0 sm:h-[540px]" showFilterChips showLegend showFullscreenControl showScaleControl showZoomControls>
              <MapUnifiedDisasterLayer geoJson={geoJson} disasters={disasters} selectedDisaster={selectedDisaster} onSelectDisaster={setSelectedDisaster} visible />
            </MapView>
          </div>
        </section>

        <section>
          <SectionIntro kicker="Latest intelligence" title="Events requiring attention" description="A concise view of the highest-priority verified and calculated signals." action={
            <Button variant="ghost" size="sm" asChild><Link href="/map">View all events <ArrowRight className="ml-2 h-3.5 w-3.5" /></Link></Button>
          } />
          <div className="mt-7 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {eventCards.map((event) => <DisasterCard key={event.id} data={event} />)}
          </div>
        </section>

        <section className="grid gap-10 border-y border-slate-200 py-12 lg:grid-cols-[.8fr_1.2fr] lg:py-16">
          <div>
            <p className="section-kicker">Built for trust</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-[-0.035em] text-slate-950 sm:text-4xl">Clear sources.<br />No black box.</h2>
            <p className="mt-5 max-w-md text-sm leading-7 text-slate-600">Every signal keeps its provenance visible, and every calculated score exposes the factors that shaped it.</p>
          </div>
          <div className="grid gap-8 sm:grid-cols-3">
            <TrustPoint icon={Database} title="Multi-source" text="USGS, NASA EONET, Open-Meteo and Indian statutory feeds." />
            <TrustPoint icon={ShieldCheck} title="Explainable" text="Deterministic factors, thresholds and missing inputs are disclosed." />
            <TrustPoint icon={BellRing} title="Actionable" text="Guidance connects monitoring signals to practical next steps." />
          </div>
        </section>

        <section className="overflow-hidden rounded-2xl bg-teal-700 px-7 py-10 text-white sm:px-12 sm:py-12">
          <div className="flex flex-col gap-7 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-teal-200">Stay prepared</p>
              <h2 className="mt-2 text-3xl font-semibold tracking-[-0.03em]">Make your local risk visible.</h2>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-teal-50/80">Save a location, follow regional alerts and keep the right preparedness guidance close at hand.</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button size="lg" asChild className="bg-white text-slate-950 hover:bg-slate-100"><Link href={isAuthenticated ? "/dashboard" : "/signup"}>{isAuthenticated ? "Open dashboard" : "Create free account"}</Link></Button>
              <Button size="lg" asChild className="border border-white/20 bg-transparent text-white shadow-none hover:bg-white/10"><Link href="/about">How it works</Link></Button>
            </div>
          </div>
        </section>
      </RouteContainer>
    </div>
  );
}

function HeroMetric({ label, value, suffix, compact = false }: { label: string; value: React.ReactNode; suffix?: string; compact?: boolean }) {
  return <div className="bg-slate-950/55 p-5"><p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">{label}</p><p className={`mt-2 font-semibold text-white ${compact ? "text-lg" : "text-3xl tracking-[-0.04em]"}`}>{value}<span className="ml-1 text-sm font-normal text-slate-500">{suffix}</span></p></div>;
}

function SignalRow({ label, value }: { label: string; value: string }) {
  return <div className="flex items-center justify-between gap-5"><span className="text-slate-500">{label}</span><span className="truncate font-medium text-slate-200">{value}</span></div>;
}

function SectionIntro({ kicker, title, description, action }: { kicker: string; title: string; description: string; action?: React.ReactNode }) {
  return <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between"><div><p className="section-kicker">{kicker}</p><h2 className="mt-2 text-3xl font-semibold tracking-[-0.035em] text-slate-950 sm:text-4xl">{title}</h2><p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">{description}</p></div>{action}</div>;
}

function TrustPoint({ icon: Icon, title, text }: { icon: React.ComponentType<{ className?: string }>; title: string; text: string }) {
  return <div><span className="flex h-10 w-10 items-center justify-center rounded-lg bg-teal-50 text-teal-700"><Icon className="h-5 w-5" /></span><h3 className="mt-4 font-semibold text-slate-950">{title}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{text}</p><div className="mt-4 flex items-center gap-2 text-xs font-medium text-teal-700"><Check className="h-3.5 w-3.5" /> Visible by design</div></div>;
}

function toGuideSlug(type: string) {
  if (type.includes("flood")) return "flood";
  if (type.includes("cyclone") || type.includes("storm") || type.includes("wind")) return "cyclone";
  if (type.includes("landslide")) return "landslide";
  if (type.includes("heat") || type.includes("cold")) return "heat-wave";
  if (type.includes("chemical")) return "chemical-leak";
  return "earthquake";
}

export default function HomePage() {
  return <LocationProvider><HomePageContent /></LocationProvider>;
}
