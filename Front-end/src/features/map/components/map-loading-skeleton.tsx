import * as React from "react";
import { cn } from "@/lib/utils";
import { Compass } from "lucide-react";

export function MapLoadingSkeleton({
  className,
  message = "Loading MapLibre GIS Engine...",
}: {
  className?: string;
  message?: string;
}) {
  return (
    <div
      className={cn(
        "relative flex h-full min-h-[380px] w-full flex-col items-center justify-center overflow-hidden rounded-xl border border-border/80 bg-slate-950 text-slate-100 shadow-inner",
        className
      )}
      role="status"
      aria-label="Loading geospatial map"
    >
      {/* Background Grid Pattern */}
      <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:24px_24px]" />

      {/* Pulsing radar ring */}
      <div className="relative mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 border border-primary/30 backdrop-blur shadow-lg">
        <div className="absolute h-full w-full rounded-2xl bg-primary/20 animate-ping opacity-30" />
        <Compass className="h-8 w-8 text-sky-400 animate-spin" style={{ animationDuration: "3s" }} />
      </div>

      <p className="text-sm font-semibold tracking-tight text-slate-200">
        {message}
      </p>
      <p className="mt-1 text-xs text-slate-400">
        Initializing OpenStreetMap base layer and GIS coordinates...
      </p>
      <span className="sr-only">Map is loading</span>
    </div>
  );
}
