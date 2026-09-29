"use client";

import * as React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { AlertTriangle, Bell, MessageSquare, ShieldCheck, Radio, Users } from "lucide-react";

interface AdminStatsOverviewProps {
  activeAlertsCount: number;
  draftAlertsCount: number;
  totalDeliveredCount: number;
  fcmRecipientsCount: number;
  smsRecipientsCount: number;
  monitoredRegionsCount: number;
}

export function AdminStatsOverview({
  activeAlertsCount,
  draftAlertsCount,
  totalDeliveredCount,
  fcmRecipientsCount,
  smsRecipientsCount,
  monitoredRegionsCount,
}: AdminStatsOverviewProps) {
  const stats = [
    {
      title: "Active Warnings",
      value: activeAlertsCount,
      sub: `${draftAlertsCount} drafts awaiting review`,
      icon: AlertTriangle,
      color: "text-amber-500 dark:text-amber-400",
      bg: "bg-amber-500/10 border-amber-500/20",
    },
    {
      title: "Dispatched Warnings",
      value: totalDeliveredCount,
      sub: "Broadcasts logged today",
      icon: Radio,
      color: "text-blue-500 dark:text-blue-400",
      bg: "bg-blue-500/10 border-blue-500/20",
    },
    {
      title: "Push Notification Reach",
      value: fcmRecipientsCount,
      sub: "Active FCM browser devices",
      icon: Bell,
      color: "text-purple-500 dark:text-purple-400",
      bg: "bg-purple-500/10 border-purple-500/20",
    },
    {
      title: "SMS Broadcast Reach",
      value: smsRecipientsCount,
      sub: "Opted-in citizen phone lines",
      icon: MessageSquare,
      color: "text-emerald-500 dark:text-emerald-400",
      bg: "bg-emerald-500/10 border-emerald-500/20",
    },
    {
      title: "Monitored Regions",
      value: monitoredRegionsCount,
      sub: "Surveillance zones active",
      icon: ShieldCheck,
      color: "text-teal-500 dark:text-teal-400",
      bg: "bg-teal-500/10 border-teal-500/20",
    },
    {
      title: "Total Citizen Network",
      value: fcmRecipientsCount + smsRecipientsCount,
      sub: "Platform protected reach",
      icon: Users,
      color: "text-indigo-500 dark:text-indigo-400",
      bg: "bg-indigo-500/10 border-indigo-500/20",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {stats.map((stat, idx) => {
        const Icon = stat.icon;
        return (
          <Card key={idx} className="bg-card/60 backdrop-blur-sm border-border/40 shadow-xs hover:border-border/80 transition-all">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {stat.title}
              </CardTitle>
              <div className={`p-2 rounded-lg border ${stat.bg}`}>
                <Icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold tracking-tight text-foreground">{stat.value}</div>
              <p className="text-xs text-muted-foreground mt-1">{stat.sub}</p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
