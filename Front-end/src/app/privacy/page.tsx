import * as React from "react";
import { RouteContainer } from "@/components/layout/route-container";
import { PageHeader } from "@/components/ui/page-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

export default function PrivacyPage() {
  return (
    <RouteContainer size="sm">
      <PageHeader
        title="Privacy Policy"
        description="Transparent data practices for the ResQEarth academic project."
        badge={<Badge variant="outline">Legal & Privacy</Badge>}
      />

      <div className="mt-6 space-y-4 text-xs sm:text-sm text-muted-foreground leading-relaxed">
        <Card>
          <CardContent className="pt-6 space-y-3">
            <h3 className="font-bold text-foreground text-sm">1. Data Collection & Purpose</h3>
            <p>
              ResQEarth collects basic profile information (name, phone number, email address) solely for authentication, consent-based disaster SMS notifications, and regional risk calculations. Continuous precise location tracking is never performed.
            </p>

            <h3 className="font-bold text-foreground text-sm">2. Granular Consent</h3>
            <p>
              Citizens maintain independent control over browser push notifications (FCM) and SMS emergency warnings. Consent can be updated or withdrawn at any time in Profile settings.
            </p>

            <h3 className="font-bold text-foreground text-sm">3. Academic Scope</h3>
            <p>
              Submitted for Second-Year Engineering Environmental Science. Data is used strictly for academic demonstration and decision support.
            </p>
          </CardContent>
        </Card>
      </div>
    </RouteContainer>
  );
}
