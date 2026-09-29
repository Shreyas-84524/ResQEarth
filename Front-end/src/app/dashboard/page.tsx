"use client";

import * as React from "react";
import { RouteContainer } from "@/components/layout/route-container";
import { PageHeader } from "@/components/ui/page-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ProtectedRoute, useAuth } from "@/features/auth";
import { LocationProvider, LocationStatusCard } from "@/features/map";
import { WeatherOverviewCard, useWeather } from "@/features/weather";
import {
  EarthquakeOverviewCard,
  useEarthquakes,
  GlobalDisasterOverviewCard,
  useGlobalDisasters,
} from "@/features/disasters";
import { ShieldCheck, CloudSun, Activity, Globe2, ShieldAlert, Sparkles } from "lucide-react";

function CitizenDashboardContent() {
  const { user, profile } = useAuth();
  const { weather, isLoading: isWeatherLoading, error: weatherError, refresh: refreshWeather } = useWeather();
  const {
    earthquakes,
    strongestRecent,
    nearbyEarthquakes,
    isLoading: isEarthquakesLoading,
    error: earthquakesError,
    refresh: refreshEarthquakes,
  } = useEarthquakes();
  const {
    disasters: globalDisasters,
    mostSevereDisaster,
    nearbyDisasters: nearbyGlobalDisasters,
    isLoading: isGlobalLoading,
    error: globalError,
    refresh: refreshGlobalDisasters,
  } = useGlobalDisasters();

  const userName = profile?.name || user?.email?.split("@")[0] || "Citizen";

  return (
    <RouteContainer className="space-y-6 pb-12">
      {/* 1. Header with Role Clearance and Live Telemetry Badges */}
      <PageHeader
        title={`Welcome, ${userName}`}
        description="Location-aware disaster surveillance, ambient environmental monitoring, and explainable risk intelligence."
        badge={
          <div className="flex items-center gap-1.5 flex-wrap">
            <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
              <ShieldCheck className="h-3 w-3 mr-1" />
              Verified Citizen
            </Badge>
            <Badge variant="secondary" className="font-mono text-[10px]">
              Active Session
            </Badge>
          </div>
        }
      />

      {/* 2. Real-Time Geolocation Telemetry */}
      <LocationStatusCard />

      {/* 3. Live Environmental Surveillance Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-start">
        {/* Live Weather Overview Card */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-muted-foreground px-1">
            <span className="font-semibold uppercase tracking-wider text-[11px] flex items-center gap-1.5">
              <CloudSun className="h-3.5 w-3.5 text-primary" />
              Ambient Weather Feed
            </span>
            <span className="font-mono text-[11px]">Open-Meteo API</span>
          </div>
          <WeatherOverviewCard
            data={weather}
            isLoading={isWeatherLoading}
            error={weatherError}
            onRefresh={refreshWeather}
          />
        </div>

        {/* Live USGS Earthquake Overview Card */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-muted-foreground px-1">
            <span className="font-semibold uppercase tracking-wider text-[11px] flex items-center gap-1.5">
              <Activity className="h-3.5 w-3.5 text-destructive" />
              Seismic Surveillance
            </span>
            <span className="font-mono text-[11px]">USGS Real-Time</span>
          </div>
          <EarthquakeOverviewCard
            earthquakes={earthquakes}
            isLoading={isEarthquakesLoading}
            error={earthquakesError}
            onRefresh={refreshEarthquakes}
            strongestRecent={strongestRecent}
            nearestEvent={nearbyEarthquakes[0]}
          />
        </div>

        {/* Live NASA EONET Global Natural Hazards Card */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-muted-foreground px-1">
            <span className="font-semibold uppercase tracking-wider text-[11px] flex items-center gap-1.5">
              <Globe2 className="h-3.5 w-3.5 text-blue-500" />
              Global Natural Hazards
            </span>
            <span className="font-mono text-[11px]">NASA EONET v3</span>
          </div>
          <GlobalDisasterOverviewCard
            disasters={globalDisasters}
            isLoading={isGlobalLoading}
            error={globalError}
            onRefresh={refreshGlobalDisasters}
            mostSevereDisaster={mostSevereDisaster}
            nearestDisaster={nearbyGlobalDisasters[0]}
          />
        </div>
      </div>

      {/* 4. Risk Intelligence Engine Telemetry & Pipeline Overview */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-muted-foreground px-1">
          <span className="font-semibold uppercase tracking-wider text-[11px] flex items-center gap-1.5">
            <ShieldAlert className="h-3.5 w-3.5 text-amber-500" />
            Local Hazard Readiness & Deterministic Engine
          </span>
          <span className="font-mono text-[11px]">ResQEarth v1.0</span>
        </div>

        <Card className="border-border/80">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold flex items-center justify-between">
              <span>Deterministic Risk Engine</span>
              <Badge variant="outline" className="text-[10px] text-primary border-primary/30">
                <Sparkles className="h-3 w-3 mr-1" />
                Multi-Node Feeds
              </Badge>
            </CardTitle>
            <CardDescription className="text-xs">
              Calculates explainable risk scores combining live precipitation, wind gusts, river discharge, seismic shocks, and global natural hazards.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-muted-foreground">
            <div className="rounded-lg bg-muted/40 p-3 space-y-1.5 border border-border/40">
              <div className="flex items-center justify-between font-medium text-foreground">
                <span>Weather Telemetry</span>
                <Badge variant="secondary" className="text-[10px] text-emerald-600 dark:text-emerald-400">
                  Connected (Open-Meteo)
                </Badge>
              </div>
              <p className="text-[11px]">
                Precipitation ({weather ? `${weather.precipitation} mm` : "Active"}), Humidity ({weather ? `${weather.humidity}%` : "Active"}), and Wind ({weather ? `${Math.round(weather.windSpeed)} km/h` : "Active"}).
              </p>
            </div>

            <div className="rounded-lg bg-muted/40 p-3 space-y-1.5 border border-border/40">
              <div className="flex items-center justify-between font-medium text-foreground">
                <span>Seismic Surveillance</span>
                <Badge variant="secondary" className="text-[10px] text-emerald-600 dark:text-emerald-400">
                  Connected (USGS)
                </Badge>
              </div>
              <p className="text-[11px]">
                {earthquakes.length > 0
                  ? `${earthquakes.length} events in 24h feed. Nearest: ${nearbyEarthquakes[0]?.distanceKm?.toLocaleString() ?? "N/A"} km (${nearbyEarthquakes[0]?.place ?? "N/A"}).`
                  : "Monitoring global & regional tectonic plates in real time."}
              </p>
            </div>

            <div className="rounded-lg bg-muted/40 p-3 space-y-1.5 border border-border/40">
              <div className="flex items-center justify-between font-medium text-foreground">
                <span>Global Event Feeds</span>
                <Badge variant="secondary" className="text-[10px] text-emerald-600 dark:text-emerald-400">
                  Connected (NASA EONET)
                </Badge>
              </div>
              <p className="text-[11px]">
                {globalDisasters.length > 0
                  ? `${globalDisasters.length} natural hazard events active worldwide. Nearest: ${nearbyGlobalDisasters[0]?.distanceKm?.toLocaleString() ?? "N/A"} km (${nearbyGlobalDisasters[0]?.title ?? "N/A"}).`
                  : "Monitoring wildfires, severe storms, volcanoes, and floods."}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </RouteContainer>
  );
}

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <LocationProvider>
        <CitizenDashboardContent />
      </LocationProvider>
    </ProtectedRoute>
  );
}
