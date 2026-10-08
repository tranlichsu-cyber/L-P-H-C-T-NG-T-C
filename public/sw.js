const CACHE_NAME = 'lhtt-shell-v2';

const SHELL_ASSETS = [
  '/manifest.webmanifest',
  '/favicon.ico',
];

// Install only tiny stable shell assets. Never pre-cache index.html or JS chunks.
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(SHELL_ASSETS))
  );
  self.skipWaiting();
});

// Activate immediately and remove all older app caches.
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) =>
      Promise.all(
        cacheNames.map((name) => {
          if (name !== CACHE_NAME) return caches.delete(name);
          return Promise.resolve(false);
        })
      )
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  const url = new URL(request.url);

  if (request.method !== 'GET') return;

  // Never cache Firebase / Auth / Firestore / AI network traffic.
  if (
    url.hostname.includes('firestore.googleapis.com') ||
    url.hostname.includes('identitytoolkit.googleapis.com') ||
    url.hostname.includes('firebase') ||
    url.hostname.includes('generativelanguage.googleapis.com')
  ) {
    return;
  }

  // Navigation must always prefer the latest deployed index.html.
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request, { cache: 'no-store' }).catch(async () => {
        const cached = await caches.match('/index.html');
        return cached || new Response('Không có kết nối mạng', {
          status: 503,
          statusText: 'Service Unavailable',
        });
      })
    );
    return;
  }

  // Vite chunks must always come from the network/browser HTTP cache.
  // Do NOT put hashed JS/CSS into the Service Worker cache.
  if (
    url.pathname.startsWith('/assets/') ||
    url.pathname.endsWith('.js') ||
    url.pathname.endsWith('.css') ||
    url.pathname.endsWith('.map')
  ) {
    event.respondWith(fetch(request));
    return;
  }

  // Cache only stable public assets with network-first fallback.
  event.respondWith(
    fetch(request)
      .then((response) => {
        if (response.ok) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
        }
        return response;
      })
      .catch(async () => {
        const cached = await caches.match(request);
        return cached || new Response('Không có kết nối mạng', {
          status: 503,
          statusText: 'Service Unavailable',
        });
      })
  );
});
