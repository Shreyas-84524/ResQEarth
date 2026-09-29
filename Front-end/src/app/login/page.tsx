import type { Metadata } from "next";
import { Suspense } from "react";
import { RouteContainer } from "@/components/layout/route-container";
import { LoginForm } from "@/features/auth";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

export const metadata: Metadata = {
  title: "Sign In | ResQEarth",
  description:
    "Sign in to your ResQEarth account to access local disaster risk calculations, active warnings, and emergency notification settings.",
};

function LoginFormFallback() {
  return (
    <Card className="shadow-lg border-border/80">
      <CardContent className="py-12 text-center space-y-3">
        <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
        <p className="text-sm text-muted-foreground font-medium">Loading Sign In...</p>
      </CardContent>
    </Card>
  );
}

export default function LoginPage() {
  return (
    <RouteContainer size="sm">
      <div className="mx-auto max-w-md py-6 sm:py-10">
        <Suspense fallback={<LoginFormFallback />}>
          <LoginForm />
        </Suspense>
      </div>
    </RouteContainer>
  );
}
