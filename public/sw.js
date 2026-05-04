const CACHE_NAME = "orderflow-v1";
const STATIC_ASSETS = [
  "/dashboard",
  "/dashboard/orders",
  "/dashboard/menu",
  "/dashboard/analytics",
  "/dashboard/settings",
];

// Install
self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS).catch(() => {});
    })
  );
  self.skipWaiting();
});

// Activate
self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

// Fetch — Network first, cache fallback
self.addEventListener("fetch", (e) => {
  if (e.request.method !== "GET") return;
  if (e.request.url.includes("/api/")) return; // never cache API

  e.respondWith(
    fetch(e.request)
      .then((res) => {
        const clone = res.clone();
        caches.open(CACHE_NAME).then((c) => c.put(e.request, clone));
        return res;
      })
      .catch(() => caches.match(e.request))
  );
});

// Push Notifications
self.addEventListener("push", (e) => {
  const data = e.data?.json() || {};
  const options = {
    body: data.body || "You have a new order!",
    icon: "/icons/icon-192.png",
    badge: "/icons/icon-72.png",
    vibrate: [200, 100, 200],
    data: { url: data.url || "/dashboard/orders" },
    actions: [
      { action: "view", title: "View Order 👀" },
      { action: "dismiss", title: "Dismiss" },
    ],
    tag: "new-order",
    renotify: true,
  };
  e.waitUntil(
    self.registration.showNotification(
      data.title || "🔔 New Order!",
      options
    )
  );
});

// Notification click
self.addEventListener("notificationclick", (e) => {
  e.notification.close();
  if (e.action === "dismiss") return;
  e.waitUntil(
    clients.matchAll({ type: "window" }).then((clientList) => {
      const url = e.notification.data?.url || "/dashboard/orders";
      for (const client of clientList) {
        if (client.url.includes("/dashboard") && "focus" in client) {
          client.navigate(url);
          return client.focus();
        }
      }
      return clients.openWindow(url);
    })
  );
});