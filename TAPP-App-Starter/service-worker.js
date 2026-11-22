/* TAPP offline app-shell cache. This does NOT cache Firebase data or enable
   report/forum synchronization. Those remain online Firebase operations. */
const CACHE_NAME = 'tapp-shell-v1';
const APP_ROOT = self.registration.scope;
const APP_SHELL = [
  new URL('./', APP_ROOT).href,
  new URL('./index.html', APP_ROOT).href,
  new URL('./firebase-config.js', APP_ROOT).href,
  new URL('./manifest.webmanifest', APP_ROOT).href,
  new URL('./icons/tapp-192.png', APP_ROOT).href,
  new URL('./icons/tapp-512.png', APP_ROOT).href,
  new URL('./icons/tapp-512-maskable.png', APP_ROOT).href,
  new URL('./icons/tapp-180.png', APP_ROOT).href
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(key => key.startsWith('tapp-shell-') && key !== CACHE_NAME).map(key => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  // Never intercept Firebase, Google, or other third-party requests.
  if (url.origin !== self.location.origin) return;

  // Network-first for page navigations so users receive the latest app.
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then(response => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(new URL('./index.html', APP_ROOT).href, copy));
          return response;
        })
        .catch(async () => (await caches.match(new URL('./index.html', APP_ROOT).href)) || Response.error())
    );
    return;
  }

  // Cache-first only for same-origin static assets under this app's scope.
  if (url.href.startsWith(APP_ROOT) && ['script', 'style', 'image', 'font'].includes(request.destination)) {
    event.respondWith(
      caches.match(request).then(cached => cached || fetch(request).then(response => {
        if (response.ok) {
          const copy = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(request, copy));
        }
        return response;
      }))
    );
  }
});
