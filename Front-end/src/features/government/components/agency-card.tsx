"use client";

import * as React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  PhoneCall,
  ExternalLink,
  ShieldCheck,
  Radio,
  MapPin,
  CheckCircle2,
} from "lucide-react";
import type { GovernmentAgency } from "../types";

interface AgencyCardProps {
  agency: GovernmentAgency;
}

export function AgencyCard({ agency }: AgencyCardProps) {
  const getJurisdictionBadge = (j: string) => {
    switch (j) {
      case "national":
        return <Badge variant="default" className="text-[10px]">National Apex</Badge>;
      case "specialized-force":
        return <Badge variant="destructive" className="text-[10px]">Specialized Force</Badge>;
      case "scientific-early-warning":
        return <Badge variant="secondary" className="text-[10px]">Scientific Early Warning</Badge>;
      default:
        return <Badge variant="outline" className="text-[10px]">Statutory</Badge>;
    }
  };

  return (
    <Card className="flex flex-col justify-between hover:border-primary/50 transition-all shadow-xs">
      <CardHeader className="pb-3">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-2">
            <span className="font-mono font-extrabold text-sm px-2 py-0.5 rounded bg-primary/10 text-primary">
              {agency.acronym}
            </span>
            {getJurisdictionBadge(agency.jurisdiction)}
          </div>
          {agency.capStandardParticipation && (
            <Badge variant="outline" className="text-[10px] text-emerald-700 dark:text-emerald-400 border-emerald-300 dark:border-emerald-800 flex items-center gap-1">
              <Radio className="h-2.5 w-2.5 animate-pulse" />
              CAP Standard Active
            </Badge>
          )}
        </div>

        <CardTitle className="text-base sm:text-lg font-bold leading-snug">
          {agency.name}
        </CardTitle>
        <p className="text-xs text-muted-foreground">
          {agency.parentMinistryOrDepartment}
        </p>
      </CardHeader>

      <CardContent className="space-y-4 pt-0 text-xs sm:text-sm">
        <p className="text-muted-foreground leading-relaxed">
          {agency.mandateAndRole}
        </p>

        {/* Hazard Focus Tags */}
        <div className="space-y-1.5">
          <div className="text-[11px] font-semibold text-foreground uppercase tracking-wider">
            Nodal Hazard Focus:
          </div>
          <div className="flex flex-wrap gap-1">
            {agency.specializedHazardFocus.map((hazard, i) => (
              <span
                key={i}
                className="inline-flex items-center rounded bg-muted/80 px-2 py-0.5 text-[11px] text-foreground font-medium"
              >
                {hazard}
              </span>
            ))}
          </div>
        </div>

        {/* Operational Capabilities */}
        <div className="space-y-1.5 p-3 rounded-lg bg-muted/30 border">
          <div className="text-[11px] font-semibold text-foreground uppercase tracking-wider flex items-center gap-1.5">
            <ShieldCheck className="h-3.5 w-3.5 text-primary" />
            Operational Capabilities:
          </div>
          <ul className="space-y-1 text-xs text-muted-foreground">
            {agency.operationalCapabilities.map((cap, i) => (
              <li key={i} className="flex items-start gap-1.5">
                <CheckCircle2 className="h-3 w-3 text-emerald-600 shrink-0 mt-0.5" />
                <span className="leading-snug">{cap}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Contact & Helpline Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t text-xs">
          <div className="space-y-1">
            <div className="text-[11px] text-muted-foreground">Toll-Free Helpline:</div>
            <Button size="sm" variant="destructive" asChild className="h-7 text-xs w-full justify-start font-mono">
              <a href={`tel:${agency.tollFreeHelpline.replace(/[^0-9]/g, "")}`}>
                <PhoneCall className="h-3 w-3 mr-1.5" />
                {agency.tollFreeHelpline}
              </a>
            </Button>
          </div>
          <div className="space-y-1">
            <div className="text-[11px] text-muted-foreground">Control Room:</div>
            <div className="font-mono text-xs text-foreground p-1.5 rounded bg-muted/60 border truncate" title={agency.emergencyControlRoomNumber}>
              {agency.emergencyControlRoomNumber}
            </div>
          </div>
        </div>

        {/* Location & External Portal */}
        <div className="flex items-center justify-between pt-2 border-t text-xs text-muted-foreground">
          <div className="flex items-center gap-1 truncate max-w-[65%]" title={agency.headquarters}>
            <MapPin className="h-3 w-3 text-primary shrink-0" />
            <span className="truncate">{agency.headquarters.split(",")[0]}</span>
          </div>
          <Button size="sm" variant="outline" asChild className="h-7 text-xs gap-1">
            <a href={agency.websiteUrl} target="_blank" rel="noopener noreferrer">
              <span>Official Portal</span>
              <ExternalLink className="h-3 w-3" />
            </a>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
