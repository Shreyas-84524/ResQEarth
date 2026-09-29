import * as React from "react";
import { RouteContainer } from "@/components/layout/route-container";
import { PageHeader } from "@/components/ui/page-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

export default function TermsPage() {
  return (
    <RouteContainer size="sm">
      <PageHeader
        title="Terms of Service"
        description="Usage terms and safety disclaimers for the ResQEarth educational platform."
        badge={<Badge variant="outline">Terms & Conditions</Badge>}
      />

      <div className="mt-6 space-y-4 text-xs sm:text-sm text-muted-foreground leading-relaxed">
        <Card>
          <CardContent className="pt-6 space-y-3">
            <h3 className="font-bold text-foreground text-sm">1. Educational Nature</h3>
            <p>
              ResQEarth is an academic project designed for disaster awareness, risk education, and demonstration of environmental science IT applications.
            </p>

            <h3 className="font-bold text-foreground text-sm">2. Emergency Disclaimer</h3>
            <p>
              ResQEarth calculated risk scores and simulated alerts do not replace official alerts issued by NDMA, IMD, or local government authorities. In any real emergency, immediately contact official services (112).
            </p>

            <h3 className="font-bold text-foreground text-sm">3. Availability</h3>
            <p>
              External disaster feeds and SMS delivery depend on third-party APIs and network availability. Delivery is not guaranteed for life-safety critical operations.
            </p>
          </CardContent>
        </Card>
      </div>
    </RouteContainer>
  );
}
