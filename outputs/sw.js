const CACHE = 'ea-v1';
const STATIC = [
  '/',
  '/css/main.css',
  '/js/data/modules.js',
  '/js/modules/breathing.js',
  '/js/modules/coldwater.js',
  '/js/modules/butterfly.js',
  '/js/modules/grounding.js',
  '/js/modules/gargling.js',
  '/js/modules/smile.js',
  '/js/modules/movement.js',
  '/js/modules/powerpose.js',
  '/js/modules/humming.js',
  '/js/modules/journaling.js',
  '/js/modules/physiosigh.js',
  '/js/modules/breathing478.js',
  '/js/modules/eft.js',
  '/js/modules/stretching.js',
  '/js/modules/selfmassage.js',
  '/js/modules/pmr.js',
  '/js/modules/meditation.js',
  '/js/modules/bodyscan.js',
  '/js/modules/visualization.js',
  '/js/modules/cogdefusion.js',
  '/js/modules/cogreframing.js',
  '/js/selector.js',
  '/js/app.js',
  '/js/pwa.js',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(STATIC)));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  // No cachear YouTube ni Google
  if (e.request.url.includes('youtube.com') ||
      e.request.url.includes('googleapis.com') ||
      e.request.url.includes('googletagmanager.com') ||
      e.request.url.includes('vercel')) return;

  e.respondWith(
    caches.match(e.request).then(cached => {
      if (cached) return cached;
      return fetch(e.request).then(res => {
        if (!res || res.status !== 200 || res.type === 'opaque') return res;
        const clone = res.clone();
        caches.open(CACHE).then(c => c.put(e.request, clone));
        return res;
      });
    })
  );
});
