const CACHE_NAME = "bingelog-cache-v1";
const ASSETS_TO_CACHE = [
  "/",
  "/manifest.json",
  "/icon-192.png",
  "/icon-512.png",
  "/apple-touch-icon.png",
  "/favicon.ico"
];

// Install Event - Pre-cache basic shell assets
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    }).then(() => {
      return self.skipWaiting();
    })
  );
});

// Activate Event - Clean up old caches and claim clients
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log("[Service Worker] Deleting old cache:", cache);
            return caches.delete(cache);
          }
        })
      );
    }).then(() => {
      return self.clients.claim();
    })
  );
});

// Fetch Event - Caching Strategy
self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  // Bypass cache for API calls (local server or external GraphQL / REST)
  // and non-GET requests (e.g. database POST/PUT updates)
  if (
    url.pathname.startsWith("/api") ||
    url.hostname.includes("anilist.co") ||
    url.hostname.includes("tvmaze.com") ||
    url.hostname.includes("yts.mx") ||
    event.request.method !== "GET"
  ) {
    // Network-Only for dynamic data
    return;
  }

  // Stale-While-Revalidate strategy for static assets
  event.respondWith(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.match(event.request).then((cachedResponse) => {
        const fetchPromise = fetch(event.request)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              cache.put(event.request, networkResponse.clone());
            }
            return networkResponse;
          })
          .catch(() => {
            // Silence network errors when offline
          });

        // Return cached response immediately if found, otherwise wait for network
        return cachedResponse || fetchPromise;
      });
    })
  );
});
