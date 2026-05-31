/* Study Manager – Service Worker
 * Strategy: Cache-first for the app shell (single HTML file).
 * All app data lives in IndexedDB so no network needed after first load.
 */
const CACHE_NAME = 'study-manager-v1';
const SHELL = ['./'];   // just the root index.html

self.addEventListener('install', e => {
    e.waitUntil(
        caches.open(CACHE_NAME)
            .then(c => c.addAll(SHELL))
            .then(() => self.skipWaiting())
    );
});

self.addEventListener('activate', e => {
    e.waitUntil(
        caches.keys().then(keys =>
            Promise.all(keys
                .filter(k => k !== CACHE_NAME)
                .map(k => caches.delete(k))
            )
        ).then(() => self.clients.claim())
    );
});

self.addEventListener('fetch', e => {
    // Only handle GET requests; skip cross-origin (none expected since everything is inline)
    if (e.request.method !== 'GET') return;
    e.respondWith(
        caches.match(e.request).then(cached => {
            if (cached) return cached;
            return fetch(e.request).then(resp => {
                if (!resp || resp.status !== 200 || resp.type !== 'basic') return resp;
                const toCache = resp.clone();
                caches.open(CACHE_NAME).then(c => c.put(e.request, toCache));
                return resp;
            }).catch(() => caches.match('./'));
        })
    );
});
