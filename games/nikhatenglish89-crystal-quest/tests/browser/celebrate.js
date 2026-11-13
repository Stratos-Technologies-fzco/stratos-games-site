/* Celebrations in a real browser (headless Chrome). From the game folder:  python -m http.server 8123  then  node tests/browser/celebrate.js
   Checks the praise words (size grows, one at a time, gone after about half a second, soft chime), the level-complete moment (banner, stars one by one,
   confetti, chimes), Calmer effects (no confetti), the boss banner and Hindi. */
const { launch } = require('./cdp.js');
const BASE = process.env.GAME_URL || 'http://127.0.0.1:8123/', URL = BASE + 'index.html?nosplash=1';
let pass = 0, fail = 0;
const check = (name, ok, extra) => { if (ok) { pass++; console.log('  ok   ' + name); } else { fail++; console.log('  FAIL ' + name + (extra ? '  -> ' + extra : '')); } };
(async () => {
  const p = await launch(390, 844, true), ev = x => p.eval(x), sl = ms => p.sleep(ms);
  const until = async (js, ms) => { const t0 = Date.now(); while (Date.now() - t0 < (ms || 6000)) { if (await ev(js)) return true; await sl(100); } return false; };
  const audio = async () => JSON.parse(await ev('JSON.stringify(__cq.audio())'));
  // start a level, make its goal already reached, play one move, and wait for the banner (chain reactions can take a couple of seconds)
  const winLevel = async (id, extra) => {
    await ev('__cq.home()'); await sl(150); await ev(`__cq.go(${id})`); await sl(500);
    await ev("(()=>{const e=__cq.engine(); " + (extra || '') + "e.collected=[999,999,999,999,999,999];})()");
    await ev('__cq.botMove()'); return until("!!document.querySelector('h2.winbanner')");
  };
  await p.goto(URL); await ev('localStorage.clear()'); await p.goto(URL);
  await p.click(195, 120); await sl(200);                                    // a real tap unlocks the sound
  await ev('__cq.go(3)'); await sl(700);
  await ev(`window.__pr = []; new MutationObserver(m => m.forEach(r => { r.addedNodes.forEach(n => { if (n.classList && n.classList.contains('praise')) window.__pr.push({ el: n, word: n.innerText, t0: performance.now(), t1: 0 }); }); r.removedNodes.forEach(n => { if (n.classList && n.classList.contains('praise')) { const x = window.__pr.find(q => q.el === n); if (x) x.t1 = performance.now(); } }); })).observe(document.getElementById('board'), { childList: true, subtree: true }); 0`);

  console.log('Praise words');
  const sizes = [], words = [];
  for (let tier = 1; tier <= 4; tier++) {
    const c0 = (await audio()).chimes;
    await ev(`__cq.praise(${tier})`); await sl(80);
    sizes.push(parseFloat(await ev("getComputedStyle(document.querySelector('.praise span')).fontSize")));
    words.push(await ev("document.querySelector('.praise span').innerText"));
    check(`tier ${tier} plays a soft chime`, (await audio()).chimes === c0 + 1, JSON.stringify(await audio()));
    await sl(800);
  }
  check('the words are Good! Great! Amazing! Incredible!', JSON.stringify(words) === JSON.stringify(['Good!', 'Great!', 'Amazing!', 'Incredible!']), words.join(','));
  check('the word grows with the blast', sizes[0] < sizes[1] && sizes[1] < sizes[2] && sizes[2] < sizes[3], sizes.join(' < '));
  await ev('__cq.praise(4)'); await sl(120);
  check('the biggest word still fits inside the board', await ev("(()=>{const w=document.querySelector('.praise span').getBoundingClientRect(), b=document.getElementById('board').getBoundingClientRect(); return w.left>=b.left-2 && w.right<=b.right+2})()"));
  await sl(800);
  await ev('__cq.praise(2); __cq.praise(3); __cq.praise(1)'); await sl(50);
  check('only one word on screen at a time', (await ev("document.querySelectorAll('.praise').length")) === 1);
  await sl(900);
  check('and it is gone after about half a second', (await ev("document.querySelectorAll('.praise').length")) === 0);
  const life = JSON.parse(await ev("JSON.stringify(window.__pr.filter(x => x.t1).map(x => Math.round(x.t1 - x.t0)))"));
  const natural = life.filter(v => v > 100);                                    // (a word replaced by the next one at once is not counted)
  check('each word lasts about half a second (took ' + natural.join(', ') + ' ms)', natural.length >= 5 && natural.every(v => v <= 650 && v >= 400));
  check('chimes follow the effects volume (default is the soft middle)', (await audio()).sfxLevel === 0.5);

  console.log('Real play');
  await ev('window.__pr.length = 0');
  for (let i = 0; i < 28; i++) { const inf = JSON.parse(await ev('JSON.stringify(__cq.info())')); if (inf.state !== 'ready') break; if (!inf.busy) await ev('__cq.botMove()'); await sl(900); }
  const seen = JSON.parse(await ev('JSON.stringify(window.__pr.map(x => x.word))'));
  check('big blasts during real moves showed words (' + seen.length + ': ' + seen.join(' ') + ')', seen.length >= 1 && seen.every(w => ['Good!', 'Great!', 'Amazing!', 'Incredible!'].includes(w)));
  check('a plain 3-match gets no word (not every move says something)', seen.length < 28);

  console.log('Level complete');
  const c1 = (await audio()).chimes;
  check('winning shows the banner', await winLevel(1));
  check('the banner says Level Complete!', (await ev("document.querySelector('h2.winbanner').innerText")) === 'Level Complete!');
  const earned = await ev("document.querySelectorAll('.stars .star.earn').length");
  check('stars earned: ' + earned, earned >= 1 && earned <= 3);
  const delays = JSON.parse(await ev("JSON.stringify([...document.querySelectorAll('.stars .star.earn .fill')].map(i => parseFloat(getComputedStyle(i).animationDelay)))"));
  check('the stars light up one after the other (delays ' + delays.join(', ') + ' s)', delays.length === earned && delays.every((d, i) => i === 0 || d > delays[i - 1]));
  check('confetti bursts', (await ev("document.querySelectorAll('.confetti i').length")) >= 20);
  check('the buttons work straight away', await ev("!document.getElementById('mNext').disabled"));
  check('every earned star ends filled in', await until("[...document.querySelectorAll('.stars .star.earn .fill')].every(i => getComputedStyle(i).opacity === '1')"));
  check('one soft chime per star (+ the sparkle after 3)', await until('__cq.audio().chimes - ' + c1 + ' >= ' + earned, 3000), String((await audio()).chimes - c1));
  check('the confetti clears itself', await until("document.querySelectorAll('.confetti').length === 0", 5000));

  console.log('Calmer effects and the boss banner');
  await ev("document.body.classList.add('lowfx')"); const c2 = (await audio()).chimes;
  const calmWon = await winLevel(1);
  check('with Calmer effects the banner shows but there is no confetti', calmWon && (await ev("document.querySelectorAll('.confetti i').length")) === 0);
  check('chimes still play with Calmer effects', await until('__cq.audio().chimes > ' + c2, 3000));
  await ev("document.body.classList.remove('lowfx')");
  check('boss levels get the BOSS DEFEATED! banner', (await winLevel(20, 'e.bossHp=0;')) && (await ev("(document.querySelector('h2.winbanner.boss')||{}).innerText||''")) === 'BOSS DEFEATED!');

  console.log('Hindi');
  await ev('__cq.home()'); await sl(200); await ev('__cq.settings()'); await sl(200); await ev("document.querySelector('.lbtn[data-l=hi]').click()"); await sl(300); await ev("document.getElementById('mX').click()");
  await ev('__cq.go(3)'); await sl(600); await ev('__cq.praise(3)'); await sl(100);
  check('the praise word is shown in Hindi', (await ev("document.querySelector('.praise span').innerText")) === 'कमाल!');
  check('the banner is shown in Hindi', (await winLevel(1)) && (await ev("document.querySelector('h2.winbanner').innerText")) === 'स्तर पूरा हुआ!');

  console.log('\n' + pass + ' passed, ' + fail + ' failed; console errors: ' + JSON.stringify(p.errors));
  await p.close(); process.exit(fail ? 1 : 0);
})();
