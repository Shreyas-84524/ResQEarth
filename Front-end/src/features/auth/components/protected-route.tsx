"use client";

import * as React from "react";
import { useRouter, usePathname } from "next/navigation";
import { ShieldCheck, Loader2 } from "lucide-react";
import { useAuth } from "../hooks/use-auth";
import { AccessDenied } from "./access-denied";
import type { UserRole } from "@/types";

export interface ProtectedRouteProps {
  children: React.ReactNode;
  /**
   * Allowed roles for this route.
   * Default: ['citizen', 'admin'] (any authenticated user).
   */
  allowedRoles?: UserRole[];
  /**
   * Optional custom loading fallback rendered during auth hydration.
   */
  loadingFallback?: React.ReactNode;
  /**
   * Optional custom component rendered when user role is not authorized.
   */
  deniedFallback?: React.ReactNode;
  /**
   * Whether to automatically redirect unauthenticated users to /login?redirect=...
   * Default: true
   */
  redirectToLogin?: boolean;
}

/**
 * Default Loading Shell shown while auth session and Firestore profile are hydrating.
 * Prevents content flash and visual layout jumping.
 */
function RouteGuardLoadingSkeleton() {
  return (
    <div
      role="status"
      aria-live="polite"
      className="flex min-h-[60vh] flex-col items-center justify-center p-6 text-center"
    >
      <div className="relative mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary shadow-sm">
        <ShieldCheck className="h-7 w-7 animate-pulse text-primary" aria-hidden="true" />
        <Loader2 className="absolute -top-1 -right-1 h-5 w-5 animate-spin text-primary" aria-hidden="true" />
      </div>
      <h2 className="text-base font-semibold text-foreground">
        Verifying Security Clearance
      </h2>
      <p className="mt-1 text-xs text-muted-foreground max-w-xs">
        Checking active session credentials and authorization permissions...
      </p>
      <span className="sr-only">Loading protected page and verifying credentials...</span>
    </div>
  );
}

export function ProtectedRoute({
  children,
  allowedRoles = ["citizen", "admin"],
  loadingFallback,
  deniedFallback,
  redirectToLogin = true,
}: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, role } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [hasMounted, setHasMounted] = React.useState(false);

  React.useEffect(() => {
    setHasMounted(true);
  }, []);

  // Handle automatic redirect to login for unauthenticated visitors
  React.useEffect(() => {
    if (!hasMounted || isLoading) return;

    if (!isAuthenticated && redirectToLogin) {
      const redirectParam = pathname ? `?redirect=${encodeURIComponent(pathname)}` : "";
      router.replace(`/login${redirectParam}`);
    }
  }, [hasMounted, isLoading, isAuthenticated, redirectToLogin, pathname, router]);

  // Render loading fallback while checking session or before initial client mount
  if (!hasMounted || isLoading) {
    return <>{loadingFallback ?? <RouteGuardLoadingSkeleton />}</>;
  }

  // If not authenticated, render loading state while redirect is in flight
  if (!isAuthenticated) {
    return <>{loadingFallback ?? <RouteGuardLoadingSkeleton />}</>;
  }

  // Resolve active role from Firestore profile (defaults to citizen if logged in)
  const resolvedRole: UserRole = role ?? "citizen";

  // Check role authorization
  const isAuthorized = allowedRoles.includes(resolvedRole);

  if (!isAuthorized) {
    return (
      <>
        {deniedFallback ?? (
          <AccessDenied currentRole={resolvedRole} requiredRoles={allowedRoles} />
        )}
      </>
    );
  }

  return <>{children}</>;
}
