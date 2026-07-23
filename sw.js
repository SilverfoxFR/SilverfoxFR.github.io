const CACHE_NAME = 'modular-engine-v1';
const FILES_TO_CACHE = [
  './index.html',
  './src/style.css',
];

function swLog(msg) {
  console.log("[SW]", msg);

  if (self.clients && self.clients.matchAll) {
    self.clients.matchAll().then(clients => {
      clients.forEach(client => {
        client.postMessage({ type: "sw-log", message: msg });
      });
    });
  }
}

swLog("[LOG] The sw.js file was called and launched correctly !");
// Install event: caching files
self.addEventListener('install', (event) => {
  swLog('[SW] Installing...');
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      swLog('[SW] Caching files...');
      return cache.addAll(FILES_TO_CACHE);
    })
  );
  self.skipWaiting(); // take control immediately
});


// Activate event: cleanup old caches if needed
self.addEventListener('activate', (event) => {
  swLog('[SW] Activating...');
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.map(key => {
          if (key !== CACHE_NAME) return caches.delete(key);
        })
      )
    )
  );
  self.clients.claim(); // take control of all clients immediately
});

// Fetch event: serve from cache first, then network fallback
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request);
    }).catch(() => {
      // Show which file caused the offline error
      return new Response(
        `Offline: File not available → ${event.request.url}`,
        { status: 503, statusText: 'Service Worker offline' }
      );
    })
  );
});










