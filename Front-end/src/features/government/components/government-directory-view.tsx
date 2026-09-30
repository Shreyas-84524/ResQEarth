"use client";

import * as React from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import {
  Building2,
  Search,
  Radio,
  Shield,
  Layers,
  PhoneCall,
  ExternalLink,
  Info,
} from "lucide-react";
import { AgencyCard } from "./agency-card";
import { StateSdmaTable } from "./state-sdma-table";
import type { AgencyJurisdiction, GovernmentAgency, StateSdmaInfo } from "../types";
import { filterGovernmentAgencies } from "../services/government-service";

interface GovernmentDirectoryViewProps {
  initialAgencies: GovernmentAgency[];
  initialSdmas: StateSdmaInfo[];
}

export function GovernmentDirectoryView({
  initialAgencies,
  initialSdmas,
}: GovernmentDirectoryViewProps) {
  const [activeTab, setActiveTab] = React.useState("national");
  const [searchQuery, setSearchQuery] = React.useState("");
  const [selectedJurisdiction, setSelectedJurisdiction] = React.useState<AgencyJurisdiction | "all">("all");
  const [selectedHazard, setSelectedHazard] = React.useState<string>("all");

  const filteredAgencies = React.useMemo(() => {
    return filterGovernmentAgencies({
      jurisdiction: selectedJurisdiction,
      hazardFocus: selectedHazard,
      searchQuery,
    });
  }, [selectedJurisdiction, selectedHazard, searchQuery]);

  return (
    <div className="space-y-6">
      {/* Top Banner: Statutory Framework */}
      <div className="rounded-[16px] bg-gradient-to-r from-[#04411F] via-[#08752A] to-[#0B8F2F] text-white p-6 sm:p-8 shadow-[0_10px_30px_rgba(4,65,31,0.15)]">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 font-bold text-base sm:text-lg text-[#BDF58E]">
              <Shield className="h-5 w-5" />
              <span>Institutional Disaster Framework of India</span>
            </div>
            <p className="text-xs sm:text-sm text-white/90 leading-relaxed max-w-2xl">
              Under the <strong>Disaster Management Act, 2005</strong>, India operates a unified multi-tiered architecture: <strong>NDMA</strong> (National Policy), <strong>NDRF</strong> (Specialized Response), <strong>Scientific Bodies</strong> (IMD, CWC, INCOIS, GSI), and <strong>SDMAs / DDMAs</strong> (State & District Execution).
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="destructive" size="sm" asChild className="text-xs h-9 rounded-full px-4">
              <a href="tel:112">
                <PhoneCall className="h-3.5 w-3.5 mr-1.5" />
                Universal Emergency: <span className="font-mono font-bold ml-1">112</span>
              </a>
            </Button>
          </div>
        </div>
      </div>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={(val: string) => setActiveTab(val)}>
        <TabsList className="grid grid-cols-3 w-full max-w-md">
          <TabsTrigger value="national" className="text-xs font-semibold">
            National Agencies ({initialAgencies.length})
          </TabsTrigger>
          <TabsTrigger value="sdmas" className="text-xs font-semibold">
            State SDMAs ({initialSdmas.length})
          </TabsTrigger>
          <TabsTrigger value="cap" className="text-xs font-semibold">
            CAP & Sachet Architecture
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: National Agencies */}
        <TabsContent value="national" className="space-y-6 mt-6">
          {/* Filters Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search agency, mandate, helpline..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 text-xs h-9"
              />
            </div>

            <Select
              value={selectedJurisdiction}
              onChange={(e) => setSelectedJurisdiction(e.target.value as AgencyJurisdiction | "all")}
              options={[
                { label: "All Jurisdictions", value: "all" },
                { label: "National Apex (NDMA / MHA)", value: "national" },
                { label: "Specialized Tactical Force (NDRF / ICG)", value: "specialized-force" },
                { label: "Scientific Early Warning (IMD/CWC/INCOIS/GSI)", value: "scientific-early-warning" },
              ]}
              className="text-xs h-9"
            />

            <Select
              value={selectedHazard}
              onChange={(e) => setSelectedHazard(e.target.value)}
              options={[
                { label: "All Hazard Specialties", value: "all" },
                { label: "Cyclones & Weather", value: "Cyclone" },
                { label: "Floods & Reservoirs", value: "Flood" },
                { label: "Tsunamis & Ocean State", value: "Tsunami" },
                { label: "Landslides & Geology", value: "Landslide" },
                { label: "Forest Fires (Van Agni)", value: "Forest Fire" },
                { label: "CBRN & Hazardous Chemicals", value: "CBRN" },
              ]}
              className="text-xs h-9"
            />
          </div>

          {/* Agencies Grid */}
          {filteredAgencies.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {filteredAgencies.map((agency) => (
                <AgencyCard key={agency.id} agency={agency} />
              ))}
            </div>
          ) : (
            <EmptyState
              icon={Building2}
              title="No Matching Government Agencies Found"
              description="Adjust your search query or filters to discover statutory response organizations."
            />
          )}
        </TabsContent>

        {/* Tab 2: State SDMAs */}
        <TabsContent value="sdmas" className="mt-6">
          <StateSdmaTable initialSdmas={initialSdmas} />
        </TabsContent>

        {/* Tab 3: CAP & Sachet Platform */}
        <TabsContent value="cap" className="space-y-6 mt-6">
          <Card className="border-primary/40">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2 text-primary font-bold text-base">
                <Radio className="h-5 w-5 animate-pulse" />
                <span>Common Alerting Protocol (ITU-T X.1303) & Sachet Integration</span>
              </div>
              <p className="text-xs text-muted-foreground">
                India&apos;s National Pan-Disaster Integrated Early Warning Dissemination Standard.
              </p>
            </CardHeader>
            <CardContent className="space-y-4 text-xs sm:text-sm">
              <p className="text-foreground leading-relaxed">
                The <strong>Common Alerting Protocol (CAP)</strong> is an international standard XML-based data format for exchanging public emergency alerts and notifications across all types of networks and devices.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                <div className="p-3.5 rounded-lg bg-muted/40 border space-y-1.5">
                  <div className="font-bold text-xs text-primary flex items-center gap-1.5">
                    <Layers className="h-4 w-4" />
                    Multi-Agency Ingestion
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Aggregates warnings from IMD (Cyclones/Rain), CWC (Floods), INCOIS (Tsunamis), FSI (Forest Fires), and GSI (Landslides) into a single canonical message stream.
                  </p>
                </div>

                <div className="p-3.5 rounded-lg bg-muted/40 border space-y-1.5">
                  <div className="font-bold text-xs text-emerald-600 flex items-center gap-1.5">
                    <Radio className="h-4 w-4" />
                    Targeted Geo-Fencing
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Leverages Cell Broadcast (CBS) and Telecom Service Providers (TSPs) to deliver audio-vibrational warnings exclusively to mobile devices located within hazard polygons.
                  </p>
                </div>

                <div className="p-3.5 rounded-lg bg-muted/40 border space-y-1.5">
                  <div className="font-bold text-xs text-indigo-600 flex items-center gap-1.5">
                    <Shield className="h-4 w-4" />
                    ResQEarth Architectural Alignment
                  </div>
                  <p className="text-xs text-muted-foreground">
                    ResQEarth&apos;s Phase 3 alert model mirrors CAP v1.2 standard schema (Identifier, Sender, Status, MsgType, Scope, Category, Event, Urgency, Severity, Certainty, Polygon).
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-lg bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900 space-y-2">
                <div className="flex items-center gap-2 font-bold text-xs text-blue-800 dark:text-blue-300">
                  <Info className="h-4 w-4 shrink-0" />
                  <span>Public Access to Sachet Alert Feeds</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Citizens can access verified national and regional alerts directly through the NDMA / C-DOT Sachet Portal.
                </p>
                <div className="pt-1">
                  <Button size="sm" variant="outline" asChild className="text-xs h-8 bg-background">
                    <a href="https://sachet.ndma.gov.in" target="_blank" rel="noopener noreferrer" className="gap-1.5">
                      <span>Visit National Sachet Portal</span>
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
