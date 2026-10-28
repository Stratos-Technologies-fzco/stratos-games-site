/* BrainRush Daily service worker: app shell + puzzle packs work offline after a first visit.
   Every URL is resolved against the worker's own scope, so the game works from any folder. */
const VERSION = 'v4';
const SHELL = `brd-shell-${VERSION}`;
const PACKS = `brd-packs-${VERSION}`;
const BASE = self.registration.scope; // always ends with "/"
const abs = (p) => new URL(p, BASE).href;
const PACK_PATH = new URL('packs/', BASE).pathname;
const PRECACHE = ['', 'manifest.webmanifest', 'icons/icon.svg', 'icons/icon-192.png', 'packs/tutorial-pack.json'].map(abs);

/** Cache the hashed build assets referenced by the shell, and the next week of packs. */
async function precacheAll() {
  const shell = await caches.open(SHELL);
  await shell.addAll(PRECACHE);
  const html = await (await fetch(abs(''))).text();
  const assets = [...html.matchAll(/(?:src|href)="(\.\/assets\/[^"]+)"/g)].map((m) => abs(m[1]));
  await shell.addAll(assets);

  const packs = await caches.open(PACKS);
  try {
    const manifest = await (await fetch(abs('packs/pack-manifest.json'))).json();
    await packs.add(abs('packs/pack-manifest.json'));
    // Local dates sit within a day of UTC, so start from yesterday (UTC) to cover every time zone.
    const from = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
    const upcoming = Object.keys(manifest.packs).filter((d) => d >= from).sort().slice(0, 9);
    await Promise.all(upcoming.map((d) => packs.add(abs(`packs/${d}.json`)).catch(() => {})));
  } catch {
    /* packs are also cached on demand */
  }
}

self.addEventListener('install', (e) => {
  e.waitUntil(precacheAll().then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => ![SHELL, PACKS].includes(k)).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== location.origin) return; // never touch other sites

  // Pack manifest and packs: network first (so new releases land), cache fallback offline.
  if (url.pathname.startsWith(PACK_PATH)) {
    e.respondWith(
      fetch(req)
        .then((res) => {
          if (res.ok) caches.open(PACKS).then((c) => c.put(req, res.clone()));
          return res;
        })
        .catch(() => caches.match(req).then((hit) => hit || new Response('', { status: 404 }))),
    );
    return;
  }

  // Navigations: network first, fall back to the cached shell.
  if (req.mode === 'navigate') {
    e.respondWith(
      fetch(req)
        .then((res) => {
          caches.open(SHELL).then((c) => c.put(abs(''), res.clone()));
          return res;
        })
        .catch(() => caches.match(abs(''))),
    );
    return;
  }

  // Everything else (hashed assets, fonts): stale-while-revalidate.
  e.respondWith(
    caches.match(req).then((hit) => {
      const net = fetch(req)
        .then((res) => {
          if (res.ok) caches.open(SHELL).then((c) => c.put(req, res.clone()));
          return res;
        })
        .catch(() => hit);
      return hit || net;
    }),
  );
});
