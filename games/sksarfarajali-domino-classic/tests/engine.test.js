// Run: node tests/engine.test.js   (pulls the engine straight out of index.html)
const fs = require('fs'), path = require('path'), assert = require('assert');
const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
const code = html.split('/*ENGINE_START*/')[1].split('/*ENGINE_END*/')[0];
const m = { exports: {} };
new Function('module', code)(m);
const E = m.exports;
let n = 0;
function t(name, fn) { fn(); n++; console.log('ok -', name); }
const cfg = (mode, players) => ({ mode, players });
const V = () => new Array(7).fill(false);
const mkState = (o) => Object.assign({ mode: 'block', n: 2, boneyard: [], opening: null, passes: 0, over: false, history: [], turn: 0 }, o,
  { voids: Array.from({ length: (o.n || 2) }, V) });

t('28 unique tiles, correct pips', () => {
  const s = E.makeSet();
  assert.equal(s.length, 28);
  assert.equal(new Set(s.map(x => x.a + ',' + x.b)).size, 28);
  assert.equal(new Set(s.map(x => x.id)).size, 28);
  assert(s.every(x => x.a <= x.b && x.a >= 0 && x.b <= 6));
  assert.equal(s.filter(x => x.a === x.b).length, 7);
  assert.equal(s.reduce((a, x) => a + x.a + x.b, 0), 168);
});

t('distribution 2p and 4p', () => {
  for (const p of [2, 4]) {
    const S = E.newRound(cfg('draw', p), E.rng32(5));
    assert.equal(S.hands.length, p);
    S.hands.forEach(h => assert.equal(h.length, 7));
    assert.equal(S.boneyard.length, p === 2 ? 14 : 0);
    const ids = [].concat(...S.hands, S.boneyard).map(x => x.id);
    assert.equal(new Set(ids).size, 28);
  }
});

t('opening: highest double else highest tile', () => {
  for (let seed = 1; seed < 300; seed++) {
    const S = E.newRound(cfg('block', 4), E.rng32(seed));
    const all = [].concat(...S.hands);
    const dbls = all.filter(x => x.a === x.b);
    const exp = dbls.length ? dbls.sort((x, y) => y.a - x.a)[0]
      : all.sort((x, y) => (y.a + y.b) - (x.a + x.b) || y.b - x.b)[0];
    assert.equal(S.opening, exp.id);
    assert(S.hands[S.starter].some(x => x.id === exp.id));
  }
});

t('opening move is forced, then matching rules', () => {
  const S = E.newRound(cfg('draw', 2), E.rng32(3));
  const mv = E.legalMoves(S, S.turn);
  assert.equal(mv.length, 1);
  assert.equal(mv[0].tile.id, S.opening);
  assert(!E.applyMove(S, 1 - S.turn, S.opening, 'S').ok, 'wrong turn rejected');
  const s0 = S.turn;
  assert(E.applyMove(S, s0, S.opening, 'S').ok);
  assert.equal(S.chain.length, 1);
  assert.notEqual(S.turn, s0);
  const e = E.ends(S);
  S.hands[S.turn].forEach(x => {
    const ok = E.legalMoves(S, S.turn).some(q => q.tile.id === x.id);
    const touches = x.a === e.left || x.b === e.left || x.a === e.right || x.b === e.right;
    assert.equal(ok, touches);
  });
  const bad = S.hands[S.turn].find(x => !(x.a === e.left || x.b === e.left || x.a === e.right || x.b === e.right));
  if (bad) assert(!E.applyMove(S, S.turn, bad.id, 'L').ok);
});

t('left/right placement orientation', () => {
  const S = mkState({ hands: [[{ id: 1, a: 0, b: 1 }, { id: 2, a: 1, b: 2 }, { id: 9, a: 5, b: 6 }], [{ id: 3, a: 3, b: 4 }]], chain: [{ id: 20, a: 2, b: 5 }] });
  assert(E.applyMove(S, 0, 2, 'L').ok);
  assert.deepEqual(S.chain[0], { id: 2, a: 1, b: 2 });
  S.turn = 0;
  assert(E.applyMove(S, 0, 9, 'R').ok);
  assert.deepEqual(S.chain[S.chain.length - 1], { id: 9, a: 5, b: 6 });
});

