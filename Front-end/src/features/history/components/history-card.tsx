"use client";

import * as React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  MapPin,
  AlertOctagon,
  BookOpen,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  ShieldCheck,
  TrendingDown,
  Users,
} from "lucide-react";
import type { HistoricalDisasterEvent } from "../types";

interface HistoryCardProps {
  event: HistoricalDisasterEvent;
}

export function HistoryCard({ event }: HistoryCardProps) {
  const [expanded, setExpanded] = React.useState(false);

  const getCategoryColor = (type: string) => {
    switch (type) {
      case "cyclone":
        return "bg-cyan-50 text-cyan-700 border-cyan-200 dark:bg-cyan-950/40 dark:text-cyan-300 dark:border-cyan-900";
      case "earthquake":
        return "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-900";
      case "flood":
        return "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-900";
      case "tsunami":
        return "bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-300 dark:border-indigo-900";
      case "landslide":
        return "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-900";
      case "chemical":
      case "industrial":
        return "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-300 dark:border-red-900";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  return (
    <Card className="overflow-hidden border transition-all hover:border-primary/50 shadow-xs">
      <CardHeader className="pb-3">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1 text-xs font-mono font-bold bg-primary/10 text-primary px-2 py-0.5 rounded">
              <Calendar className="h-3 w-3" />
              {event.year}
            </span>
            <Badge variant="outline" className={`capitalize text-[10px] font-semibold ${getCategoryColor(event.disasterType)}`}>
              {event.disasterType}
            </Badge>
          </div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <MapPin className="h-3.5 w-3.5 text-primary" />
            <span className="font-medium text-foreground">{event.state}</span>
          </div>
        </div>
        <CardTitle className="text-base sm:text-lg font-bold leading-snug">
          {event.title}
        </CardTitle>
        <p className="text-xs text-muted-foreground italic">
          {event.dateString} &bull; Affected: {event.affectedRegions.join(", ")}
        </p>
      </CardHeader>

      <CardContent className="space-y-3.5 pt-0 text-xs sm:text-sm">
        <p className="text-foreground leading-relaxed">
          {event.severitySummary}
        </p>

        {/* Impact Snapshot Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 p-3 rounded-lg bg-muted/40 border text-xs">
          <div className="flex items-start gap-2">
            <Users className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-foreground">Casualties: </span>
              <span className="text-muted-foreground">{event.humanCasualties}</span>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <TrendingDown className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-foreground">Losses: </span>
              <span className="text-muted-foreground">{event.economicOrInfrastructureLoss}</span>
            </div>
          </div>
        </div>

        {/* Primary Lessons Learned Banner */}
        <div className="p-3 rounded-lg bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/60 space-y-1.5">
          <div className="flex items-center gap-1.5 font-bold text-xs text-emerald-800 dark:text-emerald-400">
            <ShieldCheck className="h-4 w-4 shrink-0" />
            <span>Key Institutional & Policy Reforms:</span>
          </div>
          <ul className="space-y-1 list-disc list-inside text-xs text-foreground/90">
            {event.policyAndInstitutionalLessonsLearned.slice(0, expanded ? undefined : 2).map((lesson, idx) => (
              <li key={idx} className="leading-snug">
                {lesson}
              </li>
            ))}
          </ul>
        </div>

        {/* Expandable Comprehensive Deep-Dive Section */}
        {expanded && (
          <div className="space-y-3 pt-2 border-t text-xs">
            <div>
              <div className="font-semibold text-foreground mb-1 flex items-center gap-1">
                <AlertOctagon className="h-3.5 w-3.5 text-primary" />
                Meteorological / Geological Physical Trigger:
              </div>
              <p className="text-muted-foreground leading-relaxed">
                {event.meteorologicalOrGeologicalTrigger}
              </p>
            </div>

            <div>
              <div className="font-semibold text-foreground mb-1">
                Environmental & Ecological Impact:
              </div>
              <p className="text-muted-foreground leading-relaxed">
                {event.environmentalImpact}
              </p>
            </div>

            <div>
              <div className="font-semibold text-foreground mb-1">
                Emergency Response Highlights:
              </div>
              <ul className="space-y-1 list-disc list-inside text-muted-foreground">
                {event.responseHighlights.map((res, i) => (
                  <li key={i}>{res}</li>
                ))}
              </ul>
            </div>

            <div className="p-2.5 rounded bg-muted/60 border">
              <span className="font-semibold text-foreground">ESE Curriculum Relevance: </span>
              <span className="text-muted-foreground">{event.relevanceToEseCurriculum}</span>
            </div>

            {event.officialReferences.length > 0 && (
              <div>
                <div className="font-semibold text-foreground mb-1 flex items-center gap-1">
                  <BookOpen className="h-3.5 w-3.5 text-primary" />
                  Statutory References & Investigation Reports:
                </div>
                <div className="flex flex-wrap gap-2">
                  {event.officialReferences.map((ref, i) => (
                    <a
                      key={i}
                      href={ref.url || "#"}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] text-primary hover:underline bg-background px-2 py-1 rounded border"
                    >
                      <span>{ref.title} ({ref.source})</span>
                      <ExternalLink className="h-2.5 w-2.5" />
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        <Button
          variant="ghost"
          size="sm"
          onClick={() => setExpanded(!expanded)}
          className="w-full text-xs h-7 gap-1 mt-1 text-muted-foreground hover:text-foreground"
        >
          {expanded ? (
            <>
              Show Less <ChevronUp className="h-3.5 w-3.5" />
            </>
          ) : (
            <>
              View Complete Scientific & Response Analysis ({event.responseHighlights.length + event.policyAndInstitutionalLessonsLearned.length} points) <ChevronDown className="h-3.5 w-3.5" />
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
