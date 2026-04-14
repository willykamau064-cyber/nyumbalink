const CACHE_NAME = 'linkpoint-v3';
const ASSETS = [
  '/',
  '/index.html',
  '/join.html',
  '/bnb.html',
  '/sell.html',
  '/rentals.html',
  '/buy.html',
  '/commercial.html',
  '/about.html',
  '/user-dashboard.html',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png',
  '/paystack.js',
  '/mpesa.js',
  '/linkpoint-3d.js',
  '/nairobi360.png',
  '/kenya_house.png',
  '/kenyan_apartment.png',
  '/kenya_shop.png',
  '/kenya_bnb.png',
  '/bnb.png',
  '/nairobi_street.png',
  'https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&family=Playfair+Display:ital,wght@1,400;1,900&display=swap',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(ASSETS.map(url => new Request(url, { mode: 'no-cors' })));
    }).catch(() => {})
  );
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  e.waitUntil(clients.claim());
});

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  // Skip API calls - always go to network
  if (e.request.url.includes('/api/')) return;

  e.respondWith(
    caches.match(e.request).then(cached => {
      if (cached) return cached;
      return fetch(e.request).then(response => {
        const clone = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(e.request, clone));
        return response;
      }).catch(() => caches.match('/index.html'));
    })
  );
});
