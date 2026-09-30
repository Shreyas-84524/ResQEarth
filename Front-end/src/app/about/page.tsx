import * as React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { RouteContainer } from "@/components/layout/route-container";
import { PageHeader } from "@/components/ui/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Globe,
  Leaf,
  Layers,
  Activity,
  Shield,
  ShieldAlert,
  Radio,
  Cpu,
  Database,
  MapPin,
  BookOpen,
  HeartHandshake,
  Workflow,
} from "lucide-react";

export const metadata: Metadata = {
  title: "About ResQEarth | Environmental Science & Engineering Platform",
  description:
    "Comprehensive documentation of ResQEarth — Smart Disaster Intelligence, Preparedness and Emergency Warning Decision-Support Platform developed for Environmental Science & Engineering (ESE).",
};

export default function AboutPage() {
  const disasterCycleStages = [
    {
      stage: "1. Prevention & Mitigation",
      icon: Shield,
      color: "text-blue-600 bg-blue-50 dark:bg-blue-950/50 dark:text-blue-400",
      description:
        "Structural engineering reinforcements (seismic retrofitting, anti-hail nets, flood dykes) and non-structural hazard zoning regulations prohibiting construction in active floodways and high-susceptibility landslide slopes.",
    },
    {
      stage: "2. Disaster Preparedness",
      icon: BookOpen,
      color: "text-indigo-600 bg-indigo-50 dark:bg-indigo-950/50 dark:text-indigo-400",
      description:
        "Community training (Aapda Mitra), pre-positioning emergency grab bags, multi-channel early warning siren testing, shelter route mapping, and hospital surge capacity planning.",
    },
    {
      stage: "3. Warning & Surveillance",
      icon: Radio,
      color: "text-amber-600 bg-amber-50 dark:bg-amber-950/50 dark:text-amber-400",
      description:
        "Continuous multi-sensor ingestion (Doppler radars, seismometers, river telemetry, satellite thermal hotspots), spatial buffer matching, and deterministic risk score computation.",
    },
    {
      stage: "4. Emergency Response",
      icon: Activity,
      color: "text-red-600 bg-red-50 dark:bg-red-950/50 dark:text-red-400",
      description:
        "Rapid mobilization of NDRF / SDRF battalions, targeted geo-fenced citizen evacuation broadcasts via SMS/FCM, Golden Hour trauma care, and emergency shelter operations.",
    },
    {
      stage: "5. Recovery & Build-Back-Better",
      icon: HeartHandshake,
      color: "text-emerald-600 bg-emerald-50 dark:bg-emerald-950/50 dark:text-emerald-400",
      description:
        "Eco-restoration of riparian wetlands and mangrove shelterbelts, resilient infrastructure reconstruction, psychosocial rehabilitation, and environmental bioremediation.",
    },
  ];

  const itCapabilities = [
    {
      title: "Heterogeneous Multi-Source Ingestion",
      icon: Database,
      desc: "Synthesizes real-time data feeds from USGS (Earthquakes), NASA EONET (Global Natural Events), Open-Meteo (Hydrometeorology & Severe Weather), and Indian CAP Sachet feeds into a unified schema.",
    },
    {
      title: "Geospatial GIS Buffering & Proximity",
      icon: MapPin,
      desc: "Executes precise spherical Haversine distance computations and multi-ring radial hazard polygons to identify communities falling within danger zones in real-time.",
    },
    {
      title: "Deterministic Risk Engine",
      icon: Cpu,
      desc: "Applies transparent, audited risk-scoring algorithms factoring hazard severity, distance attenuation, and historical vulnerability to produce 'RESQEARTH CALCULATED RISK' metrics.",
    },
    {
      title: "Multi-Channel Emergency Alerting",
      icon: Radio,
      desc: "Dispatches high-priority web push notifications (FCM) and integrates SMS gateway fallback architectures to reach citizens even during low-bandwidth conditions.",
    },
  ];

  return (
    <RouteContainer size="lg">
      <PageHeader
        title="About ResQEarth"
        description="Smart Disaster Intelligence, Preparedness, and Emergency Warning Decision-Support Platform developed for Environmental Science & Engineering (ESE)."
        badge={<Badge variant="outline">ESE Curriculum Project</Badge>}
      />

      <div className="mt-8 space-y-8">
        {/* Executive Summary & Mission */}
        <div className="rounded-[20px] bg-gradient-to-r from-[#04411F] via-[#08752A] to-[#0B8F2F] text-white p-8 sm:p-10 space-y-4 shadow-[0_10px_30px_rgba(4,65,31,0.15)]">
          <div className="flex items-center gap-2 text-[#BDF58E] font-semibold text-xs uppercase tracking-wider">
            <Globe className="h-4 w-4" />
            Project Mission & Core Objective
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            Empowering Resilient Communities Through Environmental Intelligence & Real-Time Warning
          </h2>
          <p className="text-sm text-white/90 leading-relaxed max-w-3xl">
            ResQEarth bridges the critical gap between complex environmental sensor telemetry and actionable citizen preparedness. By synthesizing satellite earth observations, seismic feeds, hydrological models, and historical hazard profiles into a unified geospatial GIS interface, ResQEarth democratizes disaster awareness and accelerates life-saving emergency actions.
          </p>
        </div>

        {/* ESE Curriculum Core: 5 Stages of Disaster Management */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Workflow className="h-5 w-5 text-[#0B8F2F]" />
            <h3 className="text-lg font-bold text-[#0A0A0A]">The Five Stages of the Disaster Management Cycle</h3>
          </div>
          <p className="text-sm text-[#4D514F] leading-relaxed">
            In modern Environmental Engineering, disaster risk reduction (DRR) has transformed from a purely reactive post-event relief model into an integrated, proactive cyclical paradigm.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
            {disasterCycleStages.map((s, idx) => {
              const Icon = s.icon;
              return (
                <Card key={idx} className="rounded-[14px] border border-[#EEF1EE] bg-white hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)] hover:-translate-y-0.5 transition-all duration-[180ms]">
                  <CardHeader className="pb-2">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#E8FAD9] text-[#0B8F2F] shrink-0">
                        <Icon className="h-5 w-5" />
                      </div>
                      <CardTitle className="text-sm font-bold text-[#0A0A0A]">{s.stage}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-xs text-[#4D514F] leading-relaxed">{s.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Role of Information Technology & GIS */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Layers className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-bold">Role of Information Technology & GIS in Disaster Risk Reduction</h3>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
            Information Technology serves as the backbone of contemporary emergency response by converting raw, distributed geospatial telemetry into actionable spatial intelligence within seconds.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            {itCapabilities.map((item, idx) => {
              const Icon = item.icon;
              return (
                <div key={idx} className="p-4 rounded-xl border bg-muted/20 space-y-2">
                  <div className="flex items-center gap-2 font-bold text-xs sm:text-sm text-foreground">
                    <Icon className="h-4 w-4 text-primary shrink-0" />
                    <span>{item.title}</span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Environmental Science & Ecological Drivers */}
        <Card className="border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/20 dark:bg-emerald-950/10">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-bold flex items-center gap-2 text-emerald-800 dark:text-emerald-400">
              <Leaf className="h-5 w-5 text-emerald-600" />
              Environmental Science & Ecological Vulnerabilities
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-xs sm:text-sm leading-relaxed">
            <p className="text-foreground">
              Disasters are rarely purely natural phenomena; their frequency, intensity, and destructive footprint are heavily exacerbated by anthropogenic ecological degradation and climate dynamics:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
              <div className="p-3 rounded-lg bg-background border space-y-1">
                <div className="font-bold text-xs text-emerald-700 dark:text-emerald-400">
                  Catchment & Wetland Encroachment
                </div>
                <p className="text-[11px] text-muted-foreground">
                  Destruction of natural sponge wetlands and unscientific floodplain building increases urban flood peak discharges by over 300%.
                </p>
              </div>

              <div className="p-3 rounded-lg bg-background border space-y-1">
                <div className="font-bold text-xs text-emerald-700 dark:text-emerald-400">
                  Deforestation & Hillslope Shear Failure
                </div>
                <p className="text-[11px] text-muted-foreground">
                  Removal of deep-rooted native tree canopies in high-gradient mountain terrains directly accelerates topsoil saturation and mass debris flows.
                </p>
              </div>

              <div className="p-3 rounded-lg bg-background border space-y-1">
                <div className="font-bold text-xs text-emerald-700 dark:text-emerald-400">
                  Marine Warming & Rapid Cyclogenesis
                </div>
                <p className="text-[11px] text-muted-foreground">
                  Elevated Sea Surface Temperatures (SSTs &gt; 29°C) in the Arabian Sea and Bay of Bengal drive rapid storm intensification within 24-hour windows.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* System Boundaries: Calculated Risk vs Official Alerts */}
        <Card className="border-blue-200 dark:border-blue-900/60">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm sm:text-base font-bold flex items-center gap-2">
              <Shield className="h-4 w-4 text-primary" />
              Algorithmic Risk Scoring vs. Statutory Official Alerts
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-xs sm:text-sm text-muted-foreground leading-relaxed">
            <p>
              ResQEarth strictly maintains a clear architectural distinction between <strong>Official Government Warnings</strong> (statutory broadcasts issued by NDMA, IMD, CWC, INCOIS) and <strong>RESQEARTH CALCULATED RISK</strong> (automated multi-sensor algorithmic risk indices).
            </p>
            <p>
              Calculated risk algorithms utilize distance attenuation, environmental baseline thresholds, and USGS/NASA telemetry to provide early situational awareness. However, statutory evacuation orders and emergency declarations remain the sole constitutional prerogative of District Magistrates and State Disaster Management Authorities.
            </p>
          </CardContent>
        </Card>

        {/* Statutory Disclaimer & Project Context */}
        <div className="rounded-xl border border-amber-300 dark:border-amber-800 bg-amber-50/60 dark:bg-amber-950/30 p-5 space-y-3 text-xs leading-relaxed">
          <div className="flex items-center gap-2 text-amber-800 dark:text-amber-300 font-bold text-sm">
            <ShieldAlert className="h-5 w-5 shrink-0" />
            <span>Academic Project Attribution & Statutory Disclaimer</span>
          </div>
          <p className="text-foreground/90">
            <strong>ResQEarth</strong> is an academic engineering research and educational prototype developed for the Second-Year Engineering Environmental Science &amp; Engineering (ESE) curriculum.
          </p>
          <p className="text-muted-foreground">
            It is designed as an analytical decision-support and community awareness tool. It is <strong>NOT</strong> a certified replacement for official emergency sirens or statutory government warning bulletins. In any real-world emergency, citizens must strictly follow the official instructions issued by the <strong>National Disaster Management Authority (NDMA)</strong>, <strong>India Meteorological Department (IMD)</strong>, <strong>State / District Administration</strong>, or dial <strong>112</strong>.
          </p>
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Button size="sm" variant="outline" asChild className="text-xs h-8 bg-background">
              <Link href="/disasters">Explore Disaster Safety Guides</Link>
            </Button>
            <Button size="sm" variant="outline" asChild className="text-xs h-8 bg-background">
              <Link href="/government-response">View Government Directory</Link>
            </Button>
            <Button size="sm" variant="outline" asChild className="text-xs h-8 bg-background">
              <Link href="/history">View Indian Disaster History</Link>
            </Button>
          </div>
        </div>
      </div>
    </RouteContainer>
  );
}
