const CACHE_NAME = 'my-cache-v1';

const openCache = () => caches.open(CACHE_NAME);

addEventListener('install', async (e) => {
  e.waitUntil(
    (async () => {
      const cache = await openCache();

      // Caching using the shorthand
      await cache.addAll([
        '/',
        'https://api.github.com/users/gaearon',
        'https://api.github.com/users/facebook',
      ]);

      // Caching manually without the above shorthand
      const test = await fetch('https://api.github.com/users/ThisseasX');
      await cache.put('https:/fakeurl.that.doesnt.exist', test);

      // Activate immediately on installation
      return skipWaiting();
    })(),
  );
});

addEventListener('activate', (e) => {
  // Force all active pages to use this service worker
  // without refreshing
  e.waitUntil(clients.claim());
});

// Intercept `fetch` calls
addEventListener('fetch', (e) => {
  e.respondWith(
    (async () => {
      const match = await caches.match(e.request.url);

      // If found in cache, return it.
      if (match) {
        return match;
      } else {
        const fetched = await fetch(e.request.url);

        // If not found in cache, request it, clone
        // the stream, let the cache consume the cloned response stream,
        // and return the original response stream to the caller
        const cache = await openCache();
        await cache.put(e.request.url, fetched.clone());

        return fetched;
      }
    })(),
  );
});
