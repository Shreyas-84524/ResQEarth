import * as React from "react";
import Link from "next/link";
import { RouteContainer } from "@/components/layout/route-container";
import { PageHeader } from "@/components/ui/page-header";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { Flame, PhoneCall, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return [
    { slug: "flood" },
    { slug: "cyclone" },
    { slug: "earthquake" },
    { slug: "landslide" },
    { slug: "heat-wave" },
    { slug: "chemical-leak" },
  ];
}

export default async function DisasterDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const formattedTitle = slug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

  return (
    <RouteContainer size="sm">
      <div className="mb-4">
        <Button variant="ghost" size="sm" asChild className="gap-1.5 -ml-3">
          <Link href="/disasters">
            <ArrowLeft className="h-4 w-4" />
            Back to Disasters
          </Link>
        </Button>
      </div>

      <PageHeader
        title={`${formattedTitle} Preparedness Guide`}
        description={`Comprehensive safety precautions, environmental factors, emergency kit checklist, and response procedures for ${formattedTitle.toLowerCase()}.`}
        badge={<Badge variant="outline">Phase 4 Content Shell</Badge>}
      />

      <div className="mt-6 space-y-6">
        <EmptyState
          icon={Flame}
          title={`${formattedTitle} Guide Ready for Content`}
          description="Detailed before, during, and after guidance, verified emergency helplines, and government references will be populated in Phase 4."
        />

        {/* Emergency contact box */}
        <div className="rounded-lg border border-red-200 dark:border-red-900 bg-red-50/50 dark:bg-red-950/20 p-4 text-xs">
          <div className="flex items-center gap-2 text-red-600 font-bold mb-1">
            <PhoneCall className="h-4 w-4" />
            National Emergency Helpline: 112
          </div>
          <p className="text-muted-foreground">
            In an active crisis, contact emergency services immediately or follow instructions from the National Disaster Management Authority (NDMA).
          </p>
        </div>
      </div>
    </RouteContainer>
  );
}
