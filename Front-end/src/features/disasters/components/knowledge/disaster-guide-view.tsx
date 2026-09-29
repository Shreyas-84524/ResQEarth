"use client";

import * as React from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  ArrowLeft,
  CheckCircle2,
  Circle,
  ExternalLink,
  Info,
  PhoneCall,
  Shield,
  ShieldAlert,
  ShieldCheck,
  XCircle,
  BookOpen,
  Leaf,
  Activity,
  LifeBuoy,
} from "lucide-react";
import { DisasterIcon } from "./disaster-icon";
import { DisasterCard } from "./disaster-card";
import type { DisasterGuide } from "../../types/knowledge";

interface DisasterGuideViewProps {
  guide: DisasterGuide;
  relatedGuides?: DisasterGuide[];
}

export function DisasterGuideView({ guide, relatedGuides = [] }: DisasterGuideViewProps) {
  // Local checklist state for the disaster kit
  const [checkedItems, setCheckedItems] = React.useState<Record<string, boolean>>({});

  const toggleCheck = (item: string) => {
    setCheckedItems((prev) => ({
      ...prev,
      [item]: !prev[item],
    }));
  };

  const totalKitItems = guide.emergencyKit.length;
  const completedCount = Object.values(checkedItems).filter(Boolean).length;
  const progressPercent = totalKitItems > 0 ? Math.round((completedCount / totalKitItems) * 100) : 0;

  const isNatural = guide.category === "natural";

  return (
    <div className="space-y-8">
      {/* Navigation Breadcrumb */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" asChild className="gap-1.5 -ml-2 text-xs">
          <Link href="/disasters">
            <ArrowLeft className="h-4 w-4" />
            Back to All Disaster Guides
          </Link>
        </Button>
        <div className="flex items-center gap-2">
          <Badge variant={isNatural ? "secondary" : "warning"} className="capitalize text-xs">
            {guide.category} Hazard
          </Badge>
          <Badge variant="outline" className="text-xs font-mono">
            Baseline: {guide.severityBaseline}
          </Badge>
        </div>
      </div>

      {/* Hero Banner Header */}
      <div className="rounded-2xl border bg-gradient-to-b from-muted/50 to-muted/20 p-6 sm:p-8 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div
            className={`flex h-16 w-16 items-center justify-center rounded-2xl shrink-0 ${
              isNatural
                ? "bg-blue-100 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400"
                : "bg-amber-100 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400"
            }`}
          >
            <DisasterIcon name={guide.iconName} className="h-8 w-8" />
          </div>
          <div className="space-y-1.5">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">{guide.title}</h1>
            <p className="text-sm sm:text-base text-muted-foreground">{guide.bannerDescription}</p>
          </div>
        </div>
      </div>

      {/* Immediate Helplines Callout */}
      <div className="rounded-xl border border-red-200 dark:border-red-900/60 bg-red-50/50 dark:bg-red-950/20 p-4 sm:p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 text-red-700 dark:text-red-400 font-bold text-sm">
            <PhoneCall className="h-5 w-5 animate-pulse shrink-0" />
            <span>Emergency Helplines for this Hazard</span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button size="sm" variant="destructive" asChild className="text-xs h-8">
              <a href="tel:112">
                Universal: <span className="font-mono font-bold ml-1">112</span>
              </a>
            </Button>
            {guide.officialHelplines.map((h, i) => (
              <Button key={i} size="sm" variant="outline" asChild className="text-xs h-8 bg-background">
                <a href={`tel:${h.phone.replace(/[^0-9]/g, "")}`}>
                  <span>{h.agency}:</span>
                  <span className="font-mono font-bold ml-1 text-primary">{h.phone}</span>
                </a>
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Grid: Definition, Causes & ESE Environmental Factors */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Definition & Trigger Causes */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <Info className="h-4 w-4 text-primary" />
              Scientific Definition & Causes
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-xs sm:text-sm">
            <p className="text-muted-foreground leading-relaxed">{guide.definition}</p>
            <div>
              <div className="font-semibold text-xs text-foreground uppercase tracking-wider mb-2">
                Primary Trigger Causes:
              </div>
              <ul className="space-y-1.5 list-disc list-inside text-muted-foreground">
                {guide.causes.map((c, idx) => (
                  <li key={idx} className="leading-snug">
                    <span className="text-foreground font-medium">{c}</span>
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* ESE Environmental & Anthropogenic Vulnerabilities */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <Leaf className="h-4 w-4 text-emerald-600" />
              Environmental Science & Ecological Factors
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-xs sm:text-sm">
            <div>
              <div className="font-semibold text-xs text-foreground uppercase tracking-wider mb-2">
                Ecological Amplifiers & Landscape Vulnerabilities:
              </div>
              <ul className="space-y-1.5 list-disc list-inside text-muted-foreground">
                {guide.environmentalFactors.map((f, idx) => (
                  <li key={idx} className="leading-snug">
                    <span className="text-foreground">{f}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <div className="font-semibold text-xs text-foreground uppercase tracking-wider mb-2">
                Ecological & Environmental Impacts:
              </div>
              <ul className="space-y-1.5 list-disc list-inside text-muted-foreground">
                {guide.environmentalImpacts.map((e, idx) => (
                  <li key={idx} className="leading-snug">
                    <span className="text-foreground">{e}</span>
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Warning Signs & Human Impacts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-amber-200 dark:border-amber-900/40 bg-amber-50/20 dark:bg-amber-950/10">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-bold flex items-center gap-2 text-amber-700 dark:text-amber-400">
              <ShieldAlert className="h-4 w-4" />
              Early Warning Signs & Detection
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-xs sm:text-sm">
              {guide.warningSigns.map((sign, idx) => (
                <li key={idx} className="flex items-start gap-2.5">
                  <div className="h-2 w-2 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                  <span className="text-foreground leading-snug">{sign}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <Activity className="h-4 w-4 text-red-500" />
              Human & Socioeconomic Impacts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-xs sm:text-sm">
              {guide.humanImpacts.map((impact, idx) => (
                <li key={idx} className="flex items-start gap-2.5">
                  <div className="h-2 w-2 rounded-full bg-red-500 mt-1.5 shrink-0" />
                  <span className="text-foreground leading-snug">{impact}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Prevention & Engineering Mitigation */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-bold flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-primary" />
            Prevention & Long-Term Mitigation Strategies
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs sm:text-sm">
            {guide.preventionStrategies.map((strat, idx) => (
              <div key={idx} className="flex items-start gap-2 p-2.5 rounded-lg bg-muted/40 border">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 mt-0.5 shrink-0" />
                <span className="text-foreground leading-snug">{strat}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Phased Action Guidance: Before / During / After */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-bold">Standard Operating Safety Procedures (SOPs)</h2>
        </div>
        <Tabs defaultValue="before" className="w-full">
          <TabsList className="grid grid-cols-3 w-full max-w-md">
            <TabsTrigger value="before" className="text-xs font-semibold">
              Before (Preparedness)
            </TabsTrigger>
            <TabsTrigger value="during" className="text-xs font-semibold">
              During (Response)
            </TabsTrigger>
            <TabsTrigger value="after" className="text-xs font-semibold">
              After (Recovery)
            </TabsTrigger>
          </TabsList>

          <TabsContent value="before" className="mt-4">
            <Card className="border-blue-200 dark:border-blue-900/40">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-bold text-blue-700 dark:text-blue-400">
                  Pre-Disaster Preparedness & Risk Reduction
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2.5 text-xs sm:text-sm">
                {guide.phases.before.map((step, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-bold text-[10px] shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <span className="text-foreground leading-snug">{step}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="during" className="mt-4">
            <Card className="border-red-200 dark:border-red-900/40 bg-red-50/10 dark:bg-red-950/10">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-bold text-red-700 dark:text-red-400">
                  During Event: Immediate Life-Saving Action
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2.5 text-xs sm:text-sm">
                {guide.phases.during.map((step, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300 font-bold text-[10px] shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <span className="text-foreground font-medium leading-snug">{step}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="after" className="mt-4">
            <Card className="border-emerald-200 dark:border-emerald-900/40">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-bold text-emerald-700 dark:text-emerald-400">
                  Post-Disaster Recovery, Health & Safety
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2.5 text-xs sm:text-sm">
                {guide.phases.after.map((step, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold text-[10px] shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <span className="text-foreground leading-snug">{step}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Interactive Emergency Kit Checklist */}
      <Card className="border-primary/30">
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <LifeBuoy className="h-5 w-5 text-primary" />
              Customized Emergency Kit Checklist
            </CardTitle>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">
                Progress: <strong className="text-foreground">{completedCount}/{totalKitItems}</strong> ({progressPercent}%)
              </span>
              <div className="w-24 bg-muted rounded-full h-2 overflow-hidden">
                <div
                  className="bg-primary h-full transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs sm:text-sm">
            {guide.emergencyKit.map((item, idx) => {
              const isChecked = !!checkedItems[item.item];
              return (
                <div
                  key={idx}
                  onClick={() => toggleCheck(item.item)}
                  className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer select-none transition-all ${
                    isChecked
                      ? "bg-primary/10 border-primary/40 text-foreground"
                      : "bg-background hover:bg-muted/40 border-muted"
                  }`}
                >
                  <button
                    type="button"
                    className="mt-0.5 text-primary shrink-0 focus:outline-none"
                    aria-label={isChecked ? `Uncheck ${item.item}` : `Check ${item.item}`}
                  >
                    {isChecked ? (
                      <CheckCircle2 className="h-4 w-4 text-primary fill-primary/20" />
                    ) : (
                      <Circle className="h-4 w-4 text-muted-foreground" />
                    )}
                  </button>
                  <div className="space-y-0.5 flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className={`font-semibold ${isChecked ? "line-through text-muted-foreground" : "text-foreground"}`}>
                        {item.item}
                      </span>
                      {item.essential && (
                        <Badge variant="destructive" className="text-[9px] px-1 py-0 h-3.5">
                          Essential
                        </Badge>
                      )}
                    </div>
                    <p className="text-[11px] text-muted-foreground leading-tight">{item.reason}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* What NOT To Do Warning Box */}
      <Card className="border-red-300 dark:border-red-900 bg-red-50/40 dark:bg-red-950/20">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-bold flex items-center gap-2 text-red-700 dark:text-red-400">
            <XCircle className="h-5 w-5" />
            Critical Mistakes to Avoid (What NOT to Do)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-xs sm:text-sm">
            {guide.whatNotToDo.map((dont, idx) => (
              <li key={idx} className="flex items-start gap-2.5 text-foreground">
                <XCircle className="h-4 w-4 text-red-600 dark:text-red-400 mt-0.5 shrink-0" />
                <span className="leading-snug">{dont}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Official Government Portals & Early Warning Links */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-bold flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-primary" />
            Statutory Early Warning Portals & Official Links
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {guide.officialResources.map((res, idx) => (
              <a
                key={idx}
                href={res.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col justify-between p-3 rounded-lg border bg-background hover:bg-muted/40 transition-colors group"
              >
                <div className="space-y-1">
                  <div className="flex items-center justify-between gap-1">
                    <Badge variant="outline" className="text-[10px]">
                      {res.agency}
                    </Badge>
                    <ExternalLink className="h-3 w-3 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                  <div className="font-semibold text-xs text-foreground group-hover:text-primary transition-colors">
                    {res.name}
                  </div>
                  {res.description && (
                    <p className="text-[11px] text-muted-foreground line-clamp-2">
                      {res.description}
                    </p>
                  )}
                </div>
              </a>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Academic & Scientific References */}
      {guide.references && guide.references.length > 0 && (
        <Card className="bg-muted/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Academic & Environmental References
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-1 text-xs text-muted-foreground">
              {guide.references.map((ref, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="font-mono text-[10px] text-muted-foreground shrink-0">[{idx + 1}]</span>
                  <span>
                    <strong>{ref.title}</strong> — {ref.source} {ref.year ? `(${ref.year})` : ""}
                  </span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Related Disaster Guides */}
      {relatedGuides.length > 0 && (
        <div className="space-y-4 pt-4 border-t">
          <h3 className="text-base font-bold">Related {guide.category === "natural" ? "Natural" : "Industrial"} Safety Guides</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {relatedGuides.map((rel) => (
              <DisasterCard key={rel.slug} guide={rel} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
