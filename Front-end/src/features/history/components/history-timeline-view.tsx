"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { EmptyState } from "@/components/ui/empty-state";
import { Search, History, Landmark } from "lucide-react";
import { HistoryCard } from "./history-card";
import type { HistoricalDisasterCategory, HistoricalDisasterEvent } from "../types";
import {
  filterHistoricalEvents,
  getHistoricalDecades,
  getHistoricalStates,
} from "../services/history-service";

interface HistoryTimelineViewProps {
  initialEvents: HistoricalDisasterEvent[];
}

export function HistoryTimelineView({ initialEvents }: HistoryTimelineViewProps) {
  const [searchQuery, setSearchQuery] = React.useState("");
  const [selectedType, setSelectedType] = React.useState<HistoricalDisasterCategory | "all">("all");
  const [selectedDecade, setSelectedDecade] = React.useState<string>("all");
  const [selectedState, setSelectedState] = React.useState<string>("all");

  const decades = React.useMemo(() => getHistoricalDecades(), []);
  const states = React.useMemo(() => getHistoricalStates(), []);

  const filteredEvents = React.useMemo(() => {
    return filterHistoricalEvents({
      disasterType: selectedType,
      decade: selectedDecade === "all" ? "all" : selectedDecade.replace("s", ""),
      state: selectedState,
      searchQuery,
    });
  }, [selectedType, selectedDecade, selectedState, searchQuery]);

  return (
    <div className="space-y-6">
      {/* Historical Context Banner */}
      <div className="rounded-[16px] border border-[#EEF1EE] bg-gradient-to-r from-[#FAFBFA] via-white to-[#E8FAD9]/40 p-5 sm:p-6 shadow-[0_6px_24px_rgba(0,0,0,0.04)]">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-[#0B8F2F] font-bold text-sm sm:text-base">
              <History className="h-5 w-5 shrink-0" />
              <span>Evolution of Disaster Management in India (1984 – 2024)</span>
            </div>
            <p className="text-xs text-[#4D514F]">
              From the 1984 Bhopal tragedy and the 1999 Odisha Super Cyclone to the modern NDMA / NDRF framework and AI-driven early warnings.
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <div className="text-center bg-white rounded-[12px] p-2.5 border border-[#EEF1EE] shadow-sm">
              <div className="text-lg font-extrabold text-[#0B8F2F]">{initialEvents.length}</div>
              <div className="text-[10px] text-[#4D514F] uppercase font-semibold">Major Catastrophes</div>
            </div>
            <div className="text-center bg-white rounded-[12px] p-2.5 border border-[#EEF1EE] shadow-sm">
              <div className="text-lg font-extrabold text-[#137D43]">40 Yrs</div>
              <div className="text-[10px] text-[#4D514F] uppercase font-semibold">Policy Evolution</div>
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search disasters, states, lessons..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 text-xs h-9"
          />
        </div>

        <Select
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value as HistoricalDisasterCategory | "all")}
          options={[
            { label: "All Disaster Types", value: "all" },
            { label: "Cyclones", value: "cyclone" },
            { label: "Floods", value: "flood" },
            { label: "Earthquakes", value: "earthquake" },
            { label: "Tsunamis", value: "tsunami" },
            { label: "Landslides", value: "landslide" },
            { label: "Chemical & Industrial", value: "chemical" },
          ]}
          className="text-xs h-9"
        />

        <Select
          value={selectedDecade}
          onChange={(e) => setSelectedDecade(e.target.value)}
          options={[
            { label: "All Decades", value: "all" },
            ...decades.map((d) => ({ label: d, value: d })),
          ]}
          className="text-xs h-9"
        />

        <Select
          value={selectedState}
          onChange={(e) => setSelectedState(e.target.value)}
          options={[
            { label: "All Affected States", value: "all" },
            ...states.map((s) => ({ label: s, value: s })),
          ]}
          className="text-xs h-9"
        />
      </div>

      {/* Timeline Events List */}
      {filteredEvents.length > 0 ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-muted-foreground px-1">
            <span>Showing {filteredEvents.length} historical events</span>
            <span>Sorted chronologically (Newest first)</span>
          </div>

          <div className="space-y-4">
            {filteredEvents.map((event) => (
              <HistoryCard key={event.id} event={event} />
            ))}
          </div>
        </div>
      ) : (
        <EmptyState
          icon={Landmark}
          title="No Matching Historical Disasters Found"
          description="Try broadening your search query or adjusting the category, decade, or state filters."
        />
      )}
    </div>
  );
}
