import * as React from "react";
import type { Metadata } from "next";
import { RouteContainer } from "@/components/layout/route-container";
import { PageHeader } from "@/components/ui/page-header";
import { Badge } from "@/components/ui/badge";
import { CookiePreferenceCenter } from "@/features/legal/components/cookie-preference-center";

export const metadata: Metadata = {
  title: "Cookie & Local Storage Preferences | ResQEarth",
  description:
    "Manage your cookie, local storage, and privacy preferences for the ResQEarth platform.",
};

export default function CookiesPage() {
  return (
    <RouteContainer size="default">
      <PageHeader
        title="Cookie & Storage Preferences"
        description="Configure your browser storage, authentication session tokens, UI functional preferences, and anonymous latency analytics."
        badge={<Badge variant="outline">Privacy Controls</Badge>}
      />

      <div className="mt-8">
        <CookiePreferenceCenter />
      </div>
    </RouteContainer>
  );
}
