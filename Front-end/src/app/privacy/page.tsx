import * as React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { RouteContainer } from "@/components/layout/route-container";
import { PageHeader } from "@/components/ui/page-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ShieldCheck, Lock, MapPin, Bell, PhoneCall, Database } from "lucide-react";

export const metadata: Metadata = {
  title: "Privacy Policy | ResQEarth",
  description:
    "Data privacy policy for ResQEarth detailing geolocation consent, emergency SMS notification handling, and DPDP Act 2023 compliance.",
};

export default function PrivacyPage() {
  return (
    <RouteContainer size="lg">
      <PageHeader
        title="Privacy Policy & Data Governance"
        description="Transparent data practices, geolocation permissions, emergency SMS consent, and Digital Personal Data Protection (DPDP) Act compliance."
        badge={<Badge variant="outline">DPDP Act 2023 Compliant</Badge>}
      />

      <div className="mt-8 space-y-6 text-xs sm:text-sm text-muted-foreground leading-relaxed">
        {/* Core Principles Header */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl border bg-muted/20 space-y-1.5">
            <div className="flex items-center gap-2 font-bold text-foreground text-xs">
              <MapPin className="h-4 w-4 text-primary" />
              1. Explicit Geolocation
            </div>
            <p className="text-xs text-muted-foreground">
              Location coordinates are requested strictly on-demand for nearby hazard distance calculations. No continuous background tracking is performed.
            </p>
          </div>

          <div className="p-4 rounded-xl border bg-muted/20 space-y-1.5">
            <div className="flex items-center gap-2 font-bold text-foreground text-xs">
              <Bell className="h-4 w-4 text-emerald-600" />
              2. Granular Notification Consent
            </div>
            <p className="text-xs text-muted-foreground">
              Citizens maintain independent controls over browser push alerts and emergency warning SMS messages.
            </p>
          </div>

          <div className="p-4 rounded-xl border bg-muted/20 space-y-1.5">
            <div className="flex items-center gap-2 font-bold text-foreground text-xs">
              <Lock className="h-4 w-4 text-indigo-600" />
              3. Zero Commercial Monetization
            </div>
            <p className="text-xs text-muted-foreground">
              User coordinates, phone numbers, and activity logs are never sold, rented, or shared with third-party advertisers.
            </p>
          </div>
        </div>

        {/* Detailed Policy Sections */}
        <Card>
          <CardContent className="pt-6 space-y-6">
            <div className="space-y-2">
              <h3 className="font-bold text-foreground text-sm flex items-center gap-2">
                <Database className="h-4 w-4 text-primary" />
                1. Data Collection &amp; Specific Purposes
              </h3>
              <p>
                ResQEarth processes personal data solely for the provision of life-safety early warnings and disaster preparedness education. Collected data categories include:
              </p>
              <ul className="list-disc list-inside space-y-1 pl-2">
                <li>
                  <strong>Account Identification:</strong> Email address, name, and role (Citizen or Admin) secured via Firebase Authentication.
                </li>
                <li>
                  <strong>Geographic Coordinates:</strong> User latitude, longitude, and detected city/state for matching against active disaster polygons and radial impact buffers.
                </li>
                <li>
                  <strong>Emergency Phone Numbers:</strong> Mobile numbers provided voluntarily for receiving high-severity disaster SMS warnings.
                </li>
                <li>
                  <strong>Device Push Tokens:</strong> Firebase Cloud Messaging (FCM) device registration tokens for browser alert delivery.
                </li>
              </ul>
            </div>

            <div className="space-y-2 pt-4 border-t">
              <h3 className="font-bold text-foreground text-sm flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-emerald-600" />
                2. Geolocation Privacy &amp; On-Device Processing
              </h3>
              <p>
                ResQEarth respects location privacy. Location data is collected only after explicit browser permission prompts. Citizens may choose to revoke location access at any time or manually input their city name. Distance to earthquake epicenters and cyclonic eye paths is computed deterministically using standard mathematical formulas (Haversine).
              </p>
            </div>

            <div className="space-y-2 pt-4 border-t">
              <h3 className="font-bold text-foreground text-sm flex items-center gap-2">
                <PhoneCall className="h-4 w-4 text-amber-600" />
                3. Emergency SMS Communications Policy
              </h3>
              <p>
                SMS messages are restricted strictly to <strong>CRITICAL</strong> and <strong>HIGH</strong> severity emergency warnings impacting the user&apos;s registered geographic zone. ResQEarth never sends promotional, commercial, or marketing SMS. Citizens can opt out of SMS alerts at any time via their <Link href="/profile" className="text-primary underline">Profile Settings</Link>.
              </p>
            </div>

            <div className="space-y-2 pt-4 border-t">
              <h3 className="font-bold text-foreground text-sm flex items-center gap-2">
                <Lock className="h-4 w-4 text-primary" />
                4. Citizen Data Rights (DPDP Act, 2023)
              </h3>
              <p>
                In compliance with India&apos;s Digital Personal Data Protection Act (2023), citizens possess the right to:
              </p>
              <ul className="list-disc list-inside space-y-1 pl-2">
                <li>Access and review all personal data stored in their profile.</li>
                <li>Request immediate correction or updating of outdated contact details.</li>
                <li>Request account deletion and complete erasure of stored profile data.</li>
                <li>Manage cookie and client storage preferences via the <Link href="/cookies" className="text-primary underline">Cookie Preference Center</Link>.</li>
              </ul>
            </div>

            <div className="space-y-2 pt-4 border-t">
              <h3 className="font-bold text-foreground text-sm">5. Academic Prototype Context</h3>
              <p>
                ResQEarth is developed as an academic project for Environmental Science &amp; Engineering. All telemetry and data pipelines operate in a sandbox environment designed for educational demonstration and decision-support modeling.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </RouteContainer>
  );
}
