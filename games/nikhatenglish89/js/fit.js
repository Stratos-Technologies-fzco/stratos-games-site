// Keeps every screen inside the window with no scrolling.
// If a screen is taller (or wider) than the window, it is shrunk just enough to fit.

const MIN_FIT = 0.4;
let queued = false;

function measure() {
  queued = false;
  const app = document.getElementById('app');
  const screen = app && app.firstElementChild;
  if (!screen) return;
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  // measure at natural size first
  screen.style.setProperty('--fit', '1');
  screen.style.zoom = '1';
  const needH = screen.scrollHeight;
  const needW = screen.scrollWidth;
  let f = Math.min(1, vh / needH, vw / needW);
  if (!Number.isFinite(f) || f <= 0) f = 1;
  f = Math.max(MIN_FIT, Math.floor(f * 1000) / 1000);
  screen.style.setProperty('--fit', String(f));
  screen.style.zoom = String(f);
  document.documentElement.style.setProperty('--fit-now', String(f));
}

export function refit() {
  if (queued) return;
  queued = true;
  requestAnimationFrame(measure);
}

export function initFit() {
  const app = document.getElementById('app');
  if (!app) return;
  new MutationObserver(refit).observe(app, { childList: true, subtree: true, characterData: true });
  window.addEventListener('resize', refit);
  window.addEventListener('orientationchange', refit);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(refit);
  window.addEventListener('load', refit);
  refit();
}
