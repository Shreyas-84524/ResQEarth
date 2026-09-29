"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  UserPlus,
  ShieldCheck,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  Phone,
  Mail,
  Lock,
  User as UserIcon,
  Loader2,
  Info,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { signupSchema, type SignupFormData } from "../schemas/signup-schema";
import { useAuth } from "../hooks/use-auth";

export function SignupForm() {
  const router = useRouter();
  const { signup, isAuthenticated, isLoading: authLoading } = useAuth();

  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);
  const [serverError, setServerError] = React.useState<string | null>(null);
  const [successMessage, setSuccessMessage] = React.useState<string | null>(null);

  // Redirect away if already authenticated
  React.useEffect(() => {
    if (isAuthenticated && !authLoading) {
      router.replace("/dashboard");
    }
  }, [isAuthenticated, authLoading, router]);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    mode: "onTouched",
    defaultValues: {
      name: "",
      phone: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const passwordValue = watch("password") || "";
  const confirmPasswordValue = watch("confirmPassword") || "";

  // Password requirements calculation
  const hasMinLength = passwordValue.length >= 8;
  const hasUpper = /[A-Z]/.test(passwordValue);
  const hasLower = /[a-z]/.test(passwordValue);
  const hasNumber = /\d/.test(passwordValue);
  const hasSpecial = /[@$!%*?&#^()_\-+={}[\]:;"'<>,.~`|\\]/.test(passwordValue);
  const passwordsMatch = confirmPasswordValue.length > 0 && passwordValue === confirmPasswordValue;

  const onSubmit = async (data: SignupFormData) => {
    setServerError(null);
    setSuccessMessage(null);

    const result = await signup(data);

    if (!result.success) {
      setServerError(result.error || "Failed to create account. Please check your inputs.");
      return;
    }

    setSuccessMessage(
      "Citizen account created successfully! Redirecting you to your dashboard..."
    );

    // Redirect to citizen dashboard after brief feedback
    setTimeout(() => {
      router.push("/dashboard");
    }, 1200);
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
          <UserPlus className="h-6 w-6" />
        </div>
        <div className="flex items-center justify-center gap-2">
          <CardTitle className="text-2xl font-bold tracking-tight">Create Citizen Account</CardTitle>
          <Badge variant="outline" className="text-[10px] font-semibold uppercase tracking-wider text-primary border-primary/30">
            Citizen
          </Badge>
        </div>
        <CardDescription className="text-xs sm:text-sm text-muted-foreground max-w-sm mx-auto">
          Register to receive local disaster risk insights and consented emergency notifications.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4 pt-2">
        {serverError && (
          <Alert variant="destructive" className="py-2.5">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle className="text-xs font-semibold">Registration Notice</AlertTitle>
            <AlertDescription className="text-xs text-destructive/90">{serverError}</AlertDescription>
          </Alert>
        )}

        {successMessage && (
          <Alert variant="success" className="py-2.5">
            <CheckCircle2 className="h-4 w-4" />
            <AlertTitle className="text-xs font-semibold">Account Created</AlertTitle>
            <AlertDescription className="text-xs text-emerald-800 dark:text-emerald-300">
              {successMessage}
            </AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3.5" noValidate>
          {/* Full Name */}
          <div className="space-y-1.5">
            <Label htmlFor="name" required className="text-xs font-medium">
              Full Name
            </Label>
            <div className="relative">
              <Input
                id="name"
                type="text"
                placeholder="e.g. Aditi Sharma"
                disabled={isSubmitting}
                error={Boolean(errors.name)}
                className="pl-9 text-sm"
                aria-describedby={errors.name ? "name-error" : undefined}
                {...register("name")}
              />
              <UserIcon className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            </div>
            {errors.name && (
              <p id="name-error" className="text-xs text-destructive flex items-center gap-1 font-medium">
                <AlertCircle className="h-3 w-3 inline shrink-0" />
                {errors.name.message}
              </p>
            )}
          </div>

          {/* Phone Number */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="phone" required className="text-xs font-medium">
                Mobile Number
              </Label>
              <span className="text-[10px] text-muted-foreground">For Emergency SMS</span>
            </div>
            <div className="relative">
              <Input
                id="phone"
                type="tel"
                placeholder="+91 98765 43210"
                disabled={isSubmitting}
                error={Boolean(errors.phone)}
                className="pl-9 text-sm"
                aria-describedby={errors.phone ? "phone-error" : "phone-help"}
                {...register("phone")}
              />
              <Phone className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            </div>
            {errors.phone ? (
              <p id="phone-error" className="text-xs text-destructive flex items-center gap-1 font-medium">
                <AlertCircle className="h-3 w-3 inline shrink-0" />
                {errors.phone.message}
              </p>
            ) : (
              <p id="phone-help" className="text-[11px] text-muted-foreground flex items-center gap-1">
                <Info className="h-3 w-3 text-muted-foreground inline shrink-0" />
                Used solely for consented two-part disaster SMS alerts. Not used for marketing.
              </p>
            )}
          </div>

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
            <Label htmlFor="password" required className="text-xs font-medium">
              Password
            </Label>
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

            {/* Password checklist */}
            {passwordValue.length > 0 && (
              <div className="grid grid-cols-2 gap-1 pt-1 text-[11px] text-muted-foreground bg-muted/30 p-2 rounded border border-border/40">
                <span className={`flex items-center gap-1 ${hasMinLength ? "text-emerald-600 dark:text-emerald-400 font-medium" : ""}`}>
                  <span className={`h-1.5 w-1.5 rounded-full ${hasMinLength ? "bg-emerald-500" : "bg-muted-foreground/40"}`} />
                  8+ characters
                </span>
                <span className={`flex items-center gap-1 ${hasUpper ? "text-emerald-600 dark:text-emerald-400 font-medium" : ""}`}>
                  <span className={`h-1.5 w-1.5 rounded-full ${hasUpper ? "bg-emerald-500" : "bg-muted-foreground/40"}`} />
                  Uppercase letter
                </span>
                <span className={`flex items-center gap-1 ${hasLower ? "text-emerald-600 dark:text-emerald-400 font-medium" : ""}`}>
                  <span className={`h-1.5 w-1.5 rounded-full ${hasLower ? "bg-emerald-500" : "bg-muted-foreground/40"}`} />
                  Lowercase letter
                </span>
                <span className={`flex items-center gap-1 ${hasNumber && hasSpecial ? "text-emerald-600 dark:text-emerald-400 font-medium" : ""}`}>
                  <span className={`h-1.5 w-1.5 rounded-full ${hasNumber && hasSpecial ? "bg-emerald-500" : "bg-muted-foreground/40"}`} />
                  Number & symbol
                </span>
              </div>
            )}
          </div>

          {/* Confirm Password */}
          <div className="space-y-1.5">
            <Label htmlFor="confirmPassword" required className="text-xs font-medium">
              Confirm Password
            </Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="••••••••"
                disabled={isSubmitting}
                error={Boolean(errors.confirmPassword)}
                className="pl-9 pr-9 text-sm"
                aria-describedby={errors.confirmPassword ? "confirmPassword-error" : undefined}
                {...register("confirmPassword")}
              />
              <Lock className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                tabIndex={-1}
                aria-label={showConfirmPassword ? "Hide password confirmation" : "Show password confirmation"}
                className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground focus:outline-none"
              >
                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.confirmPassword && (
              <p id="confirmPassword-error" className="text-xs text-destructive flex items-center gap-1 font-medium">
                <AlertCircle className="h-3 w-3 inline shrink-0" />
                {errors.confirmPassword.message}
              </p>
            )}
            {!errors.confirmPassword && passwordsMatch && (
              <p className="text-[11px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-medium">
                <CheckCircle2 className="h-3 w-3 inline" />
                Passwords match
              </p>
            )}
          </div>

          {/* Role and Security Note */}
          <div className="rounded-lg bg-muted/40 p-2.5 text-xs text-muted-foreground border border-border/50 space-y-1">
            <p className="flex items-center gap-1.5 font-medium text-foreground">
              <ShieldCheck className="h-4 w-4 text-primary shrink-0" />
              Default Citizen Role & Privacy Notice
            </p>
            <p className="text-[11px] leading-relaxed">
              Public signup creates a standard <strong>citizen</strong> account. Admin credentials require trusted provisioning. Your notification & SMS preferences can be customized anytime from your settings.
            </p>
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
                Creating Citizen Account...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <UserPlus className="h-4 w-4" />
                Create Citizen Account
              </span>
            )}
          </Button>
        </form>
      </CardContent>

      <CardFooter className="flex flex-col gap-2 text-center text-xs text-muted-foreground border-t border-border/40 pt-4 pb-4">
        <div>
          Already have an account?{" "}
          <Link href="/login" className="font-semibold text-primary hover:underline ml-1">
            Sign In
          </Link>
        </div>
        <p className="text-[11px] text-muted-foreground/80">
          Emergency response needed? Call <span className="font-bold text-foreground">112</span> for immediate official assistance.
        </p>
      </CardFooter>
    </Card>
  );
}
