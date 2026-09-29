"use client";

import * as React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ShieldCheck,
  Lock,
  Sliders,
  BarChart3,
  CheckCircle2,
} from "lucide-react";
import {
  getStoredCookiePreferences,
  saveCookiePreferences,
  acceptAllCookies,
  acceptEssentialOnly,
} from "../services/cookie-consent-service";
import type { CookieConsentPreferences } from "../types";

export function CookiePreferenceCenter() {
  const [preferences, setPreferences] = React.useState<CookieConsentPreferences>(
    getStoredCookiePreferences
  );
  const [savedMessage, setSavedMessage] = React.useState<string | null>(null);

  React.useEffect(() => {
    setPreferences(getStoredCookiePreferences());
  }, []);

  const handleSave = () => {
    const updated = saveCookiePreferences(preferences);
    setPreferences(updated);
    setSavedMessage("Your privacy & storage preferences have been updated successfully.");
    setTimeout(() => setSavedMessage(null), 4000);
  };

  const handleAcceptAll = () => {
    const updated = acceptAllCookies();
    setPreferences(updated);
    setSavedMessage("All optional functional and performance cookies accepted.");
    setTimeout(() => setSavedMessage(null), 4000);
  };

  const handleEssentialOnly = () => {
    const updated = acceptEssentialOnly();
    setPreferences(updated);
    setSavedMessage("Only strictly essential session cookies enabled.");
    setTimeout(() => setSavedMessage(null), 4000);
  };

  return (
    <div className="space-y-6">
      {/* Current Status Callout */}
      <div className="rounded-xl border bg-muted/30 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2 font-bold text-sm text-foreground">
            <ShieldCheck className="h-4 w-4 text-emerald-600" />
            <span>Consent Status: {preferences.hasConsented ? "Configured" : "Default Settings"}</span>
          </div>
          <p className="text-xs text-muted-foreground">
            {preferences.hasConsented
              ? `Last updated: ${new Date(preferences.updatedAt).toLocaleDateString()} at ${new Date(preferences.updatedAt).toLocaleTimeString()}`
              : "You are currently browsing with default privacy preferences."}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" onClick={handleEssentialOnly} className="text-xs h-8">
            Essential Only
          </Button>
          <Button size="sm" variant="default" onClick={handleAcceptAll} className="text-xs h-8">
            Accept All
          </Button>
        </div>
      </div>

      {savedMessage && (
        <div className="p-3 rounded-lg bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-xs flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>{savedMessage}</span>
        </div>
      )}

      {/* Category Toggles */}
      <div className="space-y-4">
        {/* 1. Essential Storage */}
        <Card className="border-primary/20">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Lock className="h-4 w-4" />
                </div>
                <div>
                  <CardTitle className="text-sm font-bold">Strictly Essential Storage &amp; Auth Tokens</CardTitle>
                  <span className="text-[11px] text-muted-foreground">Required for platform security and operation</span>
                </div>
              </div>
              <Badge variant="secondary" className="text-[10px] font-semibold">
                Always Active
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground leading-relaxed">
            Essential for user authentication (Firebase Auth session tokens), CSRF attack prevention, and security role routing. These cookies cannot be turned off as the platform cannot function without them.
          </CardContent>
        </Card>

        {/* 2. Functional & Preference Storage */}
        <Card className="hover:border-primary/40 transition-colors">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400">
                  <Sliders className="h-4 w-4" />
                </div>
                <div>
                  <CardTitle className="text-sm font-bold">Functional &amp; UI Preference Storage</CardTitle>
                  <span className="text-[11px] text-muted-foreground">Remembers your user interface preferences</span>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={preferences.functional}
                  onChange={(e) =>
                    setPreferences((prev) => ({ ...prev, functional: e.target.checked }))
                  }
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground leading-relaxed">
            Stores theme mode (dark/light), GIS map layer toggles (weather, earthquakes, official alerts), and local emergency grab-bag checklist completion state across browser reloads.
          </CardContent>
        </Card>

        {/* 3. Analytics & Telemetry */}
        <Card className="hover:border-primary/40 transition-colors">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-50 text-purple-600 dark:bg-purple-950 dark:text-purple-400">
                  <BarChart3 className="h-4 w-4" />
                </div>
                <div>
                  <CardTitle className="text-sm font-bold">Anonymous Telemetry &amp; Alert Latency</CardTitle>
                  <span className="text-[11px] text-muted-foreground">Monitors platform reliability and alert delivery speeds</span>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={preferences.analytics}
                  onChange={(e) =>
                    setPreferences((prev) => ({ ...prev, analytics: e.target.checked }))
                  }
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground leading-relaxed">
            Collects aggregated, non-personally identifiable metrics on GIS rendering FPS and emergency push notification arrival latency to identify infrastructure bottlenecks.
          </CardContent>
        </Card>
      </div>

      {/* Save Button */}
      <div className="flex items-center justify-end gap-3 pt-2">
        <Button onClick={handleSave} className="text-xs h-9 font-semibold">
          Save Privacy Preferences
        </Button>
      </div>
    </div>
  );
}
