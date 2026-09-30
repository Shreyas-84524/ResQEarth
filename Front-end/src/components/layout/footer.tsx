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
    <footer className="w-full border-t border-[#E7EAE7] bg-[#FAFBFA] text-[#0A0A0A]">
      {/* Central Environmental Mission Strip per design.md Section 23 */}
      <div className="border-b border-[#E7EAE7] bg-white py-6 px-4 text-center">
        <p className="text-xs sm:text-sm font-semibold tracking-[0.12em] text-[#137D43] uppercase flex items-center justify-center gap-2">
          <span>🌿</span>
          <span>Cleaner Earth • Healthier Lives • Sustainable Future</span>
          <span>🌿</span>
        </p>
      </div>

      {/* Official Systems Emergency Disclaimer Banner */}
      <div className="border-b border-[#E7EAE7] bg-[#E8FAD9]/40 py-3.5 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-left text-xs text-[#4D514F]">
          <div className="flex items-center gap-2">
            <AlertOctagon className="h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
            <span>
              <strong>Academic Decision-Support:</strong> ResQEarth is an educational environmental risk project and does not replace statutory NDMA / IMD emergency decrees.
            </span>
          </div>
          <div className="flex items-center gap-1.5 font-semibold text-[#0A0A0A] shrink-0">
            <PhoneCall className="h-3.5 w-3.5 text-red-600" />
            <span>National Emergency: <strong className="text-red-600 font-mono">112</strong></span>
          </div>
        </div>
      </div>

      {/* Main 4-Column Footer Content */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
          {/* Column 1: Project Identity & Mission */}
          <div className="space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#E8FAD9] text-[#0B8F2F]">
                <ShieldAlert className="h-5 w-5" aria-hidden="true" />
              </div>
              <span className="text-xl font-bold tracking-tight text-[#0A0A0A]">ResQEarth</span>
            </div>
            <p className="text-sm text-[#4D514F] leading-relaxed">
              Disaster intelligence, multi-hazard environmental risk awareness, explainable safety indicators, and emergency communication for resilient communities.
            </p>
            <div className="rounded-[12px] bg-white p-3.5 text-xs text-[#4D514F] border border-[#EEF1EE] shadow-sm">
              <p className="font-semibold text-[#0A0A0A]">Academic Context</p>
              <p className="text-xs mt-0.5">Second-Year Engineering ESE Mini Project — Disaster Risk Reduction & Environmental Science.</p>
            </div>
          </div>

          {/* Column 2: Disaster Safety Guides */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#0A0A0A] mb-3.5">
              Disaster Preparedness
            </h4>
            <ul className="space-y-2.5 text-sm text-[#4D514F]">
              <li>
                <Link href="/disasters/flood" className="hover:text-[#0B8F2F] transition-colors">
                  Flood Safety & River Flow
                </Link>
              </li>
              <li>
                <Link href="/disasters/cyclone" className="hover:text-[#0B8F2F] transition-colors">
                  Cyclone & Severe Storms
                </Link>
              </li>
              <li>
                <Link href="/disasters/earthquake" className="hover:text-[#0B8F2F] transition-colors">
                  Earthquake & Seismic Activity
                </Link>
              </li>
              <li>
                <Link href="/disasters/landslide" className="hover:text-[#0B8F2F] transition-colors">
                  Landslide & Slope Hazards
                </Link>
              </li>
              <li>
                <Link href="/disasters/heat-wave" className="hover:text-[#0B8F2F] transition-colors">
                  Heat Wave & Thermal Risk
                </Link>
              </li>
              <li>
                <Link href="/disasters" className="font-semibold text-[#0B8F2F] hover:underline inline-flex items-center gap-1">
                  All 22 Disaster Guides →
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Response & Government Bodies */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#0A0A0A] mb-3.5">
              Statutory Authorities
            </h4>
            <ul className="space-y-2.5 text-sm text-[#4D514F]">
              <li>
                <Link href="/government-response" className="hover:text-[#0B8F2F] transition-colors">
                  Government Response Directory
                </Link>
              </li>
              <li>
                <Link href="/history" className="hover:text-[#0B8F2F] transition-colors">
                  Indian Disaster History Timeline
                </Link>
              </li>
              <li>
                <a
                  href="https://sachet.ndma.gov.in/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 hover:text-[#0B8F2F] transition-colors"
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
                  className="inline-flex items-center gap-1 hover:text-[#0B8F2F] transition-colors"
                >
                  IMD Mausam Portal
                  <ExternalLink className="h-3 w-3" />
                </a>
              </li>
              <li>
                <a
                  href="https://earthquake.usgs.gov/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 hover:text-[#0B8F2F] transition-colors"
                >
                  USGS Seismology Feed
                  <ExternalLink className="h-3 w-3" />
                </a>
              </li>
            </ul>
          </div>

          {/* Column 4: Platform, Legal & Disclosures */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#0A0A0A] mb-3.5">
              Platform & Privacy
            </h4>
            <ul className="space-y-2.5 text-sm text-[#4D514F]">
              <li>
                <Link href="/about" className="hover:text-[#0B8F2F] transition-colors">
                  About ResQEarth & DRR
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-[#0B8F2F] transition-colors">
                  Privacy Policy (DPDP Act)
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-[#0B8F2F] transition-colors">
                  Terms of Service & Safety
                </Link>
              </li>
              <li>
                <Link href="/cookies" className="hover:text-[#0B8F2F] transition-colors">
                  Cookie Preferences Center
                </Link>
              </li>
              <li>
                <Link href="/map" className="hover:text-[#0B8F2F] transition-colors">
                  Live GIS Hazard Map
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 border-t border-[#E7EAE7] pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#4D514F]">
          <p>© 2026 ResQEarth. Built for environmental science and community disaster resilience.</p>
          <p className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-[#0B8F2F]" />
            <span>MapLibre GL JS & OpenStreetMap</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
