/* Gem sets in a real browser (headless Chrome). From the game folder:  python -m http.server 8123  then  node tests/browser/sets-e2e.js
   Checks: each world draws its own set, only needed sets are requested, guest levels, boss glow, special rim, Classic style and its persistence, collection unlocks, fallback when a set fails. */
const { launch } = require('./cdp.js');
const SP = require('os').tmpdir() + '/';
const BASE = process.env.GAME_URL || 'http://127.0.0.1:8123/', URL = BASE + 'index.html?nosplash=1';
let pass = 0, fail = 0;
const check = (name, ok, extra) => { if (ok) { pass++; console.log('  ok   ' + name); } else { fail++; console.log('  FAIL ' + name + (extra ? '  -> ' + extra : '')); } };
const setsIn = reqs => [...new Set(reqs.filter(u => /crystal_sets\//.test(u)).map(u => u.match(/crystal_sets\/(set_\d+_[a-z_]+)/)[1]))];
(async () => {
  const p = await launch(390, 844, true);
  await p.goto(URL); await p.eval('localStorage.clear()'); p.requests.length = 0; await p.goto(URL);
  const ev = x => p.eval(x), sl = ms => p.sleep(ms);
  const tileSrcs = async () => JSON.parse(await ev("JSON.stringify([...document.querySelectorAll('#board .t:not(.sp):not(.item) img')].map(i=>i.getAttribute('src')))"));
  const chipSrcs = async () => JSON.parse(await ev("JSON.stringify([...document.querySelectorAll('#objs .obj img')].map(i=>i.getAttribute('src')))"));

  console.log('Loading: only what is needed');
  check('home screen requests no themed set at all', setsIn(p.requests).length === 0, JSON.stringify(setsIn(p.requests)));
  const want = { 1: 'assets/crystals/', 21: 'assets/crystal_sets/set_02_frozen_shards/', 41: 'assets/crystal_sets/set_03_forest_leaves/', 61: 'assets/crystal_sets/set_04_desert_relics/', 81: 'assets/crystal_sets/set_05_dragon_scales/' };
  const order = [1, 21, 41, 61, 81];
  console.log('Each world draws its own set');
  for (const id of order) {
    await ev(`__cq.go(${id})`); await sl(900);
    const t = await tileSrcs(), c = await chipSrcs();
    check(`level ${id}: all ${t.length} gems from ${want[id].replace('assets/', '')}`, t.length >= 50 && t.every(s => s.startsWith(want[id])), t.slice(0, 2).join(','));
    check(`level ${id}: goal chip uses the same set`, c.some(s => s.startsWith(want[id])), c.join(','));
    const expectedSets = order.slice(0, order.indexOf(id) + 1).filter(x => x !== 1).map(x => want[x].match(/set_\d+_[a-z_]+/)[0]);
    check(`level ${id}: only the sets reached so far were requested (${expectedSets.length})`, JSON.stringify(setsIn(p.requests).sort()) === JSON.stringify(expectedSets.sort()), JSON.stringify(setsIn(p.requests)));
  }

  console.log('Guest gems, boss glow, special rim');
  await ev('__cq.intro(5)'); await sl(400);
  check('level 5 intro shows the "Guest gems!" banner', (await ev("(document.querySelector('.guestbanner')||{}).innerText||''")).indexOf('Guest gems!') > -1);
  await ev("document.getElementById('mGo').click()"); await sl(800);
  check('level 5 (world 1) draws Forest Leaves gems', (await ev('__cq.curSet()')) === 'set_03_forest_leaves' && (await tileSrcs()).every(s => s.indexOf('set_03_forest_leaves') > -1));
  for (const id of [10, 15, 30, 55]) { await ev(`__cq.intro(${id})`); await sl(250); check(`level ${id} intro has the banner`, !!(await ev("!!document.querySelector('.guestbanner')"))); await ev("document.getElementById('mX').click()"); }
  await ev('__cq.intro(6)'); await sl(250); check('level 6 intro has no banner', !(await ev("!!document.querySelector('.guestbanner')"))); await ev("document.getElementById('mX').click()");
  await ev('__cq.go(40)'); await sl(700);
  check('level 40 (boss) has the glow around the board', await ev("document.getElementById('board').classList.contains('bossglow') && document.getElementById('board').style.getPropertyValue('--bossglow').length>3"));
  await ev('__cq.go(21)'); await sl(600);
  await ev("(()=>{const e=__cq.engine(); const t=e.grid[7][3]; t.sp='bomb';})()"); await ev('__cq.botMove()'); await sl(2500);
  const rim = await ev("(()=>{const d=document.querySelector('#board .t.sp'); return d? d.style.getPropertyValue('--rim').trim() : 'none'})()");
  check('a special on a Frozen Shards board gets the set rim colour', rim.toUpperCase() === '#DFF6FF' || rim === 'none', rim);

  console.log('Set changes only between levels');
  await ev('__cq.go(21)'); await sl(500); const before = await ev('__cq.curSet()');
  for (let i = 0; i < 4; i++) { await ev('__cq.botMove()'); await sl(1500); }
  check('the set stayed the same through 4 moves', (await ev('__cq.curSet()')) === before);

  console.log('Gem style: Classic');
  await ev('__cq.home()'); await sl(200); await ev('__cq.settings()'); await sl(250);
  await ev("document.querySelector('.lbtn[data-g=classic]').click()"); await sl(250);
  check('Settings shows Classic selected', await ev("document.querySelector('.lbtn[data-g=classic]').classList.contains('on')"));
  await ev("document.getElementById('mX').click()");
  for (const id of [21, 41, 61, 81]) { await ev(`__cq.go(${id})`); await sl(700); const t = await tileSrcs(); check(`classic style: level ${id} uses classic gems`, t.length >= 50 && t.every(s => s.startsWith('assets/crystals/'))); }
  await p.goto(URL); await sl(300);
  check('the Classic choice is still there after a reload', (await ev('__cq.save().gemStyle')) === 'classic');
  await ev('__cq.go(41)'); await sl(700); check('after reload, level 41 is still classic', (await tileSrcs()).every(s => s.startsWith('assets/crystals/')));
  await ev('__cq.home()'); await ev('__cq.settings()'); await sl(200); await ev("document.querySelector('.lbtn[data-g=themed]').click()"); await sl(200); await ev("document.getElementById('mX').click()");
  await ev('__cq.go(41)'); await sl(800); check('back to Themed: level 41 uses Forest Leaves again', (await tileSrcs()).every(s => s.indexOf('set_03_forest_leaves') > -1));

  console.log('Gem Collection');
  await ev('__cq.collection()'); await sl(500);
  const open = await ev("document.querySelectorAll('.scard:not(.locked)').length"), locked = await ev("document.querySelectorAll('.scard.locked').length");
  check('5 sets unlocked (classic + 4 worlds reached), 4 locked', open === 5 && locked === 4, open + ' open, ' + locked + ' locked');
  const lockedSrc = await ev("[...document.querySelectorAll('.scard.locked img')].map(i=>i.getAttribute('src')).filter(s=>/crystal_sets/.test(s)).length");
  check('locked sets do not even load their gem pictures', lockedSrc === 0, String(lockedSrc));
  check('the unlock is saved', await ev("(()=>{const s=__cq.save().sets; return s.set_02_frozen_shards&&s.set_05_dragon_scales&&!s.set_06_ocean_pearls})()"));
  await p.shot(SP + 'g_collection.png');

  console.log('Fallback when a set fails to load');
  await p.send('Network.setBlockedURLs', { urls: ['*set_04_desert_relics*'] });
  await p.goto(URL); await sl(300); await ev('__cq.go(61)'); await sl(1800);
  const imgs = JSON.parse(await ev("JSON.stringify([...document.querySelectorAll('#board .t img')].map(i=>({ok:i.complete&&i.naturalWidth>0,src:i.getAttribute('src')})))"));
  check('no empty tile: every gem picture is drawn', imgs.length >= 50 && imgs.every(i => i.ok), imgs.filter(i => !i.ok).length + ' empty');
  check('the board fell back to classic gems', (await ev('__cq.curSet()')) === 'set_01_classic' && imgs.every(i => i.src.indexOf('assets/crystals/') === 0));
  check('a warning was logged', p.logs.some(l => /warning: .*Gem set failed|warning: .*gem set missing/i.test(l)), p.logs.filter(l => /warn/.test(l)).slice(0, 2).join(' | '));
  await p.send('Network.setBlockedURLs', { urls: [] });

  console.log('\n' + pass + ' passed, ' + fail + ' failed; console errors: ' + JSON.stringify(p.errors.filter(e => !/Failed to load resource|ERR_BLOCKED/.test(e))));
  await p.close(); process.exit(fail ? 1 : 0);
})();
