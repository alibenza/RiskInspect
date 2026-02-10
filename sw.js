const CACHE = "vr-cache-v1";

const CORE_ASSETS = [
  "/",
  "/index.html",
  "/manifest.json",
  "/css/style.css",
  "/js/app.js",
  "/js/ui.js",
  "/js/db.js",
  "/js/auth.js",
  "/js/scoring.js",
  "/js/utils.js",
  "/js/dashboard.js",
  "/js/export.js",
  "/icons/icon-192.png",
  "/icons/icon-512.png"
];

self.addEventListener("install", event => {
  event.waitUntil(caches.open(CACHE).then(c => c.addAll(CORE_ASSETS)));
  self.skipWaiting();
});

self.addEventListener("activate", event => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", event => {
  const req = event.request;

  if (req.headers.get("accept")?.includes("text/html")) {
    event.respondWith(
      fetch(req).catch(() => caches.match(req) || caches.match("/index.html"))
    );
    return;
  }

  if (req.url.endsWith(".js") || req.url.endsWith(".css")) {
    event.respondWith(
      fetch(req)
        .then(res => {
          caches.open(CACHE).then(c => c.put(req, res.clone()));
          return res;
        })
        .catch(() => caches.match(req))
    );
    return;
  }

  event.respondWith(
    caches.match(req).then(c => c || fetch(req).then(res => {
      caches.open(CACHE).then(cache => cache.put(req, res.clone()));
      return res;
    }))
  );
});
