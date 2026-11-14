/* Run: node tests/stars.js [seeds]
   Plays every level with the look-ahead bot (wins only) and compares the final score with the star targets,
   so 2 stars is within easy reach and 3 stars needs good play. */
var E = require('../js/engine.js'), LV = require('../js/levels.js');
var WRITE = process.argv.indexOf('--write') > -1, N = +(process.argv.filter(function (a) { return /^\d+$/.test(a); })[0] || 6);
function progress(e, L) { var v = 0; e.objectiveProgress().forEach(function (o) { v += o.done ? 1 : o.cur / o.need; }); v += Math.min(e.score, 12000) / 60000; if (L.items) { for (var r = 0; r < e.rows; r++) for (var c = 0; c < e.cols; c++) { var t = e.grid[r][c]; if (t && t.item) v += (r / e.rows) * 0.5; } } return v; }
function play(L, seed) {
  var e = new E(JSON.parse(JSON.stringify(L)), seed), g = 0, cap = L.time ? Math.round(L.time / 2.2) : 90;
  while (e.state === 'ready' && g++ < cap) {
    var best = null, bv = -1;
    for (var r = 0; r < e.rows; r++) for (var c = 0; c < e.cols; c++) for (var d = 0; d < 2; d++) {
      var r2 = r + (d ? 1 : 0), c2 = c + (d ? 0 : 1); if (!e.playable(r, c) || !e.playable(r2, c2)) continue;
      var cl = e.clone(), res = cl.trySwap([r, c], [r2, c2]); if (!res.ok) continue;
      var v = progress(cl, L) + (cl.state === 'win' ? 100 : 0); if (v > bv) { bv = v; best = [[r, c], [r2, c2]]; }
    }
    if (!best) break; e.trySwap(best[0], best[1]);
  }
  return e.state === 'win' ? e.score : null;
}
var rows = [], worst = [], table = [];
LV.LEVELS.forEach(function (L) {
  var sc = []; for (var s = 1; s <= N; s++) { var x = play(L, s * 31 + L.id); if (x !== null) sc.push(x); }
  if (!sc.length) { table.push(null); return; } sc.sort(function (a, b) { return a - b; });
  var med = sc[Math.floor(sc.length / 2)], two = sc.filter(function (x) { return x >= L.stars[1]; }).length / sc.length, three = sc.filter(function (x) { return x >= L.stars[2]; }).length / sc.length;
  var tgt = L.objectives.filter(function (o) { return o.type === 'score'; })[0], lowFloor = tgt ? tgt.n : 0;
  var t2 = Math.max(Math.round(med * (tgt ? 0.85 : 0.75) / 100) * 100, tgt ? Math.round(tgt.n * 1.15 / 100) * 100 : 0), t3 = Math.max(Math.round(med * 1.3 / 100) * 100, tgt ? Math.round(tgt.n * 1.5 / 100) * 100 : 0, t2 + 600);
  table.push([t2, t3]);
  rows.push({ id: L.id, type: L.type, med: med, s2: L.stars[1], s3: L.stars[2], two: two, three: three });
  if (two < 0.5 || three > 0.6) worst.push(L.id + ':' + L.type + ' median ' + med + ' vs ' + L.stars[1] + '/' + L.stars[2] + ' (2*:' + Math.round(two * 100) + '% 3*:' + Math.round(three * 100) + '%)');
});
var avg = function (k) { return Math.round(rows.reduce(function (a, r) { return a + r[k]; }, 0) / rows.length * 100) / 100; };
console.log('average share of won runs reaching 2 stars:', Math.round(avg('two') * 100) + '%, 3 stars:', Math.round(avg('three') * 100) + '%');
[1, 2, 3, 4, 5, 10, 20, 40].forEach(function (id) { var r = rows.filter(function (x) { return x.id === id; })[0]; if (r) console.log('level', id, r.type.padEnd(9), 'median score', r.med, '| 2 stars at', r.s2, '| 3 stars at', r.s3, '| reach 2*', Math.round(r.two * 100) + '%', '3*', Math.round(r.three * 100) + '%'); });
console.log('levels where 2 stars is hard (<50%) or 3 stars is too easy (>60%):\n  ' + (worst.join('\n  ') || 'none'));

if (WRITE) {
  var fs = require('fs'), path = require('path'), file = path.join(__dirname, '..', 'js', 'levels.js'), src = fs.readFileSync(file, 'utf8');
  // levels the bot could not win keep the old formula numbers
  var fixed = table.map(function (t, i) { return t || [LV.LEVELS[i].stars[1], LV.LEVELS[i].stars[2]]; });
  src = src.replace(/var STAR_TABLE = [^;]*;/, 'var STAR_TABLE = ' + JSON.stringify(fixed) + ';');
  fs.writeFileSync(file, src); console.log('wrote star targets for', fixed.length, 'levels into js/levels.js');
}
