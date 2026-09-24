// SendResqPls Service Worker — enables offline support and installability
const CACHE_NAME = 'sendresqpls-v3';
const PRECACHE_URLS = [
  '/mobile',
  '/mobile/report',
  '/mobile/history',
  '/mobile/profile',
  '/icon-192.png',
  '/icon-512.png',
];

// Install: cache core mobile app shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_URLS))
  );
  self.skipWaiting();
});

// Activate: clean old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Fetch: network-first for API, cache-first for static assets
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Don't cache API calls, auth routes, or reset-password — always go directly to live network
  if (
    url.pathname.startsWith('/api') ||
    url.pathname.includes('reset-password') ||
    url.pathname.includes('forgot-password') ||
    url.pathname.includes('get-the-app') ||
    url.pathname.includes('login') ||
    url.pathname.includes('signup')
  ) {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Cache successful GET responses
        if (event.request.method === 'GET' && response.status === 200) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        }
        return response;
      })
      .catch(() => caches.match(event.request).then((cached) => cached || caches.match('/mobile')))
  );
});
