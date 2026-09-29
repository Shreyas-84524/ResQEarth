import * as React from "react";
import { RouteContainer } from "@/components/layout/route-container";
import { PageHeader } from "@/components/ui/page-header";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { History } from "lucide-react";

export default function HistoryPage() {
  return (
    <RouteContainer>
      <PageHeader
        title="Indian Disaster History Timeline"
        description="A curated, sourced historical record of major natural and industrial disasters in India, their causes, and lessons learned."
        badge={<Badge variant="outline">Educational Archive</Badge>}
      />
      <div className="mt-6">
        <EmptyState
          icon={History}
          title="Historical Timeline Shell"
          description="Interactive timeline with filterable disaster categories (Cyclone, Tsunami, Earthquake, Gas Leak) will be populated in Phase 4.5."
        />
      </div>
    </RouteContainer>
  );
}
