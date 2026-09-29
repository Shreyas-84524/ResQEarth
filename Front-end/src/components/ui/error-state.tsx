import * as React from "react";
import { AlertCircle, RefreshCw, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./button";

export interface ErrorStateProps extends React.HTMLAttributes<HTMLDivElement> {
  icon?: LucideIcon;
  title?: string;
  message: string;
  correlationId?: string;
  onRetry?: () => void;
  retryLabel?: string;
}

export function ErrorState({
  icon: Icon = AlertCircle,
  title = "Something went wrong",
  message,
  correlationId,
  onRetry,
  retryLabel = "Try Again",
  className,
  ...props
}: ErrorStateProps) {
  return (
    <div
      role="alert"
      className={cn(
        "flex min-h-[220px] flex-col items-center justify-center rounded-lg border border-destructive/20 bg-destructive/5 p-8 text-center",
        className
      )}
      {...props}
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10 text-destructive mb-4">
        <Icon className="h-6 w-6" aria-hidden="true" />
      </div>
      <h4 className="text-base font-semibold text-destructive mb-1">{title}</h4>
      <p className="max-w-md text-sm text-muted-foreground mb-3">{message}</p>
      {correlationId && (
        <p className="font-mono text-xs text-muted-foreground/80 mb-4">
          Error ID: {correlationId}
        </p>
      )}
      {onRetry && (
        <Button size="sm" onClick={onRetry} variant="outline" className="gap-1.5">
          <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />
          {retryLabel}
        </Button>
      )}
    </div>
  );
}
