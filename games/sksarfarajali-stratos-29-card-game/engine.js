/* STRATOS 29 - rules engine + AI. Pure logic, no DOM. Works in browser (window.S29) and Node (module.exports).
 *
 * DEFAULT RULESET ("STRATOS standard"):
 *  - 32 cards (7-A of 4 suits), 4 players, partners sit opposite (seats 0+2 = Team A, 1+3 = Team B).
 *  - Card order J 9 A 10 K Q 8 7. Points J3 9:2 A1 10:1, total 28, +1 for the last trick = 29.
 *  - Deal 4 cards, bid (min 16, max 29, one pass is final), declarer names trump, deal the other 4.
 *  - If everyone passes: redeal by the next dealer.
 *  - Hidden trump (optional): trump stays secret until a player who cannot follow suit asks for it, or the declarer plays it.
 *    The player who asks must play a trump if they hold one.
 *  - Pair (K+Q of trump): a player whose team has won a trick may declare it. Declarer team: bid -4 (never below 16).
 *    Opponents: bid +4 (never above 29). Declaring reveals trump.
 *  - Double / re-double: opponents may double after the full deal, declarer may re-double. Game points x2 / x4.
 *  - Game points: declarer team makes its bid => +1 x multiplier, else -1 x multiplier. First to +6 wins (or -6 loses).
 *  - Variants NOT implemented: single hand, partner-specific bidding limits, trump-card-face-down variants.
 */
