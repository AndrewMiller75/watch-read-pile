/* Watch & Read Pile - service worker
   Strategy:
     - index.html, manifest and navigations: NETWORK FIRST, fall back to cache.
       This is what makes an update actually land. The old cache-first worker
       would serve a stale catalogue forever.
     - icons and other static assets: CACHE FIRST (they never change).
   The cache name carries a build stamp so a deploy discards the previous cache
   outright rather than relying on anyone remembering to bump a version string.
*/
const BUILD = '20260901-220002';
const CACHE = 'wrpile-' + BUILD;
const PRECACHE = [
  './',
  './index.html',
  './manifest.webmanifest',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/icon-maskable-512.png'
];

self.addEventListener('install', function (e) {
  e.waitUntil(
    caches.open(CACHE)
      .then(function (c) { return c.addAll(PRECACHE); })
      .then(function () { return self.skipWaiting(); })
  );
});

self.addEventListener('activate', function (e) {
  e.waitUntil(
    caches.keys()
      .then(function (ks) {
        return Promise.all(ks.filter(function (k) { return k !== CACHE; })
                             .map(function (k) { return caches.delete(k); }));
      })
      .then(function () { return self.clients.claim(); })
  );
});

function networkFirst(req) {
  return fetch(req)
    .then(function (resp) {
      if (resp && resp.ok) {
        var cp = resp.clone();
        caches.open(CACHE).then(function (c) { c.put(req, cp); });
      }
      return resp;
    })
    .catch(function () {
      return caches.match(req).then(function (r) {
        return r || caches.match('./index.html');
      });
    });
}

function cacheFirst(req) {
  return caches.match(req).then(function (r) {
    return r || fetch(req).then(function (resp) {
      if (resp && resp.ok) {
        var cp = resp.clone();
        caches.open(CACHE).then(function (c) { c.put(req, cp); });
      }
      return resp;
    });
  });
}

self.addEventListener('fetch', function (e) {
  if (e.request.method !== 'GET') return;
  var url = new URL(e.request.url);
  if (url.origin !== self.location.origin) return;

  var isDoc = e.request.mode === 'navigate' ||
              /\/$|index\.html$|\.webmanifest$/.test(url.pathname);

  e.respondWith(isDoc ? networkFirst(e.request) : cacheFirst(e.request));
});
