import * as React from "react";
import Link from "next/link";
import {
  ShieldAlert,
  PhoneCall,
  ExternalLink,
  AlertOctagon,
} from "lucide-react";

export function Footer() {
  return (
    <footer className="w-full border-t border-border/80 bg-background/95 text-foreground">
      {/* Official Systems Emergency Disclaimer Banner */}
      <div className="border-b border-border/60 bg-muted/40 py-3.5 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-left text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <AlertOctagon className="h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
            <span>
              <strong>Educational Disclaimer:</strong> ResQEarth is an academic decision-support platform and does not replace official warnings from NDMA or IMD.
            </span>
          </div>
          <div className="flex items-center gap-1.5 font-semibold text-foreground shrink-0">
            <PhoneCall className="h-3.5 w-3.5 text-red-600" />
            <span>Emergency Services: <strong className="text-red-600 font-mono">112</strong></span>
          </div>
        </div>
      </div>

      {/* Main 4-Column Footer Content */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
          {/* Column 1: Project Identity & Mission */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <ShieldAlert className="h-4 w-4" aria-hidden="true" />
              </div>
              <span className="text-lg font-bold tracking-tight">ResQEarth</span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Smart disaster intelligence, multi-source environmental risk awareness, explainable safety indicators, and emergency communication for resilient communities.
            </p>
            <div className="rounded-md bg-muted/50 p-2.5 text-[11px] text-muted-foreground border border-border/50">
              <p className="font-semibold text-foreground">Academic Context</p>
              <p>Second-Year Engineering ESE Mini Project — Disaster Management & Environmental Science.</p>
            </div>
          </div>

          {/* Column 2: Disaster Safety Guides */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-foreground mb-3">
              Disaster Preparedness
            </h4>
            <ul className="space-y-2 text-xs text-muted-foreground">
              <li>
                <Link href="/disasters/flood" className="hover:text-primary transition-colors">
                  Flood Safety & River Flow
                </Link>
              </li>
              <li>
                <Link href="/disasters/cyclone" className="hover:text-primary transition-colors">
                  Cyclone & Severe Storms
                </Link>
              </li>
              <li>
                <Link href="/disasters/earthquake" className="hover:text-primary transition-colors">
                  Earthquake & Seismic Activity
                </Link>
              </li>
              <li>
                <Link href="/disasters/landslide" className="hover:text-primary transition-colors">
                  Landslide & Slope Hazards
                </Link>
              </li>
              <li>
                <Link href="/disasters/heat-wave" className="hover:text-primary transition-colors">
                  Heat Wave & Thermal Risk
                </Link>
              </li>
              <li>
                <Link href="/disasters/chemical-leak" className="hover:text-primary transition-colors">
                  Chemical Leak & Industrial Safety
                </Link>
              </li>
              <li>
                <Link href="/disasters" className="font-semibold text-primary hover:underline">
                  All Disaster Guides →
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Response & Government Bodies */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-foreground mb-3">
              Official Agencies & Data
            </h4>
            <ul className="space-y-2 text-xs text-muted-foreground">
              <li>
                <Link href="/government-response" className="hover:text-primary transition-colors">
                  Government Response Directory
                </Link>
              </li>
              <li>
                <Link href="/history" className="hover:text-primary transition-colors">
                  Indian Disaster History Timeline
                </Link>
              </li>
              <li>
                <a
                  href="https://sachet.ndma.gov.in/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 hover:text-primary transition-colors"
                >
                  NDMA SACHET Portal
                  <ExternalLink className="h-3 w-3" />
                </a>
              </li>
              <li>
                <a
                  href="https://mausam.imd.gov.in/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 hover:text-primary transition-colors"
                >
                  IMD Mausam Portal
                  <ExternalLink className="h-3 w-3" />
                </a>
              </li>
              <li>
                <a
                  href="https://open-meteo.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 hover:text-primary transition-colors"
                >
                  Open-Meteo Weather API
                  <ExternalLink className="h-3 w-3" />
                </a>
              </li>
              <li>
                <a
                  href="https://earthquake.usgs.gov/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 hover:text-primary transition-colors"
                >
                  USGS Earthquake Hazard Feed
                  <ExternalLink className="h-3 w-3" />
                </a>
              </li>
            </ul>
          </div>

          {/* Column 4: Platform, Legal & Disclosures */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-foreground mb-3">
              Platform & Legal
            </h4>
            <ul className="space-y-2 text-xs text-muted-foreground">
              <li>
                <Link href="/about" className="hover:text-primary transition-colors">
                  About the Project
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-primary transition-colors">
                  Privacy Policy & Data Use
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-primary transition-colors">
                  Terms of Service & Disclaimers
                </Link>
              </li>
              <li>
                <Link href="/cookies" className="hover:text-primary transition-colors">
                  Cookie Preferences
                </Link>
              </li>
              <li>
                <Link href="/map" className="hover:text-primary transition-colors">
                  Interactive GIS Map
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-primary transition-colors">
                  Citizen Sign In
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-10 border-t border-border/60 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground">
          <p>© 2026 ResQEarth. Built for academic research and environmental disaster preparedness.</p>
          <p className="flex items-center gap-1">
            <span>Coordinates WGS84</span>
            <span>•</span>
            <span>OSM MapLibre Basemap</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
