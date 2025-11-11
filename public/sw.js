const CACHE_NAME = 'college-bus-tracker-v1';
const urlsToCache = [
  '/',
  '/index.html'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', event => {
  // For navigation requests, always serve index.html to support client-side routing
  if (event.request.mode === 'navigate') {
    event.respondWith(caches.match('/index.html') 
      .then(response => response || fetch('/index.html'))
    );
    return;
  }

  // For other requests, try to serve from cache first
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Return cached version or fetch from network
        if (response) {
          return response;
        }
        
        // Clone the request to consume it safely
        const fetchRequest = event.request.clone();
        
        return fetch(fetchRequest).catch(error => {
          // Log the error but don't throw it to prevent unhandled promise rejection
          console.warn('Fetch failed for:', event.request.url, error);
          // Return a basic response or rethrow if it's a critical resource
          return new Response('Network error occurred', {
            status: 503,
            statusText: 'Service Unavailable'
          });
        });
      })
  );
});