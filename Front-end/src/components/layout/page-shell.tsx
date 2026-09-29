"use client";

import * as React from "react";
import { Navbar, type NavbarProps } from "./navbar";
import { Footer } from "./footer";
import { useAuth } from "@/features/auth";

export interface PageShellProps extends NavbarProps {
  children: React.ReactNode;
  hideFooter?: boolean;
}

export function PageShell({
  children,
  hideFooter = false,
  isAuthenticated,
  userRole,
  userName,
  onLogout,
  activeAlertCount,
}: PageShellProps) {
  const auth = useAuth();

  const resolvedIsAuthenticated = isAuthenticated ?? auth.isAuthenticated;
  const resolvedUserRole = userRole ?? auth.role;
  const resolvedUserName =
    userName ?? auth.profile?.name ?? auth.user?.displayName ?? "Citizen";
  const resolvedOnLogout = onLogout ?? auth.logout;

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground antialiased selection:bg-primary/20">
      <Navbar
        isAuthenticated={resolvedIsAuthenticated}
        userRole={resolvedUserRole}
        userName={resolvedUserName}
        onLogout={resolvedOnLogout}
        activeAlertCount={activeAlertCount}
      />
      <main id="main-content" className="flex-1">
        {children}
      </main>
      {!hideFooter && <Footer />}
    </div>
  );
}
