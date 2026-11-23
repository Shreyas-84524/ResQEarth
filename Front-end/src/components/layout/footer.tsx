import Link from "next/link";
import { ExternalLink, Phone, ShieldAlert } from "lucide-react";

const productLinks = [
  ["Live hazard map", "/map"],
  ["Preparedness library", "/disasters"],
  ["Indian disaster history", "/history"],
  ["Government directory", "/government-response"],
];

const policyLinks = [
  ["About the project", "/about"],
  ["Privacy", "/privacy"],
  ["Terms & safety", "/terms"],
  ["Cookie preferences", "/cookies"],
];

export function Footer() {
  return (
    <footer className="mt-16 border-t border-slate-800 bg-slate-950 text-slate-300">
      <div className="mx-auto max-w-screen-2xl px-5 py-12 sm:px-8 lg:px-10 lg:py-16">
        <div className="grid gap-10 lg:grid-cols-[1.4fr_.8fr_.8fr_1fr]">
          <div className="max-w-md">
            <Link href="/" className="inline-flex items-center gap-3 text-white">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 ring-1 ring-white/10">
                <ShieldAlert className="h-5 w-5 text-teal-300" />
              </span>
              <span>
                <strong className="block text-lg font-semibold tracking-tight">ResQEarth</strong>
                <span className="block text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">Public safety intelligence</span>
              </span>
            </Link>
            <p className="mt-5 text-sm leading-6 text-slate-400">
              A transparent disaster-awareness platform combining verified public data, explainable regional risk and practical preparedness guidance.
            </p>
            <div className="mt-6 inline-flex items-center gap-3 rounded-lg border border-red-400/20 bg-red-400/10 px-4 py-3">
              <Phone className="h-4 w-4 text-red-300" />
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-red-300">National emergency</p>
                <p className="font-mono text-lg font-semibold text-white">112</p>
              </div>
            </div>
          </div>

          <FooterColumn title="Platform" links={productLinks} />
          <FooterColumn title="Policy" links={policyLinks} />

          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Official sources</p>
            <div className="mt-4 space-y-3 text-sm">
              {[
                ["NDMA SACHET", "https://sachet.ndma.gov.in/"],
                ["India Meteorological Department", "https://mausam.imd.gov.in/"],
                ["USGS Earthquake Program", "https://earthquake.usgs.gov/"],
              ].map(([label, href]) => (
                <a key={label} href={href} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-slate-400 transition-colors hover:text-white">
                  {label}<ExternalLink className="h-3 w-3" />
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-4 border-t border-slate-800 pt-6 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 ResQEarth · Engineering ESE academic project</p>
          <p className="max-w-2xl sm:text-right">Educational decision support only. Always follow verified instructions from NDMA, IMD and local authorities.</p>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({ title, links }: { title: string; links: string[][] }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">{title}</p>
      <ul className="mt-4 space-y-3 text-sm">
        {links.map(([label, href]) => (
          <li key={href}>
            <Link href={href} className="text-slate-400 transition-colors hover:text-white">{label}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
