/* Run: node tests/balance.js
   How often a simple "first move I find" bot wins each type of level. People play far better than this bot,
   so any level it wins now and then is clearly winnable. Levels it never wins are listed so they can be checked. */
var E = require('../js/engine.js'), LV = require('../js/levels.js');
var N = +(process.argv[2] || 12), byType = {}, zero = [], low = [];
LV.LEVELS.forEach(function (L) {
  var wins = 0;
  for (var s = 1; s <= N; s++) {
    var e = new E(JSON.parse(JSON.stringify(L)), s * 17 + L.id), g = 0, cap = L.time ? Math.round(L.time / 2.2) : 90;
    while (e.state === 'ready' && g++ < cap) { var h = e.findHint(); if (!h) break; e.trySwap(h[0], h[1]); }
    if (e.state === 'win') wins++;
  }
  var t = byType[L.type] || (byType[L.type] = { w: 0, n: 0 }); t.w += wins; t.n += N;
  if (wins === 0) zero.push(L.id + ':' + L.type); else if (wins / N < 0.15) low.push(L.id + ':' + L.type);
});
Object.keys(byType).forEach(function (t) { console.log(t.padEnd(10), Math.round(byType[t].w / byType[t].n * 100) + '%'); });
console.log('never won:', zero.join(' ') || 'none');
console.log('rarely won:', low.join(' ') || 'none');
