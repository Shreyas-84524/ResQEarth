import * as React from "react";
import type { Metadata } from "next";
import { RouteContainer } from "@/components/layout/route-container";
import { PageHeader } from "@/components/ui/page-header";
import { Badge } from "@/components/ui/badge";
import {
  getAllGovernmentAgencies,
  getAllStateSdmas,
} from "@/features/government/services/government-service";
import { GovernmentDirectoryView } from "@/features/government/components/government-directory-view";

export const metadata: Metadata = {
  title: "Government Disaster Response Directory | ResQEarth",
  description:
    "Official directory of India's statutory disaster response organizations: NDMA, NDRF, IMD, CWC, INCOIS, GSI, and State Disaster Management Authorities (SDMAs).",
};

export default function GovernmentResponsePage() {
  const nationalAgencies = getAllGovernmentAgencies();
  const stateSdmas = getAllStateSdmas();

  return (
    <RouteContainer size="lg">
      <PageHeader
        title="Government Disaster Response Directory"
        description="Verified statutory directory of India's disaster management authorities, early warning scientific centers, specialized rescue forces, and state emergency control rooms."
        badge={<Badge variant="outline">Statutory Directory</Badge>}
      />

      <div className="mt-6">
        <GovernmentDirectoryView
          initialAgencies={nationalAgencies}
          initialSdmas={stateSdmas}
        />
      </div>
    </RouteContainer>
  );
}
