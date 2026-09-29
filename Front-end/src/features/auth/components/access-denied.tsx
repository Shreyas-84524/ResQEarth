"use client";

import * as React from "react";
import Link from "next/link";
import { ShieldAlert, LayoutDashboard, Home, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import type { UserRole } from "@/types";

export interface AccessDeniedProps {
  currentRole?: UserRole | null;
  requiredRoles?: UserRole[];
  title?: string;
  description?: string;
  showReturnDashboard?: boolean;
  showReturnHome?: boolean;
}

export function AccessDenied({
  currentRole = "citizen",
  requiredRoles = ["admin"],
  title = "Access Denied",
  description,
  showReturnDashboard = true,
  showReturnHome = true,
}: AccessDeniedProps) {
  const formattedRequiredRoles = requiredRoles.join(", ");
  const defaultDescription =
    `You are currently signed in with the role "${currentRole || "citizen"}". ` +
    `This section requires ${formattedRequiredRoles} privileges.`;

  return (
    <div
      role="alert"
      aria-live="polite"
      className="flex min-h-[65vh] items-center justify-center px-4 py-12"
    >
      <Card className="w-full max-w-lg border-destructive/30 bg-card/95 shadow-float backdrop-blur">
        <CardHeader className="text-center pb-4">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-destructive/10 text-destructive shadow-sm ring-8 ring-destructive/5">
            <ShieldAlert className="h-8 w-8" aria-hidden="true" />
          </div>

          <div className="flex items-center justify-center gap-2 mb-2">
            <Badge variant="destructive" className="uppercase font-semibold tracking-wider text-[11px] px-2.5 py-0.5">
              Restricted Area
            </Badge>
            <Badge variant="outline" className="text-[11px] px-2 py-0.5">
              <Lock className="mr-1 h-3 w-3" />
              Role Guard
            </Badge>
          </div>

          <CardTitle className="text-2xl font-bold tracking-tight text-foreground">
            {title}
          </CardTitle>

          <CardDescription className="text-sm text-muted-foreground mt-2 leading-relaxed">
            {description || defaultDescription}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="rounded-lg border border-border/80 bg-muted/40 p-4 text-xs space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground font-medium">Your Active Role:</span>
              <span className="font-mono font-semibold uppercase text-foreground bg-background px-2 py-0.5 rounded border border-border">
                {currentRole || "unassigned"}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground font-medium">Required Authorization:</span>
              <span className="font-mono font-semibold uppercase text-destructive bg-destructive/5 px-2 py-0.5 rounded border border-destructive/20">
                {formattedRequiredRoles}
              </span>
            </div>
          </div>

          <p className="text-[11px] text-muted-foreground text-center leading-relaxed">
            Administrative credentials are securely assigned through vetted government channels and verified backend processes. Public accounts cannot request privilege elevation.
          </p>
        </CardContent>

        <CardFooter className="flex flex-col sm:flex-row gap-2.5 pt-2">
          {showReturnDashboard && (
            <Button asChild className="w-full sm:flex-1">
              <Link href="/dashboard">
                <LayoutDashboard className="mr-2 h-4 w-4" />
                Citizen Dashboard
              </Link>
            </Button>
          )}

          {showReturnHome && (
            <Button variant="outline" asChild className="w-full sm:flex-1">
              <Link href="/">
                <Home className="mr-2 h-4 w-4" />
                Return Home
              </Link>
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
