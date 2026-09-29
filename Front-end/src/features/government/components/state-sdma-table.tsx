"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Search, PhoneCall, ExternalLink, MapPin } from "lucide-react";
import type { StateSdmaInfo } from "../types";

interface StateSdmaTableProps {
  initialSdmas: StateSdmaInfo[];
}

export function StateSdmaTable({ initialSdmas }: StateSdmaTableProps) {
  const [searchQuery, setSearchQuery] = React.useState("");

  const filteredSdmas = React.useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return initialSdmas;

    return initialSdmas.filter((s) => {
      const inState = s.stateOrUtName.toLowerCase().includes(query);
      const inAcronym = s.acronym.toLowerCase().includes(query);
      const inCity = s.headquartersCity.toLowerCase().includes(query);
      const inHazards = s.primaryDisasterVulnerabilities.some((v) =>
        v.toLowerCase().includes(query)
      );

      return inState || inAcronym || inCity || inHazards;
    });
  }, [initialSdmas, searchQuery]);

  return (
    <div className="space-y-4">
      {/* Search Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-bold">State Disaster Management Authorities (SDMAs)</h3>
          <p className="text-xs text-muted-foreground">
            Direct statutory contact numbers and emergency control rooms across Indian States & UTs.
          </p>
        </div>
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search state, acronym, hazard..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 text-xs h-9"
          />
        </div>
      </div>

      {/* Grid of SDMA Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredSdmas.map((sdma) => (
          <Card key={sdma.stateOrUtName} className="hover:border-primary/40 transition-colors shadow-xs">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between gap-2">
                <Badge variant="outline" className="font-mono font-bold text-[10px]">
                  {sdma.acronym}
                </Badge>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <MapPin className="h-3 w-3 text-primary" />
                  <span>{sdma.headquartersCity}</span>
                </div>
              </div>
              <CardTitle className="text-sm font-bold leading-snug">
                {sdma.stateOrUtName} ({sdma.acronym})
              </CardTitle>
              <p className="text-[11px] text-muted-foreground line-clamp-1">
                {sdma.agencyName}
              </p>
            </CardHeader>
            <CardContent className="space-y-3 text-xs">
              <div>
                <div className="text-[10px] uppercase font-semibold text-muted-foreground mb-1">
                  Primary Regional Vulnerabilities:
                </div>
                <div className="flex flex-wrap gap-1">
                  {sdma.primaryDisasterVulnerabilities.map((v, i) => (
                    <span
                      key={i}
                      className="rounded bg-muted px-1.5 py-0.5 text-[10px] text-foreground font-medium"
                    >
                      {v}
                    </span>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5 pt-2 border-t">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground text-[11px]">State Helpline:</span>
                  <Button size="sm" variant="destructive" asChild className="h-6 text-[11px] px-2 font-mono">
                    <a href={`tel:${sdma.emergencyHelpline.split("/")[0].replace(/[^0-9]/g, "")}`}>
                      <PhoneCall className="h-2.5 w-2.5 mr-1" />
                      {sdma.emergencyHelpline}
                    </a>
                  </Button>
                </div>
                <div className="text-[11px] text-muted-foreground">
                  <span>Control Room: </span>
                  <span className="font-mono text-foreground">{sdma.stateControlRoomPhone}</span>
                </div>
              </div>

              <div className="pt-2 border-t">
                <a
                  href={sdma.websiteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
                >
                  <span>Visit {sdma.acronym} Portal</span>
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
