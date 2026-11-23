"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ShieldAlert,
  Menu,
  AlertTriangle,
  User,
  LogOut,
  LayoutDashboard,
  Shield,
  ChevronDown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MobileNav } from "./mobile-nav";
import type { UserRole } from "@/types";

export interface NavbarProps {
  isAuthenticated?: boolean;
  userRole?: UserRole | null;
  userName?: string;
  onLogout?: () => void;
  activeAlertCount?: number;
}

export function Navbar({
  isAuthenticated = false,
  userRole = null,
  userName = "Citizen",
  onLogout,
  activeAlertCount = 0,
}: NavbarProps) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = React.useState(false);

  // Close dropdowns on route change
  React.useEffect(() => {
    setMobileMenuOpen(false);
    setUserDropdownOpen(false);
  }, [pathname]);

  const publicNavLinks = [
    { href: "/", label: "Home" },
    { href: "/map", label: "Live Map" },
    { href: "/disasters", label: "Disasters" },
    { href: "/history", label: "History" },
    { href: "/government-response", label: "Government Bodies" },
    { href: "/about", label: "About" },
  ];

  const authNavLinks = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/alerts", label: "Alerts", icon: AlertTriangle, badge: activeAlertCount > 0 ? activeAlertCount : undefined },
  ];

  const adminNavLinks = [
    { href: "/admin", label: "Admin Console", icon: Shield, badge: "ADMIN" },
  ];

  return (
    <>
      {/* Skip to main content link for keyboard accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground focus:shadow-lg"
      >
        Skip to main content
      </a>

      <header className="sticky top-0 z-40 w-full border-b border-border/80 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Brand Logo */}
          <Link
            href="/"
            className="flex items-center gap-2.5 transition-opacity hover:opacity-90"
            aria-label="ResQEarth Home"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
              <ShieldAlert className="h-5 w-5" aria-hidden="true" />
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-bold tracking-tight text-foreground leading-none">
                ResQEarth
              </span>
              <span className="text-[10px] font-medium text-muted-foreground tracking-wide uppercase">
                Disaster Intelligence
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav
            className="hidden md:flex items-center gap-1 lg:gap-2"
            aria-label="Main Navigation"
          >
            {publicNavLinks.map((link) => {
              const isActive =
                link.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(link.href);

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "px-3 py-1.5 rounded-md text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary/10 text-primary font-semibold"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                  aria-current={isActive ? "page" : undefined}
                >
                  {link.label}
                </Link>
              );
            })}

            {/* Authenticated Links (Dashboard, Alerts) if signed in */}
            {isAuthenticated &&
              authNavLinks.map((link) => {
                const isActive = pathname.startsWith(link.href);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={cn(
                      "px-3 py-1.5 rounded-md text-sm font-medium transition-colors flex items-center gap-1.5",
                      isActive
                        ? "bg-primary/10 text-primary font-semibold"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    )}
                    aria-current={isActive ? "page" : undefined}
                  >
                    <span>{link.label}</span>
                    {link.badge && (
                      <Badge variant="destructive" className="h-4 px-1 text-[10px]">
                        {link.badge}
                      </Badge>
                    )}
                  </Link>
                );
              })}

            {/* Admin Link if role is admin */}
            {isAuthenticated &&
              userRole === "admin" &&
              adminNavLinks.map((link) => {
                const isActive = pathname.startsWith(link.href);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={cn(
                      "px-3 py-1.5 rounded-md text-sm font-medium transition-colors flex items-center gap-1.5",
                      isActive
                        ? "bg-purple-100 text-purple-900 dark:bg-purple-950 dark:text-purple-300 font-bold"
                        : "text-purple-700 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-950/50"
                    )}
                    aria-current={isActive ? "page" : undefined}
                  >
                    <Shield className="h-3.5 w-3.5" />
                    <span>{link.label}</span>
                  </Link>
                );
              })}
          </nav>

          {/* Desktop Auth / User Action Buttons */}
          <div className="hidden md:flex items-center gap-2.5">
            {!isAuthenticated ? (
              <>
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/login">Log In</Link>
                </Button>
                <Button size="sm" asChild>
                  <Link href="/signup">Sign Up</Link>
                </Button>
              </>
            ) : (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 rounded-full border border-border p-1.5 pr-3 hover:bg-muted transition-colors focus:outline-none focus:ring-2 focus:ring-ring"
                  aria-expanded={userDropdownOpen}
                  aria-haspopup="true"
                  aria-label="User profile menu"
                >
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-primary-foreground font-semibold text-xs">
                    {userName.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-xs font-medium text-foreground max-w-[100px] truncate">
                    {userName}
                  </span>
                  <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                </button>

                {/* User Dropdown Menu */}
                {userDropdownOpen && (
                  <div
                    className="absolute right-0 mt-2 w-48 rounded-lg border border-border bg-background p-1.5 shadow-lg z-50 animate-in fade-in-50 zoom-in-95"
                    role="menu"
                  >
                    <div className="px-2.5 py-1.5 border-b border-border/50 mb-1">
                      <p className="text-xs font-semibold text-foreground truncate">{userName}</p>
                      <p className="text-[10px] text-muted-foreground uppercase">{userRole || "citizen"}</p>
                    </div>

                    <Link
                      href="/dashboard"
                      className="flex items-center gap-2 rounded-md px-2.5 py-1.5 text-xs text-foreground hover:bg-muted transition-colors"
                      role="menuitem"
                    >
                      <LayoutDashboard className="h-3.5 w-3.5 text-muted-foreground" />
                      Dashboard
                    </Link>

                    <Link
                      href="/profile"
                      className="flex items-center gap-2 rounded-md px-2.5 py-1.5 text-xs text-foreground hover:bg-muted transition-colors"
                      role="menuitem"
                    >
                      <User className="h-3.5 w-3.5 text-muted-foreground" />
                      Profile & Consent
                    </Link>

                    {userRole === "admin" && (
                      <Link
                        href="/admin"
                        className="flex items-center gap-2 rounded-md px-2.5 py-1.5 text-xs font-semibold text-purple-700 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-950/50 transition-colors"
                        role="menuitem"
                      >
                        <Shield className="h-3.5 w-3.5" />
                        Admin Console
                      </Link>
                    )}

                    <div className="border-t border-border/50 my-1" />

                    <button
                      type="button"
                      onClick={() => {
                        setUserDropdownOpen(false);
                        onLogout?.();
                      }}
                      className="w-full flex items-center gap-2 rounded-md px-2.5 py-1.5 text-xs text-destructive hover:bg-destructive/10 transition-colors"
                      role="menuitem"
                    >
                      <LogOut className="h-3.5 w-3.5" />
                      Log Out
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Mobile Menu Hamburger Button */}
          <div className="flex md:hidden items-center gap-2">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="rounded-md p-2 text-foreground hover:bg-muted focus:outline-none focus:ring-2 focus:ring-ring"
              aria-label="Open mobile menu"
              aria-expanded={mobileMenuOpen}
            >
              <Menu className="h-6 w-6" aria-hidden="true" />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Navigation Drawer */}
      <MobileNav
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        isAuthenticated={isAuthenticated}
        userRole={userRole}
        userName={userName}
        onLogout={onLogout}
        activeAlertCount={activeAlertCount}
      />
    </>
  );
}
