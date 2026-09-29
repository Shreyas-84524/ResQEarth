import * as React from "react";
import { cn } from "@/lib/utils";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export function MapErrorFallback({
  className,
  error,
  onRetry,
}: {
  className?: string;
  error?: string;
  onRetry?: () => void;
}) {
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
        Map Engine Initialization Failed
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
