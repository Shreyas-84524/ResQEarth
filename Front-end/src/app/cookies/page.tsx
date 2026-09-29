import * as React from "react";
import { RouteContainer } from "@/components/layout/route-container";
import { PageHeader } from "@/components/ui/page-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function CookiesPage() {
  return (
    <RouteContainer size="sm">
      <PageHeader
        title="Cookie & Storage Preferences"
        description="Manage your local storage preferences and session preferences on ResQEarth."
        badge={<Badge variant="outline">Privacy Controls</Badge>}
      />

      <div className="mt-6 space-y-5 text-xs sm:text-sm text-muted-foreground leading-relaxed">
        <Card>
          <CardContent className="pt-6 space-y-4">
            <h3 className="font-bold text-foreground text-sm">Essential Storage Only</h3>
            <p>
              ResQEarth only uses essential browser local storage to maintain your authentication state and local disaster notification preferences. No third-party tracking cookies or advertising pixels are used.
            </p>

            <div className="flex flex-wrap gap-2 pt-2 border-t border-border/40">
              <Button size="sm" variant="default">
                Accept All
              </Button>
              <Button size="sm" variant="outline">
                Essential Only
              </Button>
              <Button size="sm" variant="secondary">
                Manage Preferences
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </RouteContainer>
  );
}
