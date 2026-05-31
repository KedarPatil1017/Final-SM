/* Study Manager – Service Worker */
const CACHE_NAME = 'study-manager-v2';

self.addEventListener('install', e => {
    e.waitUntil(
        caches.open(CACHE_NAME)
            .then(c => c.add(self.registration.scope))
            .then(() => self.skipWaiting())
    );
});

self.addEventListener('activate', e => {
    e.waitUntil(
        caches.keys()
            .then(keys => Promise.all(
                keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
            ))
            .then(() => self.clients.claim())
    );
});

self.addEventListener('fetch', e => {
    if (e.request.method !== 'GET') return;
    e.respondWith(
        caches.match(e.request).then(cached => {
            if (cached) return cached;
            return fetch(e.request).then(resp => {
                if (!resp || resp.status !== 200 || resp.type !== 'basic') return resp;
                caches.open(CACHE_NAME).then(c => c.put(e.request, resp.clone()));
                return resp;
            }).catch(() => caches.match(self.registration.scope));
        })
    );
});
