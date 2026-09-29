import * as React from "react";
import { RouteContainer } from "@/components/layout/route-container";
import { PageHeader } from "@/components/ui/page-header";
import { Badge } from "@/components/ui/badge";
import { ShieldAlert, BookOpen, Laptop } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AboutPage() {
  return (
    <RouteContainer size="sm">
      <PageHeader
        title="About ResQEarth"
        description="Smart Disaster Intelligence, Preparedness, and Emergency Warning Decision-Support Platform."
        badge={<Badge variant="outline">Project Documentation</Badge>}
      />

      <div className="mt-6 space-y-6 text-sm text-muted-foreground leading-relaxed">
        {/* Project Context */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-primary" />
              Academic & Environmental Science Context
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-xs sm:text-sm">
            <p>
              ResQEarth is developed as a Second-Year Engineering Environmental Science (ESE) project focused on disaster management, environmental risk modeling, community awareness, and resilient public systems.
            </p>
            <p>
              The platform addresses the complete disaster lifecycle: <strong>Mitigation → Preparedness → Early Warning → Response → Recovery & Awareness</strong>.
            </p>
          </CardContent>
        </Card>

        {/* Technology Stack */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Laptop className="h-4 w-4 text-primary" />
              Technology Architecture
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-xs sm:text-sm">
            <p>
              Built using Next.js, React, TypeScript, Tailwind CSS, MapLibre GL JS, and the Firebase platform. Integrates public feeds from Open-Meteo, USGS, NASA EONET, and NDMA SACHET.
            </p>
          </CardContent>
        </Card>

        {/* Official Systems Disclaimer */}
        <div className="rounded-lg border border-amber-200 dark:border-amber-900 bg-amber-50/50 dark:bg-amber-950/20 p-4 text-xs space-y-2">
          <div className="flex items-center gap-2 text-amber-800 dark:text-amber-400 font-bold">
            <ShieldAlert className="h-4 w-4" />
            Official Authority Disclaimer
          </div>
          <p className="text-amber-900/80 dark:text-amber-300/80">
            ResQEarth is an educational and research decision-support tool. It is not an official government emergency authority. During actual disasters, citizens must obey announcements from official emergency authorities (NDMA, IMD, NDRF) and local emergency services.
          </p>
        </div>
      </div>
    </RouteContainer>
  );
}
