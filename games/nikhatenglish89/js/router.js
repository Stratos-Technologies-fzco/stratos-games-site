// Tiny hash router: #/map, #/world/beach, #/level/beach-01 ...

const routes = [];
let notFound = null;
let beforeEach = null;
let cleanup = null;

export function route(pattern, handler, opts = {}) {
  const keys = [];
  const re = new RegExp(
    '^' +
      pattern.replace(/:(\w+)/g, (_, k) => {
        keys.push(k);
        return '([^/]+)';
      }) +
      '$'
  );
  routes.push({ re, keys, handler, opts });
}

export function setNotFound(handler) {
  notFound = handler;
}

export function setGuard(fn) {
  beforeEach = fn;
}

export function navigate(path, { replace = false } = {}) {
  const hash = '#' + path;
  if (location.hash === hash) {
    resolve();
    return;
  }
  if (replace) {
    history.replaceState(null, '', hash);
    resolve();
  } else {
    location.hash = hash;
  }
}

export function currentPath() {
  return location.hash.replace(/^#/, '') || '/';
}

export async function resolve() {
  const path = currentPath();
  for (const r of routes) {
    const m = path.match(r.re);
    if (!m) continue;
    const params = Object.fromEntries(r.keys.map((k, i) => [k, decodeURIComponent(m[i + 1])]));
    if (beforeEach) {
      const redirect = beforeEach(path, r.opts);
      if (redirect && redirect !== path) {
        navigate(redirect, { replace: true });
        return;
      }
    }
    if (typeof cleanup === 'function') {
      try {
        cleanup();
      } catch {
        /* ignore */
      }
    }
    cleanup = await r.handler(params);
    return;
  }
  if (notFound) notFound(path);
}

export function startRouter() {
  window.addEventListener('hashchange', resolve);
  return resolve();
}
