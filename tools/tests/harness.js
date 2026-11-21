// Shared test harness for the Stratos site script (assets/stratos.js). It builds the script the same way CI does (tools/build.py)
// and runs it in a fake browser window, so no browser is needed. Used by resume.test.js; run:  node tools/tests/resume.test.js
const cp = require('child_process'), vm = require('vm'), path = require('path');
const ROOT = path.join(__dirname, '..', '..');

let built = null;
function buildSource() {
  if (built) return built;
  const py = "import sys;sys.path.insert(0,'tools');import build;sys.stdout.write(build.STRATOS_JS)";
  built = cp.execFileSync(process.platform === 'win32' ? 'python' : 'python3', ['-W', 'ignore', '-c', py], { cwd: ROOT, encoding: 'utf8', env: Object.assign({}, process.env, { PYTHONIOENCODING: 'utf-8' }), maxBuffer: 64 * 1024 * 1024 });
  return built;
}

function makeStorage(opts) {
  opts = opts || {};
  const m = {};
  const st = { m, quota: opts.quota || Infinity,
    getItem(k) { if (opts.blocked) throw new Error('blocked'); return k in m ? m[k] : null; },
    setItem(k, v) { if (opts.blocked) throw new Error('blocked'); const size = Object.keys(m).reduce((a, x) => a + (x === k ? 0 : m[x].length + x.length), 0) + String(v).length + k.length; if (size > st.quota) throw new Error('quota'); m[k] = String(v); },
    removeItem(k) { if (opts.blocked) throw new Error('blocked'); delete m[k]; },
    key(i) { return Object.keys(m)[i] || null; },
    get length() { return Object.keys(m).length; } };
  return st;
}

// One "tab": a fresh window running stratos.js on the given page path, sharing a storage object.
function page(pathname, opts) {
  opts = opts || {};
  const ls = opts.storage || makeStorage(), timers = [], listeners = {}, dlisteners = {};
  const mkEl = () => { const e = { style: {}, setAttribute() {}, appendChild() {}, removeChild() {}, addEventListener() {}, parentNode: null }; e.attachShadow = () => ({ innerHTML: '', querySelector: () => ({ textContent: '' }) }); return e; };
  const doc = { currentScript: { src: 'http://localhost/assets/stratos.js' }, readyState: 'complete', visibilityState: 'visible',
    querySelector: s => (opts.kids && /stratos-kids/.test(s) ? {} : null), querySelectorAll: () => [], getElementById: () => null, createElement: mkEl, head: { appendChild() {} }, body: mkEl(),
    addEventListener(n, f) { (dlisteners[n] = dlisteners[n] || []).push(f); } };
  const win = { localStorage: ls, location: { pathname, hostname: 'localhost' }, crypto: { getRandomValues: a => a }, console: { info() {} },
    Promise, JSON, Math, Date, Uint8Array, Array, parseInt, Object, matchMedia: () => ({ matches: true }),
    addEventListener(n, f) { (listeners[n] = listeners[n] || []).push(f); },
    setTimeout: (f, t) => { timers.push({ f, t, live: true }); return timers.length; }, clearTimeout: id => { if (timers[id - 1]) timers[id - 1].live = false; } };
  win.window = win; win.parent = win; win.document = doc;
  vm.createContext(win); vm.runInContext(buildSource(), win);
  const events = [], S = win.Stratos, orig = S.track;
  S.track = (n, x) => { events.push([n, x]); orig && 0; };
  return { S, R: S.resume, C: S.coins, ls, events, win,
    firePageHide: () => (listeners.pagehide || []).forEach(f => f()),
    fireHidden: () => { doc.visibilityState = 'hidden'; (dlisteners.visibilitychange || []).forEach(f => f()); },
    runTimers: () => { timers.filter(t => t.live).forEach(t => { t.live = false; t.f(); }); } };
}

let pass = 0, fail = 0;
const ok = (c, m) => { if (c) pass++; else { fail++; console.log('FAIL:', m); } };
const done = () => { console.log(`\n${pass} passed, ${fail} failed`); process.exit(fail ? 1 : 0); };
module.exports = { page, makeStorage, ok, done };
