"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ShieldAlert,
  X,
  Home,
  Map,
  Flame,
  History,
  Building2,
  Info,
  LayoutDashboard,
  AlertTriangle,
  User,
  Shield,
  LogOut,
  PhoneCall,
  LogIn,
  UserPlus,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { UserRole } from "@/types";

export interface MobileNavProps {
  isOpen: boolean;
  onClose: () => void;
  isAuthenticated?: boolean;
  userRole?: UserRole | null;
  userName?: string;
  onLogout?: () => void;
  activeAlertCount?: number;
}

export function MobileNav({
  isOpen,
  onClose,
  isAuthenticated = false,
  userRole = null,
  userName = "Citizen",
  onLogout,
  activeAlertCount = 0,
}: MobileNavProps) {
  const pathname = usePathname();

  // Close on escape key
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Lock body scroll when open
  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const publicLinks = [
    { href: "/", label: "Home", icon: Home },
    { href: "/map", label: "Live Map", icon: Map },
    { href: "/disasters", label: "Disaster Knowledge", icon: Flame },
    { href: "/history", label: "Indian Disaster History", icon: History },
    { href: "/government-response", label: "Government Bodies", icon: Building2 },
    { href: "/about", label: "About ResQEarth", icon: Info },
  ];

  const authLinks = [
    { href: "/dashboard", label: "Citizen Dashboard", icon: LayoutDashboard },
    { href: "/alerts", label: "My Regional Alerts", icon: AlertTriangle, badge: activeAlertCount > 0 ? activeAlertCount : undefined },
    { href: "/profile", label: "Profile & Preferences", icon: User },
  ];

  return (
    <div className="fixed inset-0 z-50 md:hidden" role="dialog" aria-modal="true">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Slide-out Drawer */}
      <div className="fixed inset-y-0 right-0 z-50 flex w-full max-w-xs flex-col bg-background shadow-xl border-l border-border animate-in slide-in-from-right duration-200">
        {/* Drawer Header */}
        <div className="flex h-16 items-center justify-between border-b border-border/80 px-5">
          <Link
            href="/"
            onClick={onClose}
            className="flex items-center gap-2"
            aria-label="ResQEarth Home"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <ShieldAlert className="h-4 w-4" />
            </div>
            <span className="text-base font-bold text-foreground">
              ResQEarth
            </span>
          </Link>

          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-2 text-muted-foreground hover:bg-muted hover:text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* User Status Header if authenticated */}
        {isAuthenticated && (
          <div className="border-b border-border/60 bg-muted/30 px-5 py-3 flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold text-sm">
              {userName.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground truncate">{userName}</p>
              <Badge variant="outline" className="text-[10px] px-1.5 py-0 uppercase">
                {userRole || "citizen"}
              </Badge>
            </div>
          </div>
        )}

        {/* Nav Links Scroll Area */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-6">
          {/* Public Navigation */}
          <div>
            <span className="px-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Explore ResQEarth
            </span>
            <div className="mt-2 space-y-1">
              {publicLinks.map((link) => {
                const Icon = link.icon;
                const isActive =
                  link.href === "/"
                    ? pathname === "/"
                    : pathname.startsWith(link.href);

                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={onClose}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                      isActive
                        ? "bg-primary/10 text-primary font-bold"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    )}
                    aria-current={isActive ? "page" : undefined}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    <span>{link.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Authenticated Links if logged in */}
          {isAuthenticated && (
            <div>
              <span className="px-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Citizen Portal
              </span>
              <div className="mt-2 space-y-1">
                {authLinks.map((link) => {
                  const Icon = link.icon;
                  const isActive = pathname.startsWith(link.href);

                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={onClose}
                      className={cn(
                        "flex items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                        isActive
                          ? "bg-primary/10 text-primary font-bold"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground"
                      )}
                      aria-current={isActive ? "page" : undefined}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="h-4 w-4 shrink-0" />
                        <span>{link.label}</span>
                      </div>
                      {link.badge && (
                        <Badge variant="destructive" className="h-4 px-1 text-[10px]">
                          {link.badge}
                        </Badge>
                      )}
                    </Link>
                  );
                })}

                {userRole === "admin" && (
                  <Link
                    href="/admin"
                    onClick={onClose}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-bold transition-colors",
                      pathname.startsWith("/admin")
                        ? "bg-purple-100 text-purple-900 dark:bg-purple-950 dark:text-purple-300"
                        : "text-purple-700 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-950/50"
                    )}
                  >
                    <Shield className="h-4 w-4 shrink-0" />
                    <span>Admin Control Center</span>
                  </Link>
                )}
              </div>
            </div>
          )}

          {/* Emergency Hotlines Action Banner */}
          <div className="rounded-lg border border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950/30 p-3">
            <div className="flex items-center gap-2 text-red-700 dark:text-red-400 font-bold text-xs mb-1">
              <PhoneCall className="h-3.5 w-3.5" />
              Emergency Helpline
            </div>
            <p className="text-[11px] text-muted-foreground mb-2">
              National Emergency Number: <strong className="text-foreground">112</strong>
            </p>
            <a
              href="tel:112"
              className="inline-flex w-full items-center justify-center rounded bg-red-600 hover:bg-red-700 text-white text-xs font-bold py-1.5 transition-colors"
            >
              Call 112
            </a>
          </div>
        </div>

        {/* Drawer Footer (Auth buttons or Logout) */}
        <div className="border-t border-border/80 p-4">
          {!isAuthenticated ? (
            <div className="flex flex-col gap-2">
              <Button asChild className="w-full justify-center">
                <Link href="/signup" onClick={onClose}>
                  <UserPlus className="mr-2 h-4 w-4" />
                  Sign Up
                </Link>
              </Button>
              <Button variant="outline" asChild className="w-full justify-center">
                <Link href="/login" onClick={onClose}>
                  <LogIn className="mr-2 h-4 w-4" />
                  Log In
                </Link>
              </Button>
            </div>
          ) : (
            <Button
              variant="outline"
              onClick={() => {
                onClose();
                onLogout?.();
              }}
              className="w-full justify-center text-destructive hover:bg-destructive/10 border-destructive/30"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Log Out
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
