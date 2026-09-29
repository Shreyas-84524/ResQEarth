"use client";

import { useState, useEffect, useCallback } from "react";
import type {
  NotificationPermissionStatus,
  DisasterNotificationPayload,
} from "../types";
import {
  getNotificationPermissionStatus,
  hasUserDeniedNotifications,
  requestAndRegisterFcmToken,
} from "../services/fcm-service";
import { subscribeToForegroundMessages } from "@/services/firebase/messaging";
import { isMessagingSupported } from "@/lib/firebase/messaging";

export interface UseFcmOptions {
  uid?: string;
  onForegroundMessage?: (payload: DisasterNotificationPayload) => void;
  autoPrompt?: boolean;
}

export function useFcm(options: UseFcmOptions = {}) {
  const { uid, onForegroundMessage, autoPrompt = false } = options;

  const [permission, setPermission] = useState<NotificationPermissionStatus>("default");
  const [token, setToken] = useState<string | null>(null);
  const [isSupported, setIsSupported] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastMessage, setLastMessage] = useState<DisasterNotificationPayload | null>(null);

  // Initial check on mount
  useEffect(() => {
    let isMounted = true;

    async function checkSupportAndPermission() {
      const supported = await isMessagingSupported();
      if (!isMounted) return;
      setIsSupported(supported);

      if (supported) {
        const currentPerm = getNotificationPermissionStatus();
        setPermission(currentPerm);

        // If granted and autoPrompt, retrieve token
        if (currentPerm === "granted" && autoPrompt) {
          try {
            const res = await requestAndRegisterFcmToken(uid);
            if (isMounted && res.token) {
              setToken(res.token);
            }
          } catch {}
        }
      }
    }

    checkSupportAndPermission();

    return () => {
      isMounted = false;
    };
  }, [uid, autoPrompt]);

  // Foreground message subscriber
  useEffect(() => {
    if (!isSupported || permission !== "granted") return;

    let unsubscribe: (() => void) | undefined;

    subscribeToForegroundMessages((message) => {
      const payload: DisasterNotificationPayload = {
        alertId: message.data?.alertId || "alert-inbound",
        title: message.notification?.title || message.data?.title || "Disaster Alert",
        body: message.notification?.body || message.data?.body || "New hazard advisory issued.",
        disasterType: message.data?.disasterType || "general",
        severity: (message.data?.severity as DisasterNotificationPayload["severity"]) || "MODERATE",
        isOfficialAlert: message.data?.isOfficialAlert === "true",
        region: message.data?.region,
        url: message.data?.url,
        slug: message.data?.slug,
        timestamp: new Date().toISOString(),
      };

      setLastMessage(payload);
      if (onForegroundMessage) {
        onForegroundMessage(payload);
      }
    }).then((unsub) => {
      unsubscribe = unsub;
    });

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [isSupported, permission, onForegroundMessage]);

  const requestPermission = useCallback(async () => {
    if (hasUserDeniedNotifications()) {
      setError("Notifications have been disabled in your browser settings.");
      return null;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await requestAndRegisterFcmToken(uid);
      const newPerm = getNotificationPermissionStatus();
      setPermission(newPerm);

      if (result.error) {
        setError(result.error);
      } else if (result.token) {
        setToken(result.token);
      }

      return result.token;
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to enable notifications";
      setError(msg);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [uid]);

  return {
    permission,
    token,
    isSupported,
    isLoading,
    error,
    lastMessage,
    requestPermission,
    hasDenied: hasUserDeniedNotifications(),
  };
}