t('double placement', () => {
  const S = mkState({ hands: [[{ id: 1, a: 2, b: 2 }, { id: 2, a: 0, b: 0 }], [{ id: 3, a: 3, b: 4 }]], chain: [{ id: 20, a: 2, b: 5 }] });
  assert(E.applyMove(S, 0, 1, 'L').ok);
  assert.deepEqual(S.chain[0], { id: 1, a: 2, b: 2 });
});

t('draw rules: draw only when stuck; pass only when boneyard empty', () => {
  const mk = (mode, bone) => mkState({ mode, hands: [[{ id: 1, a: 0, b: 0 }], [{ id: 3, a: 3, b: 4 }]], boneyard: bone, chain: [{ id: 20, a: 5, b: 5 }] });
  let S = mk('draw', [{ id: 9, a: 1, b: 2 }]);
  assert(E.canDraw(S, 0)); assert(!E.canPass(S, 0));
  assert(E.drawTile(S, 0).ok);
  assert.equal(S.hands[0].length, 2);
  assert(!E.canDraw(S, 0)); assert(E.canPass(S, 0));
  S = mk('block', [{ id: 9, a: 1, b: 2 }]);
  assert(!E.canDraw(S, 0)); assert(!E.drawTile(S, 0).ok); assert(E.canPass(S, 0));
  S = mk('draw', []);
  assert(!E.canDraw(S, 0)); assert(E.canPass(S, 0));
  S.hands[0] = [{ id: 5, a: 5, b: 6 }];
  assert(!E.canPass(S, 0)); assert(!E.passTurn(S, 0).ok);
});

t('round completion scoring (domino)', () => {
  const S = mkState({ hands: [[{ id: 1, a: 5, b: 5 }], [{ id: 3, a: 3, b: 4 }, { id: 4, a: 6, b: 6 }]], chain: [{ id: 20, a: 2, b: 5 }] });
  assert(E.applyMove(S, 0, 1, 'R').ok);
  assert(S.over);
  assert.equal(S.result.reason, 'domino');
  assert.equal(S.result.winnerTeam, 0);
  assert.equal(S.result.points, 19);
  assert.deepEqual(E.applyRoundResult([0, 0], S.result), [19, 0]);
});

t('blocked game: lowest total wins the difference; tie scores 0', () => {
  const mk = (h0, h1) => mkState({ hands: [h0, h1], chain: [{ id: 20, a: 6, b: 6 }] });
  let S = mk([{ id: 1, a: 0, b: 1 }], [{ id: 2, a: 2, b: 3 }]);
  E.passTurn(S, 0); E.passTurn(S, 1);
  assert(S.over);
  assert.equal(S.result.reason, 'blocked');
  assert.equal(S.result.winnerTeam, 0);
  assert.equal(S.result.points, 4);
  S = mk([{ id: 1, a: 2, b: 3 }], [{ id: 2, a: 1, b: 4 }]);
  E.passTurn(S, 0); E.passTurn(S, 1);
  assert.equal(S.result.winnerTeam, null);
  assert.equal(S.result.points, 0);
});

t('team scoring in 4 players', () => {
  const S = mkState({ n: 4, hands: [[{ id: 1, a: 0, b: 0 }], [{ id: 2, a: 6, b: 6 }, { id: 3, a: 5, b: 5 }], [{ id: 4, a: 1, b: 1 }], [{ id: 5, a: 4, b: 4 }]], chain: [{ id: 20, a: 2, b: 3 }] });
  for (let i = 0; i < 4; i++) E.passTurn(S, i);
  assert(S.over);
  assert.deepEqual(S.result.totals, [2, 30]);
  assert.equal(S.result.winnerTeam, 0);
  assert.equal(S.result.points, 28);
  assert.equal(S.result.winnerSeat, 0);
  const S2 = mkState({ n: 4, turn: 2, hands: [[{ id: 1, a: 6, b: 6 }], [{ id: 2, a: 3, b: 3 }], [{ id: 4, a: 2, b: 2 }], [{ id: 5, a: 4, b: 4 }]], chain: [{ id: 20, a: 2, b: 3 }] });
  assert(E.applyMove(S2, 2, 4, 'L').ok);
  assert.equal(S2.result.winnerTeam, 0);
  assert.equal(S2.result.points, 6 + 8);
});

