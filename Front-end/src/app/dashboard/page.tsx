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
  UnifiedDisasterOverviewCard,
  useUnifiedDisasters,
} from "@/features/disasters";
import { ShieldCheck, CloudSun, ShieldAlert, Sparkles, Radio } from "lucide-react";

function CitizenDashboardContent() {
  const { user, profile } = useAuth();
  const { weather, isLoading: isWeatherLoading, error: weatherError, refresh: refreshWeather } = useWeather();
  const {
    disasters: unifiedDisasters,
    mostSevereDisaster,
    officialCount,
    criticalCount,
    nearbyDisasters,
    isLoading: isUnifiedLoading,
    error: unifiedError,
    refresh: refreshUnified,
  } = useUnifiedDisasters();

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
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
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

        {/* Live Multi-Hazard Unified Surveillance Card */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-muted-foreground px-1">
            <span className="font-semibold uppercase tracking-wider text-[11px] flex items-center gap-1.5">
              <Radio className="h-3.5 w-3.5 text-destructive animate-pulse" />
              Multi-Hazard Intelligence Layer
            </span>
            <span className="font-mono text-[11px]">USGS • NASA • NDMA • IMD</span>
          </div>
          <UnifiedDisasterOverviewCard
            disasters={unifiedDisasters}
            isLoading={isUnifiedLoading}
            error={unifiedError}
            onRefresh={refreshUnified}
            mostSevereDisaster={mostSevereDisaster}
            officialCount={officialCount}
            criticalCount={criticalCount}
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
                <span>Multi-Hazard Surveillance</span>
                <Badge variant="secondary" className="text-[10px] text-emerald-600 dark:text-emerald-400">
                  {unifiedDisasters.length} Active Feeds
                </Badge>
              </div>
              <p className="text-[11px]">
                {unifiedDisasters.length > 0
                  ? `Nearest hazard: ${nearbyDisasters[0]?.distanceKm?.toLocaleString() ?? "N/A"} km (${nearbyDisasters[0]?.title ?? "N/A"}).`
                  : "Monitoring earthquakes, cyclones, wildfires, and floods worldwide."}
              </p>
            </div>

            <div className="rounded-lg bg-muted/40 p-3 space-y-1.5 border border-border/40">
              <div className="flex items-center justify-between font-medium text-foreground">
                <span>Statutory Alerts</span>
                <Badge variant={officialCount > 0 ? "destructive" : "secondary"} className="text-[10px]">
                  {officialCount > 0 ? `${officialCount} NDMA / IMD Active` : "Clear"}
                </Badge>
              </div>
              <p className="text-[11px]">
                {officialCount > 0
                  ? `${officialCount} official government advisories currently active across Indian disaster management zones.`
                  : "Statutory CAP feed surveillance active via NDMA SACHET & IMD."}
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
