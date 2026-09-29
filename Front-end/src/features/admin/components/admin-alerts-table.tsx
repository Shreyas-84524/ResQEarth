"use client";

import * as React from "react";
import type { UnifiedAlert, AlertStatus } from "@/features/alerts";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { SeverityBadge } from "@/components/ui/severity-badge";
import {
  AlertTriangle,
  Search,
  CheckCircle,
  XCircle,
  Clock,
  ShieldCheck,
  Radio,
  UserCheck,
} from "lucide-react";

interface AdminAlertsTableProps {
  alerts: UnifiedAlert[];
  isLoading?: boolean;
  onActivate: (alertId: string) => Promise<void>;
  onCancel: (alertId: string, reason: string) => Promise<void>;
  onExpire: (alertId: string) => Promise<void>;
  onCreateNewClick?: () => void;
}

export function AdminAlertsTable({
  alerts,
  isLoading = false,
  onActivate,
  onCancel,
  onExpire,
  onCreateNewClick,
}: AdminAlertsTableProps) {
  const [searchQuery, setSearchQuery] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<string>("all");
  const [cancellingAlertId, setCancellingAlertId] = React.useState<string | null>(null);
  const [cancelReason, setCancelReason] = React.useState("");
  const [actionLoadingId, setActionLoadingId] = React.useState<string | null>(null);

  const filteredAlerts = React.useMemo(() => {
    return alerts.filter((alert) => {
      if (statusFilter !== "all" && alert.status !== statusFilter) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = alert.title.toLowerCase().includes(q);
        const matchRegion = alert.region?.toLowerCase().includes(q);
        const matchType = alert.disasterType.toLowerCase().includes(q);
        if (!matchTitle && !matchRegion && !matchType) return false;
      }
      return true;
    });
  }, [alerts, statusFilter, searchQuery]);

  const handleActivate = async (id: string) => {
    setActionLoadingId(id);
    try {
      await onActivate(id);
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleExpire = async (id: string) => {
    setActionLoadingId(id);
    try {
      await onExpire(id);
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleConfirmCancel = async () => {
    if (!cancellingAlertId) return;
    setActionLoadingId(cancellingAlertId);
    try {
      await onCancel(cancellingAlertId, cancelReason || "Cancelled by admin operations");
      setCancellingAlertId(null);
      setCancelReason("");
    } finally {
      setActionLoadingId(null);
    }
  };

  const getStatusBadge = (status: AlertStatus) => {
    switch (status) {
      case "active":
        return <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 text-xs">Active</Badge>;
      case "draft":
        return <Badge className="bg-amber-500/10 text-amber-500 border-amber-500/20 text-xs">Draft</Badge>;
      case "cancelled":
        return <Badge className="bg-destructive/10 text-destructive border-destructive/20 text-xs">Cancelled</Badge>;
      case "expired":
        return <Badge className="bg-muted text-muted-foreground border-border text-xs">Expired</Badge>;
      case "superseded":
        return <Badge className="bg-purple-500/10 text-purple-500 border-purple-500/20 text-xs">Superseded</Badge>;
    }
  };

  const getProvenanceBadge = (alert: UnifiedAlert) => {
    if (alert.isOfficialAlert || alert.sourceType === "official") {
      return (
        <Badge variant="outline" className="bg-blue-500/10 text-blue-500 border-blue-500/20 gap-1 text-[11px]">
          <ShieldCheck className="h-3 w-3" />
          <span>Official Statutory</span>
        </Badge>
      );
    }
    if (alert.sourceType === "automatic") {
      return (
        <Badge variant="outline" className="bg-amber-500/10 text-amber-500 border-amber-500/20 gap-1 text-[11px]">
          <Radio className="h-3 w-3" />
          <span>Calculated Risk</span>
        </Badge>
      );
    }
    return (
      <Badge variant="outline" className="bg-purple-500/10 text-purple-500 border-purple-500/20 gap-1 text-[11px]">
        <UserCheck className="h-3 w-3" />
        <span>Manual Admin</span>
      </Badge>
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-1 max-w-md">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search alerts by title, region, hazard..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-card/60"
            />
          </div>
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-36 bg-card/60"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="draft">Draft</option>
            <option value="cancelled">Cancelled</option>
            <option value="expired">Expired</option>
            <option value="superseded">Superseded</option>
          </Select>
        </div>

        {onCreateNewClick && (
          <Button onClick={onCreateNewClick} className="gap-2 shadow-sm font-semibold">
            <AlertTriangle className="h-4 w-4 text-amber-400" />
            Issue Regional Warning
          </Button>
        )}
      </div>

      {cancellingAlertId && (
        <div className="p-4 rounded-xl border border-destructive/40 bg-destructive/5 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-destructive">Confirm Alert Cancellation</p>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCancellingAlertId(null)}
              className="h-7 text-xs"
            >
              Close
            </Button>
          </div>
          <Input
            placeholder="Enter reason for cancellation (e.g., threat subsided, false alarm)..."
            value={cancelReason}
            onChange={(e) => setCancelReason(e.target.value)}
            className="bg-card"
          />
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCancellingAlertId(null)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleConfirmCancel}
              disabled={actionLoadingId === cancellingAlertId}
            >
              Confirm Cancellation
            </Button>
          </div>
        </div>
      )}

      <div className="rounded-xl border border-border/40 overflow-hidden bg-card/40 backdrop-blur-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted/40 text-muted-foreground text-xs uppercase tracking-wider border-b border-border/40">
              <tr>
                <th className="py-3 px-4 font-semibold">Alert / Hazard</th>
                <th className="py-3 px-4 font-semibold">Provenance</th>
                <th className="py-3 px-4 font-semibold">Severity</th>
                <th className="py-3 px-4 font-semibold">Region / Target</th>
                <th className="py-3 px-4 font-semibold">Status</th>
                <th className="py-3 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/30">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-muted-foreground">
                    Loading alerts catalog...
                  </td>
                </tr>
              ) : filteredAlerts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-muted-foreground">
                    No warnings matching current filter criteria.
                  </td>
                </tr>
              ) : (
                filteredAlerts.map((alert) => (
                  <tr key={alert.id} className="hover:bg-muted/20 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-medium text-foreground">{alert.title}</div>
                      <div className="text-xs text-muted-foreground truncate max-w-xs mt-0.5">
                        {alert.description}
                      </div>
                    </td>
                    <td className="py-3 px-4">{getProvenanceBadge(alert)}</td>
                    <td className="py-3 px-4">
                      <SeverityBadge level={alert.severity} size="sm" />
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-xs font-medium text-foreground">
                        {alert.region || "All Platform Users"}
                      </div>
                      <div className="text-[11px] text-muted-foreground capitalize">
                        Mode: {alert.targetMode} {alert.radiusKm ? `(${alert.radiusKm} km)` : ""}
                      </div>
                    </td>
                    <td className="py-3 px-4">{getStatusBadge(alert.status)}</td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {alert.status === "draft" && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 text-xs gap-1 border-emerald-500/30 text-emerald-500 hover:bg-emerald-500/10"
                            onClick={() => handleActivate(alert.id)}
                            disabled={actionLoadingId === alert.id}
                          >
                            <CheckCircle className="h-3 w-3" />
                            Activate
                          </Button>
                        )}
                        {alert.status === "active" && (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-7 text-xs gap-1 text-muted-foreground hover:text-foreground"
                              onClick={() => handleExpire(alert.id)}
                              disabled={actionLoadingId === alert.id}
                            >
                              <Clock className="h-3 w-3" />
                              Expire
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-7 text-xs gap-1 border-destructive/30 text-destructive hover:bg-destructive/10"
                              onClick={() => setCancellingAlertId(alert.id)}
                              disabled={actionLoadingId === alert.id}
                            >
                              <XCircle className="h-3 w-3" />
                              Cancel
                            </Button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
