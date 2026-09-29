import * as React from "react";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, ShieldAlert } from "lucide-react";
import { DisasterIcon } from "./disaster-icon";
import type { DisasterGuide } from "../../types/knowledge";

interface DisasterCardProps {
  guide: DisasterGuide;
}

export function DisasterCard({ guide }: DisasterCardProps) {
  const isNatural = guide.category === "natural";

  return (
    <Card className="flex flex-col justify-between hover:border-primary/50 transition-all shadow-sm hover:shadow-md">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-2 mb-2">
          <div
            className={`flex h-10 w-10 items-center justify-center rounded-lg ${
              isNatural
                ? "bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400"
                : "bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400"
            }`}
          >
            <DisasterIcon name={guide.iconName} className="h-5 w-5" />
          </div>
          <div className="flex items-center gap-1.5">
            <Badge variant={isNatural ? "secondary" : "warning"} className="capitalize text-[10px]">
              {guide.category}
            </Badge>
            <Badge variant="outline" className="text-[10px] font-mono">
              {guide.severityBaseline}
            </Badge>
          </div>
        </div>
        <CardTitle className="text-base font-bold leading-tight">
          <Link href={`/disasters/${guide.slug}`} className="hover:text-primary transition-colors">
            {guide.title}
          </Link>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 pb-3">
        <CardDescription className="text-xs line-clamp-2 leading-relaxed">
          {guide.shortDescription}
        </CardDescription>
        <div className="flex flex-wrap gap-1">
          {guide.warningSigns.slice(0, 2).map((sign, idx) => (
            <span
              key={idx}
              className="inline-flex items-center gap-1 rounded bg-muted/60 px-1.5 py-0.5 text-[10px] text-muted-foreground truncate max-w-full"
            >
              <ShieldAlert className="h-2.5 w-2.5 text-primary shrink-0" />
              <span className="truncate">{sign}</span>
            </span>
          ))}
        </div>
      </CardContent>
      <CardFooter className="pt-2 border-t">
        <Link
          href={`/disasters/${guide.slug}`}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
        >
          View Full Safety Guide <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </CardFooter>
    </Card>
  );
}
