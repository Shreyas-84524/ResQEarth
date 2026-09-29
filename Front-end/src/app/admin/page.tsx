import * as React from "react";
import { RouteContainer } from "@/components/layout/route-container";
import { PageHeader } from "@/components/ui/page-header";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { Shield } from "lucide-react";

export default function AdminPage() {
  return (
    <RouteContainer size="lg">
      <PageHeader
        title="Admin Control Center"
        description="Protected administrator operations, provider health monitoring, simulated emergency warnings, and SMS dispatch previews."
        badge={<Badge variant="simulation">Restricted Admin Area</Badge>}
      />
      <div className="mt-6">
        <EmptyState
          icon={Shield}
          title="Admin Control Center Shell"
          description="Server-authoritative role verification, manual warning creation, targeting previews, and delivery logs will be implemented in Phase 3.3."
        />
      </div>
    </RouteContainer>
  );
}
