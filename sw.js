const CACHE_NAME = 'linkpoint-v17.0';
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
  '/shared-ui.js',
  '/mpesa.js',
  '/real_nairobi_aerial.jpg',
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
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.skipWaiting();
});

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  // Always go to network for API and HTML to ensure live updates
  if (e.request.url.includes('/api/') || e.request.mode === 'navigate') {
    return e.respondWith(
      fetch(e.request).catch(() => caches.match(e.request))
    );
  }

  e.respondWith(
    caches.match(e.request).then(cached => {
      return cached || fetch(e.request).then(response => {
        const clone = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(e.request, clone));
        return response;
      });
    }).catch(() => caches.match('/index.html'))
  );
});
