// Tests for Stratos.resume (tools/resume.js). Run:  node tools/tests/resume.test.js
const { page, makeStorage, ok, done } = require('./harness');
const DAY = 864e5;
const state = { level: 7, board: [[1, 2], [3, 4]], score: 1250, nested: { a: ['x', 'y'], t: true } };

// ---- save and load
let t = page('/play/game-a/'), R = t.R;
ok(R && typeof R.save === 'function' && typeof R.offer === 'function', 'Stratos.resume exists');
ok(R.save(state, { label: 'Level 7' }) === true, 'save accepts a state');
let r = R.load();
ok(r && JSON.stringify(r.state) === JSON.stringify(state), 'load returns the same state');
ok(r.label === 'Level 7' && r.ver === 1 && typeof r.ts === 'number' && r.ageMs >= 0, 'load has label, ver, ts and age');
ok(R.has() === true, 'has() is true after a save');
state.level = 99; ok(R.load().state.level === 7, 'the snapshot is a copy: changing the original later does not change it');

// ---- only on a play page, only for the page's own game
let home = page('/'); ok(home.R.save(state) === false && home.R.load() === null && home.R.has() === false, 'no save or load off a play page');
let called = 0; home.R.offer(() => called += 10, () => called += 1); ok(called === 1, 'off a play page offer() starts new at once');
t = page('/play/game-a/'); t.R.save({ who: 'a' }); const s = t.ls;
let b = page('/play/game-b/', { storage: s }); b.R.save({ who: 'b' });
ok(page('/play/game-a/', { storage: s }).R.load().state.who === 'a' && page('/play/game-b/', { storage: s }).R.load().state.who === 'b', 'each game has its own snapshot');
b.R._test.flush(); const list = page('/play/game-a/', { storage: s }).R.list();
ok(list.length === 2 && list.map(x => x.game).sort().join() === 'game-a,game-b', 'list() shows both games');
ok(t.R.save({ x: 1 }) === true && !t.R.save(undefined), 'undefined state is refused');

// ---- expiry and versions
t = page('/play/game-t/'); R = t.R;
R.save({ a: 1 }, { ver: 1 }); R._test.flush();
R._test.setNow(Date.now() + 29 * DAY); ok(R.load() !== null, 'a 29-day-old snapshot is still there');
R._test.setNow(Date.now() + 31 * DAY); ok(R.load() === null, 'a 31-day-old snapshot is forgotten');
ok(!R._test.keys().some(k => k.includes('game-t')), 'and its key is removed');
R._test.setNow(null); R.save({ a: 1 }); R._test.flush();
R._test.setNow(Date.now() + 5 * DAY); ok(R.load({ ttlDays: 3 }) === null, 'ttlDays option shortens the life');
R._test.setNow(null); R.save({ a: 1 }, { ver: 2 }); ok(R.load({ ver: 1 }) === null, 'a different version is ignored');
R.save({ a: 1 }, { ver: 2 }); ok(R.load({ ver: 2 }) !== null, 'the same version loads');
ok(R.load({ ver: 1 }) === null && R.load({ ver: 2 }) === null, 'a version mismatch removes the old snapshot');

// ---- limits and bad input never throw
t = page('/play/game-x/'); R = t.R;
ok(R.save({ big: 'x'.repeat(200 * 1024) }) === false, 'a state over 100 KB is refused');
ok(R.load() === null, 'nothing stored for a refused state');
const circ = {}; circ.self = circ; ok(R.save(circ) === false, 'a circular state is refused');
ok(R.save(() => 1) === false || R.save(() => 1) === true, 'functions do not throw');
t.ls.setItem('stratos.resume.game-x.v1', '{not json'); ok(R.load() === null, 'corrupt JSON loads as nothing');
t.ls.setItem('stratos.resume.game-x.v1', JSON.stringify({ v: 9, ts: 1, state: {} })); ok(R.load() === null, 'wrong record version loads as nothing');
t.ls.setItem('stratos.resume.game-x.v1', JSON.stringify({ v: 1, state: {} })); ok(R.load() === null, 'a record with no time loads as nothing');
ok(page('/play/we%20ird/').R.save({ a: 1 }) === false, 'an odd game name is refused');

// ---- writes are coalesced; the last state wins; hidden and pagehide flush
t = page('/play/game-c/'); R = t.R;
R.save({ n: 1 }); R.save({ n: 2 }); R.save({ n: 3 });
let raw = t.ls.m['stratos.resume.game-c.v1']; ok(raw && JSON.parse(raw).state.n === 1, 'the first save is written at once, the rest wait');
ok(R.load().state.n === 3, 'load() flushes the pending state: the last one wins');
R.save({ n: 4 }); R.save({ n: 5 }); t.firePageHide(); ok(JSON.parse(t.ls.m['stratos.resume.game-c.v1']).state.n === 5, 'pagehide writes the last state');
R.save({ n: 6 }); R.save({ n: 7 }); t.fireHidden(); ok(JSON.parse(t.ls.m['stratos.resume.game-c.v1']).state.n === 7, 'the tab going hidden writes the last state');

