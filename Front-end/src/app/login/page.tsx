import * as React from "react";
import Link from "next/link";
import { RouteContainer } from "@/components/layout/route-container";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LogIn, ShieldCheck } from "lucide-react";

export default function LoginPage() {
  return (
    <RouteContainer size="sm">
      <div className="mx-auto max-w-md py-6 sm:py-10">
        <Card className="shadow-md">
          <CardHeader className="space-y-1 text-center">
            <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary mb-2">
              <LogIn className="h-5 w-5" />
            </div>
            <CardTitle className="text-2xl font-bold">Sign In to ResQEarth</CardTitle>
            <CardDescription className="text-xs">
              Access personalized risk assessments, saved locations, and emergency notification settings.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" required>Email Address</Label>
              <Input id="email" type="email" placeholder="citizen@example.com" disabled />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" required>Password</Label>
              </div>
              <Input id="password" type="password" placeholder="••••••••" disabled />
            </div>
            <div className="rounded-md bg-muted/50 p-2.5 text-xs text-muted-foreground border border-border/50">
              <p className="flex items-center gap-1.5 font-medium text-foreground">
                <ShieldCheck className="h-4 w-4 text-emerald-600" />
                Phase 1.5 Authentication Shell
              </p>
              <p className="mt-0.5">Firebase Email/Password Authentication logic will be connected in Phase 1.5.</p>
            </div>
            <Button className="w-full" disabled>
              Sign In (Phase 1.5)
            </Button>
          </CardContent>
          <CardFooter className="flex justify-center text-xs text-muted-foreground border-t border-border/40 pt-4">
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="font-semibold text-primary hover:underline ml-1">
              Sign Up
            </Link>
          </CardFooter>
        </Card>
      </div>
    </RouteContainer>
  );
}
