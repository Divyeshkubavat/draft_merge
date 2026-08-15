const CACHE_NAME = 'mergio-v1';
const PRECACHE_URLS = [
  '/',
  '/index.html',
  '/pdf.html',
  '/image.html',
  '/video.html',
  '/audio.html',
  '/text.html',
  '/converters.html',
  '/utility.html',
  '/privacy.html',
  '/terms.html',
  '/contact.html',
  '/css/style.css',
  '/js/common.js',
  '/js/app.js',
  '/assets/favicon-32.png',
  '/manifest.json'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(PRECACHE_URLS))
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.filter(name => name !== CACHE_NAME).map(name => caches.delete(name))
      );
    })
  );
});

self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  // Skip caching for COI service worker
  if (url.href.includes('coi-serviceworker')) {
    return;
  }

  // Network-only for CDN URLs
  if (url.origin !== location.origin) {
    return;
  }

  // Stale-while-revalidate for HTML/CSS/JS
  if (url.pathname.endsWith('.html') || url.pathname.endsWith('.css') || url.pathname.endsWith('.js') || url.pathname === '/') {
    event.respondWith(
      caches.match(event.request).then(cachedResponse => {
        const fetchPromise = fetch(event.request).then(networkResponse => {
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, networkResponse.clone()));
          return networkResponse;
        });
        return cachedResponse || fetchPromise;
      })
    );
  } else {
    // Cache-first for assets
    event.respondWith(
      caches.match(event.request).then(cachedResponse => {
        if (cachedResponse) {
          return cachedResponse;
        }
        return fetch(event.request).then(networkResponse => {
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, networkResponse.clone()));
          return networkResponse;
        });
      })
    );
  }
});