// ---- storage blocked or full
t = page('/play/game-m/', { storage: makeStorage({ blocked: true }) }); R = t.R;
let threw = false; try { R.save({ a: 1 }); R.flush; R.load(); R.clear(); R.list(); } catch (e) { threw = true; }
ok(!threw, 'blocked storage never throws'); ok(R.persistent === false, 'persistent is false when storage is blocked');
t = page('/play/game-m/', { storage: makeStorage({ blocked: true }) }); R = t.R; R.save({ a: 1 }); ok(R.load() && R.load().state.a === 1, 'blocked storage still works in memory for the session');
const small = makeStorage({ quota: 3000 }); const o1 = page('/play/old-game/', { storage: small }); o1.R.save({ pad: 'o'.repeat(1200) }); o1.R._test.flush();
o1.R._test.setNow(Date.now() + 1000);
const n1 = page('/play/new-game/', { storage: small }); n1.R._test.setNow(Date.now() + 2000); n1.R.save({ pad: 'n'.repeat(1200) }); n1.R.save({ pad: 'n'.repeat(1300) }); n1.R._test.flush();
ok(n1.R.has() && JSON.parse(small.m['stratos.resume.new-game.v1']).state.pad.length === 1300, 'a full storage drops the oldest other snapshot to fit the new one');

// ---- clear
t = page('/play/game-k/'); R = t.R; R.save({ a: 1 }); R._test.flush(); R.clear(); ok(R.load() === null && !R.list().some(x => x.game === 'game-k'), 'clear() removes the snapshot and its list entry');
R.save({ a: 1 }); R.save({ a: 2 }); R.clear(); ok(R.load() === null, 'clear() also drops a pending write');

// ---- offer: continue, start new, escape, errors
t = page('/play/game-o/'); R = t.R; let shown = null, resumed = null, fresh = 0; t.C._test.setSheet(o => { shown = o; });
R.offer(x => resumed = x, () => fresh++); ok(fresh === 1 && shown === null, 'no snapshot: starts new at once, no prompt');
R.save({ step: 5 }, { label: 'Level 5' }); R._test.flush(); shown = null;
R.offer(x => resumed = x, () => fresh++, {});
ok(shown && shown.title === 'Continue where you left off?' && /Level 5/.test(shown.text) && shown.yes === 'Continue' && shown.noLabel === 'Start new', 'the prompt asks Continue or Start new: ' + (shown && shown.text));
ok(shown.escYes === true && shown.noMore === true, 'Escape means Continue (safe) and the coins link is hidden');
ok(t.events.some(e => e[0] === 'resume_offered'), 'resume_offered is tracked');
shown.yes_(); ok(resumed && resumed.step === 5 && fresh === 1, 'Continue calls onResume with the state'); ok(t.events.some(e => e[0] === 'resume_taken'), 'resume_taken is tracked');
shown.yes_(); ok(resumed.step === 5, 'a second tap does nothing');
ok(R.has() === true, 'Continue keeps the snapshot until the game clears it');
shown = null; fresh = 0; R.offer(() => resumed = 'again', () => fresh++); shown.no(); ok(fresh === 1 && R.load() === null, 'Start new calls onNew and removes the snapshot'); ok(t.events.some(e => e[0] === 'resume_new'), 'resume_new is tracked');
R.save({ step: 6 }); R._test.flush(); fresh = 0; shown = null;
R.offer(() => { throw new Error('restore failed'); }, () => fresh++); shown.yes_(); ok(fresh === 1 && R.load() === null, 'if the restore throws, the game starts new and the bad snapshot is removed');
R.save({ step: 7 }); R._test.flush(); fresh = 0; shown = null;
R.offer(() => {}, () => fresh++, { ver: 2 }); ok(fresh === 1 && shown === null, 'a snapshot of another version is not offered');
R.save({ step: 8 }, { ver: 2 }); R._test.flush(); shown = null; R.offer(() => {}, () => {}, { ver: 2, title: 'Welcome back', text: 'Pick up your game' });
ok(shown.title === 'Welcome back' && shown.text === 'Pick up your game', 'title and text can be set by the game');
R.offer(null, null, { ver: 2 }); shown.yes_(); shown.no && shown.no(); ok(true, 'missing callbacks never throw');

// ---- kids pages work the same (on the device only, no analytics anywhere)
t = page('/play/kid-game/', { kids: true }); t.R.save({ k: 1 }); ok(t.R.load().state.k === 1, 'kids games can resume');

// ---- coins still work next to resume
t = page('/play/game-q/'); ok(t.C.earn('level_complete', { game: 'game-q', level: 1 }).ok && t.R.save({ q: 1 }), 'coins and resume work together');

done();
