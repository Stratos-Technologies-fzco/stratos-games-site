// Optional offline support (PWA). After the first online visit, these files
// are cached so the game can be replayed without a connection. Bump VERSION
// whenever game files change so players get the update.

const VERSION = 'mystery-island-v1.0.0';

const FILES = [
  './',
  'index.html',
  'manifest.webmanifest',
  'assets/ui/icon.svg',
  'css/base.css',
  'css/map.css',
  'css/game.css',
  'css/responsive.css',
  'js/app.js',
  'js/analytics.js',
  'js/audio.js',
  'js/content.js',
  'js/player.js',
  'js/rewards.js',
  'js/rng.js',
  'js/router.js',
  'js/state.js',
  'js/storage.js',
  'js/ui.js',
  'js/minigames/index.js',
  'js/minigames/common.js',
  'js/minigames/expr.js',
  'js/minigames/number.js',
  'js/minigames/word-builder.js',
  'js/minigames/memory-sequence.js',
  'js/minigames/pattern-puzzle.js',
  'js/minigames/object-hunt.js',
  'js/minigames/maze-path.js',
  'js/minigames/science-choice.js',
  'js/minigames/spot-difference.js',
  'js/screens/splash.js',
  'js/screens/profiles.js',
  'js/screens/setup.js',
  'js/screens/tutorial.js',
  'js/screens/map.js',
  'js/screens/world.js',
  'js/screens/level.js',
  'js/screens/camp.js',
  'js/screens/achievements.js',
  'js/screens/settings.js',
  'js/screens/parent.js',
  'data/config.json',
  'data/levels.json',
  'data/questions.json',
  'data/rewards.json',
  'data/achievements.json',
  'data/dialogue.json'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(VERSION)
      .then((cache) => cache.addAll(FILES))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k.startsWith('mystery-island-') && k !== VERSION).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// Stale-while-revalidate for the game's own files; everything else
// (e.g. optional analytics) goes straight to the network.
self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;
  const scope = new URL(self.registration.scope);
  if (!url.pathname.startsWith(scope.pathname)) return;

  event.respondWith(
    caches.open(VERSION).then(async (cache) => {
      const cached = await cache.match(req, { ignoreSearch: true });
      const network = fetch(req)
        .then((res) => {
          if (res.ok) cache.put(req, res.clone());
          return res;
        })
        .catch(() => null);
      if (cached) {
        event.waitUntil(network);
        return cached;
      }
      const res = await network;
      return res || new Response('Offline: connect to the internet to load Mystery Island.', { status: 503, headers: { 'Content-Type': 'text/plain' } });
    })
  );
});
