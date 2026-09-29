// ResQEarth Service Worker for Background Firebase Cloud Messaging
/* eslint-disable no-restricted-globals */

self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("push", (event) => {
  let data = {};
  try {
    if (event.data) {
      data = event.data.json();
    }
  } catch (err) {
    try {
      data = { body: event.data ? event.data.text() : "Emergency Alert Notification" };
    } catch {
      data = {};
    }
  }

  const notificationTitle =
    data.notification?.title ||
    data.data?.title ||
    data.title ||
    "ResQEarth Emergency Warning";

  const notificationOptions = {
    body:
      data.notification?.body ||
      data.data?.body ||
      data.body ||
      "New disaster hazard warning issued for your region.",
    icon: "/icons/icon-192x192.png",
    badge: "/icons/badge-72x72.png",
    tag: data.data?.alertId ? `alert-${data.data.alertId}` : "resqearth-alert",
    renotify: true,
    requireInteraction: data.data?.severity === "CRITICAL" || data.data?.severity === "HIGH",
    data: {
      url: data.data?.url || (data.data?.slug ? `/disasters/${data.data.slug}` : "/alerts"),
      alertId: data.data?.alertId,
      disasterType: data.data?.disasterType,
      severity: data.data?.severity,
    },
  };

  event.waitUntil(
    self.registration.showNotification(notificationTitle, notificationOptions)
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const targetUrl = event.notification.data?.url || "/alerts";

  event.waitUntil(
    self.clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clientList) => {
        // If an existing window is open, focus it and navigate
        for (const client of clientList) {
          if (client.url.includes(self.location.origin) && "focus" in client) {
            client.focus();
            if ("navigate" in client) {
              return client.navigate(targetUrl);
            }
            return client;
          }
        }
        // Otherwise open a new window
        if (self.clients.openWindow) {
          return self.clients.openWindow(targetUrl);
        }
      })
  );
});
