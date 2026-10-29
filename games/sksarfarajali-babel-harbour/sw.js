// Caches the app and any language file the player loads, so Free Sail and the Daily work offline.
const CACHE = 'babel-harbour-v2';
const SHELL = ['./', 'index.html', 'css/app.css', 'css/fonts.css', 'fonts/fredoka-500.ttf', 'fonts/fredoka-600.ttf', 'fonts/fredoka-700.ttf', 'fonts/nunito-400.ttf', 'fonts/nunito-600.ttf', 'fonts/nunito-700.ttf', 'fonts/nunito-800.ttf', 'manifest.webmanifest', 'icons/icon.svg', 'icons/icon-192.png', 'icons/icon-512.png',
  'js/main.js', 'js/store.js', 'js/engine.js', 'js/game.js', 'js/audio.js', 'js/art.js', 'data/de.json'];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  const sameOrigin = url.origin === location.origin;
  const isFont = /fonts\.(googleapis|gstatic)\.com$/.test(url.hostname);
  if (!sameOrigin && !isFont) return;
  // same-origin: network first so updates arrive, cache as fallback. fonts: cache first.
  if (isFont) {
    e.respondWith(caches.match(req).then((hit) => hit || fetch(req).then((res) => { const copy = res.clone(); caches.open(CACHE).then((c) => c.put(req, copy)); return res; }).catch(() => hit)));
    return;
  }
  e.respondWith(
    fetch(req).then((res) => { if (res.ok) { const copy = res.clone(); caches.open(CACHE).then((c) => c.put(req, copy)); } return res; })
      .catch(() => caches.match(req, { ignoreSearch: true }).then((hit) => hit || (req.mode === 'navigate' ? caches.match('index.html') : Response.error())))
  );
});