t('match winner', () => {
  assert.equal(E.matchWinner([99, 50], 100), null);
  assert.equal(E.matchWinner([100, 50], 100), 0);
  assert.equal(E.matchWinner([120, 120], 100), null);
});

function playFull(mode, players, levels, seed) {
  const rnd = E.rng32(seed), S = E.newRound(cfg(mode, players), rnd);
  let steps = 0;
  while (!S.over) {
    assert(steps++ < 400, 'game too long');
    const total = S.hands.reduce((a, h) => a + h.length, 0) + S.boneyard.length + S.chain.length;
    assert.equal(total, 28);
    for (let i = 0; i + 1 < S.chain.length; i++) assert.equal(S.chain[i].b, S.chain[i + 1].a);
    const seat = S.turn, mv = E.legalMoves(S, seat);
    if (!mv.length) {
      if (E.canDraw(S, seat)) { assert(E.drawTile(S, seat).ok); continue; }
      assert(E.canPass(S, seat)); assert(E.passTurn(S, seat).ok); continue;
    }
    const q = E.chooseMove(E.viewFor(S, seat), levels[seat % levels.length], rnd);
    assert(q, 'ai returned no move');
    assert(mv.some(x => x.tile.id === q.tile.id && x.end === q.end), 'ai illegal move');
    assert(E.applyMove(S, seat, q.tile.id, q.end).ok);
  }
  assert(S.result);
  return S.result;
}

t('1200 full random games: no illegal moves, tiles conserved, chain consistent', () => {
  let seed = 1;
  const L = ['easy', 'medium', 'hard'];
  for (const mode of ['draw', 'block']) for (const p of [2, 4]) for (let i = 0; i < 150; i++) {
    const r = playFull(mode, p, [L[i % 3], L[(i + 1) % 3], L[(i + 2) % 3], L[i % 3]], seed++);
    assert(r.points >= 0);
    if (r.reason === 'domino') assert(r.winnerTeam !== null);
  }
});

t('AI sees no hidden information', () => {
  for (let seed = 1; seed < 60; seed++) {
    const S = E.newRound(cfg('draw', 2), E.rng32(seed));
    E.applyMove(S, S.turn, S.opening, 'S');
    const A = JSON.stringify(E.viewFor(S, S.turn));
    const S2 = JSON.parse(JSON.stringify(S));
    const opp = 1 - S.turn, tmp = S2.hands[opp];
    S2.hands[opp] = S2.boneyard.splice(0, tmp.length);
    S2.boneyard.push(...tmp);
    assert.equal(JSON.stringify(E.viewFor(S2, S2.turn)), A, 'view leaked');
    ['easy', 'medium', 'hard'].forEach(l => {
      const a = E.chooseMove(E.viewFor(S, S.turn), l, () => 0.3), b = E.chooseMove(E.viewFor(S2, S.turn), l, () => 0.3);
      assert.equal(a && a.tile.id, b && b.tile.id);
      assert.equal(a && a.end, b && b.end);
    });
  }
});

t('hard AI beats easy AI over many games (sanity)', () => {
  let hard = 0, easy = 0;
  for (let i = 0; i < 400; i++) {
    const r = playFull('block', 2, i % 2 ? ['hard', 'easy'] : ['easy', 'hard'], 5000 + i);
    if (r.winnerTeam === null) continue;
    const hardSeat = i % 2 ? 0 : 1;
    if (r.winnerTeam === hardSeat) hard++; else easy++;
  }
  console.log('   hard wins', hard, 'easy wins', easy);
  assert(hard > easy);
});

console.log('\nAll ' + n + ' test groups passed');
