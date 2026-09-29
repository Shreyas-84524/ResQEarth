import { PhoneCall, AlertOctagon } from "lucide-react";
import { Button } from "@/components/ui/button";

export function DisasterQuickEmergencyCta() {
  const quickNumbers = [
    { label: "Universal Emergency", number: "112", primary: true },
    { label: "National Disaster Helpline", number: "1070" },
    { label: "Disaster Control Room", number: "1077" },
    { label: "NDRF HQ Control", number: "1078" },
    { label: "Ambulance", number: "108" },
    { label: "Fire Service", number: "101" },
  ];

  return (
    <div className="rounded-xl border border-red-200 dark:border-red-900/60 bg-gradient-to-r from-red-50 to-amber-50/50 dark:from-red-950/30 dark:to-amber-950/20 p-4 sm:p-5 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-red-700 dark:text-red-400 font-bold text-sm sm:text-base">
            <AlertOctagon className="h-5 w-5 animate-pulse shrink-0" />
            <span>Immediate Emergency Helplines (India)</span>
          </div>
          <p className="text-xs text-muted-foreground">
            In life-threatening situations, dial toll-free emergency lines immediately. Keep lines clear for rescue dispatches.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {quickNumbers.map((q) => (
            <Button
              key={q.number}
              variant={q.primary ? "destructive" : "outline"}
              size="sm"
              asChild
              className="text-xs h-8 font-semibold shadow-xs"
            >
              <a href={`tel:${q.number}`} className="flex items-center gap-1.5">
                <PhoneCall className="h-3 w-3" />
                <span>{q.label}:</span>
                <span className="font-mono font-bold underline">{q.number}</span>
              </a>
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}
