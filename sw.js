const CACHE_NAME = 'my-cache-v1';

const openCache = () => caches.open(CACHE_NAME);

addEventListener('install', async e => {
  e.waitUntil(
    (async () => {
      const cache = await openCache();
      await cache.addAll([
        '/',
        'https://jsonplaceholder.typicode.com/todos/1',
        'https://jsonplaceholder.typicode.com/todos/2',
      ]);

      const test = await fetch('https://jsonplaceholder.typicode.com/todos/5');
      await cache.put('/test', test);

      return skipWaiting();
    })(),
  );
});

addEventListener('activate', e => {
  e.waitUntil(clients.claim());
});

addEventListener('fetch', e => {
  e.respondWith(
    (async () => {
      const match = await caches.match(e.request.url);

      if (match) {
        return match;
      } else {
        const fetched = await fetch(e.request.url);

        const cache = await openCache();
        await cache.put(e.request.url, fetched.clone());

        return fetched;
      }
    })(),
  );
});
