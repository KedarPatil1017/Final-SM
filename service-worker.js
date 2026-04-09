const CACHE_NAME = "sm-cache-v1";

const urlsToCache = [
  "/Final-SM/",
  "/Final-SM/index.html",
  "/Final-SM/manifest.json",
  "/Final-SM/icons/icon-192.png",
  "/Final-SM/icons/icon-512.png"
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(urlsToCache);
    })
  );
  self.skipWaiting();
});

self.addEventListener("activate", event => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request);
    })
  );
});