import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 gap-1.5",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground shadow hover:bg-primary/80",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground shadow hover:bg-destructive/80",
        outline: "text-foreground",
        success:
          "border-transparent bg-success text-success-foreground shadow",
        warning:
          "border-transparent bg-warning text-warning-foreground shadow",
        info:
          "border-transparent bg-info text-info-foreground shadow",
        // Provenance variants
        official:
          "border-transparent bg-provenance-official text-white shadow font-bold tracking-wide uppercase text-[10px]",
        calculated:
          "border-transparent bg-provenance-calculated text-white shadow font-bold tracking-wide uppercase text-[10px]",
        simulation:
          "border-transparent bg-provenance-simulation text-white shadow font-bold tracking-wide uppercase text-[10px]",
        // Risk severity variants
        "risk-low":
          "border-transparent bg-risk-low text-white font-bold",
        "risk-guarded":
          "border-transparent bg-risk-guarded text-white font-bold",
        "risk-moderate":
          "border-transparent bg-risk-moderate text-slate-950 font-bold",
        "risk-high":
          "border-transparent bg-risk-high text-white font-bold",
        "risk-critical":
          "border-transparent bg-risk-critical text-white font-bold animate-pulse",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
