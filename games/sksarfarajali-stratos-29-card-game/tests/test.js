// Unit tests + 10,000-game AI simulation for the STRATOS 29 engine.  Run: node tests/test.js [games]
const assert = require('assert');
const E = require('../engine.js');

let passed = 0;
function t(name, fn) { try { fn(); passed++; console.log('  ok  ' + name); } catch (e) { console.log('FAIL  ' + name + '\n      ' + e.message); process.exitCode = 1; } }

console.log('Unit tests');
t('deck has 32 unique cards', () => { const d = E.makeDeck(); assert.strictEqual(d.length, 32); assert.strictEqual(new Set(d).size, 32); });
t('card points total 28', () => assert.strictEqual(E.makeDeck().reduce((a, c) => a + E.cardPoints(c), 0), 28));
t('ranking J 9 A 10 K Q 8 7', () => {
  const o = ['Js', '9s', 'As', '10s', 'Ks', 'Qs', '8s', '7s'];
  for (let i = 0; i < 7; i++) assert(E.strength(o[i]) > E.strength(o[i + 1]));
});
t('shuffle keeps all cards', () => { const s = E.shuffle(E.makeDeck(), E.secureRng()); assert.strictEqual(new Set(s).size, 32); });
t('seeded shuffle is repeatable', () => {
  const a = E.shuffle(E.makeDeck(), E.seededRng(42)), b = E.shuffle(E.makeDeck(), E.seededRng(42));
  assert.deepStrictEqual(a, b);
});
t('deal: 4 cards each, then 8 after trump', () => {
  const G = E.newRound({ dealer: 0 });
  G.hands.forEach(h => assert.strictEqual(h.length, 4));
  E.placeBid(G, 1, 16); E.passBid(G, 2); E.passBid(G, 3); E.passBid(G, 0);
  assert.strictEqual(G.phase, 'trump');
  E.chooseTrump(G, 1, 'h', false);
  G.hands.forEach(h => assert.strictEqual(h.length, 8));
});
t('bidding: min 16, must raise, turn order, pass is final', () => {
  const G = E.newRound({ dealer: 0 });
  assert(!E.placeBid(G, 1, 15).ok); assert(!E.placeBid(G, 2, 16).ok); assert(!E.placeBid(G, 1, 30).ok);
  assert(E.placeBid(G, 1, 16).ok); assert(!E.placeBid(G, 2, 16).ok); assert(E.placeBid(G, 2, 17).ok);
  assert(E.passBid(G, 3).ok); assert(E.passBid(G, 0).ok); assert(E.passBid(G, 1).ok);
  assert.strictEqual(G.declarer, 2); assert.strictEqual(G.target, 17);
});
t('all pass -> redeal', () => {
  const G = E.newRound({ dealer: 0 });
  E.passBid(G, 1); E.passBid(G, 2); E.passBid(G, 3); E.passBid(G, 0);
  assert.strictEqual(G.phase, 'redeal');
});
t('only the declarer may pick trump', () => {
  const G = E.newRound({ dealer: 0 });
  E.placeBid(G, 1, 16); E.passBid(G, 2); E.passBid(G, 3); E.passBid(G, 0);
  assert(!E.chooseTrump(G, 2, 's', false).ok);
  assert(E.chooseTrump(G, 1, 's', false).ok);
});
t('trick winner: trump beats lead, lead beats off-suit', () => {
  const P = (p, card) => ({ p, card });
  assert.strictEqual(E.trickWinner([P(0, 'As'), P(1, '7h'), P(2, 'Js'), P(3, '9c')], 'h'), 1);
  assert.strictEqual(E.trickWinner([P(0, '10s'), P(1, 'Jh'), P(2, 'Ks'), P(3, '9c')], null), 0);
  assert.strictEqual(E.trickWinner([P(0, '7s'), P(1, 'Jh'), P(2, 'Ks'), P(3, '9c')], 'd'), 2);
});
function rig(hands, rest, opts) {
  const deck = [];
  for (let p = 0; p < 4; p++) deck.push(...hands[p]);
  for (let p = 0; p < 4; p++) deck.push(...rest[p]);
  return E.newRound(Object.assign({ dealer: 0, deck }, opts || {}));
}
t('must follow suit; free discard when void', () => {
  const G = E.newRound({ dealer: 0, rules: { doubling: false } });
  E.placeBid(G, 1, 16); E.passBid(G, 2); E.passBid(G, 3); E.passBid(G, 0);
  E.chooseTrump(G, 1, 'h', false);
  const lead = G.hands[1][0], ls = E.suit(lead);
  E.playCard(G, 1, lead);
  const hand = G.hands[2], has = hand.filter(c => E.suit(c) === ls);
  const legal = E.legalCards(G, 2);
  if (has.length) assert.deepStrictEqual(legal.sort(), has.sort()); else assert.strictEqual(legal.length, 8);
  const illegal = hand.find(c => !legal.includes(c));
  if (illegal) assert(!E.playCard(G, 2, illegal).ok);
});
t('cannot play out of turn or a card you do not hold', () => {
  const G = E.newRound({ dealer: 0, rules: { doubling: false } });
  E.placeBid(G, 1, 16); E.passBid(G, 2); E.passBid(G, 3); E.passBid(G, 0); E.chooseTrump(G, 1, 'h', false);
  assert(!E.playCard(G, 2, G.hands[2][0]).ok);
  assert(!E.playCard(G, 1, G.hands[3][0]).ok);
});
t('double / re-double sets multiplier', () => {
  const G = E.newRound({ dealer: 0 });
  E.placeBid(G, 1, 16); E.passBid(G, 2); E.passBid(G, 3); E.passBid(G, 0); E.chooseTrump(G, 1, 'h', false);
  assert.strictEqual(G.phase, 'double'); assert.strictEqual(G.turn, 2);
  E.decideDouble(G, 2, true); assert.strictEqual(G.turn, 1);
  E.decideDouble(G, 1, true); assert.strictEqual(G.mult, 4); assert.strictEqual(G.phase, 'play');
});
t('no double: opponents pass -> play, mult 1', () => {
  const G = E.newRound({ dealer: 0 });
  E.placeBid(G, 1, 16); E.passBid(G, 2); E.passBid(G, 3); E.passBid(G, 0); E.chooseTrump(G, 1, 'h', false);
  E.decideDouble(G, 2, false); E.decideDouble(G, 0, false);
  assert.strictEqual(G.phase, 'play'); assert.strictEqual(G.mult, 1);
});
t('hidden trump: declarer playing trump reveals; void non-declarer may ask and must trump', () => {
  const hands = [
    ['Js', '9s', 'As', '10s'], ['Jh', '9h', 'Ah', '10h'], ['Kc', 'Qc', '8c', '7c'], ['Jd', '9d', 'Ad', '10d']];
  const rest = [['Ks', 'Qs', '8s', '7s'], ['Kh', 'Qh', '8h', '7h'], ['Jc', '9c', 'Ac', '10c'], ['Kd', 'Qd', '8d', '7d']];
  const G = rig(hands, rest, { rules: { doubling: false } });
  E.placeBid(G, 1, 16); E.passBid(G, 2); E.passBid(G, 3); E.passBid(G, 0); E.chooseTrump(G, 1, 'h', true);
  assert(G.hidden && !G.revealed);
  E.playCard(G, 1, 'Jh');
  assert(G.revealed, 'declarer leading trump reveals it');
  const G3 = rig(hands, rest, { rules: { doubling: false } });
  E.passBid(G3, 1); E.placeBid(G3, 2, 16); E.passBid(G3, 3); E.passBid(G3, 0); E.chooseTrump(G3, 2, 'd', true);
  E.playCard(G3, 1, 'Jh');
  assert(!E.canReveal(G3, 2), 'declarer cannot ask');
  E.playCard(G3, 2, '8c');
  assert(E.canReveal(G3, 3));
  assert(E.revealTrump(G3, 3).ok && G3.revealed);
  assert(E.legalCards(G3, 3).every(c => E.suit(c) === 'd'), 'asker must play trump');
  E.playCard(G3, 3, '9d');
  assert.strictEqual(E.trickWinner([{p:1,card:'Jh'},{p:2,card:'8c'},{p:3,card:'9d'}], 'd'), 3);
});
t('pair needs K+Q of trump and a won trick; adjusts bid', () => {
  const G = E.newRound({ dealer: 0, rules: { doubling: false } });
  E.placeBid(G, 1, 20); E.passBid(G, 2); E.passBid(G, 3); E.passBid(G, 0);
  E.chooseTrump(G, 1, 'h', false);
  assert(!E.canDeclarePair(G, 1));
  G.hands[1] = ['Kh', 'Qh', 'Js', '9s', 'As', '10s', 'Jd', '9d'];
  G.playerWon[1] = 1; G.turn = 1;
  assert(E.canDeclarePair(G, 1)); E.declarePair(G, 1);
  assert.strictEqual(G.target, 16 + 0 === 16 ? 16 : 16);
  assert(!E.canDeclarePair(G, 1));
});
t('scoring: last trick bonus, total 29, set/win', () => {
  const G = E.newRound({ dealer: 0, rules: { doubling: false } });
  E.placeBid(G, 1, 16); E.passBid(G, 2); E.passBid(G, 3); E.passBid(G, 0); E.chooseTrump(G, 1, 'h', false);
  while (G.phase === 'play') {
    const o = E.observe(G, G.turn);
    E.playCard(G, G.turn, E.ai.play(o, 'Hard', Math.random));
  }
  assert.strictEqual(G.teamPts[0] + G.teamPts[1], 29);
  assert.strictEqual(G.tricks.length, 8);
  assert.strictEqual(G.tricks[7].last, true);
  assert.strictEqual(G.result.success, G.teamPts[1] >= 16);
});
t('match: +6 wins, -6 loses', () => {
  const M = E.newMatch();
  for (let i = 0; i < 6; i++) E.applyRound(M, { bidTeam: 0, delta: 1 });
  assert(M.over && M.winner === 0);
  const M2 = E.newMatch();
  for (let i = 0; i < 6; i++) E.applyRound(M2, { bidTeam: 0, delta: -1 });
  assert(M2.over && M2.winner === 1);
});
t('observe() never leaks other hands or hidden trump', () => {
  const G = E.newRound({ dealer: 0 });
  E.placeBid(G, 1, 16); E.passBid(G, 2); E.passBid(G, 3); E.passBid(G, 0); E.chooseTrump(G, 1, 'h', true);
  const o = E.observe(G, 2);
  assert.strictEqual(o.trump, null);
  assert.strictEqual(JSON.stringify(o).includes(JSON.stringify(G.hands[3])), false);
  assert.strictEqual(E.observe(G, 1).trump, 'h');
});

