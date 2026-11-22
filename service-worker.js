/* TAPP service worker
   Network-first caching means online visits use the newest files deployed from GitHub
   through Cloudflare Pages. Cached files are only used as an offline fallback.
*/
const CACHE_NAME = 'tapp-shell-v1';

const APP_SHELL_URLS = [
  new URL('./', self.registration.scope).href,
  new URL('./index.html', self.registration.scope).href,
  new URL('./manifest.webmanifest', self.registration.scope).href,
  new URL('./tapp-180.png', self.registration.scope).href,
  new URL('./tapp-192.png', self.registration.scope).href,
  new URL('./tapp-512.png', self.registration.scope).href,
  new URL('./tapp-512-maskable.png', self.registration.scope).href
];

self.addEventListener('install', event => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);
    await cache.addAll(APP_SHELL_URLS);
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const cacheNames = await caches.keys();
    await Promise.all(
      cacheNames
        .filter(name => name.startsWith('tapp-shell-') && name !== CACHE_NAME)
        .map(name => caches.delete(name))
    );
    await self.clients.claim();
  })());
});

self.addEventListener('message', event => {
  if (event.data?.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

self.addEventListener('fetch', event => {
  const request = event.request;

  // Never cache writes, authentication requests, or third-party Firebase/Google requests.
  if (request.method !== 'GET') return;

  const requestUrl = new URL(request.url);
  if (requestUrl.origin !== self.location.origin) return;

  event.respondWith((async () => {
    const cache = await caches.open(CACHE_NAME);

    try {
      // Network first: current Cloudflare deployment wins whenever the device is online.
      const response = await fetch(request);

      if (response && response.ok && response.type === 'basic') {
        try {
          await cache.put(request, response.clone());
        } catch (cacheError) {
          // A cache write failure must not prevent the live page from loading.
          console.warn('TAPP cache update skipped:', cacheError);
        }
      }

      return response;
    } catch (networkError) {
      const cachedResponse = await cache.match(request);
      if (cachedResponse) return cachedResponse;

      if (request.mode === 'navigate') {
        const offlinePage = await cache.match(
          new URL('./index.html', self.registration.scope).href
        );
        if (offlinePage) return offlinePage;
      }

      return new Response('TAPP is offline. Please reconnect to the internet and try again.', {
        status: 503,
        headers: { 'Content-Type': 'text/plain; charset=utf-8' }
      });
    }
  })());
});
