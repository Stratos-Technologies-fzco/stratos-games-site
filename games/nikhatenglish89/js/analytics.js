// Optional, anonymous, cookie-free usage counts. Disabled unless an endpoint
// is set in data/config.json AND the parent has not switched it off.
// Sends only event names and level/world/engine ids: no nickname, no device
// identifier, no cookies. Uses the Matomo HTTP tracking API format so a
// self-hosted Matomo (cookieless mode) on the WordPress hosting can receive
// it. Any failure is swallowed: analytics must never affect gameplay.

import { content } from './content.js';
import { state } from './state.js';

function config() {
  return (content.config && content.config.analytics) || {};
}

export function analyticsAvailable() {
  const cfg = config();
  return !!(cfg.enabled && cfg.endpoint);
}

export function track(category, action, name = '') {
  try {
    if (!analyticsAvailable() || !state.settings.analytics) return;
    if (navigator.doNotTrack === '1') return;
    const cfg = config();
    const params = new URLSearchParams({
      idsite: String(cfg.siteId || 1),
      rec: '1',
      apiv: '1',
      e_c: category,
      e_a: action,
      e_n: name,
      url: location.origin + location.pathname,
      rand: String(Math.floor(Math.random() * 1e9))
    });
    const url = `${cfg.endpoint}?${params}`;
    if (navigator.sendBeacon) navigator.sendBeacon(url);
    else fetch(url, { method: 'POST', mode: 'no-cors', keepalive: true, credentials: 'omit' }).catch(() => {});
  } catch {
    /* dropped silently */
  }
}

export function installErrorTracking() {
  window.addEventListener('error', () => track('app', 'error'));
  window.addEventListener('unhandledrejection', () => track('app', 'error'));
}