/* ---------- simulation ---------- */
const N = parseInt(process.argv[2] || '10000', 10);
console.log('\nSimulation: ' + N + ' complete rounds (random AI levels, hidden + open trump, doubling)');
const rng = Math.random;
const stats = { rounds: 0, redeals: 0, made: 0, set: 0, doubled: 0, pairs: 0, reveals: 0, byLevel: {} };
const t0 = Date.now();
for (let g = 0; g < N; g++) {
  const levels = [0, 1, 2, 3].map(() => Math.floor(rng() * 4));
  let dealer = Math.floor(rng() * 4), G;
  const rules = { hiddenTrump: rng() < 0.6 };
  for (;;) {
    G = E.newRound({ dealer, rules, rng });
    const all = G.hands.concat(G.rest).flat();
    assert.strictEqual(new Set(all).size, 32);
    while (G.phase === 'bidding') {
      const p = G.turn, d = E.ai.bid(E.observe(G, p), levels[p], rng);
      const r = d.act === 'bid' ? E.placeBid(G, p, d.amount) : E.passBid(G, p);
      assert(r.ok, r.error);
    }
    if (G.phase === 'redeal') { stats.redeals++; dealer = (dealer + 1) % 4; continue; }
    break;
  }
  const dec = G.declarer;
  let r = E.chooseTrump(G, dec, E.ai.trump(E.observe(G, dec), levels[dec]).suit, E.ai.trump(E.observe(G, dec), levels[dec]).hidden);
  assert(r.ok, r.error);
  G.hands.forEach(h => assert.strictEqual(h.length, 8));
  while (G.phase === 'double') {
    const p = G.turn, o = E.observe(G, p);
    const yes = G.dblStage === 'redouble' ? E.ai.redouble(o, levels[p], rng) : E.ai.double(o, levels[p], rng);
    assert(E.decideDouble(G, p, yes).ok);
  }
  if (G.mult > 1) stats.doubled++;
  const hold = new Set(G.hands.flat());
  assert.strictEqual(hold.size, 32);
  let guard = 0;
  while (G.phase === 'play') {
    if (++guard > 40) throw new Error('stuck');
    const p = G.turn;
    let o = E.observe(G, p);
    if (o.canPair && E.ai.pair(o, levels[p])) { assert(E.declarePair(G, p).ok); stats.pairs++; o = E.observe(G, p); }
    if (o.canReveal && E.ai.reveal(o, levels[p], rng)) { assert(E.revealTrump(G, p).ok); stats.reveals++; o = E.observe(G, p); }
    const c = E.ai.play(o, levels[p], rng);
    assert(o.legal.includes(c), 'AI chose illegal card');
    assert(E.playCard(G, p, c).ok);
  }
  assert.strictEqual(G.tricks.length, 8);
  const played = G.tricks.flatMap(tr => tr.plays.map(pl => pl.card));
  assert.strictEqual(new Set(played).size, 32, 'every card played once');
  const cardPts = G.tricks.reduce((a, tr) => a + tr.plays.reduce((b, pl) => b + E.cardPoints(pl.card), 0), 0);
  assert.strictEqual(cardPts, 28);
  assert.strictEqual(G.tricks[7].pts - G.tricks[7].plays.reduce((b, pl) => b + E.cardPoints(pl.card), 0), 1);
  assert.strictEqual(G.teamPts[0] + G.teamPts[1], 29);
  assert.strictEqual(G.hands.flat().length, 0);
  stats.rounds++;
  if (G.result.success) stats.made++; else stats.set++;
  const key = 'L' + levels[dec];
  stats.byLevel[key] = stats.byLevel[key] || { made: 0, n: 0, bid: 0 };
  stats.byLevel[key].n++; stats.byLevel[key].bid += G.bid.amount; if (G.result.success) stats.byLevel[key].made++;
}
console.log('  all invariants held for ' + stats.rounds + ' rounds (' + (Date.now() - t0) + ' ms)');
console.log('  redeals ' + stats.redeals + ', bids made ' + stats.made + ', set ' + stats.set + ', doubled ' + stats.doubled +
  ', pairs ' + stats.pairs + ', trump reveals ' + stats.reveals);
