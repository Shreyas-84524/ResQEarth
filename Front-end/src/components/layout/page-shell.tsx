import * as React from "react";
import { Navbar, type NavbarProps } from "./navbar";
import { Footer } from "./footer";

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
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground antialiased selection:bg-primary/20">
      <Navbar
        isAuthenticated={isAuthenticated}
        userRole={userRole}
        userName={userName}
        onLogout={onLogout}
        activeAlertCount={activeAlertCount}
      />
      <main id="main-content" className="flex-1">
        {children}
      </main>
      {!hideFooter && <Footer />}
    </div>
  );
}
