import * as React from "react";
import { ShieldAlert } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function GlobalLoading() {
  return (
    <div
      className="flex min-h-[70vh] w-full flex-col items-center justify-center p-6"
      role="status"
      aria-live="polite"
    >
      <div className="flex flex-col items-center space-y-4 max-w-sm w-full text-center">
        {/* Animated Brand Icon */}
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-md animate-bounce">
          <ShieldAlert className="h-7 w-7" aria-hidden="true" />
        </div>

        <div className="space-y-1">
          <h3 className="text-base font-bold text-foreground">
            Loading ResQEarth
          </h3>
          <p className="text-xs text-muted-foreground">
            Synchronizing environmental data and regional feeds...
          </p>
        </div>

        {/* Loading Skeleton Placeholders */}
        <div className="w-full space-y-2 pt-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6 mx-auto" />
          <Skeleton className="h-4 w-4/6 mx-auto" />
        </div>

        <span className="sr-only">Loading page content, please wait...</span>
      </div>
    </div>
  );
}
