"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  LogIn,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  Mail,
  Lock,
  Loader2,
  ShieldAlert,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { loginSchema, type LoginFormData } from "../schemas/login-schema";
import { useAuth } from "../hooks/use-auth";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, isAuthenticated, isLoading: authLoading } = useAuth();

  const [showPassword, setShowPassword] = React.useState(false);
  const [serverError, setServerError] = React.useState<string | null>(null);
  const [successMessage, setSuccessMessage] = React.useState<string | null>(null);

  // Redirect parameter (defaults to /dashboard)
  const redirectTarget = searchParams?.get("redirect") || "/dashboard";

  // Redirect away if already authenticated
  React.useEffect(() => {
    if (isAuthenticated && !authLoading) {
      router.replace(redirectTarget);
    }
  }, [isAuthenticated, authLoading, redirectTarget, router]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    mode: "onTouched",
    defaultValues: {
      email: "",
      password: "",
      rememberMe: true,
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    setServerError(null);
    setSuccessMessage(null);

    const result = await login(data);

    if (!result.success) {
      setServerError(result.error || "Failed to sign in. Please verify your email and password.");
      return;
    }

    setSuccessMessage("Authenticated successfully! Loading your dashboard...");

    setTimeout(() => {
      router.push(redirectTarget);
    }, 1000);
  };

  if (authLoading) {
    return (
      <Card className="shadow-lg border-border/80">
        <CardContent className="py-12 text-center space-y-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
          <p className="text-sm text-muted-foreground font-medium">Checking session...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-lg border-border/80">
      <CardHeader className="space-y-1.5 text-center pb-4">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary mb-1">
          <LogIn className="h-6 w-6" />
        </div>
        <div className="flex items-center justify-center gap-2">
          <CardTitle className="text-2xl font-bold tracking-tight">Sign In to ResQEarth</CardTitle>
          <Badge variant="outline" className="text-[10px] font-semibold uppercase tracking-wider text-primary border-primary/30">
            Secure Auth
          </Badge>
        </div>
        <CardDescription className="text-xs sm:text-sm text-muted-foreground max-w-sm mx-auto">
          Access your personal disaster alerts, local risk scores, and emergency communication preferences.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4 pt-2">
        {serverError && (
          <Alert variant="destructive" className="py-2.5">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle className="text-xs font-semibold">Sign In Notice</AlertTitle>
            <AlertDescription className="text-xs text-destructive/90">{serverError}</AlertDescription>
          </Alert>
        )}

        {successMessage && (
          <Alert variant="success" className="py-2.5">
            <CheckCircle2 className="h-4 w-4" />
            <AlertTitle className="text-xs font-semibold">Access Granted</AlertTitle>
            <AlertDescription className="text-xs text-emerald-800 dark:text-emerald-300">
              {successMessage}
            </AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          {/* Email Address */}
          <div className="space-y-1.5">
            <Label htmlFor="email" required className="text-xs font-medium">
              Email Address
            </Label>
            <div className="relative">
              <Input
                id="email"
                type="email"
                placeholder="citizen@example.com"
                disabled={isSubmitting}
                error={Boolean(errors.email)}
                className="pl-9 text-sm"
                aria-describedby={errors.email ? "email-error" : undefined}
                {...register("email")}
              />
              <Mail className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            </div>
            {errors.email && (
              <p id="email-error" className="text-xs text-destructive flex items-center gap-1 font-medium">
                <AlertCircle className="h-3 w-3 inline shrink-0" />
                {errors.email.message}
              </p>
            )}
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="password" required className="text-xs font-medium">
                Password
              </Label>
            </div>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                disabled={isSubmitting}
                error={Boolean(errors.password)}
                className="pl-9 pr-9 text-sm"
                aria-describedby={errors.password ? "password-error" : undefined}
                {...register("password")}
              />
              <Lock className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
                aria-label={showPassword ? "Hide password" : "Show password"}
                className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground focus:outline-none"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.password && (
              <p id="password-error" className="text-xs text-destructive flex items-center gap-1 font-medium">
                <AlertCircle className="h-3 w-3 inline shrink-0" />
                {errors.password.message}
              </p>
            )}
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full font-semibold shadow-sm"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Verifying Credentials...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <LogIn className="h-4 w-4" />
                Sign In
              </span>
            )}
          </Button>
        </form>
      </CardContent>

      <CardFooter className="flex flex-col gap-2.5 text-center text-xs text-muted-foreground border-t border-border/40 pt-4 pb-4">
        <div>
          Don&apos;t have an account yet?{" "}
          <Link href="/signup" className="font-semibold text-primary hover:underline ml-1">
            Create Citizen Account
          </Link>
        </div>
        <div className="flex items-center justify-center gap-1.5 text-[11px] text-muted-foreground/80">
          <ShieldAlert className="h-3.5 w-3.5 text-amber-500" />
          <span>Official warning support & educational risk models</span>
        </div>
      </CardFooter>
    </Card>
  );
}
