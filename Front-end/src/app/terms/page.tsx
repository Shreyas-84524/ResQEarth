import * as React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { RouteContainer } from "@/components/layout/route-container";
import { PageHeader } from "@/components/ui/page-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ShieldAlert, AlertTriangle, Scale, CheckCircle2 } from "lucide-react";

export const metadata: Metadata = {
  title: "Terms of Service | ResQEarth",
  description:
    "Terms of service and safety disclaimers governing the use of the ResQEarth academic disaster intelligence platform.",
};

export default function TermsPage() {
  return (
    <RouteContainer size="lg">
      <PageHeader
        title="Terms of Service & Safety Disclaimers"
        description="Conditions governing the educational and analytical use of ResQEarth disaster intelligence tools."
        badge={<Badge variant="outline">Academic Terms of Use</Badge>}
      />

      <div className="mt-8 space-y-6 text-xs sm:text-sm text-muted-foreground leading-relaxed">
        {/* Important Warning Callout */}
        <div className="rounded-xl border border-red-300 dark:border-red-900 bg-red-50/50 dark:bg-red-950/20 p-4 sm:p-5 space-y-2">
          <div className="flex items-center gap-2 text-red-700 dark:text-red-400 font-bold text-sm">
            <ShieldAlert className="h-5 w-5 shrink-0" />
            <span>CRITICAL SAFETY &amp; EMERGENCY DISCLAIMER</span>
          </div>
          <p className="text-foreground/90">
            ResQEarth is an academic decision-support prototype. It does <strong>NOT</strong> constitute a statutory early warning authority. In all active disaster emergencies, citizens must prioritize announcements issued by the <strong>National Disaster Management Authority (NDMA)</strong>, <strong>India Meteorological Department (IMD)</strong>, and <strong>District Emergency Operations Centers (112 / 1070 / 1077)</strong>.
          </p>
        </div>

        <Card>
          <CardContent className="pt-6 space-y-6">
            <div className="space-y-2">
              <h3 className="font-bold text-foreground text-sm flex items-center gap-2">
                <Scale className="h-4 w-4 text-primary" />
                1. Acceptance of Terms &amp; Scope of Use
              </h3>
              <p>
                By accessing or registering an account on ResQEarth, you agree to these Terms of Service. ResQEarth is made available freely for educational research, public safety awareness, and disaster preparedness training.
              </p>
            </div>

            <div className="space-y-2 pt-4 border-t">
              <h3 className="font-bold text-foreground text-sm flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-600" />
                2. Algorithmic Risk Scores vs. Statutory Decrees
              </h3>
              <p>
                The platform generates algorithmic risk scores (&quot;RESQEARTH CALCULATED RISK&quot;) utilizing third-party scientific APIs (USGS, Open-Meteo, NASA EONET). While every effort is made to ensure low latency and accuracy, calculated risk scores represent model estimates and should not be relied upon as the sole basis for life-safety critical actions without government corroboration.
              </p>
            </div>

            <div className="space-y-2 pt-4 border-t">
              <h3 className="font-bold text-foreground text-sm flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                3. Prohibited Misuse &amp; Security Standards
              </h3>
              <p>Users of ResQEarth agree NOT to:</p>
              <ul className="list-disc list-inside space-y-1 pl-2">
                <li>Submit fabricated disaster reports, hoax SOS distress beacons, or fake chemical leak warnings.</li>
                <li>Attempt unauthorized privilege escalation or access admin management consoles without permission.</li>
                <li>Execute automated scraping bots or denial-of-service attacks against API endpoints.</li>
                <li>Distort or misrepresent educational risk data as official statutory evacuation mandates.</li>
              </ul>
            </div>

            <div className="space-y-2 pt-4 border-t">
              <h3 className="font-bold text-foreground text-sm flex items-center gap-2">
                <ShieldAlert className="h-4 w-4 text-primary" />
                4. Limitation of Liability
              </h3>
              <p>
                To the maximum extent permitted by applicable law, the authors, academic institutions, and contributors of ResQEarth shall not be held liable for any direct, indirect, incidental, or consequential damages resulting from network interruptions, third-party API outages, SMS gateway delays, or actions taken based on platform content.
              </p>
            </div>

            <div className="space-y-2 pt-4 border-t">
              <h3 className="font-bold text-foreground text-sm">5. Academic Project Attribution</h3>
              <p>
                ResQEarth is developed under the Second-Year Engineering Environmental Science &amp; Engineering curriculum. Review our <Link href="/about" className="text-primary underline">About Page</Link> for detailed curriculum alignment and institutional context.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </RouteContainer>
  );
}
