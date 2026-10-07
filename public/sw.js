const CACHE_NAME = 'lhtt-app-v1.1.0';

const STATIC_SHELL_ASSETS = [
  '/',
  '/index.html',
  '/manifest.webmanifest',
  '/favicon.ico',
];

// 1. Install Event - Cache Static App Shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_SHELL_ASSETS);
    })
  );
  self.skipWaiting();
});

// 2. Activate Event - Clean Up Old Caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((name) => {
          if (name !== CACHE_NAME) {
            return caches.delete(name);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// 3. Fetch Event - Network-First for APIs/Realtime, Cache-First for Static Assets
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // STRICT RULE: NEVER cache Firestore, Firebase Auth, or Gemini API network requests!
  if (
    url.hostname.includes('firestore.googleapis.com') ||
    url.hostname.includes('identitytoolkit.googleapis.com') ||
    url.hostname.includes('firebase') ||
    url.hostname.includes('generativelanguage.googleapis.com')
  ) {
    return; // Pass through to network natively
  }

  // Network-first strategy for navigation / static assets
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Cache valid HTTP responses for static assets
        if (response.status === 200 && event.request.method === 'GET') {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
        }
        return response;
      })
      .catch(() => {
        // If network offline, serve from cache
        return caches.match(event.request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          if (event.request.mode === 'navigate') {
            return caches.match('/index.html');
          }
          return new Response('Không có kết nối mạng', {
            status: 503,
            statusText: 'Service Unavailable',
          });
        });
      })
  );
});
