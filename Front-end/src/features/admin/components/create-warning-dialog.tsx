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
} from "lucide-react";

interface CreateWarningDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (
    alertData: CreateAlertInput,
    channels: { inSite: boolean; fcm: boolean; sms: boolean }
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

  // Set default title when type changes
  React.useEffect(() => {
    if (!title || title.startsWith("Manual Emergency Warning:")) {
      const typeCapitalized = disasterType.charAt(0).toUpperCase() + disasterType.slice(1);
      setTitle(`Manual Warning: Elevated ${typeCapitalized} Alert in ${regionName || "Region"}`);
    }
  }, [disasterType, regionName, title]);

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
        source: "ResQEarth Emergency Operations Center",
        sourceType: "manual-admin",
        isOfficialAlert: false, // Strict: manual warnings are NOT statutory government alerts
        region: regionName || cityName || stateName || "Target Zone",
        latitude: targetMode === "radius" ? latitude : undefined,
        longitude: targetMode === "radius" ? longitude : undefined,
        radiusKm: targetMode === "radius" ? radiusKm : undefined,
        targetMode,
        instructions,
        expiresAt,
        status: "active",
        metadata: {
          channels: { inSite: channelInSite, fcm: channelFcm, sms: channelSms },
          targetingPreview: targetingEstimate,
        },
      };

      await onSubmit(alertInput, {
        inSite: channelInSite,
        fcm: channelFcm,
        sms: channelSms,
      });

      setIsConfirming(false);
      onClose();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to broadcast emergency warning";
      setFormError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Issue Regional Emergency Warning</DialogTitle>
        </DialogHeader>
        {!isConfirming ? (
        <form onSubmit={handleReviewClick} className="space-y-4 max-h-[80vh] overflow-y-auto pr-1">
          {formError && (
            <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/30 text-destructive text-sm flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          {/* Hazard & Severity */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <Label className="text-xs font-semibold">Disaster / Hazard Type</Label>
              <Select
                value={disasterType}
                onChange={(e) => setDisasterType(e.target.value)}
                className="mt-1"
              >
                <option value="flood">Flood / Inundation</option>
                <option value="cyclone">Cyclone / Severe Storm</option>
                <option value="earthquake">Earthquake / Tremors</option>
                <option value="wildfire">Wildfire / Forest Fire</option>
                <option value="heatwave">Extreme Heatwave</option>
                <option value="landslide">Landslide / Mudflow</option>
                <option value="heavy-rain">Severe Torrential Rain</option>
                <option value="tsunami">Tsunami / Coastal Surge</option>
                <option value="chemical-leak">Industrial / Chemical Hazard</option>
              </Select>
            </div>
            <div>
              <Label className="text-xs font-semibold">Severity Level</Label>
              <Select
                value={severity}
                onChange={(e) => setSeverity(e.target.value as RiskLevel)}
                className="mt-1"
              >
                <option value="LOW">LOW</option>
                <option value="GUARDED">GUARDED</option>
                <option value="MODERATE">MODERATE</option>
                <option value="HIGH">HIGH (Urgent Action)</option>
                <option value="CRITICAL">CRITICAL (Imminent Threat)</option>
              </Select>
            </div>
          </div>

          {/* Title */}
          <div>
            <Label className="text-xs font-semibold">Warning Headline</Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Severe Urban Waterlogging Warning for Mumbai Suburbs"
              className="mt-1"
              required
            />
          </div>

          {/* Description */}
          <div>
            <Label className="text-xs font-semibold">Detailed Warning Message</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide clear description of the hazard conditions and impact zones..."
              rows={3}
              className="mt-1"
              required
            />
          </div>

          {/* Instructions */}
          <div>
            <Label className="text-xs font-semibold">Citizen Safety Instructions (one per line)</Label>
            <Textarea
              value={instructionsText}
              onChange={(e) => setInstructionsText(e.target.value)}
              rows={3}
              className="mt-1 font-mono text-xs"
            />
          </div>

          {/* Targeting Mode */}
          <div className="p-3 rounded-xl bg-muted/40 border border-border/40 space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5 text-primary" />
                Target Population & Geography
              </Label>
              <Badge variant="outline" className="text-[11px] capitalize">
                {targetMode} Mode
              </Badge>
            </div>

            <Select
              value={targetMode}
              onChange={(e) => setTargetMode(e.target.value as TargetMode)}
            >
              <option value="radius">Geographic Radius around GPS Coordinates</option>
              <option value="city">Specific City</option>
              <option value="state">Specific State</option>
              <option value="region">General Region Query</option>
              <option value="all">Platform-Wide (All Registered Users)</option>
            </Select>

            {targetMode === "radius" && (
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
                  <Label className="text-[11px] text-muted-foreground">Radius (km)</Label>
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

            {/* Live Recipient Preview */}
            <div className="p-2.5 rounded-lg bg-card border border-border/60 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-primary" />
                <span className="font-medium text-foreground">
                  Estimated Recipients: {targetingEstimate.totalMatchedUsers} citizens
                </span>
              </div>
              <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                <span>FCM: {targetingEstimate.fcmEligibleCount}</span>
                <span>•</span>
                <span>SMS: {targetingEstimate.smsEligibleCount}</span>
              </div>
            </div>
          </div>

          {/* Delivery Channels */}
          <div className="space-y-2">
            <Label className="text-xs font-semibold">Dispatch Channels</Label>
            <div className="grid grid-cols-3 gap-2">
              <label className="flex items-center gap-2 p-2 rounded-lg border border-border/60 bg-card/40 cursor-pointer text-xs">
                <input
                  type="checkbox"
                  checked={channelInSite}
                  onChange={(e) => setChannelInSite(e.target.checked)}
                  className="rounded text-primary"
                />
                <Globe className="h-3.5 w-3.5 text-primary" />
                <span>In-Site Banner</span>
              </label>
              <label className="flex items-center gap-2 p-2 rounded-lg border border-border/60 bg-card/40 cursor-pointer text-xs">
                <input
                  type="checkbox"
                  checked={channelFcm}
                  onChange={(e) => setChannelFcm(e.target.checked)}
                  className="rounded text-primary"
                />
                <Bell className="h-3.5 w-3.5 text-purple-400" />
                <span>Web Push (FCM)</span>
              </label>
              <label className="flex items-center gap-2 p-2 rounded-lg border border-border/60 bg-card/40 cursor-pointer text-xs">
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
          <div className="p-4 rounded-xl border border-amber-500/30 bg-amber-500/10 space-y-2">
            <div className="flex items-center gap-2 text-amber-500 font-semibold text-sm">
              <AlertTriangle className="h-4 w-4" />
              <span>Confirm Emergency Warning Dispatch</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Please review the warning parameters carefully. This action will immediately publish the alert to the platform and dispatch notifications to targeted citizens.
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
              <span className="text-muted-foreground">Target Scope:</span>
              <span className="font-medium text-foreground">{targetingEstimate.summaryDescription}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Active Channels:</span>
              <div className="flex items-center gap-2">
                {channelInSite && <Badge variant="outline" className="text-[10px]">In-Site</Badge>}
                {channelFcm && <Badge variant="outline" className="text-[10px] text-purple-400">Push</Badge>}
                {channelSms && <Badge variant="outline" className="text-[10px] text-emerald-400">SMS</Badge>}
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Target Reach:</span>
              <span className="font-semibold text-primary">
                {targetingEstimate.totalMatchedUsers} Citizens ({targetingEstimate.fcmEligibleCount} Push / {targetingEstimate.smsEligibleCount} SMS)
              </span>
            </div>
          </div>

          {formError && (
            <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/30 text-destructive text-xs">
              {formError}
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2 border-t border-border/40">
            <Button
              variant="outline"
              onClick={() => setIsConfirming(false)}
              disabled={isSubmitting}
            >
              Back to Edit
            </Button>
            <Button
              onClick={handleFinalSubmit}
              disabled={isSubmitting}
              className="gap-1.5 bg-destructive hover:bg-destructive/90 text-destructive-foreground font-semibold"
            >
              <CheckCircle2 className="h-4 w-4" />
              {isSubmitting ? "Dispatching Broadcast..." : "Confirm & Send Warning"}
            </Button>
          </div>
        </div>
      )}
      </DialogContent>
    </Dialog>
  );
}
