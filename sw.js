const CACHE_NAME = 'modular-engine-v1';
const FILES_TO_CACHE = [
  './index.html',
  './src/style.css',
  './src/main.js',
  './src/shell/logger.js',
  './src/shell/homeUI.js',
  './src/shell/MenuHandler.js',
  './src/shell/packLoader.js',
  './vendor/jszip.min.js',
  './packs/index.json',
  './packs/Adventure/scripts/entry.js',
  './packs/Adventure/FileContent.json',
  './packs/Adventure/icon.png',
  './packs/Adventure/README.md',
  './packs/Adventure/SelfDesc.json',
  './WebAssets/icon.png',
  './WebAssets/bg.png'
  // Add more files here manually if you want to cache specific pack icons or scripts
];

console.log("[LOG] The sw.js file was called and launched correctly !");
// Install event: caching files
self.addEventListener('install', (event) => {
  console.log('[SW] Installing...');
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('[SW] Caching files...');
      return cache.addAll(FILES_TO_CACHE);
    })
  );
  self.skipWaiting(); // take control immediately
});

// Activate event: cleanup old caches if needed
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating...');
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



