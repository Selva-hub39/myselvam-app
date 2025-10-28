const CACHE_NAME = 'my-selvam-cache-v7'; // Version bumped to ensure a fresh install

// List of all local and remote assets required for the app to function offline.
const urlsToCache = [
  // Local App Shell
  './',
  './index.html',
  './logo.svg',
  './manifest.json',

  // Local Source Code (The browser will request these due to the importmap)
  './index.tsx',
  './App.tsx',
  './types.ts',
  './data/mockData.ts',
  './components/Dashboard.tsx',
  './components/Portfolio.tsx',
  './components/Gold.tsx',
  './components/Expenses.tsx',
  './components/Assets.tsx',
  './components/Goals.tsx',
  './components/common/Card.tsx',
  './components/common/Icons.tsx',
  './utils/finance.ts',
  './utils/casParser.ts',

  // --- CRITICAL OFFLINE DEPENDENCIES (Remote) ---
  // These will be fetched with standard CORS requests, which is correct for CDNs.
  'https://cdn.tailwindcss.com',
  'https://unpkg.com/@babel/standalone/babel.min.js',
  
  // From Import Map
  'https://aistudiocdn.com/react@^19.2.0',
  'https://aistudiocdn.com/react-dom@^19.2.0/client',
  'https://aistudiocdn.com/recharts@^3.3.0',
  'https://aistudiocdn.com/@google/genai@^1.27.0',
  // React's internal dependencies that might be requested
  'https://aistudiocdn.com/react@^19.2.0/jsx-runtime'
];

self.addEventListener('install', event => {
  // Perform install steps
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache. Caching all app assets.');
        // addAll makes standard CORS requests. This is correct for CDNs 
        // that have permissive CORS headers, which these do.
        return cache.addAll(urlsToCache);
      })
      .then(() => self.skipWaiting()) // Force the waiting service worker to become the active one.
      .catch(error => {
        console.error('Failed to cache assets during install:', error);
      })
  );
});

self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim()) // Take control of all open clients immediately.
  );
});


self.addEventListener('fetch', event => {
    // Use a "cache-first" strategy.
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                // Cache hit - return response from cache.
                if (response) {
                    return response;
                }

                // Not in cache - fetch from the network.
                return fetch(event.request).then(
                    networkResponse => {
                        // Check if we received a valid response.
                        if (!networkResponse || networkResponse.status !== 200) {
                            return networkResponse;
                        }

                        // IMPORTANT: Clone the response. A response is a stream
                        // and can only be consumed once. We need one for the browser
                        // and one for the cache.
                        const responseToCache = networkResponse.clone();

                        caches.open(CACHE_NAME)
                            .then(cache => {
                                cache.put(event.request, responseToCache);
                            });

                        return networkResponse;
                    }
                ).catch(error => {
                    // This handles fetch errors, e.g., when the user is offline.
                    console.error('Fetch failed; user is likely offline. Request:', event.request.url, error);
                    // Optionally, return a fallback offline page here.
                });
            })
    );
});
