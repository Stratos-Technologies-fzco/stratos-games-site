// Local persistence. IndexedDB for structured game state, localStorage for
// small settings. Falls back to localStorage, then memory, and reports which
// mode is active so the UI never pretends progress was saved when it wasn't.

const DB_NAME = 'mystery-island';
const DB_VERSION = 1;
const STORES = ['profiles', 'checkpoints'];
const LS_PREFIX = 'mi.';

let db = null;
let mode = 'memory';
const memory = Object.fromEntries(STORES.map((s) => [s, new Map()]));

function lsAvailable() {
  try {
    const k = LS_PREFIX + '__test';
    localStorage.setItem(k, '1');
    localStorage.removeItem(k);
    return true;
  } catch {
    return false;
  }
}

function openDb() {
  return new Promise((resolve, reject) => {
    if (!('indexedDB' in window) || !window.indexedDB) {
      reject(new Error('IndexedDB unavailable'));
      return;
    }
    let req;
    try {
      req = indexedDB.open(DB_NAME, DB_VERSION);
    } catch (err) {
      reject(err);
      return;
    }
    const timer = setTimeout(() => reject(new Error('IndexedDB open timed out')), 4000);
    req.onupgradeneeded = () => {
      const d = req.result;
      if (!d.objectStoreNames.contains('profiles')) d.createObjectStore('profiles', { keyPath: 'id' });
      if (!d.objectStoreNames.contains('checkpoints')) d.createObjectStore('checkpoints', { keyPath: 'profileId' });
    };
    req.onsuccess = () => {
      clearTimeout(timer);
      resolve(req.result);
    };
    req.onerror = () => {
      clearTimeout(timer);
      reject(req.error);
    };
    req.onblocked = () => {
      clearTimeout(timer);
      reject(new Error('IndexedDB blocked'));
    };
  });
}

export async function initStorage() {
  try {
    db = await openDb();
    mode = 'indexeddb';
  } catch {
    mode = lsAvailable() ? 'localstorage' : 'memory';
  }
  return mode;
}

export function storageMode() {
  return mode;
}

export function isPersistent() {
  return mode !== 'memory';
}

function idbRequest(storeName, type, fn) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, type);
    const store = tx.objectStore(storeName);
    const req = fn(store);
    tx.oncomplete = () => resolve(req ? req.result : undefined);
    tx.onerror = () => reject(tx.error);
    tx.onabort = () => reject(tx.error);
  });
}

function lsKey(store) {
  return `${LS_PREFIX}db.${store}`;
}

function lsRead(store) {
  try {
    return JSON.parse(localStorage.getItem(lsKey(store)) || '{}');
  } catch {
    return {};
  }
}

function lsWrite(store, obj) {
  localStorage.setItem(lsKey(store), JSON.stringify(obj));
}

function keyOf(store, value) {
  return store === 'checkpoints' ? value.profileId : value.id;
}

export async function getItem(store, key) {
  if (mode === 'indexeddb') return idbRequest(store, 'readonly', (s) => s.get(key));
  if (mode === 'localstorage') return lsRead(store)[key];
  return structuredCloneSafe(memory[store].get(key));
}

export async function getAll(store) {
  if (mode === 'indexeddb') return idbRequest(store, 'readonly', (s) => s.getAll());
  if (mode === 'localstorage') return Object.values(lsRead(store));
  return [...memory[store].values()].map(structuredCloneSafe);
}

export async function putItem(store, value) {
  const copy = structuredCloneSafe(value);
  if (mode === 'indexeddb') return idbRequest(store, 'readwrite', (s) => s.put(copy));
  if (mode === 'localstorage') {
    const all = lsRead(store);
    all[keyOf(store, copy)] = copy;
    lsWrite(store, all);
    return;
  }
  memory[store].set(keyOf(store, copy), copy);
}

export async function deleteItem(store, key) {
  if (mode === 'indexeddb') return idbRequest(store, 'readwrite', (s) => s.delete(key));
  if (mode === 'localstorage') {
    const all = lsRead(store);
    delete all[key];
    lsWrite(store, all);
    return;
  }
  memory[store].delete(key);
}

export async function clearAll() {
  for (const store of STORES) {
    if (mode === 'indexeddb') await idbRequest(store, 'readwrite', (s) => s.clear());
    else if (mode === 'localstorage') localStorage.removeItem(lsKey(store));
    else memory[store].clear();
  }
  try {
    Object.keys(localStorage)
      .filter((k) => k.startsWith(LS_PREFIX))
      .forEach((k) => localStorage.removeItem(k));
  } catch {
    /* settings live only in memory */
  }
}

function structuredCloneSafe(v) {
  if (v === undefined) return undefined;
  return JSON.parse(JSON.stringify(v));
}

// ---- small settings (localStorage) ----
const memSettings = {};

export function getSetting(name, fallback) {
  try {
    const raw = localStorage.getItem(LS_PREFIX + name);
    return raw === null ? fallback : JSON.parse(raw);
  } catch {
    return name in memSettings ? memSettings[name] : fallback;
  }
}

export function setSetting(name, value) {
  memSettings[name] = value;
  try {
    localStorage.setItem(LS_PREFIX + name, JSON.stringify(value));
  } catch {
    /* kept in memory only */
  }
}
