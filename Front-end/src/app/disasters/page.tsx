import * as React from "react";
import type { Metadata } from "next";
import { RouteContainer } from "@/components/layout/route-container";
import { PageHeader } from "@/components/ui/page-header";
import { Badge } from "@/components/ui/badge";
import { getAllDisasterGuides } from "@/features/disasters/services/knowledge-service";
import { DisasterPortalClient } from "@/features/disasters/components/knowledge/disaster-portal-client";

export const metadata: Metadata = {
  title: "Disaster Preparedness Knowledge Portal | ResQEarth",
  description:
    "Comprehensive guides covering environmental factors, early warning signs, mitigation strategies, SOPs, and emergency kits for 22 natural and man-made disasters.",
};

export default function DisastersIndexPage() {
  const allGuides = getAllDisasterGuides();

  return (
    <RouteContainer size="lg">
      <PageHeader
        title="Disaster Preparedness Knowledge Portal"
        description="Comprehensive safety manuals, environmental factors, standard operating procedures, and emergency kit checklists for natural and industrial hazards."
        badge={<Badge variant="outline">22 Hazards Library</Badge>}
      />

      <div className="mt-6">
        <DisasterPortalClient initialGuides={allGuides} />
      </div>
    </RouteContainer>
  );
}
