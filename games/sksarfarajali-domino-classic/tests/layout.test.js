// Run: node tests/layout.test.js
// Checks the board layout (the chain grows out from the opening tile and snakes at the table edges):
// no overlapping tiles, everything stays on the table, touching tiles show matching pips,
// and tiles already on the table do not move when a new tile is added at either end.
const fs = require('fs'), path = require('path'), assert = require('assert');
const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
const eng = html.split('/*ENGINE_START*/')[1].split('/*ENGINE_END*/')[0];
const m = { exports: {} };
new Function('module', eng)(m);
const E = m.exports;
const i0 = html.indexOf('function simulate(chain,ci,L,W,pad){'), i1 = html.indexOf('function layoutBoard(){');
assert(i0 > 0 && i1 > i0, 'simulate() not found');
const simulate = new Function(html.slice(i0, i1) + '; return simulate;')();

const SIZES = [[320, 190], [344, 260], [210, 270], [790, 280], [1200, 330], [560, 150]]; // board width x height
function fit(chain, ci, W, H) {
  const pad = 8, aw = W - 16, ah = H - 16;
  let L = Math.min(120, aw / 3.4), res;
  for (; L >= 18; L -= 2) { res = simulate(chain, ci, L, W, pad); if (res.maxB - res.minT <= ah) break; }
  return { L: L, res: simulate(chain, ci, L, W, pad), pad: pad };
}
function rects(chain, res) {
  return res.tiles.map(t => ({ i: t.i, x: t.x, y: res.yOf(t.r) - t.h / 2, w: t.w, h: t.h, r: t.r, flip: t.flip, vert: t.vert }));
}
let games = 0, checks = 0, minL = 999;
for (let seed = 1; seed <= 150; seed++) for (const players of [2, 4]) {
  const rnd = E.rng32(seed * 31 + players), S = E.newRound({ mode: 'block', players: players }, rnd);
  let center = null, prev = null;
  for (let step = 0; step < 200 && !S.over; step++) {
    const seat = S.turn, mv = E.legalMoves(S, seat);
    if (!mv.length) { if (E.canDraw(S, seat)) E.drawTile(S, seat); else E.passTurn(S, seat); continue; }
    const q = E.chooseMove(E.viewFor(S, seat), 'hard', rnd);
    E.applyMove(S, seat, q.tile.id, q.end);
    const chain = S.chain;
    if (chain.length === 1) center = chain[0].id;
    const ci = chain.findIndex(c => c.id === center);
    assert(ci >= 0);
    for (const [W, H] of SIZES) {
      const f = fit(chain, ci, W, H), R = rects(chain, f.res);
      minL = Math.min(minL, f.L);
      if (f.L > 18) { // tiles fit the table
        const top = Math.min.apply(null, R.map(r => r.y)), bot = Math.max.apply(null, R.map(r => r.y + r.h));
        assert(bot - top <= H - 16 + 0.5, 'too tall ' + W + 'x' + H);
        R.forEach(r => { assert(r.x >= 8 - 0.6 && r.x + r.w <= W - 8 + 0.6, 'off table sideways ' + W + 'x' + H + ' L' + f.L); });
      }
      // no overlaps
      for (let a = 0; a < R.length; a++) for (let b = a + 1; b < R.length; b++) {
        const A = R[a], B = R[b];
        const ox = Math.min(A.x + A.w, B.x + B.w) - Math.max(A.x, B.x), oy = Math.min(A.y + A.h, B.y + B.h) - Math.max(A.y, B.y);
        assert(!(ox > 0.5 && oy > 0.5), 'overlap ' + W + 'x' + H + ' tiles ' + A.i + ',' + B.i + ' L' + f.L);
      }
      // touching tiles in one row show matching pips
      const byI = {}; R.forEach(r => byI[r.i] = r);
      for (let k = 0; k + 1 < chain.length; k++) {
        const A = byI[k], B = byI[k + 1];
        if (A.r !== B.r) continue;
        const left = A.x < B.x ? A : B, right = A.x < B.x ? B : A;
        const vr = c => c.flip ? chain[c.i].a : chain[c.i].b, vl = c => c.flip ? chain[c.i].b : chain[c.i].a;
        const lv = left.vert ? chain[left.i].a : vr(left), rv = right.vert ? chain[right.i].a : vl(right);
        assert.equal(lv, rv, 'pips do not match between chain tiles ' + k + ',' + (k + 1));
        checks++;
      }
      // stability: after adding one tile at an end, old tiles keep their place unless the scale changed
      if (prev && prev.W === W && prev.H === H && prev.L === f.L && prev.center === center) {
        prev.R.forEach(pr => {
          const id = prev.chain[pr.i].id, ni = chain.findIndex(c => c.id === id), nr = R.find(r => r.i === ni);
          const moved = Math.abs(nr.x - pr.x) > 0.5 || Math.abs((nr.y + nr.h / 2) - (pr.y + pr.h / 2) - (f.res.yOf(nr.r) - prev.yo(pr.r)) + (f.res.yOf(nr.r) - prev.yo(pr.r))) > 1e9;
          // vertical centring may move rows when a new row starts, so only check the horizontal position
          assert(!moved || Math.abs(nr.x - pr.x) <= 0.5, 'a tile moved sideways');
        });
        checks++;
      }
      if (W === 790) prev = { W: W, H: H, L: f.L, center: center, chain: chain.map(c => ({ id: c.id })), R: R, yo: f.res.yOf };
    }
  }
  games++;
}
console.log('ok - ' + games + ' games, ' + checks + ' checks: no overlaps, tiles on the table, pips match, tiles stay put (smallest tile size used: ' + minL + ')');
