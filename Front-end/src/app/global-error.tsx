"use client";

import * as React from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";
import "./globals.css";

export default function RootGlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  React.useEffect(() => {
    console.error("Root Application Error:", error);
  }, [error]);

  return (
    <html lang="en">
      <body className="flex min-h-screen flex-col items-center justify-center bg-background p-6 text-center text-foreground font-sans">
        <div className="max-w-md space-y-4">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
            <AlertTriangle className="h-7 w-7" aria-hidden="true" />
          </div>
          <h1 className="text-2xl font-bold">System Error</h1>
          <p className="text-sm text-muted-foreground">
            A critical application error occurred. Please reload to restore the session.
          </p>
          <button
            type="button"
            onClick={() => reset()}
            className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90 transition-colors"
          >
            <RefreshCw className="h-4 w-4" />
            Reload ResQEarth
          </button>
        </div>
      </body>
    </html>
  );
}
