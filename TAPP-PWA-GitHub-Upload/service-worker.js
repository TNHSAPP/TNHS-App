/* TAPP service worker: prefer fresh deployed files; use cached shell when offline. */
const CACHE_NAME = 'tapp-shell-v1';
const APP_ROOT = self.registration.scope;
const APP_SHELL = [
  new URL('./', APP_ROOT).href,
  new URL('./index.html', APP_ROOT).href,
  new URL('./firebase-config.js', APP_ROOT).href,
  new URL('./manifest.webmanifest', APP_ROOT).href,
  new URL('./tapp-192.png', APP_ROOT).href,
  new URL('./tapp-512.png', APP_ROOT).href,
  new URL('./tapp-512-maskable.png', APP_ROOT).href,
  new URL('./tapp-180.png', APP_ROOT).href
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
      .then(keys => Promise.all(
        keys.filter(key => key.startsWith('tapp-shell-') && key !== CACHE_NAME)
          .map(key => caches.delete(key))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  // Do not intercept Firebase, Google authentication, or other third-party requests.
  if (url.origin !== self.location.origin || !url.href.startsWith(APP_ROOT)) return;

  // Network-first navigation: installed users receive the latest deployed HTML.
  if (request.mode === 'navigate') {
    event.respondWith((async () => {
      const cache = await caches.open(CACHE_NAME);
      try {
        const response = await fetch(request);
        if (response.ok) await cache.put(new URL('./index.html', APP_ROOT).href, response.clone());
        return response;
      } catch {
        return (await cache.match(new URL('./index.html', APP_ROOT).href)) || Response.error();
      }
    })());
    return;
  }

  // Network-first for same-origin static files so online GitHub deployments stay current.
  event.respondWith((async () => {
    const cache = await caches.open(CACHE_NAME);
    try {
      const response = await fetch(request);
      if (response.ok) await cache.put(request, response.clone());
      return response;
    } catch {
      return (await cache.match(request)) || Response.error();
    }
  })());
});
