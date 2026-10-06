"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { SeverityBadge } from "@/components/ui/severity-badge";
import type { RiskLevel } from "@/types";
import type { TargetMode, CreateAlertInput } from "@/features/alerts";
import {
  calculateTargetingEstimate,
  MOCK_RECIPIENT_USERS,
} from "@/features/alerts/services/targeting-service";
import {
  AlertTriangle,
  Send,
  Users,
  Bell,
  MessageSquare,
  Globe,
  MapPin,
  CheckCircle2,
  ShieldAlert,
  Radio,
} from "lucide-react";

interface CreateWarningDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (
    alertData: CreateAlertInput,
    channels: { inSite: boolean; fcm: boolean; sms: boolean },
    isSimulation: boolean
  ) => Promise<void>;
  defaultLatitude?: number;
  defaultLongitude?: number;
}

export function CreateWarningDialog({
  isOpen,
  onClose,
  onSubmit,
  defaultLatitude = 19.076,
  defaultLongitude = 72.8777,
}: CreateWarningDialogProps) {
  const [disasterType, setDisasterType] = React.useState("flood");
  const [severity, setSeverity] = React.useState<RiskLevel>("HIGH");
  const [title, setTitle] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [instructionsText, setInstructionsText] = React.useState(
    "1. Move immediately to higher ground.\n2. Avoid walking or driving through floodwaters.\n3. Disconnect electrical equipment."
  );
  const [targetMode, setTargetMode] = React.useState<TargetMode>("radius");
  const [regionName, setRegionName] = React.useState("Mumbai Metropolitan Region");
  const [cityName, setCityName] = React.useState("Mumbai");
  const [stateName, setStateName] = React.useState("Maharashtra");
  const [latitude, setLatitude] = React.useState(defaultLatitude);
  const [longitude, setLongitude] = React.useState(defaultLongitude);
  const [radiusKm, setRadiusKm] = React.useState(35);
  const [expiryHours, setExpiryHours] = React.useState(12);

  // Simulation / Demo Mode (default: true for safety and academic presentations)
  const [isSimulation, setIsSimulation] = React.useState(true);

  // Channels
  const [channelInSite, setChannelInSite] = React.useState(true);
  const [channelFcm, setChannelFcm] = React.useState(true);
  const [channelSms, setChannelSms] = React.useState(true);

  // Confirmation step
  const [isConfirming, setIsConfirming] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [formError, setFormError] = React.useState<string | null>(null);

  // Live targeting estimate
  const targetingEstimate = React.useMemo(() => {
    return calculateTargetingEstimate(MOCK_RECIPIENT_USERS, {
      targetMode,
      regionName,
      cityName,
      stateName,
      latitude,
      longitude,
      radiusKm,
    });
  }, [targetMode, regionName, cityName, stateName, latitude, longitude, radiusKm]);

  // Set default title when type or region changes
  React.useEffect(() => {
    const typeCapitalized = disasterType.charAt(0).toUpperCase() + disasterType.slice(1);
    const prefix = isSimulation ? "Simulated Emergency Warning:" : "Emergency Warning:";
    setTitle(`${prefix} Elevated ${typeCapitalized} Alert in ${regionName || cityName || "Target Region"}`);
  }, [disasterType, regionName, cityName, isSimulation]);

  // Quick coordinate presets
  const applyPreset = (presetLat: number, presetLon: number, presetName: string, presetRadius: number) => {
    setLatitude(presetLat);
    setLongitude(presetLon);
    setRegionName(presetName);
    setRadiusKm(presetRadius);
    setTargetMode("radius");
  };

  const handleReviewClick = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!title.trim()) {
      setFormError("Alert title is required.");
      return;
    }
    if (!description.trim()) {
      setFormError("Alert description is required.");
      return;
    }
    if (!channelInSite && !channelFcm && !channelSms) {
      setFormError("Please select at least one delivery channel.");
      return;
    }

    setIsConfirming(true);
  };

  const handleFinalSubmit = async () => {
    setIsSubmitting(true);
    setFormError(null);

    try {
      const instructions = instructionsText
        .split("\n")
        .map((s) => s.replace(/^\d+\.\s*/, "").trim())
        .filter(Boolean);

      const expiresAt = new Date(Date.now() + expiryHours * 60 * 60 * 1000).toISOString();

      const alertInput: CreateAlertInput = {
        title: title.trim(),
        description: description.trim(),
        disasterType,
        severity,
        source: isSimulation
          ? "ResQEarth Academic Simulation"
          : "ResQEarth Emergency Operations Center",
        sourceType: "manual-admin",
        isOfficialAlert: false, // Strict invariant: manual warnings are NOT statutory government decrees
        region: regionName || cityName || stateName || "Target Zone",
        latitude: targetMode === "radius" ? latitude : undefined,
        longitude: targetMode === "radius" ? longitude : undefined,
        radiusKm: targetMode === "radius" ? radiusKm : undefined,
        targetMode,
        instructions,
        expiresAt,
        status: "active",
        metadata: {
          isSimulation,
          channels: { inSite: channelInSite, fcm: channelFcm, sms: channelSms },
          targetingPreview: targetingEstimate,
        },
      };

      await onSubmit(
        alertInput,
        { inSite: channelInSite, fcm: channelFcm, sms: channelSms },
        isSimulation
      );
      setIsConfirming(false);
      onClose();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to dispatch emergency warning";
      setFormError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg font-bold text-foreground">
            <Radio className="h-5 w-5 text-red-500 animate-pulse" />
            Admin Regional Emergency Warning & SMS Control
          </DialogTitle>
        </DialogHeader>

        {formError && (
          <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-xs flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            <span>{formError}</span>
          </div>
        )}

        {!isConfirming ? (
          <form onSubmit={handleReviewClick} className="space-y-4 pt-2">
            {/* Simulation / Demo Mode Toggle */}
            <div className="p-3 rounded-xl border border-amber-500/40 bg-amber-500/10 flex items-center justify-between">
              <div className="space-y-0.5 pr-2">
                <div className="flex items-center gap-2">
                  <ShieldAlert className="h-4 w-4 text-amber-500" />
                  <span className="text-xs font-bold text-amber-500 uppercase tracking-wider">
                    SIMULATION / DEMO ALERT
                  </span>
                  <Badge variant="outline" className="text-[10px] bg-amber-500/20 border-amber-500/40 text-amber-600 dark:text-amber-300">
                    {isSimulation ? "ACTIVE (SAFE)" : "LIVE BROADCAST"}
                  </Badge>
                </div>
                <p className="text-[11px] text-muted-foreground">
                  {isSimulation
                    ? "Academic demonstration mode: alerts are badged as simulations and distinct from official NDMA/IMD decrees."
                    : "Live Emergency Broadcast: alert will be sent to registered citizens within target zone."}
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer shrink-0">
                <input
                  type="checkbox"
                  checked={isSimulation}
                  onChange={(e) => setIsSimulation(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
              </label>
            </div>

            {/* Disaster Type & Severity */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs font-semibold">Disaster Category</Label>
                <Select
                  value={disasterType}
                  onChange={(e) => setDisasterType(e.target.value)}
                  className="mt-1"
                >
                  <option value="flood">Flood / Flash Flood</option>
                  <option value="urban-flood">Urban Inundation</option>
                  <option value="cyclone">Cyclone / Severe Storm</option>
                  <option value="earthquake">Earthquake</option>
                  <option value="landslide">Landslide / Mudflow</option>
                  <option value="tsunami">Tsunami Warning</option>
                  <option value="heat-wave">Severe Heatwave</option>
                  <option value="cold-wave">Cold Wave</option>
                  <option value="forest-fire">Forest Fire / Wildfire</option>
                  <option value="chemical-leak">Industrial / Chemical Leak</option>
                </Select>
              </div>

              <div>
                <Label className="text-xs font-semibold">Severity Tier</Label>
                <Select
                  value={severity}
                  onChange={(e) => setSeverity(e.target.value as RiskLevel)}
                  className="mt-1"
                >
                  <option value="CRITICAL">CRITICAL (Red Alert - Life Threat)</option>
                  <option value="HIGH">HIGH (Orange Alert - Severe Threat)</option>
                  <option value="MODERATE">MODERATE (Yellow Alert - Advisory)</option>
                  <option value="LOW">LOW (Green Alert - Informational)</option>
                </Select>
              </div>
            </div>

            {/* Title */}
            <div>
              <Label className="text-xs font-semibold">Warning Title / Headline</Label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Flash Flood Emergency in Low-Lying Coastal Areas"
                className="mt-1"
              />
            </div>

            {/* Emergency Message / Description */}
            <div>
              <Label className="text-xs font-semibold">Emergency Description / Situation Report</Label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe current environmental hazard, expected time of impact, and critical localized details..."
                rows={2}
                className="mt-1 text-xs"
              />
            </div>

            {/* Safety Instructions */}
            <div>
              <Label className="text-xs font-semibold">
                Phased SOP & Precautions (One per line)
              </Label>
              <Textarea
                value={instructionsText}
                onChange={(e) => setInstructionsText(e.target.value)}
                rows={3}
                className="mt-1 font-mono text-xs"
              />
            </div>

            {/* Targeting Mode */}
            <div className="p-3 rounded-xl bg-muted/40 border border-border/60 space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5 text-primary" />
                  Target Geography & Population
                </Label>
                <Badge variant="outline" className="text-[11px] capitalize">
                  {targetMode} Mode
                </Badge>
              </div>

              {/* Quick Presets for Demo */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                <span className="text-[11px] text-muted-foreground py-0.5">Quick Presets:</span>
                <button
                  type="button"
                  onClick={() => applyPreset(19.076, 72.8777, "Mumbai Metropolitan Region", 35)}
                  className="text-[11px] px-2 py-0.5 rounded-full bg-primary/10 hover:bg-primary/20 text-primary transition-colors"
                >
                  Mumbai (35km)
                </button>
                <button
                  type="button"
                  onClick={() => applyPreset(18.5204, 73.8567, "Pune Urban District", 25)}
                  className="text-[11px] px-2 py-0.5 rounded-full bg-primary/10 hover:bg-primary/20 text-primary transition-colors"
                >
                  Pune (25km)
                </button>
                <button
                  type="button"
                  onClick={() => applyPreset(19.2183, 72.9781, "Thane-Kalyan Belt", 20)}
                  className="text-[11px] px-2 py-0.5 rounded-full bg-primary/10 hover:bg-primary/20 text-primary transition-colors"
                >
                  Thane (20km)
                </button>
              </div>

              <Select
                value={targetMode}
                onChange={(e) => setTargetMode(e.target.value as TargetMode)}
              >
                <option value="radius">Geographic Radius around Center Coordinates (Recommended for Demo)</option>
                <option value="city">Specific City</option>
                <option value="state">Specific State</option>
                <option value="region">General Region Query</option>
                <option value="all">Platform-Wide (All Registered Users)</option>
              </Select>

              {targetMode === "radius" && (
                <div className="space-y-2">
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <Label className="text-[11px] text-muted-foreground">Latitude</Label>
                      <Input
                        type="number"
                        step="0.0001"
                        value={latitude}
                        onChange={(e) => setLatitude(parseFloat(e.target.value) || 0)}
                        className="mt-0.5 text-xs"
                      />
                    </div>
                    <div>
                      <Label className="text-[11px] text-muted-foreground">Longitude</Label>
                      <Input
                        type="number"
                        step="0.0001"
                        value={longitude}
                        onChange={(e) => setLongitude(parseFloat(e.target.value) || 0)}
                        className="mt-0.5 text-xs"
                      />
                    </div>
                    <div>
                      <Label className="text-[11px] text-muted-foreground">Radius (km): {radiusKm} km</Label>
                      <Input
                        type="number"
                        min="1"
                        max="500"
                        value={radiusKm}
                        onChange={(e) => setRadiusKm(parseInt(e.target.value, 10) || 25)}
                        className="mt-0.5 text-xs"
                      />
                    </div>
                  </div>
                  <div>
                    <Label className="text-[11px] text-muted-foreground">Target Region Label</Label>
                    <Input
                      value={regionName}
                      onChange={(e) => setRegionName(e.target.value)}
                      placeholder="e.g., Mumbai Coastal District"
                      className="mt-0.5 text-xs"
                    />
                  </div>
                </div>
              )}

              {targetMode === "city" && (
                <div>
                  <Label className="text-[11px] text-muted-foreground">City Name</Label>
                  <Input
                    value={cityName}
                    onChange={(e) => setCityName(e.target.value)}
                    placeholder="e.g., Mumbai, Pune, Thane"
                    className="mt-0.5 text-xs"
                  />
                </div>
              )}

              {targetMode === "state" && (
                <div>
                  <Label className="text-[11px] text-muted-foreground">State Name</Label>
                  <Input
                    value={stateName}
                    onChange={(e) => setStateName(e.target.value)}
                    placeholder="e.g., Maharashtra, Gujarat"
                    className="mt-0.5 text-xs"
                  />
                </div>
              )}

              {targetMode === "region" && (
                <div>
                  <Label className="text-[11px] text-muted-foreground">Region Description</Label>
                  <Input
                    value={regionName}
                    onChange={(e) => setRegionName(e.target.value)}
                    placeholder="e.g., Konkan Coastal Belt"
                    className="mt-0.5 text-xs"
                  />
                </div>
              )}

              {/* Live Privacy-Preserving Recipient Breakdown Preview */}
              <div className="p-3 rounded-xl bg-card border border-border/60 space-y-2 text-xs">
                <div className="flex items-center justify-between font-medium">
                  <span className="flex items-center gap-1.5 text-foreground">
                    <Users className="h-4 w-4 text-primary" />
                    Target Population Matching
                  </span>
                  <Badge variant="outline" className="text-[10px] font-mono">
                    {targetingEstimate.summaryDescription}
                  </Badge>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 border-t border-border/40 text-[11px]">
                  <div className="p-2 rounded-lg bg-muted/40 border border-border/30">
                    <span className="text-muted-foreground block text-[10px]">Affected Users</span>
                    <span className="font-bold text-foreground text-base">{targetingEstimate.totalMatchedUsers}</span>
                  </div>
                  <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                    <span className="block text-[10px] font-medium">SMS Eligible</span>
                    <span className="font-bold text-base">{targetingEstimate.smsEligibleCount}</span>
                  </div>
                  <div className="p-2 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                    <span className="block text-[10px] font-medium">No SMS Consent</span>
                    <span className="font-bold text-base">{Math.max(0, targetingEstimate.totalMatchedUsers - targetingEstimate.smsEligibleCount)}</span>
                  </div>
                  <div className="p-2 rounded-lg bg-muted/40 border border-border/30">
                    <span className="text-muted-foreground block text-[10px]">No Valid Location</span>
                    <span className="font-bold text-foreground text-base">{targetingEstimate.missingLocationCount + targetingEstimate.invalidLocationCount}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Delivery Channels */}
            <div className="space-y-2">
              <Label className="text-xs font-semibold">Dispatch Channels</Label>
              <div className="grid grid-cols-3 gap-2">
                <label className="flex items-center gap-2 p-2 rounded-lg border border-border/60 bg-card/40 cursor-pointer text-xs hover:border-primary/50 transition-colors">
                  <input
                    type="checkbox"
                    checked={channelInSite}
                    onChange={(e) => setChannelInSite(e.target.checked)}
                    className="rounded text-primary"
                  />
                  <Globe className="h-3.5 w-3.5 text-primary" />
                  <span>In-Site Banner</span>
                </label>
                <label className="flex items-center gap-2 p-2 rounded-lg border border-border/60 bg-card/40 cursor-pointer text-xs hover:border-purple-400/50 transition-colors">
                  <input
                    type="checkbox"
                    checked={channelFcm}
                    onChange={(e) => setChannelFcm(e.target.checked)}
                    className="rounded text-primary"
                  />
                  <Bell className="h-3.5 w-3.5 text-purple-400" />
                  <span>Web Push (FCM)</span>
                </label>
                <label className="flex items-center gap-2 p-2 rounded-lg border border-border/60 bg-card/40 cursor-pointer text-xs hover:border-emerald-400/50 transition-colors">
                  <input
                    type="checkbox"
                    checked={channelSms}
                    onChange={(e) => setChannelSms(e.target.checked)}
                    className="rounded text-primary"
                  />
                  <MessageSquare className="h-3.5 w-3.5 text-emerald-400" />
                  <span>Emergency SMS</span>
                </label>
              </div>
            </div>

            {/* Expiry Hours */}
            <div>
              <Label className="text-xs font-semibold">Alert Validity Window</Label>
              <Select
                value={expiryHours.toString()}
                onChange={(e) => setExpiryHours(parseInt(e.target.value, 10))}
                className="mt-1"
              >
                <option value="3">3 Hours</option>
                <option value="6">6 Hours</option>
                <option value="12">12 Hours</option>
                <option value="24">24 Hours</option>
                <option value="48">48 Hours</option>
                <option value="72">3 Days</option>
              </Select>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-border/40">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" className="gap-1.5 font-semibold">
                <Send className="h-4 w-4" />
                Review & Broadcast
              </Button>
            </div>
          </form>
        ) : (
          /* Confirmation View */
          <div className="space-y-4">
            <div className="p-4 rounded-xl border border-amber-500/40 bg-amber-500/10 space-y-2">
              <div className="flex items-center gap-2 text-amber-500 font-bold text-sm">
                <AlertTriangle className="h-4 w-4" />
                <span>
                  {isSimulation ? "Confirm Simulated Emergency Warning" : "Confirm LIVE Emergency Dispatch"}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                {isSimulation
                  ? "This warning will be flagged as an academic simulation. Two-stage SMS alert dispatch and web notification pipeline will be verified."
                  : "This action will broadcast an emergency warning to all matched citizens within the geographic target area."}
              </p>
            </div>

            <div className="p-3 rounded-lg bg-card/60 border border-border/40 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Headline:</span>
                <span className="font-semibold text-foreground text-right">{title}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Hazard / Severity:</span>
                <div className="flex items-center gap-1.5">
                  <span className="capitalize font-medium">{disasterType}</span>
                  <SeverityBadge level={severity} size="sm" />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Geographic Target:</span>
                <span className="font-medium text-foreground">
                  {targetMode === "radius"
                    ? `${radiusKm} km radius around [${latitude.toFixed(3)}, ${longitude.toFixed(3)}]`
                    : regionName || cityName || stateName || "All users"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Eligible SMS Recipients:</span>
                <span className="font-bold text-emerald-500">{targetingEstimate.smsEligibleCount} citizens</span>
              </div>
            </div>

            {/* Two-Message SMS Preview */}
            {channelSms && (
              <div className="p-3 rounded-lg bg-muted/40 border border-border/60 space-y-2">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block">
                  Two-Stage SMS Delivery Preview
                </span>
                <div className="space-y-1.5 text-[11px] font-mono bg-card p-2 rounded border border-border/40">
                  <div className="text-primary font-semibold">Part 1 (Hazard Alert):</div>
                  <div className="text-muted-foreground">
                    ⚠ RESQEARTH EMERGENCY ALERT<br />
                    {disasterType.toUpperCase()} warning for {regionName || "Region"}.<br />
                    Severity: {severity}<br />
                    Safety Guide: https://resqearth.antideploy.app/disasters/{disasterType}
                  </div>
                  <div className="text-primary font-semibold pt-1 border-t border-border/30">Part 2 (Verified Helplines):</div>
                  <div className="text-muted-foreground">
                    EMERGENCY CONTACTS<br />
                    112 - National Emergency | 100 - Police | 101 - Fire | 108 - Ambulance | 1070 - Disaster Response
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2 border-t border-border/40">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsConfirming(false)}
                disabled={isSubmitting}
              >
                Back to Edit
              </Button>
              <Button
                type="button"
                onClick={handleFinalSubmit}
                disabled={isSubmitting}
                className="gap-1.5 font-bold bg-red-600 hover:bg-red-700 text-white"
              >
                {isSubmitting ? (
                  <>
                    <Radio className="h-4 w-4 animate-spin" />
                    Dispatching Alert...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-4 w-4" />
                    Confirm & Dispatch Warning
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
