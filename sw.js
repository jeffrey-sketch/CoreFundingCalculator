const CACHE_NAME = 'csg-calc-v3';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './style.css',
  './Core_Funding_Calculator_32x32.png',
  './Core_Funding_Calculator_512x512.png',
  './js/config.js',
  './js/utils.js',
  './js/templates.js',
  './js/floatingCalc.js',
  './js/core.js',
  './js/ui_schedule.js',
  './js/ui_reports.js',
  './js/main.js'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.match(event.request).then((cachedResponse) => {
        const fetchPromise = fetch(event.request).then((networkResponse) => {
          if (networkResponse.ok) {
            cache.put(event.request, networkResponse.clone());
          }
          return networkResponse;
        }).catch(() => {});
        return cachedResponse || fetchPromise;
      });
    })
  );
});