(function (root) {
  'use strict';

  var SUITS = ['s', 'h', 'd', 'c'];
  var SUIT_NAME = { s: 'Spades', h: 'Hearts', d: 'Diamonds', c: 'Clubs' };
  var SUIT_SYM = { s: '♠', h: '♥', d: '♦', c: '♣' };
  var RANKS = ['J', '9', 'A', '10', 'K', 'Q', '8', '7'];
  var POINTS = { J: 3, '9': 2, A: 1, '10': 1, K: 0, Q: 0, '8': 0, '7': 0 };
  var STRENGTH = {};
  RANKS.forEach(function (r, i) { STRENGTH[r] = 8 - i; });

  var DEFAULT_RULES = {
    minBid: 16, maxBid: 29, hiddenTrump: true, doubling: true, pair: true,
    pairAdjust: 4, lastTrickBonus: 1, targetScore: 6
  };

  /* ---------- cards ---------- */
  function rank(c) { return c.slice(0, -1); }
  function suit(c) { return c.slice(-1); }
  function cardPoints(c) { return POINTS[rank(c)]; }
  function strength(c) { return STRENGTH[rank(c)]; }
  function team(p) { return p % 2; }
  function makeDeck() {
    var d = [];
    SUITS.forEach(function (s) { RANKS.forEach(function (r) { d.push(r + s); }); });
    return d;
  }
  function sortHand(h) {
    return h.slice().sort(function (a, b) {
      var sa = SUITS.indexOf(suit(a)), sb = SUITS.indexOf(suit(b));
      return sa !== sb ? sa - sb : strength(b) - strength(a);
    });
  }

  /* ---------- randomness ---------- */
  function secureRng() {
    var cr = root.crypto || (typeof require === 'function' ? require('crypto').webcrypto : null);
    if (!cr || !cr.getRandomValues) return Math.random;
    var buf = new Uint32Array(1);
    return function () { cr.getRandomValues(buf); return buf[0] / 4294967296; };
  }
  function seededRng(seed) { // mulberry32, used for the Daily Deal
    var a = seed >>> 0;
    return function () {
      a = (a + 0x6D2B79F5) >>> 0;
      var t = a;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  function shuffle(deck, rng) {
    var a = deck.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(rng() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  /* ---------- round ---------- */
  function newRound(opts) {
    var rules = Object.assign({}, DEFAULT_RULES, opts.rules || {});
    var rng = opts.rng || secureRng();
    var deck = opts.deck || shuffle(makeDeck(), rng);
    var hands = [], rest = [];
    for (var p = 0; p < 4; p++) {
      hands.push(deck.slice(p * 4, p * 4 + 4));
      rest.push(deck.slice(16 + p * 4, 20 + p * 4));
    }
    return {
      rules: rules, dealer: opts.dealer, hands: hands, rest: rest,
      phase: 'bidding', turn: (opts.dealer + 1) % 4,
      bid: null, passed: [false, false, false, false], bidLog: [],
      declarer: null, trump: null, hidden: false, revealed: false,
      target: 0, mult: 1, dblStage: null, doubledBy: null,
      trick: [], tricks: [], lastTrick: null, seen: [],
      teamPts: [0, 0], playerWon: [0, 0, 0, 0],
      pair: null, forceTrump: -1, result: null, deck: deck
    };
  }
  function fail(msg) { return { ok: false, error: msg }; }
  var OK = { ok: true };

  /* ---------- bidding ---------- */
  function validBids(G) {
    var lo = G.bid ? G.bid.amount + 1 : G.rules.minBid, out = [];
    for (var n = lo; n <= G.rules.maxBid; n++) out.push(n);
    return out;
  }
  function placeBid(G, p, amount) {
    if (G.phase !== 'bidding') return fail('Not bidding');
    if (G.turn !== p || G.passed[p]) return fail('Not your turn');
    if (!Number.isInteger(amount) || amount < G.rules.minBid || amount > G.rules.maxBid) return fail('Bid out of range');
    if (G.bid && amount <= G.bid.amount) return fail('Bid must beat ' + G.bid.amount);
    G.bid = { amount: amount, by: p };
    G.bidLog.push({ p: p, bid: amount });
    advanceBid(G, p);
    return OK;
  }
  function passBid(G, p) {
    if (G.phase !== 'bidding') return fail('Not bidding');
    if (G.turn !== p || G.passed[p]) return fail('Not your turn');
    G.passed[p] = true;
    G.bidLog.push({ p: p, bid: 0 });
    advanceBid(G, p);
    return OK;
  }
  function advanceBid(G, from) {
    var active = [0, 1, 2, 3].filter(function (q) { return !G.passed[q]; });
    if (active.length === 0) { G.phase = 'redeal'; return; }
    if (G.bid && active.length === 1) {
      G.declarer = G.bid.by; G.target = G.bid.amount;
      G.phase = 'trump'; G.turn = G.declarer; return;
    }
    var q = (from + 1) % 4;
    while (G.passed[q]) q = (q + 1) % 4;
    G.turn = q;
  }

  /* ---------- trump, doubling ---------- */
  function chooseTrump(G, p, s, hidden) {
    if (G.phase !== 'trump' || G.turn !== p) return fail('Not your turn to pick trump');
    if (SUITS.indexOf(s) < 0) return fail('Bad suit');
    G.trump = s;
    G.hidden = !!hidden && G.rules.hiddenTrump;
    G.revealed = !G.hidden;
    for (var q = 0; q < 4; q++) G.hands[q] = G.hands[q].concat(G.rest[q]);
    if (G.rules.doubling) {
      G.phase = 'double'; G.dblStage = 'opp1'; G.turn = (G.declarer + 1) % 4;
    } else startPlay(G);
    return OK;
  }
  function decideDouble(G, p, yes) {
    if (G.phase !== 'double' || G.turn !== p) return fail('Not your turn');
    var d = G.declarer;
    if (G.dblStage === 'opp1' || G.dblStage === 'opp2') {
      if (yes) { G.mult = 2; G.doubledBy = p; G.dblStage = 'redouble'; G.turn = d; return OK; }
      if (G.dblStage === 'opp1') { G.dblStage = 'opp2'; G.turn = (d + 3) % 4; return OK; }
      startPlay(G); return OK;
    }
    if (G.dblStage === 'redouble') {
      if (yes) G.mult = 4;
      startPlay(G); return OK;
    }
    return fail('Bad state');
  }
  function startPlay(G) {
    G.phase = 'play'; G.dblStage = null; G.turn = (G.dealer + 1) % 4; G.trick = [];
  }

  /* ---------- play ---------- */
  function countSuit(hand, s) { return hand.filter(function (c) { return suit(c) === s; }).length; }
  function legalCards(G, p) {
    var hand = G.hands[p];
    if (G.trick.length === 0) return hand.slice();
    var ls = suit(G.trick[0].card);
    var follow = hand.filter(function (c) { return suit(c) === ls; });
    if (follow.length) return follow;
    if (G.forceTrump === p) {
      var tr = hand.filter(function (c) { return suit(c) === G.trump; });
      if (tr.length) return tr;
    }
    return hand.slice();
  }
  function canReveal(G, p) {
    return G.phase === 'play' && G.turn === p && G.hidden && !G.revealed && G.trick.length > 0 &&
      countSuit(G.hands[p], suit(G.trick[0].card)) === 0 && p !== G.declarer;
  }
  function revealTrump(G, p) {
    if (!canReveal(G, p)) return fail('Cannot reveal now');
    G.revealed = true;
    if (countSuit(G.hands[p], G.trump) > 0) G.forceTrump = p;
    return OK;
  }
  function canDeclarePair(G, p) {
    if (!G.rules.pair || G.phase !== 'play' || G.turn !== p || G.pair) return false;
    var h = G.hands[p];
    if (h.indexOf('K' + G.trump) < 0 || h.indexOf('Q' + G.trump) < 0) return false;
    return G.playerWon.some(function (w, q) { return team(q) === team(p) && w > 0; });
  }
  function declarePair(G, p) {
    if (!canDeclarePair(G, p)) return fail('Cannot declare pair');
    var mine = team(p) === team(G.declarer);
    var adj = G.rules.pairAdjust;
    if (mine) G.target = Math.max(G.rules.minBid, G.target - adj);
    else G.target = Math.min(G.rules.maxBid, G.target + adj);
    G.pair = { by: p, mine: mine };
    G.revealed = true;
    return OK;
  }
  // winner of a set of plays. trump = suit that counts as trump right now (or null).
  function trickWinner(plays, trump) {
    var lead = suit(plays[0].card), best = -1, win = null;
    plays.forEach(function (pl) {
      var s = suit(pl.card), v = 0;
      if (trump && s === trump) v = 100 + strength(pl.card);
      else if (s === lead) v = strength(pl.card);
      if (v > best) { best = v; win = pl.p; }
    });
    return win;
  }
  function playCard(G, p, card) {
    if (G.phase !== 'play') return fail('Not playing');
    if (G.turn !== p) return fail('Not your turn');
    if (G.hands[p].indexOf(card) < 0) return fail('Card not in hand');
    if (legalCards(G, p).indexOf(card) < 0) return fail('Must follow suit');
    if (p === G.declarer && G.hidden && !G.revealed && suit(card) === G.trump) G.revealed = true;
    G.hands[p].splice(G.hands[p].indexOf(card), 1);
    G.trick.push({ p: p, card: card });
    G.seen.push(card);
    if (G.forceTrump === p) G.forceTrump = -1;
    if (G.trick.length < 4) { G.turn = (p + 1) % 4; return OK; }
    var w = trickWinner(G.trick, G.revealed ? G.trump : null);
    var pts = G.trick.reduce(function (a, pl) { return a + cardPoints(pl.card); }, 0);
    var last = G.tricks.length === 7;
    if (last) pts += G.rules.lastTrickBonus;
    G.teamPts[team(w)] += pts;
    G.playerWon[w]++;
    G.lastTrick = { plays: G.trick.slice(), winner: w, pts: pts, last: last };
    G.tricks.push(G.lastTrick);
    G.trick = [];
    G.turn = w;
    if (G.tricks.length === 8) { G.phase = 'done'; G.revealed = true; G.result = scoreRound(G); }
    return OK;
  }
  function scoreRound(G) {
    var bt = team(G.declarer), pts = G.teamPts[bt], success = pts >= G.target;
    return { bidTeam: bt, bid: G.bid.amount, target: G.target, points: G.teamPts.slice(), success: success,
      mult: G.mult, delta: (success ? 1 : -1) * G.mult, trump: G.trump, tricksWon: [
        G.playerWon[0] + G.playerWon[2], G.playerWon[1] + G.playerWon[3]] };
  }

  /* ---------- match (several rounds to +/-6) ---------- */
  function newMatch(rules) {
    var r = Object.assign({}, DEFAULT_RULES, rules || {});
    return { rules: r, scores: [0, 0], round: 0, over: false, winner: null, dealer: 0 };
  }
  function applyRound(M, res) {
    M.scores[res.bidTeam] += res.delta;
    M.round++;
    var t = M.rules.targetScore;
    for (var i = 0; i < 2; i++) {
      if (M.scores[i] >= t) { M.over = true; M.winner = i; }
      else if (M.scores[i] <= -t) { M.over = true; M.winner = 1 - i; }
    }
    return M;
  }

  /* ---------- what a seat is allowed to see ---------- */
  function observe(G, p) {
    return {
      me: p, hand: G.hands[p].slice(), phase: G.phase, rules: G.rules, dealer: G.dealer,
      bid: G.bid ? { amount: G.bid.amount, by: G.bid.by } : null, passed: G.passed.slice(),
      declarer: G.declarer, revealed: G.revealed, hidden: G.hidden,
      trump: (G.revealed || p === G.declarer) ? G.trump : null,
      target: G.target, mult: G.mult, trick: G.trick.slice(),
      seen: G.seen.slice(), tricks: G.tricks.map(function (t) { return { plays: t.plays, winner: t.winner, pts: t.pts }; }),
      teamPts: G.teamPts.slice(), playerWon: G.playerWon.slice(), forceTrump: G.forceTrump,
      pairDeclared: !!G.pair, legal: G.phase === 'play' && G.turn === p ? legalCards(G, p) : [],
      canReveal: canReveal(G, p), canPair: G.netCanPair !== undefined ? G.netCanPair : canDeclarePair(G, p)
    };
  }

  /* =====================  AI  ===================== */
  var LEVELS = ['Easy', 'Medium', 'Hard', 'Expert'];
  var W = { J: 4.5, '9': 3, A: 1.5, '10': 1.3, K: 0.6, Q: 0.4, '8': 0.2, '7': 0.2 };

  function suitScore(hand, s) {
    var n = 0, sc = 0;
    hand.forEach(function (c) { if (suit(c) === s) { n++; sc += W[rank(c)]; } });
    return n ? sc + 1.2 * (n - 1) : 0;
  }
  function bestSuit(hand) {
    var b = 'h', v = -1;
    SUITS.forEach(function (s) { var x = suitScore(hand, s); if (x > v) { v = x; b = s; } });
    return { suit: b, score: v };
  }
  function noise(level) { return [3, 1, 0.5, 0][level]; }
  function lvl(l) { return typeof l === 'number' ? l : LEVELS.indexOf(l); }

  // Roughly how high this hand can bid. Used by AI and by the "hand strength" hint for the player.
  function bidCeiling(hand4, level, partnerBid, rng) {
    var b = bestSuit(hand4);
    var side = hand4.reduce(function (a, c) { return a + (suit(c) === b.suit ? 0 : cardPoints(c)); }, 0);
    var ceil = 14 + (b.score + 0.25 * side) * 0.55 + (partnerBid ? 1 : 0);
    ceil += (rng() * 2 - 1) * noise(lvl(level));
    return Math.round(ceil);
  }
  function aiBid(obs, level, rng) {
    level = lvl(level);
    var partner = (obs.me + 2) % 4;
    var ceil = bidCeiling(obs.hand, level, obs.bid && obs.bid.by === partner, rng);
    var next = obs.bid ? obs.bid.amount + 1 : obs.rules.minBid;
    if (level === 3 && obs.bid && obs.bid.by === partner && ceil < obs.bid.amount + 3) return { act: 'pass' };
    if (level === 0 && rng() < 0.12) return { act: 'pass' };
    if (next > obs.rules.maxBid || next > ceil) return { act: 'pass' };
    var amt = next;
    if (level >= 2 && ceil - next >= 4 && obs.bid) amt = Math.min(ceil, next + 1);
    return { act: 'bid', amount: amt };
  }
  function aiTrump(obs, level) {
    return { suit: bestSuit(obs.hand).suit, hidden: obs.rules.hiddenTrump };
  }
  function handPoints(h) { return h.reduce(function (a, c) { return a + cardPoints(c); }, 0); }
  function aiDouble(obs, level, rng) { // opponents, 8 cards, trump usually unknown
    level = lvl(level);
    if (level < 2) return false;
    var hp = handPoints(obs.hand), jacks = obs.hand.filter(function (c) { return rank(c) === 'J'; }).length;
    var need = level === 3 ? 12 : 13;
    return obs.target >= 19 && hp >= need && jacks >= 2 && rng() < 0.8;
  }
  function aiRedouble(obs, level, rng) { // declarer, trump known
    level = lvl(level);
    if (level < 2) return false;
    var t = obs.trump, s = suitScore(obs.hand, t);
    return s >= 12 && handPoints(obs.hand) >= 9 && rng() < 0.7;
  }

  function aiSeenFilter(obs) {
    var all = makeDeck(), gone = {};
    obs.hand.forEach(function (c) { gone[c] = 1; });
    obs.seen.forEach(function (c) { gone[c] = 1; });
    return all.filter(function (c) { return !gone[c]; });
  }
  function voidsFrom(obs) {
    var v = [{}, {}, {}, {}];
    function scan(plays) {
      if (!plays.length) return;
      var ls = suit(plays[0].card);
      plays.forEach(function (pl) { if (suit(pl.card) !== ls) v[pl.p][ls] = true; });
    }
    obs.tricks.forEach(function (t) { scan(t.plays); });
    scan(obs.trick);
    return v;
  }
  function effTrump(obs) { return (obs.revealed || obs.me === obs.declarer) ? obs.trump : null; }
  function curWinner(obs, tr) { return obs.trick.length ? trickWinner(obs.trick, tr) : -1; }
  function beats(card, plays, tr) { // would `card` (played now by me) win against current plays?
    var me = { p: -9, card: card };
    return trickWinner(plays.concat([me]), tr) === -9;
  }
  function lowest(cards) { // least valuable: fewest points then weakest
    return cards.slice().sort(function (a, b) { return cardPoints(a) - cardPoints(b) || strength(a) - strength(b); })[0];
  }
  function weakest(cards) { return cards.slice().sort(function (a, b) { return strength(a) - strength(b); })[0]; }

  function aiPlay(obs, level, rng) {
    level = lvl(level);
    var legal = obs.legal;
    if (!legal.length) return null;
    if (legal.length === 1) return legal[0];
    if (level === 0 && rng() < 0.45) return legal[Math.floor(rng() * legal.length)];

    var tr = effTrump(obs), me = obs.me, partner = (me + 2) % 4;
    var plays = obs.trick, w = curWinner(obs, tr);
    var trickPts = plays.reduce(function (a, pl) { return a + cardPoints(pl.card); }, 0);
    var unseen = level >= 2 ? aiSeenFilter(obs) : null;
    var voids = level >= 2 ? voidsFrom(obs) : null;
    var behind = 3 - plays.length; // players still to act after me

    // chance that some later opponent beats `card` (only meaningful for Hard / Expert)
    function pBeaten(card) {
      if (behind === 0) return 0;
      var s = suit(card), ls = plays.length ? suit(plays[0].card) : s;
      var stronger = 0;
      if (tr && s === tr) {
        stronger = unseen.filter(function (c) { return suit(c) === tr && strength(c) > strength(card); }).length;
      } else {
        stronger = unseen.filter(function (c) { return suit(c) === ls && strength(c) > strength(card); }).length;
        if (tr && s === ls) { // opponents void in lead suit could still ruff
          var ruffRisk = 0;
          for (var q = 1; q <= behind; q++) {
            var pl = (me + q) % 4;
            if (team(pl) !== team(me) && voids[pl][ls] && unseen.some(function (c) { return suit(c) === tr; })) ruffRisk = 0.6;
          }
          if (ruffRisk) return Math.max(ruffRisk, 1 - Math.pow(2 / 3, stronger));
        }
      }
      return 1 - Math.pow(2 / 3, stronger);
    }

    var cands = legal.map(function (card) {
      var val = cardPoints(card), sc = 0;
      var wins = obs.trick.length === 0 ? true : beats(card, plays, tr);
      if (obs.trick.length === 0) { // leading
        var pb = level >= 2 ? pBeaten(card) : 0.5 - strength(card) / 20;
        var isTrump = tr && suit(card) === tr;
        sc = (1 - pb) * (2.2 + 0.4 * val) - pb * (val * 1.1) - strength(card) * 0.02;
        if (level >= 2 && isTrump && obs.me === obs.declarer && pb < 0.3) sc += 0.8; // draw trumps with the top ones
        if (isTrump && pb > 0.4) sc -= 1.2;                                    // keep weak trumps for ruffing
        if (!isTrump && pb > 0.5) sc += 0.3 * (1 - val);                       // lead low to probe
      } else if (w === partner || (w === me)) {
        var partnerSafe = level >= 2 ? (behind === 0 || pBeaten(plays.filter(function (pl) { return pl.p === w; })[0].card) < 0.35) : (behind === 0);
        if (partnerSafe) sc = val * 1.6 - strength(card) * 0.05;     // feed points to the partner
        else sc = wins ? 1.5 + val * 0.5 : -val * 0.9 - strength(card) * 0.05;
        if (level >= 1 && wins && w === partner && !partnerSafe) sc += 0.6;  // overtake an unsafe partner cheaply
      } else { // an opponent is winning
        if (wins) {
          var pbw = level >= 2 ? pBeaten(card) : 0.3;
          sc = (1 - pbw) * (2.5 + trickPts + val * 0.3) - pbw * val * 1.2 - strength(card) * 0.12;
          if (tr && suit(card) === tr && suit(plays[0].card) !== tr) sc -= 0.4 * (trickPts === 0 ? 3 : 0); // do not waste trump on empty tricks
        } else sc = -val * 1.3 - strength(card) * 0.06;
      }
      if (level === 1) sc += (rng() - 0.5) * 0.8;
      if (level === 0) sc += (rng() - 0.5) * 2;
      return { card: card, sc: sc };
    });
    cands.sort(function (a, b) { return b.sc - a.sc; });
    return cands[0].card;
  }

  // Would a void player ask for the hidden trump?
  function aiReveal(obs, level, rng) {
    level = lvl(level);
    if (!obs.canReveal || level === 0) return false;
    var tr = null, w = curWinner(obs, tr), partner = (obs.me + 2) % 4;
    if (w === partner) return false;
    var pts = obs.trick.reduce(function (a, pl) { return a + cardPoints(pl.card); }, 0);
    if (level === 1) return pts >= 3 && rng() < 0.5;
    if (level === 2) return pts >= 2 && rng() < 0.7;
    return pts >= 1 && obs.hand.length >= 3;
  }
  function aiPair(obs, level) {
    return lvl(level) >= 1 && obs.canPair;
  }

  var api = {
    SUITS: SUITS, SUIT_NAME: SUIT_NAME, SUIT_SYM: SUIT_SYM, RANKS: RANKS, POINTS: POINTS, LEVELS: LEVELS,
    DEFAULT_RULES: DEFAULT_RULES, rank: rank, suit: suit, cardPoints: cardPoints, strength: strength, team: team,
    makeDeck: makeDeck, sortHand: sortHand, secureRng: secureRng, seededRng: seededRng, shuffle: shuffle,
    newRound: newRound, validBids: validBids, placeBid: placeBid, passBid: passBid, chooseTrump: chooseTrump,
    decideDouble: decideDouble, legalCards: legalCards, canReveal: canReveal, revealTrump: revealTrump,
    canDeclarePair: canDeclarePair, declarePair: declarePair, trickWinner: trickWinner, playCard: playCard,
    scoreRound: scoreRound, newMatch: newMatch, applyRound: applyRound, observe: observe,
    bidCeiling: bidCeiling, bestSuit: bestSuit, suitScore: suitScore, handPoints: handPoints,
    ai: { bid: aiBid, trump: aiTrump, double: aiDouble, redouble: aiRedouble, play: aiPlay, reveal: aiReveal, pair: aiPair }
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.S29 = api;
})(typeof window !== 'undefined' ? window : globalThis);
