import * as React from "react";
import { RouteContainer } from "@/components/layout/route-container";
import { PageHeader } from "@/components/ui/page-header";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { User } from "lucide-react";

export default function ProfilePage() {
  return (
    <RouteContainer size="sm">
      <PageHeader
        title="Citizen Profile & Preferences"
        description="Manage your contact details, notification channels, location permissions, and consent settings."
        badge={<Badge variant="outline">Settings</Badge>}
      />
      <div className="mt-6">
        <EmptyState
          icon={User}
          title="Profile Management Shell"
          description="Profile settings, FCM browser notification toggle, and SMS consent preferences will be active in Phase 1.4."
        />
      </div>
    </RouteContainer>
  );
}
