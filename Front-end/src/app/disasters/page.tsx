import * as React from "react";
import Link from "next/link";
import { RouteContainer } from "@/components/layout/route-container";
import { PageHeader } from "@/components/ui/page-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Waves, Wind, Activity, Mountain, SunMedium, Biohazard, ArrowRight } from "lucide-react";

export default function DisastersIndexPage() {
  const coreDisasters = [
    { slug: "flood", title: "Flood & Urban Flooding", icon: Waves, description: "Preparedness for river discharge, cloudbursts, and urban waterlogging." },
    { slug: "cyclone", title: "Cyclone & Storm Surges", icon: Wind, description: "Safety protocols for severe cyclonic storms and coastal surges." },
    { slug: "earthquake", title: "Earthquake & Seismic Hazard", icon: Activity, description: "Drop, cover, and hold on procedures during seismic tremors." },
    { slug: "landslide", title: "Landslide & Slope Hazards", icon: Mountain, description: "Early warning signs and evacuation for hilly terrain." },
    { slug: "heat-wave", title: "Heat Wave & Extreme Heat", icon: SunMedium, description: "Protection from thermal stress, dehydration, and sunstroke." },
    { slug: "chemical-leak", title: "Chemical Leak & Industrial Safety", icon: Biohazard, description: "Hazard isolation and emergency protocols for toxic releases." },
  ];

  return (
    <RouteContainer>
      <PageHeader
        title="Disaster Preparedness Knowledge Portal"
        description="Comprehensive guides covering mitigation, preparedness, warning signs, and emergency actions."
        badge={<Badge variant="outline">Educational Library</Badge>}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mt-6">
        {coreDisasters.map((d) => {
          const Icon = d.icon;
          return (
            <Card key={d.slug} className="hover:border-primary/50 transition-all">
              <CardHeader className="pb-2">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Icon className="h-5 w-5" />
                  </div>
                  <CardTitle className="text-base font-bold">{d.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <CardDescription className="text-xs">{d.description}</CardDescription>
                <Link
                  href={`/disasters/${d.slug}`}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
                >
                  Read Safety Guide <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </RouteContainer>
  );
}
