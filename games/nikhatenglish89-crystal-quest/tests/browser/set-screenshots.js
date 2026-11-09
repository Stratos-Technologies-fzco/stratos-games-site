/* One board per gem set, phone size (390x844) and desktop size (1280x800), with special crystals shown. Pictures go to the temp folder.
   Run: node tests/browser/set-screenshots.js */
const { launch } = require('./cdp.js');
const SP = require('os').tmpdir() + '/'; const BASE = process.env.GAME_URL || 'http://127.0.0.1:8123/';
const sets = ['set_01_classic','set_02_frozen_shards','set_03_forest_leaves','set_04_desert_relics','set_05_dragon_scales','set_06_ocean_pearls','set_07_sky_feathers','set_08_dark_obsidian','set_09_celestial_stars'];
(async () => {
  console.log('pictures are written to', SP);
  for (const [w,h,m,tag] of [[390,844,true,'m'],[1280,800,false,'d']]) {
    const p = await launch(w,h,m);
    await p.goto(BASE + 'index.html?nosplash=1'); await p.eval('localStorage.clear()'); await p.goto(BASE + 'index.html?nosplash=1');
    for (let i = 0; i < sets.length; i++) {
      await p.eval(`__cq.goWithSet(3, '${sets[i]}')`); await p.sleep(900);
      await p.eval("(()=>{const e=__cq.engine(); [[1,1,'lightning'],[3,4,'bomb'],[5,2,'star'],[6,6,'fish']].forEach(a=>{const t=e.grid[a[0]][a[1]]; if(t) t.sp=a[2];}); __cq.resync();})()"); await p.sleep(350);
      const ok = await p.eval("JSON.stringify({set:__cq.curSet(), imgs:[...document.querySelectorAll('#board .t img')].every(i=>i.complete&&i.naturalWidth>0), n:document.querySelectorAll('#board .t').length, sp:document.querySelectorAll('#board .t.sp').length, rim:getComputedStyle(document.querySelector('#board .t.sp'),'::before').borderTopColor})");
      if (tag === 'm' || i % 2 === 0) console.log(tag, sets[i].padEnd(24), ok);
      await p.shot(SP + `b_${tag}_${i+1}.png`);
    }
    await p.close();
  }
  process.exit(0);
})();
