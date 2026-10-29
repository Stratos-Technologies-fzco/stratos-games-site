/* Persistence adapter (TECH section 7).
   Primary: IndexedDB. Last known good copy ('prev') is kept before each write.
   Mirror: localStorage backup. If IndexedDB is unavailable, localStorage is primary.
   Never reports success when a write failed. */
window.DF = window.DF || {};
(function (DF) {
  'use strict';
  var DB_NAME = 'dino-frontier', STORE = 'kv', LS_MAIN = 'df_save_v1', LS_BACKUP = 'df_backup_v1', LS_OLD = 'df_prev_game_v1';
  var db = null, mode = 'idb', timer = 0, writing = false, pending = false;
  var Store = DF.Store = { ok: true, mode: 'idb', lastError: '' };

  function openDb() {
    return new Promise(function (resolve, reject) {
      if (!window.indexedDB) return reject(new Error('no-idb'));
      var req;
      try { req = indexedDB.open(DB_NAME, 1); } catch (e) { return reject(e); }
      req.onupgradeneeded = function () { req.result.createObjectStore(STORE); };
      req.onsuccess = function () { resolve(req.result); };
      req.onerror = function () { reject(req.error || new Error('idb-open')); };
      req.onblocked = function () { reject(new Error('idb-blocked')); };
    });
  }
  function idbGet(key) {
    return new Promise(function (resolve, reject) {
      var r = db.transaction(STORE, 'readonly').objectStore(STORE).get(key);
      r.onsuccess = function () { resolve(r.result); }; r.onerror = function () { reject(r.error); };
    });
  }
  function idbPut(pairs) {
    return new Promise(function (resolve, reject) {
      var tx = db.transaction(STORE, 'readwrite'), os = tx.objectStore(STORE);
      pairs.forEach(function (p) { if (p[1] == null) os.delete(p[0]); else os.put(p[1], p[0]); });
      tx.oncomplete = function () { resolve(true); };
      tx.onerror = function () { reject(tx.error); };
      tx.onabort = function () { reject(tx.error || new Error('idb-abort')); };
    });
  }
  function lsGet(k) { try { return window.localStorage.getItem(k); } catch (e) { return null; } }
  function lsSet(k, v) { try { window.localStorage.setItem(k, v); return true; } catch (e) { return false; } }

  function parse(text) {
    if (!text) return null;
    try { var env = JSON.parse(text); return env && env.payload ? DF.sanitizeSave(env.payload) : null; } catch (e) { return null; }
  }
  function envelope(save) {
    save.updatedAt = new Date().toISOString();
    return JSON.stringify({ schemaVersion: save.schemaVersion, updatedAt: save.updatedAt, payload: save });
  }

  /* Boot: resolves { status: 'ok'|'none'|'invalid'|'unavailable', save, backup } */
  Store.init = function () {
    return openDb().then(function (d) { db = d; mode = 'idb'; Store.mode = 'idb'; }, function () {
      db = null; mode = 'ls'; Store.mode = 'ls';
    }).then(function () {
      var mainP = mode === 'idb' ? idbGet('main').catch(function () { return undefined; }) : Promise.resolve(lsGet(LS_MAIN));
      var prevP = mode === 'idb' ? idbGet('prev').catch(function () { return undefined; }) : Promise.resolve(null);
      return Promise.all([mainP, prevP]);
    }).then(function (r) {
      var mainText = r[0], prevText = r[1], bkText = lsGet(LS_BACKUP);
      var probeOk = mode === 'idb' || lsSet('df_probe', '1');
      if (!probeOk && !db) { Store.ok = false; Store.lastError = 'storage-unavailable'; return { status: 'unavailable', save: null, backup: null }; }
      var main = parse(mainText);
      if (main) return { status: 'ok', save: main, backup: null };
      var backup = parse(prevText) || parse(bkText) || parse(lsGet(LS_OLD));
      if (mainText) return { status: 'invalid', save: null, backup: backup };
      if (backup && !mainText) return { status: 'invalid', save: null, backup: backup };
      return { status: 'none', save: null, backup: null };
    });
  };

  /* Persist now. Resolves true only if the write really succeeded. */
  Store.saveNow = function (save) {
    clearTimeout(timer);
    if (writing) { pending = save; return Promise.resolve(Store.ok); }
    writing = true;
    var text = envelope(save), p;
    if (mode === 'idb') {
      p = idbGet('main').catch(function () { return undefined; }).then(function (prev) {
        return idbPut([['prev', prev || null], ['main', text]]);
      });
    } else {
      p = new Promise(function (resolve, reject) { if (lsSet(LS_MAIN, text)) resolve(true); else reject(new Error('ls-write')); });
    }
    return p.then(function () {
      var mirrored = lsSet(LS_BACKUP, text);
      Store.ok = mode === 'idb' ? true : mirrored; Store.lastError = Store.ok ? '' : 'write-failed';
      return Store.ok;
    }, function (e) {
      Store.ok = false; Store.lastError = String(e && e.message || e);
      lsSet(LS_BACKUP, text);
      return false;
    }).then(function (ok) {
      writing = false;
      if (pending) { var s = pending; pending = false; Store.saveNow(s); }
      if (DF.onSaveStatus) DF.onSaveStatus(ok);
      return ok;
    });
  };
  /* Debounced save for non-critical progress (never relies on unload alone). */
  Store.saveSoon = function (save, ms) {
    clearTimeout(timer);
    timer = setTimeout(function () { Store.saveNow(save); }, ms || 600);
  };
  /* Keep the previous game in its own slot when New Game replaces it, so it can be recovered. */
  Store.backupOf = function (save) { try { lsSet(LS_OLD, envelope(save)); } catch (e) {} };
})(window.DF);
