/* Crystal Quest celebrations: which praise word a blast earns, and the confetti for a finished level.
   Pure functions (no screen code) so they can be tested. The screen part is in game.js, the soft chimes are in audio.js. */
(function (root) {
  'use strict';

  var WORDS = ['', 'Good!', 'Great!', 'Excellent!', 'Awesome!', 'Amazing!', 'Incredible!'];     // tier 0 = no word, tier 6 = the biggest
  var SPECIAL_TYPES = ['bomb', 'lightning', 'thunder', 'nova', 'star', 'fish', 'super'];          // every special crystal except the Rainbow

  /* How big was the blast?
     info = { cleared: crystals that went in this step, cascade: 1 for the player's own match, 2, 3... for chain reactions,
              kinds: the special crystals that went off, for example ['rainbow'] or ['lightning', 'bomb'], combo: two specials were swapped together }
     Returns 0 (nothing to say, an ordinary 3-match) to 6 (Incredible!).
     A special crystal always gets a word, however few crystals it cleared:
       any special = at least Excellent!, the Rainbow = at least Awesome!, two specials swapped together = Incredible!. */
  function tierFor(info) {
    var n = info.cleared || 0, c = info.cascade || 1, kinds = info.kinds || [], t = 0;
    if (n >= 4 || c >= 2) t = 1;                       // a match of 4, or the first chain reaction
    if (n >= 5 || c >= 3) t = 2;                       // a match of 5, or two chain reactions
    if (n >= 7) t = 3;
    if (n >= 9 || c >= 4) t = 4;
    if (n >= 12 || c >= 5) t = 5;
    if (n >= 16 || c >= 6) t = 6;
    if (kinds.some(function (k) { return SPECIAL_TYPES.indexOf(k) > -1; })) t = Math.max(t, 3);
    if (kinds.indexOf('rainbow') > -1) t = Math.max(t, 4);
    if (info.combo) t = 6;
    return t;
  }
  function wordFor(tier) { return WORDS[Math.max(0, Math.min(WORDS.length - 1, tier | 0))]; }

  /* Confetti pieces for the level-complete moment. Same seed = same pieces (so it can be tested). */
  var COLORS = ['#FFE27A', '#FF6B8B', '#7DF3EC', '#7B5CFF', '#35CF7C', '#FFFFFF', '#F5A31A'];
  function confetti(count, seed) {
    var a = (seed >>> 0) || 7;
    function rnd() { a |= 0; a = (a + 0x6D2B79F5) | 0; var t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }
    var out = [];
    for (var i = 0; i < count; i++) {
      out.push({ color: COLORS[i % COLORS.length], dx: Math.round((rnd() - 0.5) * 520), up: Math.round(60 + rnd() * 160), dx2: Math.round((rnd() - 0.5) * 640),
                 rot: Math.round((rnd() - 0.5) * 900), delay: Math.round(rnd() * 160), size: 6 + Math.round(rnd() * 6), round: rnd() > 0.6 });
    }
    return out;
  }

  /* Which of the cleared crystals get a flying light from the Rainbow crystal (at most `max`, spread over the whole list so it looks even) */
  function rainbowTargets(cells, max) {
    if (cells.length <= max) return cells.slice();
    var out = [], step = cells.length / max;
    for (var i = 0; i < max; i++) out.push(cells[Math.floor(i * step)]);
    return out;
  }

  var api = { WORDS: WORDS, SPECIAL_TYPES: SPECIAL_TYPES, tierFor: tierFor, wordFor: wordFor, confetti: confetti, rainbowTargets: rainbowTargets };
  root.CQCelebrate = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis);
