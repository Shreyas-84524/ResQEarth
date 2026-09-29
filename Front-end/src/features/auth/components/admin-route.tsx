"use client";

import * as React from "react";
import { ProtectedRoute, type ProtectedRouteProps } from "./protected-route";

export interface AdminRouteProps extends Omit<ProtectedRouteProps, "allowedRoles"> {
  children: React.ReactNode;
}

/**
 * AdminRoute Guard
 * Restricts route access strictly to users with the "admin" role.
 * Citizens attempting to access this route receive the AccessDenied view.
 */
export function AdminRoute({
  children,
  loadingFallback,
  deniedFallback,
  redirectToLogin = true,
}: AdminRouteProps) {
  return (
    <ProtectedRoute
      allowedRoles={["admin"]}
      loadingFallback={loadingFallback}
      deniedFallback={deniedFallback}
      redirectToLogin={redirectToLogin}
    >
      {children}
    </ProtectedRoute>
  );
}
