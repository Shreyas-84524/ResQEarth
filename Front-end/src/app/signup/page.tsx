import * as React from "react";
import Link from "next/link";
import { RouteContainer } from "@/components/layout/route-container";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UserPlus, ShieldCheck } from "lucide-react";

export default function SignupPage() {
  return (
    <RouteContainer size="sm">
      <div className="mx-auto max-w-md py-6 sm:py-10">
        <Card className="shadow-md">
          <CardHeader className="space-y-1 text-center">
            <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary mb-2">
              <UserPlus className="h-5 w-5" />
            </div>
            <CardTitle className="text-2xl font-bold">Create Citizen Account</CardTitle>
            <CardDescription className="text-xs">
              Register for regional disaster warnings and explainable risk calculations.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3.5">
            <div className="space-y-1.5">
              <Label htmlFor="name" required>Full Name</Label>
              <Input id="name" placeholder="Citizen Name" disabled />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="phone" required>Phone Number (for SMS Alerts)</Label>
              <Input id="phone" placeholder="+91 98765 43210" disabled />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="email" required>Email Address</Label>
              <Input id="email" type="email" placeholder="citizen@example.com" disabled />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password" required>Password</Label>
              <Input id="password" type="password" placeholder="••••••••" disabled />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="confirmPassword" required>Confirm Password</Label>
              <Input id="confirmPassword" type="password" placeholder="••••••••" disabled />
            </div>
            <div className="rounded-md bg-muted/50 p-2.5 text-xs text-muted-foreground border border-border/50">
              <p className="flex items-center gap-1.5 font-medium text-foreground">
                <ShieldCheck className="h-4 w-4 text-emerald-600" />
                Phase 1.4 Registration Shell
              </p>
              <p className="mt-0.5">Zod validation, Firestore profile creation, and consent preferences connect in Phase 1.4.</p>
            </div>
            <Button className="w-full" disabled>
              Create Account (Phase 1.4)
            </Button>
          </CardContent>
          <CardFooter className="flex justify-center text-xs text-muted-foreground border-t border-border/40 pt-4">
            Already have an account?{" "}
            <Link href="/login" className="font-semibold text-primary hover:underline ml-1">
              Sign In
            </Link>
          </CardFooter>
        </Card>
      </div>
    </RouteContainer>
  );
}
