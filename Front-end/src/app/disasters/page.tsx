import * as React from "react";
import type { Metadata } from "next";
import { RouteContainer } from "@/components/layout/route-container";
import { BookOpen, SearchCheck } from "lucide-react";
import { getAllDisasterGuides } from "@/features/disasters/services/knowledge-service";
import { DisasterPortalClient } from "@/features/disasters/components/knowledge/disaster-portal-client";

export const metadata: Metadata = {
  title: "Disaster Preparedness Knowledge Portal | ResQEarth",
  description:
    "Comprehensive guides covering environmental factors, early warning signs, mitigation strategies, SOPs, and emergency kits for 22 natural and man-made disasters.",
};

export default function DisastersIndexPage() {
  const allGuides = getAllDisasterGuides();

  return (
    <RouteContainer size="lg" className="space-y-8">
      <section className="overflow-hidden rounded-2xl bg-slate-950 px-7 py-10 text-white sm:px-12 sm:py-14">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-teal-300"><BookOpen className="h-3.5 w-3.5" /> Preparedness library</div>
            <h1 className="mt-4 max-w-4xl text-4xl font-semibold tracking-[-0.04em] sm:text-5xl">Guidance for the moment it matters.</h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-300">Evidence-informed warning signs, response steps, emergency kits and recovery guidance for natural and industrial hazards.</p>
          </div>
          <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-300">
            <SearchCheck className="h-5 w-5 text-teal-300" />
            <span><strong className="block text-white">{allGuides.length} reviewed guides</strong>Natural and man-made hazards</span>
          </div>
        </div>
      </section>

      <div>
        <DisasterPortalClient initialGuides={allGuides} />
      </div>
    </RouteContainer>
  );
}