Object.keys(stats.byLevel).sort().forEach(k => {
  const s = stats.byLevel[k];
  console.log('  declarer level ' + E.LEVELS[+k[1]].padEnd(7) + ' rounds ' + String(s.n).padStart(5) + '  avg bid ' + (s.bid / s.n).toFixed(1) + '  made ' + (100 * s.made / s.n).toFixed(1) + '%');
});

// strength check: Expert pair vs Easy pair
function duel(levA, levB, n) {
  let wins = 0, total = 0;
  for (let i = 0; i < n; i++) {
    const lv = [levA, levB, levA, levB], M = E.newMatch(); let dealer = i % 4;
    while (!M.over) {
      const G = E.newRound({ dealer, rng, rules: M.rules });
      while (G.phase === 'bidding') { const p = G.turn, d = E.ai.bid(E.observe(G, p), lv[p], rng); d.act === 'bid' ? E.placeBid(G, p, d.amount) : E.passBid(G, p); }
      dealer = (dealer + 1) % 4;
      if (G.phase === 'redeal') continue;
      const dec = G.declarer, tr = E.ai.trump(E.observe(G, dec), lv[dec]);
      E.chooseTrump(G, dec, tr.suit, tr.hidden);
      while (G.phase === 'double') { const p = G.turn; E.decideDouble(G, p, false); }
      while (G.phase === 'play') {
        const p = G.turn; let o = E.observe(G, p);
        if (o.canPair && E.ai.pair(o, lv[p])) { E.declarePair(G, p); o = E.observe(G, p); }
        if (o.canReveal && E.ai.reveal(o, lv[p], rng)) { E.revealTrump(G, p); o = E.observe(G, p); }
        E.playCard(G, p, E.ai.play(o, lv[p], rng));
      }
      E.applyRound(M, G.result);
    }
    total++; if (M.winner === 0) wins++;
  }
  return (100 * wins / total).toFixed(1);
}
console.log('\nStrength check (match win rate of seats 0+2 against seats 1+3, 400 matches each):');
console.log('  Expert vs Easy   ' + duel(3, 0, 400) + '%');
console.log('  Hard   vs Easy   ' + duel(2, 0, 400) + '%');
console.log('  Medium vs Easy   ' + duel(1, 0, 400) + '%');
console.log('  Expert vs Medium ' + duel(3, 1, 400) + '%');
console.log('\n' + passed + ' unit tests passed');
