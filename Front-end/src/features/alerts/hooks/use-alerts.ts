"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useAuth } from "@/features/auth/hooks/use-auth";
import { getAlerts, getAlertById } from "../services";
import type { UnifiedAlert, AlertFilterOptions } from "../types";

export interface UseAlertsResult {
  alerts: UnifiedAlert[];
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export function useAlerts(filters: AlertFilterOptions = {}): UseAlertsResult {
  const { user, role } = useAuth();
  const [alerts, setAlerts] = useState<UnifiedAlert[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const filterKey = useMemo(() => JSON.stringify(filters), [filters]);

  const fetchAlerts = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const authContext = user ? { uid: user.uid, role: role || "citizen" } : null;
      const parsedFilters: AlertFilterOptions = JSON.parse(filterKey);
      const data = await getAlerts(parsedFilters, authContext);
      setAlerts(data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to load alerts";
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  }, [user, role, filterKey]);

  useEffect(() => {
    fetchAlerts();
  }, [fetchAlerts]);

  return {
    alerts,
    isLoading,
    error,
    refresh: fetchAlerts,
  };
}

export function useAlertDetails(alertId: string | null) {
  const { user, role } = useAuth();
  const [alert, setAlert] = useState<UnifiedAlert | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(!!alertId);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!alertId) {
      setAlert(null);
      setIsLoading(false);
      return;
    }

    let isMounted = true;
    setIsLoading(true);
    setError(null);

    const authContext = user ? { uid: user.uid, role: role || "citizen" } : null;
    getAlertById(alertId, authContext)
      .then((data) => {
        if (isMounted) {
          setAlert(data);
          setIsLoading(false);
        }
      })
      .catch((err: unknown) => {
        if (isMounted) {
          setError(err instanceof Error ? err.message : "Could not fetch alert");
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [alertId, user, role]);

  return { alert, isLoading, error };
}
