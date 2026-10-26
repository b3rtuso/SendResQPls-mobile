// SendResQPls Service Worker — enables offline support, installability, and Notification Center alerts
const CACHE_NAME = 'sendresqpls-v8';
const PRECACHE_URLS = [
  '/',
  '/offline.html',
  '/icon-192.png',
  '/icon-512.png',
  '/logo.svg',
  '/logo.jpg',
  '/manifest.json'
];

// Install: cache available static assets safely without failing if one is missing
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      const results = await Promise.allSettled(
        PRECACHE_URLS.map(async (url) => {
          try {
            const response = await fetch(url, { cache: 'no-cache' });
            if (response.ok) {
              await cache.put(url, response);
            }
          } catch {
            // Ignore individual fetch failure during install
          }
        })
      );
      return results;
    })
  );
  self.skipWaiting();
});

// Activate: clean old caches and take control
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Message listener: allows the web app to trigger OS Notification Center alerts via the Service Worker
self.addEventListener('message', (event) => {
  const data = event.data;
  if (data && data.type === 'SHOW_NOTIFICATION' && data.payload) {
    const { title, options } = data.payload;
    if (title && self.registration && typeof self.registration.showNotification === 'function') {
      event.waitUntil(
        self.registration.showNotification(title, options || {})
      );
    }
  }
});

// Push listener: handles standard Web Push payloads if sent to the browser
self.addEventListener('push', (event) => {
  let payload = {
    title: 'SendResQPls Alert',
    body: 'New emergency status update received.',
    url: '/mobile/notifications',
    tag: 'srq-push',
  };

  if (event.data) {
    try {
      const parsed = event.data.json();
      payload = {
        title: parsed.title || payload.title,
        body: parsed.body || parsed.message || payload.body,
        url: parsed.url || (parsed.incidentId ? `/mobile/history?incidentId=${parsed.incidentId}` : payload.url),
        tag: parsed.tag || (parsed.incidentId ? `srq-incident-${parsed.incidentId}` : payload.tag),
      };
    } catch {
      try {
        payload.body = event.data.text() || payload.body;
      } catch {}
    }
  }

  event.waitUntil(
    self.registration.showNotification(payload.title, {
      body: payload.body,
      icon: '/icon-192.png',
      badge: '/icon-192.png',
      tag: payload.tag,
      renotify: true,
      vibrate: [200, 100, 200],
      data: { url: payload.url },
    })
  );
});

// Notification click: focuses open PWA/browser tab and navigates to the target incident or notifications page
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const targetUrl = (event.notification.data && event.notification.data.url) || '/mobile/notifications';

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          client.postMessage({
            type: 'NOTIFICATION_CLICK',
            url: targetUrl,
          });
          return client.focus();
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow(targetUrl);
      }
    })
  );
});

// Fetch: network-first for navigation and API; stale-while-revalidate for static assets
self.addEventListener('fetch', (event) => {
  const req = event.request;
  const url = new URL(req.url);

  // 0. NEVER intercept cross-origin requests (e.g. Render backend, external APIs, /health)
  if (url.origin !== self.location.origin) {
    return;
  }

  // 1. Bypass non-GET requests, SSE, and API requests directly to network
  if (
    req.method !== 'GET' ||
    url.pathname.startsWith('/api') ||
    url.pathname.includes('/sse') ||
    url.pathname.includes('/socket.io')
  ) {
    return;
  }

  // 2. Navigation requests: try network first; if offline, return cached shell or offline.html
  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req)
        .then((response) => {
          if (response.status === 200) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(req, clone));
          }
          return response;
        })
        .catch(async () => {
          const cached = await caches.match(req);
          if (cached) return cached;
          const rootCached = await caches.match('/');
          if (rootCached) return rootCached;
          const offlinePage = await caches.match('/offline.html');
          if (offlinePage) return offlinePage;
          return new Response('Offline', { status: 503, statusText: 'Offline' });
        })
    );
    return;
  }

  // 3. Static assets: cache-first or network fallback
  event.respondWith(
    caches.match(req).then((cached) => {
      if (cached) return cached;
      return fetch(req).then((response) => {
        if (response.status === 200 && url.origin === self.location.origin) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(req, clone));
        }
        return response;
      });
    })
  );
});
