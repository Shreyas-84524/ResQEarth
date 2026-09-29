import * as React from "react";
import { RouteContainer } from "@/components/layout/route-container";
import { PageHeader } from "@/components/ui/page-header";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { LayoutDashboard } from "lucide-react";

export default function DashboardPage() {
  return (
    <RouteContainer>
      <PageHeader
        title="Citizen Risk Dashboard"
        description="Location-aware disaster surveillance, deterministic risk calculation, and real-time alerts."
        badge={<Badge variant="outline">Authenticated Area</Badge>}
      />
      <div className="mt-6">
        <EmptyState
          icon={LayoutDashboard}
          title="Citizen Dashboard Shell"
          description="Local weather, nearby disaster detection, and explainable risk scores will be connected after authentication in Phase 1.7."
        />
      </div>
    </RouteContainer>
  );
}
