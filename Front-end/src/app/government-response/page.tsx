import * as React from "react";
import { RouteContainer } from "@/components/layout/route-container";
import { PageHeader } from "@/components/ui/page-header";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { Building2 } from "lucide-react";

export default function GovernmentResponsePage() {
  return (
    <RouteContainer>
      <PageHeader
        title="Government Disaster Response Directory"
        description="Verified directory of official Indian disaster management authorities, meteorological departments, and emergency response mechanisms."
        badge={<Badge variant="outline">Verified Directory</Badge>}
      />
      <div className="mt-6">
        <EmptyState
          icon={Building2}
          title="Government Response Directory Shell"
          description="Verified agency profiles for NDMA, NDRF, IMD, CWC, INCOIS, and MHA will be rendered in Phase 4.6."
        />
      </div>
    </RouteContainer>
  );
}
