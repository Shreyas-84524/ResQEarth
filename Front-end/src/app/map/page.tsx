import * as React from "react";
import { RouteContainer } from "@/components/layout/route-container";
import { PageHeader } from "@/components/ui/page-header";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { Map } from "lucide-react";

export default function MapPage() {
  return (
    <RouteContainer size="lg">
      <PageHeader
        title="Interactive GIS Disaster Map"
        description="Geospatial visualization of multi-source environmental hazards and real-time disaster alerts."
        badge={<Badge variant="outline">Phase 2.1 Preview</Badge>}
      />
      <div className="mt-6">
        <EmptyState
          icon={Map}
          title="MapLibre GIS Map Shell"
          description="MapLibre GL JS base map with OpenStreetMap tiles, earthquake feeds, and weather layers will be initialized in Phase 2."
        />
      </div>
    </RouteContainer>
  );
}
