/* Run: node tests/smartbot.js [seeds] [firstLevel] [lastLevel]
   A bot that tries every swap, looks at what it would do, and plays the best one (about what an average player does).
   It shows which levels are too hard. */
var E = require('../js/engine.js'), LV = require('../js/levels.js');
var N = +(process.argv[2] || 4), from = +(process.argv[3] || 1), to = +(process.argv[4] || 100);

function progress(e, L) {
  var v = 0;
  e.objectiveProgress().forEach(function (o) { v += o.done ? 1 : o.cur / o.need; });
  v += Math.min(e.score, 12000) / 60000;
  if (L.items) { for (var r = 0; r < e.rows; r++) for (var c = 0; c < e.cols; c++) { var t = e.grid[r][c]; if (t && t.item) v += (r / e.rows) * 0.5; } }
  return v;
}
function play(L, seed) {
  var e = new E(JSON.parse(JSON.stringify(L)), seed), guard = 0, cap = L.time ? Math.round(L.time / 2.2) : 90;
  while (e.state === 'ready' && guard++ < cap) {
    var best = null, bestV = -1, r, c, d;
    for (r = 0; r < e.rows; r++) for (c = 0; c < e.cols; c++) for (d = 0; d < 2; d++) {
      var r2 = r + (d ? 1 : 0), c2 = c + (d ? 0 : 1);
      if (!e.playable(r, c) || !e.playable(r2, c2)) continue;
      var cl = e.clone(), res = cl.trySwap([r, c], [r2, c2]);
      if (!res.ok) continue;
      var v = progress(cl, L) + (cl.state === 'win' ? 100 : 0);
      if (v > bestV) { bestV = v; best = [[r, c], [r2, c2]]; }
    }
    if (!best) break;
    e.trySwap(best[0], best[1]);
  }
  return e.state === 'win';
}
var byType = {}, bad = [];
LV.LEVELS.forEach(function (L) {
  if (L.id < from || L.id > to) return;
  var wins = 0; for (var s = 1; s <= N; s++) if (play(L, s * 31 + L.id)) wins++;
  var t = byType[L.type] || (byType[L.type] = { w: 0, n: 0 }); t.w += wins; t.n += N;
  if (wins / N < 0.5) bad.push(L.id + ':' + L.type + ' ' + wins + '/' + N);
});
Object.keys(byType).forEach(function (t) { console.log(t.padEnd(10), Math.round(byType[t].w / byType[t].n * 100) + '%'); });
console.log('winnable less than half the time:', bad.join(' | ') || 'none');
