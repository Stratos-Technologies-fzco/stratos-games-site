/* Nothing is cut off on 12 window sizes (phones, short laptop windows) for the home, map, play, intro, guest intro, collection, shop, settings and kingdom screens.
   Run: node tests/browser/layout.js */
const { launch } = require('./cdp.js');
const SP = require('os').tmpdir() + '/'; const BASE = process.env.GAME_URL || 'http://127.0.0.1:8123/';
const sizes = [[1536,300],[1536,360],[1536,420],[1536,480],[1536,560],[1536,640],[1536,695],[800,360],[667,375],[390,844],[360,640],[320,568]];
const probe = `(()=>{const vh=innerHeight, vw=innerWidth; const bot=s=>{const e=document.querySelector(s); if(!e) return null; const b=e.getBoundingClientRect(); return {bottom:Math.round(b.bottom), right:Math.round(b.right), top:Math.round(b.top)}};
 return JSON.stringify({vh,vw,scroll:document.documentElement.scrollHeight>vh||document.documentElement.scrollWidth>vw, els:{go:bot('#mGo'),x:bot('#mX'),boost:bot('.boosters'),board:bot('#board'),soon:bot('.soon'),menu:bot('.menu'),by:bot('.by'),ok:bot('#bOk'),ach:bot('.ach:last-of-type'),ok2:bot('#bOk')}})})()`;
(async () => {
  let bad = 0;
  for (const [w,h] of sizes) {
    const p = await launch(w,h, w<700);
    await p.goto(BASE + 'index.html?nosplash=1'); await p.eval('__cq.unlockAll()'); await p.eval('__cq.save().boosters.hammer=1');
    const res = {};
    const check = async (name, setup, keys) => { await p.eval(setup); await p.sleep(450); const r = JSON.parse(await p.eval(probe)); const cut = keys.filter(k => r.els[k] && (r.els[k].bottom > r.vh + 1 || r.els[k].right > r.vw + 1)); res[name] = cut.length ? 'CUT:' + cut.join(',') : 'ok'; if (cut.length || r.scroll) { bad++; res[name] += r.scroll ? ' +scroll' : ''; } };
    await check('home', "__cq.map(0); document.getElementById('bBack').click()", ['menu','by']);
    await check('map', '__cq.map(0)', ['soon']);
    await check('play', '__cq.go(5)', ['boost','board']);
    await check('intro', '__cq.intro(9)', ['go']);
    await check('guestintro', '__cq.intro(5)', ['go']);
    await check('collection', '__cq.collection()', ['ok']);
    await check('shop', "__cq.shop('game')", ['x']);
    await check('settings', '__cq.settings()', ['x']);
    await check('kingdom', '__cq.kingdom(0)', ['ok']);
    console.log(`${w}x${h}`.padEnd(10), Object.entries(res).map(([k,v])=>k+':'+v).join('  '));
    if (h===300||h===420) await p.shot(SP+`s_${w}x${h}.png`);
    await p.close();
  }
  console.log('problems found:', bad);
  process.exit(0);
})();
