"use client";

import * as React from "react";
import { RouteContainer } from "@/components/layout/route-container";
import { PageHeader } from "@/components/ui/page-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ProtectedRoute, useAuth } from "@/features/auth";
import { LocationProvider, LocationStatusCard } from "@/features/map";
import { WeatherOverviewCard, useWeather } from "@/features/weather";
import { ShieldCheck, CloudSun, ShieldAlert, Sparkles } from "lucide-react";

function CitizenDashboardContent() {
  const { user, profile } = useAuth();
  const { weather, isLoading: isWeatherLoading, error: weatherError, refresh: refreshWeather } = useWeather();

  const userName = profile?.name || user?.email?.split("@")[0] || "Citizen";

  return (
    <RouteContainer className="space-y-6 pb-12">
      {/* 1. Header with Role Clearance and Live Telemetry Badges */}
      <PageHeader
        title={`Welcome, ${userName}`}
        description="Location-aware disaster surveillance, ambient environmental monitoring, and explainable risk intelligence."
        badge={
          <div className="flex items-center gap-1.5">
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
              Ambient Weather Telemetry
            </span>
            <span className="font-mono text-[11px]">Open-Meteo Live API</span>
          </div>
          <WeatherOverviewCard
            data={weather}
            isLoading={isWeatherLoading}
            error={weatherError}
            onRefresh={refreshWeather}
          />
        </div>

        {/* Risk Intelligence Preparation Card */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-muted-foreground px-1">
            <span className="font-semibold uppercase tracking-wider text-[11px] flex items-center gap-1.5">
              <ShieldAlert className="h-3.5 w-3.5 text-amber-500" />
              Local Disaster Risk Evaluation
            </span>
            <span className="font-mono text-[11px]">ResQEarth v1.0</span>
          </div>

          <Card className="border-border/80">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold flex items-center justify-between">
                <span>Deterministic Risk Engine</span>
                <Badge variant="outline" className="text-[10px] text-primary border-primary/30">
                  <Sparkles className="h-3 w-3 mr-1" />
                  Live Inputs
                </Badge>
              </CardTitle>
              <CardDescription className="text-xs">
                Calculates explainable risk scores based on live precipitation, wind gusts, river discharge, and nearby seismic activity.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-xs text-muted-foreground">
              <div className="rounded-lg bg-muted/40 p-3 space-y-1.5 border border-border/40">
                <div className="flex items-center justify-between font-medium text-foreground">
                  <span>Current Weather Integration</span>
                  <Badge variant="secondary" className="text-[10px] text-emerald-600 dark:text-emerald-400">
                    Connected
                  </Badge>
                </div>
                <p className="text-[11px]">
                  Precipitation ({weather ? `${weather.precipitation} mm` : "Monitoring"}), Humidity ({weather ? `${weather.humidity}%` : "Monitoring"}), and Wind ({weather ? `${Math.round(weather.windSpeed)} km/h` : "Monitoring"}) fed into local hazard indices.
                </p>
              </div>

              <div className="rounded-lg bg-muted/40 p-3 space-y-1.5 border border-border/40">
                <div className="flex items-center justify-between font-medium text-foreground">
                  <span>Upcoming Multi-Provider Pipelines</span>
                  <Badge variant="outline" className="text-[10px]">
                    Phase 2.4 - 2.8
                  </Badge>
                </div>
                <p className="text-[11px]">
                  USGS Earthquakes, GloFAS river discharge, and NDMA official advisories will be unified in subsequent phases.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
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
