import * as React from "react";
import { type LucideIcon, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export interface AdminDashboardCardProps
  extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  value: string | number;
  icon: LucideIcon;
  subtext?: string;
  trend?: {
    value: string | number;
    isPositive?: boolean;
    label?: string;
  };
  statusBadge?: {
    text: string;
    variant?: "default" | "secondary" | "success" | "warning" | "destructive" | "outline";
  };
  onClick?: () => void;
}

export function AdminDashboardCard({
  title,
  value,
  icon: Icon,
  subtext,
  trend,
  statusBadge,
  onClick,
  className,
  ...props
}: AdminDashboardCardProps) {
  return (
    <Card
      className={cn(
        "overflow-hidden border-border/80 transition-all",
        onClick && "cursor-pointer hover:border-primary/50 hover:shadow-md",
        className
      )}
      onClick={onClick}
      {...props}
    >
      <CardContent className="p-5">
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            {title}
          </span>
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Icon className="h-4 w-4" aria-hidden="true" />
          </div>
        </div>

        <div className="mt-3 flex items-baseline justify-between gap-2">
          <span className="text-2xl sm:text-3xl font-bold font-mono text-foreground tracking-tight">
            {value}
          </span>
          {statusBadge && (
            <Badge variant={statusBadge.variant || "default"} className="text-[10px] px-1.5 py-0">
              {statusBadge.text}
            </Badge>
          )}
        </div>

        {(subtext || trend) && (
          <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground border-t border-border/40 pt-2">
            {trend && (
              <span
                className={cn(
                  "inline-flex items-center font-medium font-mono text-[11px]",
                  trend.isPositive ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400"
                )}
              >
                {trend.isPositive ? (
                  <ArrowUpRight className="mr-0.5 h-3 w-3" />
                ) : (
                  <ArrowDownRight className="mr-0.5 h-3 w-3" />
                )}
                {trend.value}
              </span>
            )}
            {subtext && <span className="truncate">{subtext}</span>}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
