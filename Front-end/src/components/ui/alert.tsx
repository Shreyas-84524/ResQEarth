import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const alertVariants = cva(
  "relative w-full rounded-lg border p-4 [&>svg~*]:pl-7 [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-foreground",
  {
    variants: {
      variant: {
        default: "bg-background text-foreground",
        destructive:
          "border-destructive/50 text-destructive dark:border-destructive [&>svg]:text-destructive bg-destructive/10",
        success:
          "border-success/50 text-success dark:border-success [&>svg]:text-success bg-success/10",
        warning:
          "border-warning/50 text-amber-700 dark:text-amber-400 [&>svg]:text-warning bg-warning/10",
        info: "border-info/50 text-info [&>svg]:text-info bg-info/10",
        official:
          "border-provenance-official/60 text-slate-900 dark:text-slate-100 [&>svg]:text-provenance-official bg-indigo-50 dark:bg-indigo-950/40",
        calculated:
          "border-provenance-calculated/60 text-slate-900 dark:text-slate-100 [&>svg]:text-provenance-calculated bg-teal-50 dark:bg-teal-950/40",
        simulation:
          "border-provenance-simulation/60 text-slate-900 dark:text-slate-100 [&>svg]:text-provenance-simulation bg-purple-50 dark:bg-purple-950/40",
        "risk-critical":
          "border-risk-critical text-risk-critical [&>svg]:text-risk-critical bg-red-50 dark:bg-red-950/40 font-medium",
        "risk-high":
          "border-risk-high text-orange-700 dark:text-orange-400 [&>svg]:text-risk-high bg-orange-50 dark:bg-orange-950/40",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

const Alert = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof alertVariants>
>(({ className, variant, ...props }, ref) => (
  <div
    ref={ref}
    role="alert"
    className={cn(alertVariants({ variant }), className)}
    {...props}
  />
));
Alert.displayName = "Alert";

const AlertTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h5
    ref={ref}
    className={cn("mb-1 font-semibold leading-none tracking-tight flex items-center gap-2", className)}
    {...props}
  />
));
AlertTitle.displayName = "AlertTitle";

const AlertDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("text-sm [&_p]:leading-relaxed text-muted-foreground", className)}
    {...props}
  />
));
AlertDescription.displayName = "AlertDescription";

export { Alert, AlertTitle, AlertDescription };
