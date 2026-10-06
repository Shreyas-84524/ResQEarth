import * as React from "react";
import { cn } from "@/lib/utils";
import { AlertTriangle, KeyRound, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface MapErrorFallbackProps {
  className?: string;
  error?: string;
  title?: string;
  isConfigError?: boolean;
  onRetry?: () => void;
}

export function MapErrorFallback({
  className,
  error,
  title,
  isConfigError = false,
  onRetry,
}: MapErrorFallbackProps) {
  if (isConfigError) {
    return (
      <div
        className={cn(
          "relative flex h-full min-h-[380px] w-full flex-col items-center justify-center p-6 text-center rounded-xl border border-amber-500/30 bg-amber-500/5 text-foreground shadow-sm",
          className
        )}
        role="alert"
        aria-live="polite"
      >
        <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
          <KeyRound className="h-6 w-6" />
        </div>

        <h3 className="text-base font-bold text-foreground">
          {title || "MapTiler API Key Required"}
        </h3>

        <p className="mt-1.5 max-w-md text-xs text-muted-foreground leading-relaxed">
          {error ||
            "MapTiler API key is not configured. To render the interactive vector basemap without watermark or broken tiles, add your free key to your local environment."}
        </p>

        <div className="mt-4 max-w-md rounded-lg border border-border/80 bg-background/80 px-3.5 py-2.5 text-left text-[11px] font-mono shadow-xs backdrop-blur">
          <p className="text-muted-foreground text-[10px] mb-1 font-sans">
            Add to <span className="font-semibold text-foreground">Front-end/.env.local</span>:
          </p>
          <code className="text-primary font-semibold select-all break-all">
            NEXT_PUBLIC_MAPTILER_API_KEY=&lt;your_maptiler_key&gt;
          </code>
        </div>

        {onRetry && (
          <Button
            variant="outline"
            size="sm"
            onClick={onRetry}
            className="mt-4 gap-1.5 text-xs h-8"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Check Configuration & Retry
          </Button>
        )}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "relative flex h-full min-h-[380px] w-full flex-col items-center justify-center p-6 text-center rounded-xl border border-destructive/30 bg-destructive/5 text-foreground shadow-sm",
        className
      )}
      role="alert"
    >
      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10 text-destructive border border-destructive/20">
        <AlertTriangle className="h-6 w-6" />
      </div>

      <h3 className="text-base font-bold text-foreground">
        {title || "Map Engine Initialization Failed"}
      </h3>

      <p className="mt-1 max-w-md text-xs text-muted-foreground leading-relaxed">
        {error ||
          "WebGL is either disabled or unsupported by your graphics hardware/browser. Ensure hardware acceleration is enabled to view interactive vector maps."}
      </p>

      {onRetry && (
        <Button
          variant="outline"
          size="sm"
          onClick={onRetry}
          className="mt-4 gap-1.5 text-xs"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Retry Initialization
        </Button>
      )}
    </div>
  );
}
