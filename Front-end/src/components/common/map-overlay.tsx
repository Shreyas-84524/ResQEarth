import * as React from "react";
import {
  Plus,
  Minus,
  Navigation,
  Info,
  Waves,
  Wind,
  Activity,
  Flame,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export interface MapOverlayControlsProps {
  onZoomIn?: () => void;
  onZoomOut?: () => void;
  onLocateMe?: () => void;
  isLocating?: boolean;
  className?: string;
}

export function MapOverlayControls({
  onZoomIn,
  onZoomOut,
  onLocateMe,
  isLocating = false,
  className,
}: MapOverlayControlsProps) {
  return (
    <div
      className={cn(
        "absolute right-3 top-3 z-10 flex flex-col gap-1.5 rounded-lg border border-border/80 bg-background/90 p-1 backdrop-blur shadow-md",
        className
      )}
      role="group"
      aria-label="Map navigation controls"
    >
      {onZoomIn && (
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 rounded hover:bg-muted"
          onClick={onZoomIn}
          title="Zoom In"
          aria-label="Zoom In"
        >
          <Plus className="h-4 w-4" />
        </Button>
      )}

      {onZoomOut && (
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 rounded hover:bg-muted"
          onClick={onZoomOut}
          title="Zoom Out"
          aria-label="Zoom Out"
        >
          <Minus className="h-4 w-4" />
        </Button>
      )}

      {onLocateMe && (
        <Button
          variant="ghost"
          size="icon"
          className={cn("h-8 w-8 rounded hover:bg-muted", isLocating && "text-primary animate-spin")}
          onClick={onLocateMe}
          title="Find My Location"
          aria-label="Find My Location"
        >
          <Navigation className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}

export interface FilterChipOption {
  id: string;
  label: string;
  icon?: LucideIcon;
  count?: number;
}

export interface MapFilterChipsProps {
  options: FilterChipOption[];
  selectedId: string;
  onSelect: (id: string) => void;
  className?: string;
}

export function MapFilterChips({
  options,
  selectedId,
  onSelect,
  className,
}: MapFilterChipsProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-1.5 overflow-x-auto p-1.5 no-scrollbar",
        className
      )}
      role="tablist"
      aria-label="Disaster category filters"
    >
      {options.map((opt) => {
        const isSelected = opt.id === selectedId;
        const Icon = opt.icon;
        return (
          <button
            key={opt.id}
            type="button"
            role="tab"
            aria-selected={isSelected}
            onClick={() => onSelect(opt.id)}
            className={cn(
              "inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-1 text-xs font-medium transition-all shadow-sm",
              isSelected
                ? "bg-primary text-primary-foreground shadow"
                : "bg-background/90 text-muted-foreground hover:bg-muted hover:text-foreground border border-border/80 backdrop-blur"
            )}
          >
            {Icon && <Icon className="h-3 w-3" />}
            <span>{opt.label}</span>
            {opt.count !== undefined && (
              <span
                className={cn(
                  "rounded-full px-1.5 py-0.2 text-[10px] font-mono",
                  isSelected
                    ? "bg-primary-foreground/20 text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                )}
              >
                {opt.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

export function MapLegend({
  className,
}: {
  className?: string;
}) {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <div
      className={cn(
        "absolute bottom-4 left-4 z-10 rounded-lg border border-border/80 bg-background/95 p-2.5 backdrop-blur shadow-md max-w-[240px] text-xs",
        className
      )}
    >
      <div className="flex items-center justify-between gap-2 pb-1 border-b border-border/40">
        <span className="font-semibold flex items-center gap-1">
          <Info className="h-3.5 w-3.5 text-primary" />
          Map Legend
        </span>
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="text-[10px] text-muted-foreground hover:text-foreground"
        >
          {isOpen ? "Hide" : "Show"}
        </button>
      </div>

      {isOpen && (
        <div className="pt-2 space-y-2 text-[11px]">
          <div>
            <p className="font-medium text-muted-foreground mb-1">Severity Levels</p>
            <div className="grid grid-cols-2 gap-1 font-mono">
              <span className="flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                Low (0-20)
              </span>
              <span className="flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-sky-500" />
                Guarded (21-40)
              </span>
              <span className="flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-amber-500" />
                Moderate (41-60)
              </span>
              <span className="flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-orange-500" />
                High (61-80)
              </span>
              <span className="flex items-center gap-1 col-span-2">
                <span className="h-2 w-2 rounded-full bg-red-600" />
                Critical (81-100)
              </span>
            </div>
          </div>

          <div className="pt-1 border-t border-border/40">
            <p className="font-medium text-muted-foreground mb-1">Event Types</p>
            <div className="grid grid-cols-2 gap-1 text-[10px]">
              <span className="flex items-center gap-1">
                <Waves className="h-3 w-3 text-blue-500" /> Flood
              </span>
              <span className="flex items-center gap-1">
                <Wind className="h-3 w-3 text-teal-500" /> Cyclone
              </span>
              <span className="flex items-center gap-1">
                <Activity className="h-3 w-3 text-red-500" /> Earthquake
              </span>
              <span className="flex items-center gap-1">
                <Flame className="h-3 w-3 text-orange-500" /> Wildfire
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export function MapAttribution({
  className,
}: {
  className?: string;
}) {
  return (
    <div
      className={cn(
        "absolute bottom-1 right-2 z-10 text-[10px] text-muted-foreground/90 bg-background/80 px-1.5 py-0.5 rounded shadow-sm backdrop-blur",
        className
      )}
    >
      &copy; <a href="https://www.maptiler.com/copyright/" target="_blank" rel="noopener noreferrer" className="hover:underline">MapTiler</a> &copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer" className="hover:underline">OpenStreetMap</a> contributors | MapLibre
    </div>
  );
}
