import * as React from "react";
import type { Metadata } from "next";
import { RouteContainer } from "@/components/layout/route-container";
import { PageHeader } from "@/components/ui/page-header";
import { Badge } from "@/components/ui/badge";
import { getAllHistoricalEvents } from "@/features/history/services/history-service";
import { HistoryTimelineView } from "@/features/history/components/history-timeline-view";

export const metadata: Metadata = {
  title: "Indian Disaster History & Lessons Learned | ResQEarth",
  description:
    "Chronological archive of major Indian disasters from 1984 to 2024, analyzing meteorological/geological triggers, human impacts, and transformative policy reforms.",
};

export default function DisasterHistoryPage() {
  const allEvents = getAllHistoricalEvents();

  return (
    <RouteContainer size="lg">
      <PageHeader
        title="Indian Disaster History & Policy Evolution"
        description="Comprehensive historical archive examining major Indian natural and industrial catastrophes, meteorological triggers, response actions, and institutional lessons learned."
        badge={<Badge variant="outline">Historical Archive (1984–2024)</Badge>}
      />

      <div className="mt-6">
        <HistoryTimelineView initialEvents={allEvents} />
      </div>
    </RouteContainer>
  );
}
