// Service Worker for offline access
const CACHE_NAME = 'farm-teens-v1';
const URLS_TO_CACHE = [
  '/',
  '/index.html',
  '/about.html',
  '/programs.html',
  '/partners.html',
  '/blog.html',
  '/get-involved.html',
  '/donate.html',
  '/contact.html',
  '/style.css',
  '/script.js',
  '/chatbot.css',
  '/chatbot.js',
  '/debug_checker.py',
  '/analyze_report.py',
  '/images/logo.png',
  '/images/homena.jpg',
  '/images/abouttt.jpg',
  'https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css'
];

// Install event - cache assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Caching app assets');
      return cache.addAll(URLS_TO_CACHE).catch((err) => {
        console.log('Some assets failed to cache, continuing anyway:', err);
      });
    })
  );
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  // Don't cache non-GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((response) => {
      // Return cached version if available
      if (response) {
        return response;
      }

      // Otherwise fetch from network
      return fetch(event.request)
        .then((response) => {
          // Don't cache if not a successful response
          if (!response || response.status !== 200) {
            return response;
          }

          // Clone the response
          const responseToCache = response.clone();

          // Cache successful responses
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });

          return response;
        })
        .catch(() => {
          // Offline fallback - return offline page if available
          return caches.match('/index.html');
        });
    })
  );
});
