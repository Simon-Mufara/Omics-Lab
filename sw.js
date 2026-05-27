/* OmicsLab Service Worker — offline fallback only */
const CACHE = 'omicslab-v6';

/* On install: skip waiting immediately so new SW takes over without delay */
self.addEventListener('install', () => self.skipWaiting());

/* On activate: delete all old caches, claim all clients, then tell pages to reload */
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.map(k => caches.delete(k))))
      .then(() => self.clients.claim())
      .then(() => self.clients.matchAll({ type: 'window' }))
      .then(clients => clients.forEach(c => c.postMessage({ type: 'SW_UPDATED' })))
  );
});

/* Fetch: always try network first. Cache successful responses as offline fallback.
   Never serve stale cache when the network is available. */
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    fetch(e.request)
      .then(res => {
        if (res.ok) {
          const clone = res.clone();
          caches.open(CACHE).then(c => c.put(e.request, clone));
        }
        return res;
      })
      .catch(() => caches.match(e.request))
  );
});
