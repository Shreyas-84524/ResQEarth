"use client";

import * as React from "react";
import { RouteContainer } from "@/components/layout/route-container";
import { PageHeader } from "@/components/ui/page-header";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { AlertTriangle } from "lucide-react";
import { ProtectedRoute } from "@/features/auth";

export default function AlertsPage() {
  return (
    <ProtectedRoute>
      <RouteContainer>
        <PageHeader
          title="Active Regional Warnings"
          description="Live official warnings and local hazard notifications relevant to your selected geographic area."
          badge={<Badge variant="outline">Alert Center</Badge>}
        />
        <div className="mt-6">
          <EmptyState
            icon={AlertTriangle}
            title="No Active Alerts Found"
            description="In-site warnings, official NDMA alerts, and notification feeds will be populated in Phase 3."
          />
        </div>
      </RouteContainer>
    </ProtectedRoute>
  );
}
