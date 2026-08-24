// BestieeCP Service Worker for Web Push Notifications
/* eslint-disable no-restricted-globals */

self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("push", (event) => {
  if (!event.data) return;

  try {
    const data = event.data.json();
    const title = data.title || "اعلان جدید پنل مدیریت بستی";
    const options = {
      body: data.body || "",
      icon: data.icon || "/BestieeMiniLogoBlue.png",
      badge: data.badge || "/BestieeMiniLogoBlue.png",
      tag: data.tag || "bestiee-cp-notification",
      renotify: true,
      vibrate: [200, 100, 200],
      dir: "rtl",
      lang: "fa-IR",
      data: {
        url: data.url || (data.data && data.data.url) || "/",
        timestamp: Date.now(),
        ...(data.data || {}),
      },
      actions: [
        { action: "open", title: "مشاهده" },
        { action: "close", title: "بستن" },
      ],
    };

    event.waitUntil(self.registration.showNotification(title, options));
  } catch (err) {
    console.error("[ServiceWorker] Error parsing push payload in CP:", err);
    const text = event.data.text();
    event.waitUntil(
      self.registration.showNotification("اعلان جدید پنل مدیریت بستی", {
        body: text,
        icon: "/BestieeMiniLogoBlue.png",
        dir: "rtl",
        data: { url: "/" },
      })
    );
  }
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  if (event.action === "close") {
    return;
  }

  const targetUrl = (event.notification.data && event.notification.data.url) || "/";

  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      // Focus existing CP window if open
      for (const client of clientList) {
        if ("focus" in client) {
          if (client.url.includes(self.location.origin)) {
            client.focus();
            if (targetUrl && targetUrl !== "/" && !client.url.endsWith(targetUrl)) {
              return client.navigate(targetUrl);
            }
            return client;
          }
        }
      }
      // Otherwise open a new window
      if (self.clients.openWindow) {
        return self.clients.openWindow(targetUrl);
      }
    })
  );
});
