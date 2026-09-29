import * as React from "react";
import Link from "next/link";
import {
  Compass,
  Home,
  Map,
  Flame,
  Building2,
  PhoneCall,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-[75vh] w-full flex-col items-center justify-center p-6 text-center">
      <div className="max-w-lg space-y-6">
        {/* Icon & 404 Heading */}
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <Compass className="h-8 w-8 animate-spin-slow" aria-hidden="true" />
        </div>

        <div className="space-y-2">
          <span className="font-mono text-xs font-bold uppercase tracking-widest text-primary">
            404 Page Not Found
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
            Location Not Found
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            The page or resource you are looking for does not exist, has been moved, or is temporarily unavailable.
          </p>
        </div>

        {/* Action Button */}
        <div className="flex items-center justify-center gap-3">
          <Button asChild className="gap-2">
            <Link href="/">
              <Home className="h-4 w-4" />
              Return to Homepage
            </Link>
          </Button>
          <Button variant="outline" asChild className="gap-2">
            <Link href="/map">
              <Map className="h-4 w-4" />
              Open Live Map
            </Link>
          </Button>
        </div>

        {/* Helpful Quick Navigation Links */}
        <div className="rounded-lg border border-border/80 bg-card p-4 text-left shadow-sm">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2.5">
            Quick Navigation
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            <Link
              href="/disasters"
              className="flex items-center gap-2 rounded p-2 hover:bg-muted transition-colors text-foreground"
            >
              <Flame className="h-4 w-4 text-orange-500" />
              <span>Disaster Guides</span>
            </Link>
            <Link
              href="/government-response"
              className="flex items-center gap-2 rounded p-2 hover:bg-muted transition-colors text-foreground"
            >
              <Building2 className="h-4 w-4 text-indigo-500" />
              <span>Government Bodies</span>
            </Link>
            <Link
              href="/history"
              className="flex items-center gap-2 rounded p-2 hover:bg-muted transition-colors text-foreground"
            >
              <Compass className="h-4 w-4 text-sky-500" />
              <span>Disaster History</span>
            </Link>
            <Link
              href="/about"
              className="flex items-center gap-2 rounded p-2 hover:bg-muted transition-colors text-foreground"
            >
              <Home className="h-4 w-4 text-emerald-500" />
              <span>About ResQEarth</span>
            </Link>
          </div>
        </div>

        {/* Emergency Note */}
        <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
          <PhoneCall className="h-3.5 w-3.5 text-red-600" />
          <span>Need immediate emergency assistance? Call <strong className="text-foreground">112</strong></span>
        </div>
      </div>
    </div>
  );
}
