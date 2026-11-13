/* Crystal Quest celebrations: which praise word a blast earns, and the confetti for a finished level.
   Pure functions (no screen code) so they can be tested. The screen part is in game.js, the soft chimes are in audio.js. */
(function (root) {
  'use strict';

  var WORDS = ['', 'Good!', 'Great!', 'Amazing!', 'Incredible!'];     // tier 0 = no word

  /* How big was the blast?
     info = { cleared: crystals that went in this step, cascade: 1 for the player's own match, 2, 3... for chain reactions,
              specials: special crystals that went off, combo: two specials were swapped together }
     Returns 0 (nothing to say, an ordinary 3-match) to 4 (Incredible!). */
  function tierFor(info) {
    var n = info.cleared || 0, c = info.cascade || 1, sp = info.specials || 0, t = 0;
    if (n >= 4 || c >= 2) t = 1;                       // a match of 4, or the first chain reaction
    if (n >= 5 || c >= 3) t = 2;                       // a match of 5, or two chain reactions
    if (n >= 8 || c >= 4 || (sp >= 1 && n >= 6)) t = 3;
    if (n >= 12 || c >= 5 || info.combo) t = 4;
    return t;
  }
  function wordFor(tier) { return WORDS[Math.max(0, Math.min(4, tier | 0))]; }

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

  var api = { WORDS: WORDS, tierFor: tierFor, wordFor: wordFor, confetti: confetti };
  root.CQCelebrate = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis);
