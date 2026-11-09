/* Crystal Quest engine: pure Match-3 rules, no screen code. Works in the browser and in Node (for tests).
   The engine changes its state straight away and hands back a list of "steps" that the screen plays as animation. */
(function (root) {
  'use strict';

  var SPECIALS = ['bomb', 'lightning', 'thunder', 'rainbow', 'nova', 'star', 'fish', 'super'];

  /* Ten blockers + frost (the boss's freeze). mode: under = sits beneath a crystal; lock = holds the crystal still;
     solid = a block that fills the cell. by: what breaks it (tile = the crystal in it is cleared, adj = a clear next to it). */
  var BLOCKERS = {
    ice:    { mode: 'under', hp: 2, by: ['tile'],        art: 'blocker_01_ice_block',   name: 'Ice' },
    stone:  { mode: 'solid', hp: 2, by: ['adj'],         art: 'blocker_02_stone_block', name: 'Stone' },
    cage:   { mode: 'lock',  hp: 1, by: ['tile'],        art: 'blocker_03_crystal_cage', name: 'Cage' },
    chain:  { mode: 'lock',  hp: 1, by: ['tile', 'adj'], art: 'blocker_04_magic_chain', name: 'Chain' },
    dark:   { mode: 'solid', hp: 2, by: ['adj'],         art: 'blocker_05_dark_crystal', name: 'Dark crystal' },
    wood:   { mode: 'solid', hp: 1, by: ['adj'],         art: 'blocker_06_wooden_box',  name: 'Wooden box' },
    lava:   { mode: 'under', hp: 1, by: ['tile'],        art: 'blocker_07_lava_tile',   name: 'Lava' },
    wall:   { mode: 'solid', hp: 3, by: ['adj'],         art: 'blocker_08_crystal_wall', name: 'Crystal wall' },
    portal: { mode: 'solid', hp: 1, by: ['adj'],         art: 'blocker_09_shadow_portal', name: 'Shadow portal' },
    seal:   { mode: 'lock',  hp: 3, by: ['tile'],        art: 'blocker_10_ancient_seal', name: 'Ancient seal' },
    frost:  { mode: 'lock',  hp: 1, by: ['tile'],        art: 'blocker_01_ice_block',   name: 'Frost' },
    path:   { mode: 'under', hp: 1, by: ['tile'],        css: 'path',                     name: 'Path tile' },
    moss:   { mode: 'under', hp: 1, by: ['tile'],        css: 'moss',                     name: 'Forest patch' }
  };

  /* objective types that count a kind of broken tile */
  var BROKEN_BY = { rescue: 'cage', path: 'path', restore: 'moss', portal: 'portal' };

  function rng(seed) {
    var a = (seed >>> 0) || 1;
    return function () {
      a |= 0; a = (a + 0x6D2B79F5) | 0;
      var t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function Engine(level, seed) {
    this.L = level;
    this.rows = level.rows; this.cols = level.cols;
    this.ncol = level.colors || 5;
    this.rand = rng(seed || 1);
    this.nextId = 1;
    this.timed = !!level.time; this.timeLeft = level.time || 0;
    this.moves = this.timed ? 999 : level.moves; this.moveCount = 0; this.score = 0;
    this.energy = 0; this.itemsOut = 0; this.shield = false;
    this.collected = [0, 0, 0, 0, 0, 0];
    this.broken = {};               // blocker kind -> number destroyed
    this.bossHp = level.boss ? level.boss.hp : 0;
    this.state = 'ready';           // ready | busy | win | lose
    this.stats = { specials: 0, combos: 0, bestCascade: 0, shuffles: 0 };
    this._init();
  }
  var P = Engine.prototype;

  /* A new crystal's colour. The colours a level still needs get a little extra chance, so a goal never depends on luck alone. */
  P._pickColor = function () {
    var w = [], i, tot = 0, self = this;
    for (i = 0; i < this.ncol; i++) w.push(1);
    (this.L.objectives || []).forEach(function (o) { if (o.type === 'collect' && o.color < self.ncol && self.collected[o.color] < o.n) w[o.color] = 1.6; });
    w.forEach(function (x) { tot += x; });
    var r = this.rand() * tot;
    for (i = 0; i < w.length; i++) { r -= w[i]; if (r < 0) return i; }
    return w.length - 1;
  };
  P._mk = function (color, sp) { return { id: this.nextId++, color: color, sp: sp || null }; };
  P.inb = function (r, c) { return r >= 0 && c >= 0 && r < this.rows && c < this.cols; };
  P.solidAt = function (r, c) { var b = this.inb(r, c) && this.blk[r][c]; return !!b && BLOCKERS[b.kind].mode === 'solid'; };
  P.playable = function (r, c) { return this.inb(r, c) && !this.hole[r][c] && !this.solidAt(r, c); };
  P.lockedAt = function (r, c) { var b = this.inb(r, c) && this.blk[r][c]; return !!b && BLOCKERS[b.kind].mode === 'lock'; };
  P.tile = function (r, c) { return this.inb(r, c) ? this.grid[r][c] : null; };

  P._init = function () {
    var L = this.L, r, c, tries = 0;
    this.hole = []; this.blk = []; this.grid = [];
    for (r = 0; r < this.rows; r++) { this.hole.push([]); this.blk.push([]); this.grid.push([]); for (c = 0; c < this.cols; c++) { this.hole[r].push(false); this.blk[r].push(null); this.grid[r].push(null); } }
    (L.holes || []).forEach(function (h) { this.hole[h[0]][h[1]] = true; }, this);
    (L.blockers || []).forEach(function (b) {
      var d = BLOCKERS[b.kind]; if (!d || !this.inb(b.r, b.c) || this.hole[b.r][b.c]) return;
      this.blk[b.r][b.c] = { kind: b.kind, hp: b.hp || d.hp, max: b.hp || d.hp };
    }, this);
    do {
      for (r = 0; r < this.rows; r++) for (c = 0; c < this.cols; c++) {
        this.grid[r][c] = null;
        if (!this.playable(r, c)) continue;
        var col, k = 0;
        do { col = this._pickColor(); k++; }
        while (k < 30 && this._wouldMatch(r, c, col));
        this.grid[r][c] = this._mk(col);
      }
      this._placeItems();
      tries++;
    } while (tries < 60 && !this.findHint());
  };
  /* treasure levels: crystals-that-are-not-crystals start at the top and must be brought down to the bottom */
  P._placeItems = function () {
    var n = this.L.items || 0, cand = [], c, i;
    if (!n) return;
    for (c = 0; c < this.cols; c++) { var r = 0; while (r < this.rows && !this.playable(r, c)) r++; if (r < 2 && this.grid[r] && this.grid[r][c] && !this.lockedAt(r, c)) cand.push([r, c]); }
    for (i = 0; i < n && cand.length; i++) {
      var p = cand.splice(Math.floor(this.rand() * cand.length), 1)[0];
      this.grid[p[0]][p[1]] = { id: this.nextId++, color: -3, sp: null, item: true };
    }
  };
  P._wouldMatch = function (r, c, col) {
    var g = this.grid;
    if (c >= 2 && g[r][c - 1] && g[r][c - 2] && g[r][c - 1].color === col && g[r][c - 2].color === col) return true;
    if (r >= 2 && g[r - 1][c] && g[r - 2][c] && g[r - 1][c].color === col && g[r - 2][c].color === col) return true;
    return false;
  };

  /* ---------- matching ---------- */
  P.findMatches = function () {
    var R = this.rows, C = this.cols, g = this.grid, runs = [], r, c, e, s;
    function colorAt(r, c) { var t = g[r][c]; return t && t.color >= 0 ? t.color : -9; }
    for (r = 0; r < R; r++) {
      c = 0;
      while (c < C) {
        var col = colorAt(r, c);
        if (col < 0) { c++; continue; }
        e = c; while (e + 1 < C && colorAt(r, e + 1) === col) e++;
        if (e - c + 1 >= 3) { var cells = []; for (s = c; s <= e; s++) cells.push([r, s]); runs.push({ dir: 'h', color: col, cells: cells }); }
        c = e + 1;
      }
    }
    for (c = 0; c < C; c++) {
      r = 0;
      while (r < R) {
        var col2 = colorAt(r, c);
        if (col2 < 0) { r++; continue; }
        e = r; while (e + 1 < R && colorAt(e + 1, c) === col2) e++;
        if (e - r + 1 >= 3) { var cells2 = []; for (s = r; s <= e; s++) cells2.push([s, c]); runs.push({ dir: 'v', color: col2, cells: cells2 }); }
        r = e + 1;
      }
    }
    // merge runs that share a cell (same colour) into groups
    var parent = runs.map(function (_, i) { return i; });
    function find(i) { while (parent[i] !== i) { parent[i] = parent[parent[i]]; i = parent[i]; } return i; }
    var owner = {};
    runs.forEach(function (run, i) {
      run.cells.forEach(function (p) {
        var k = p[0] * C + p[1];
        if (owner[k] !== undefined) parent[find(i)] = find(owner[k]); else owner[k] = i;
      });
    });
    // same-colour matches that touch side by side are one group too (this is how a 2x2 square is found)
    runs.forEach(function (run, i) {
      run.cells.forEach(function (p) {
        [[p[0], p[1] + 1], [p[0] + 1, p[1]]].forEach(function (q) {
          var o = owner[q[0] * C + q[1]];
          if (o !== undefined && runs[o].color === run.color) parent[find(i)] = find(o);
        });
      });
    });
    var groups = {};
    runs.forEach(function (run, i) {
      var root = find(i), gr = groups[root] || (groups[root] = { color: run.color, cells: {}, runs: [] });
      gr.runs.push(run);
      run.cells.forEach(function (p) { gr.cells[p[0] * C + p[1]] = p; });
    });
    return Object.keys(groups).map(function (k) {
      var gr = groups[k]; gr.list = Object.keys(gr.cells).map(function (x) { return gr.cells[x]; }); return gr;
    });
  };

  /* Which special does this match make, and where does it appear? */
  P._specialFor = function (gr, swapCells, fromSwap) {
    if (fromSwap === undefined) fromSwap = true;
    var n = gr.list.length, maxH = 0, maxV = 0, hasH = false, hasV = false, best = null;
    gr.runs.forEach(function (run) {
      if (run.dir === 'h') { hasH = true; if (run.cells.length > maxH) { maxH = run.cells.length; if (!best || best.len < maxH) best = { len: maxH, run: run }; } }
      else { hasV = true; if (run.cells.length > maxV) { maxV = run.cells.length; if (!best || best.len < maxV) best = { len: maxV, run: run }; } }
    });
    var cross = hasH && hasV, longest = Math.max(maxH, maxV), sp = null;
    var set = gr.cells, C = this.cols, square = false;
    for (var i = 0; i < gr.list.length && !square; i++) {
      var p = gr.list[i];
      if (set[p[0] * C + p[1] + 1] && set[(p[0] + 1) * C + p[1]] && set[(p[0] + 1) * C + p[1] + 1]) square = true;
    }
    if (n >= 10) sp = 'super';
    else if (longest >= 5) sp = 'rainbow';
    else if (cross) sp = 'nova';
    else if (n >= 8) sp = 'star';
    else if (square) sp = 'bomb';
    else if (n >= 6) sp = 'fish';
    else if (longest === 4) sp = fromSwap ? (maxH === 4 ? 'lightning' : 'thunder') : 'fish';   // a 4-line from a cascade makes a Crystal Fish
    if (!sp) return null;
    var at = null;
    (swapCells || []).forEach(function (s) { if (!at && gr.cells[s[0] * C + s[1]]) at = gr.cells[s[0] * C + s[1]]; });
    if (!at) {
      if (cross) { // intersection
        outer: for (var a = 0; a < gr.runs.length; a++) for (var b = 0; b < gr.runs.length; b++) {
          if (gr.runs[a].dir === 'h' && gr.runs[b].dir === 'v') {
            for (var x = 0; x < gr.runs[a].cells.length; x++) for (var y = 0; y < gr.runs[b].cells.length; y++) {
              var pa = gr.runs[a].cells[x], pb = gr.runs[b].cells[y];
              if (pa[0] === pb[0] && pa[1] === pb[1]) { at = pa; break outer; }
            }
          }
        }
      }
      if (!at) at = best ? best.run.cells[Math.floor(best.run.cells.length / 2)] : gr.list[0];
    }
    return { sp: sp, at: at };
  };

  /* ---------- special crystal areas ---------- */
  P._commonColor = function () {
    var count = [0, 0, 0, 0, 0, 0], r, c, t, best = 0, bi = 0, want = -1, self = this;
    (this.L.objectives || []).forEach(function (o) { if (o.type === 'collect' && self.collected[o.color] < o.n && want < 0) want = o.color; });
    for (r = 0; r < this.rows; r++) for (c = 0; c < this.cols; c++) { t = this.grid[r][c]; if (t && t.color >= 0) count[t.color]++; }
    if (want >= 0 && count[want] > 0) return want;
    for (var i = 0; i < 6; i++) if (count[i] > best) { best = count[i]; bi = i; }
    return bi;
  };
  P._rect = function (r0, c0, r1, c1, out) {
    for (var r = Math.max(0, r0); r <= Math.min(this.rows - 1, r1); r++) for (var c = Math.max(0, c0); c <= Math.min(this.cols - 1, c1); c++) if (!this.hole[r][c]) out.push([r, c]);
    return out;
  };
  P._fishTargets = function (n, avoid) {
    var r, c, blockers = [], objective = [], others = [], t, b, self = this, want = -1;
    (this.L.objectives || []).forEach(function (o) { if (o.type === 'collect' && self.collected[o.color] < o.n && want < 0) want = o.color; });
    for (r = 0; r < this.rows; r++) for (c = 0; c < this.cols; c++) {
      if (this.hole[r][c] || (avoid && avoid[r * this.cols + c])) continue;
      t = this.grid[r][c]; b = this.blk[r][c];
      if (b) blockers.push([r, c]);
      else if (t && t.color === want) objective.push([r, c]);
      else if (t && !t.item) others.push([r, c]);
    }
    var pool = blockers.concat(objective, others), out = [];
    while (out.length < n && pool.length) {
      // take from the front-most group at random so blockers go first
      var lim = blockers.length > 0 && out.length < blockers.length ? blockers.length : pool.length;
      var i = Math.floor(this.rand() * Math.min(lim, pool.length));
      out.push(pool.splice(i, 1)[0]);
      if (blockers.length) blockers.shift();
    }
    return out;
  };
  /* The cells one special hits when it goes off at (r,c). */
  P._area = function (sp, r, c, fx) {
    var out = [], i, self = this;
    switch (sp) {
      case 'bomb': this._rect(r - 1, c - 1, r + 1, c + 1, out); break;
      case 'lightning': this._rect(r, 0, r, this.cols - 1, out); break;
      case 'thunder': this._rect(0, c, this.rows - 1, c, out); break;
      case 'nova': this._rect(r - 2, c - 2, r + 2, c + 2, out); break;
      case 'star':
        this._rect(r, 0, r, this.cols - 1, out); this._rect(0, c, this.rows - 1, c, out);
        for (i = -Math.max(this.rows, this.cols); i <= Math.max(this.rows, this.cols); i++) {
          if (this.inb(r + i, c + i) && !this.hole[r + i][c + i]) out.push([r + i, c + i]);
          if (this.inb(r + i, c - i) && !this.hole[r + i][c - i]) out.push([r + i, c - i]);
        }
        break;
      case 'super': this._rect(r - 1, 0, r + 1, this.cols - 1, out); this._rect(0, c - 1, this.rows - 1, c + 1, out); break;
      case 'rainbow': {
        var col = this._commonColor();
        for (var rr = 0; rr < this.rows; rr++) for (var cc = 0; cc < this.cols; cc++) { var t = this.grid[rr][cc]; if (t && t.color === col) out.push([rr, cc]); }
        if (fx) fx.color = col; break;
      }
      case 'fish': {
        // four fish, each one clears the crystal it lands on and the four crystals around it
        var tg = this._fishTargets(4); if (fx) fx.targets = tg;
        tg.forEach(function (p) { out.push(p); [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(function (d) { var rr = p[0] + d[0], cc = p[1] + d[1]; if (self.inb(rr, cc) && !self.hole[rr][cc]) out.push([rr, cc]); }); });
        break;
      }
    }
    return out;
  };

  /* Turn a set of starting cells into every cell that ends up cleared, chaining the specials inside. */
  P._expand = function (start, keep, fxList) {
    var set = {}, C = this.cols, queue = [], self = this, fired = {};
    function add(p) { var k = p[0] * C + p[1]; if (!set[k]) { set[k] = p; queue.push(p); } }
    start.forEach(add);
    while (queue.length) {
      var p = queue.shift(), t = this.grid[p[0]][p[1]], k = p[0] * C + p[1];
      if (t && t.sp && !fired[k] && !(keep && keep[k])) {
        fired[k] = true;
        var fx = { type: t.sp, r: p[0], c: p[1] };
        this._area(t.sp, p[0], p[1], fx).forEach(add);
        fxList.push(fx);
      }
    }
    if (keep) Object.keys(keep).forEach(function (k) { delete set[k]; });
    return Object.keys(set).map(function (k) { return set[k]; });
  };

  /* Two specials swapped together. */
  P._combo = function (pa, pb, ta, tb, fxList) {
    var self = this, out = [], a = ta.sp, b = tb.sp, r = pb[0], c = pb[1];
    var has = function (x) { return a === x || b === x; };
    this.stats.combos++;
    var fx = { type: 'combo', a: a, b: b, r: r, c: c };
    fxList.push(fx);
    var other = a === 'rainbow' ? b : a;
    if (a === 'rainbow' && b === 'rainbow') { this._rect(0, 0, this.rows - 1, this.cols - 1, out); }
    else if (has('super')) { this._rect(0, 0, this.rows - 1, this.cols - 1, out); }
    else if (has('rainbow')) {
      var col = this._commonColor(); fx.color = col;
      for (var rr = 0; rr < this.rows; rr++) for (var cc = 0; cc < this.cols; cc++) {
        var t = this.grid[rr][cc];
        if (t && t.color === col) { out.push([rr, cc]); if (other !== 'fish' && other !== 'star' && other !== 'nova') { t.sp = other; } else { t.sp = other; } }
      }
      out.push(pa, pb);
      // the converted crystals are in `out`; _expand fires each one
    }
    else if (a === 'nova' && b === 'nova') { this._rect(0, 0, this.rows - 1, this.cols - 1, out); }
    else if (has('nova')) { this._rect(r - 3, c - 3, r + 3, c + 3, out); }
    else if (has('star')) {
      this._area('star', r, c).forEach(function (p) { out.push(p); });
      var o2 = a === 'star' ? b : a;
      if (o2 !== 'star') this._area(o2, r, c).forEach(function (p) { out.push(p); });
    }
    else if (a === 'bomb' && b === 'bomb') { this._rect(r - 3, c - 3, r + 3, c + 3, out); }
    else if (has('bomb') && (has('lightning') || has('thunder'))) { this._rect(r - 1, 0, r + 1, this.cols - 1, out); this._rect(0, c - 1, this.rows - 1, c + 1, out); }
    else if (has('fish')) {
      var o3 = a === 'fish' ? b : a, tg = this._fishTargets(o3 === 'fish' ? 6 : 3); fx.targets = tg;
      tg.forEach(function (p) { out.push(p); if (o3 !== 'fish') self._area(o3, p[0], p[1]).forEach(function (q) { out.push(q); }); });
    }
    else { // line + line
      this._rect(r, 0, r, this.cols - 1, out); this._rect(0, c, this.rows - 1, c, out);
    }
    out.push(pa, pb);
    // Remove the two swapped specials from the "fire" list so the combo is not fired twice: they are cleared plainly.
    ta.sp = null; tb.sp = null;
    return out;
  };

  /* ---------- clearing ---------- */
  P._clear = function (cells, makes, steps, cascade, extraFx) {
    var C = this.cols, self = this, set = {}, cleared = [], i;
    cells.forEach(function (p) { set[p[0] * C + p[1]] = p; });
    var damage = {};   // blocker cell -> hits (once per step)
    function hit(r, c) { if (self.inb(r, c) && self.blk[r][c]) damage[r * C + c] = [r, c]; }
    Object.keys(set).forEach(function (k) {
      var p = set[k], r = p[0], c = p[1], t = self.grid[r][c], b = self.blk[r][c];
      if (t && t.item) return;                // treasures are never smashed, they have to be brought down
      if (t) {
        cleared.push({ r: r, c: c, id: t.id, color: t.color, sp: t.sp });
        if (t.color >= 0) self.collected[t.color]++;
        self.grid[r][c] = null;
        if (b && BLOCKERS[b.kind].by.indexOf('tile') >= 0) hit(r, c);
      } else if (b && BLOCKERS[b.kind].mode === 'solid') { hit(r, c); }
      var nb = [[r - 1, c], [r + 1, c], [r, c - 1], [r, c + 1]];
      nb.forEach(function (q) {
        var bb = self.inb(q[0], q[1]) && self.blk[q[0]][q[1]];
        if (bb && BLOCKERS[bb.kind].by.indexOf('adj') >= 0) hit(q[0], q[1]);
      });
    });
    var blkEvents = [];
    Object.keys(damage).forEach(function (k) {
      var p = damage[k], b = self.blk[p[0]][p[1]]; if (!b) return;
      b.hp--;
      var gone = b.hp <= 0;
      if (gone) {
        self.blk[p[0]][p[1]] = null;
        self.broken[b.kind] = (self.broken[b.kind] || 0) + 1;
        if (self.bossHp > 0 && b.kind === 'frost') self.bossHp = Math.max(0, self.bossHp - 3);
      }
      blkEvents.push({ r: p[0], c: p[1], kind: b.kind, hp: Math.max(0, b.hp), gone: gone });
    });
    var madeEvents = [];
    (makes || []).forEach(function (m) {
      var t = self.grid[m.r][m.c];
      if (t) { t.sp = m.sp; if (m.sp === 'rainbow') t.color = -2; madeEvents.push({ r: m.r, c: m.c, id: t.id, sp: m.sp, color: t.color }); self.stats.specials++; }
    });
    var n = cleared.length, pts = n * 10 * Math.min(cascade, 5) + (extraFx ? extraFx.length * 40 : 0);
    this.score += pts;
    this.energy += (extraFx ? extraFx.length * 5 : 0) + (cascade >= 2 ? 3 * (cascade - 1) : 0) + (n >= 4 ? n - 3 : 0);
    if (this.bossHp > 0) this.bossHp = Math.max(0, this.bossHp - n);
    this.stats.bestCascade = Math.max(this.stats.bestCascade, cascade);
    steps.push({ k: 'clear', cells: cleared, fx: extraFx || [], makes: madeEvents, blk: blkEvents, pts: pts, cascade: cascade, hud: this.hud() });
  };

  /* ---------- gravity and refill ---------- */
  P._gravity = function (steps) {
    var R = this.rows, C = this.cols, moves = [], spawns = [], c, r, self = this;
    for (c = 0; c < C; c++) {
      var bottom = R - 1;
      while (bottom >= 0) {
        // find the segment that ends at `bottom`
        while (bottom >= 0 && !this._free(bottom, c)) bottom--;
        if (bottom < 0) break;
        var top = bottom; while (top - 1 >= 0 && this._free(top - 1, c)) top--;
        var tiles = [];
        for (r = bottom; r >= top; r--) if (this.grid[r][c]) tiles.push(this.grid[r][c]);
        var write = bottom;
        tiles.forEach(function (t) {
          if (self.grid[write][c] !== t) { moves.push({ id: t.id, r: write, c: c }); }
          self.grid[write][c] = t; write--;
        });
        var k = 0;
        for (r = write; r >= top; r--) {
          this.grid[r][c] = null;
          var nt = this._mk(this._pickColor());
          this.grid[r][c] = nt; k++;
          spawns.push({ id: nt.id, color: nt.color, sp: null, r: r, c: c, fromR: top - k });
        }
        bottom = top - 1;
      }
    }
    // tiles that did not really move because the tile at that spot is the same: filtered above
    steps.push({ k: 'fall', moves: moves, spawn: spawns });
  };
  P._fall = function (steps) { var g = 0; do { this._gravity(steps); } while (this._collect(steps) && g++ < 12); };
  /* a treasure that reaches the bottom is collected */
  P._collect = function (steps) {
    var any = false, r, c;
    for (r = 0; r < this.rows; r++) for (c = 0; c < this.cols; c++) {
      var t = this.grid[r][c];
      if (t && t.item && (r === this.rows - 1 || (this.inb(r + 1, c) && this.hole[r + 1][c]))) {
        this.grid[r][c] = null; this.itemsOut++; any = true;
        steps.push({ k: 'item', id: t.id, r: r, c: c, hud: this.hud() });
      }
    }
    return any;
  };
  P._free = function (r, c) {   // a cell where crystals may fall through
    if (this.hole[r][c] || this.solidAt(r, c)) return false;
    if (this.lockedAt(r, c) && this.grid[r][c]) return false;
    return true;
  };

  /* ---------- a whole move ---------- */
  P._settle = function (steps, swapCells) {
    var cascade = 0;
    for (var guard = 0; guard < 40; guard++) {
      var groups = this.findMatches();
      if (!groups.length) break;
      cascade++;
      var cells = [], makes = [], keep = {}, C = this.cols, self = this;
      groups.forEach(function (gr) {
        var sp = self._specialFor(gr, cascade === 1 ? swapCells : null, cascade === 1);
        gr.list.forEach(function (p) { cells.push(p); });
        if (sp) { makes.push({ r: sp.at[0], c: sp.at[1], sp: sp.sp }); keep[sp.at[0] * C + sp.at[1]] = true; }
      });
      var fxList = [];
      var all = this._expand(cells, keep, fxList);
      // a special crystal that is being created must stay; everything else matched is cleared
      this._clear(all, makes, steps, cascade, fxList);
      this._fall(steps);
    }
  };

  P.trySwap = function (a, b) {
    var steps = [];
    if (this.state !== 'ready') return { ok: false, steps: steps };
    if (Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1]) !== 1) return { ok: false, steps: steps };
    if (!this.playable(a[0], a[1]) || !this.playable(b[0], b[1])) return { ok: false, steps: steps };
    var ta = this.grid[a[0]][a[1]], tb = this.grid[b[0]][b[1]];
    if (!ta || !tb || this.lockedAt(a[0], a[1]) || this.lockedAt(b[0], b[1])) { return { ok: false, steps: [{ k: 'bad', a: a, b: b }] }; }
    this.grid[a[0]][a[1]] = tb; this.grid[b[0]][b[1]] = ta;      // ta now at b, tb now at a
    var special = ta.sp || tb.sp;
    if (!special && !this.findMatches().length) {
      this.grid[a[0]][a[1]] = ta; this.grid[b[0]][b[1]] = tb;
      return { ok: false, steps: [{ k: 'bad', a: a, b: b }] };
    }
    this.moves--; this.moveCount++;
    steps.push({ k: 'swap', a: a, b: b, ta: ta.id, tb: tb.id });
    this.state = 'busy';
    if (special) {
      var fxList = [], cells;
      if (ta.sp && tb.sp) {
        cells = this._combo(b, a, ta, tb, fxList);       // ta sits at b, tb at a
        cells = this._expand(cells, null, fxList);
      } else {
        var sp = ta.sp ? ta : tb, pos = ta.sp ? b : a, other = ta.sp ? tb : ta;
        if (sp.sp === 'rainbow') {
          var fx = { type: 'rainbow', r: pos[0], c: pos[1], color: other.color };
          cells = [pos];
          for (var r = 0; r < this.rows; r++) for (var c = 0; c < this.cols; c++) { var t = this.grid[r][c]; if (t && t.color === other.color) cells.push([r, c]); }
          fxList.push(fx);
          sp.sp = null;
          cells = this._expand(cells, null, fxList);
        } else {
          cells = this._expand([pos], null, fxList);
        }
      }
      this._clear(cells, null, steps, 1, fxList);
      this._fall(steps);
    }
    this._settle(steps, [a, b]);
    this._afterMove(steps, true);
    return { ok: true, steps: steps };
  };

  P._bossAttack = function (steps) {
    var B = this.L.boss; if (!B || this.bossHp <= 0) return;
    if (this.moveCount % B.every !== 0) return;
    if (this.shield) { this.shield = false; steps.push({ k: 'shield' }); return; }
    var cand = [], r, c;
    for (r = 0; r < this.rows; r++) for (c = 0; c < this.cols; c++) if (this.playable(r, c) && this.grid[r][c] && !this.blk[r][c] && !this.grid[r][c].sp && !this.grid[r][c].item) cand.push([r, c]);
    var hits = [];
    for (var i = 0; i < B.count && cand.length; i++) { var p = cand.splice(Math.floor(this.rand() * cand.length), 1)[0]; this.blk[p[0]][p[1]] = { kind: 'frost', hp: 1, max: 1 }; hits.push(p); }
    if (hits.length) steps.push({ k: 'boss', cells: hits });
  };

  P._afterMove = function (steps, countMove) {
    if (countMove && this.state !== 'win') this._bossAttack(steps);
    if (this._done()) {
      var bonus = this.timed ? Math.floor(this.timeLeft) * 20 : (this.moves > 0 ? this.moves * 50 : 0);
      this.score += bonus; this.state = 'win';
      steps.push({ k: 'end', result: 'win', bonus: bonus, hud: this.hud(), stars: this.stars() });
      return;
    }
    if (this.moves <= 0 && !this.timed) { this.state = 'lose'; steps.push({ k: 'end', result: 'lose', hud: this.hud() }); return; }
    if (!this.findHint()) this._shuffle(steps);
    this.state = 'ready';
    steps.push({ k: 'ready', hud: this.hud() });
  };

  P._shuffle = function (steps) {
    var cells = [], tiles = [], r, c, tries = 0, moves = [];
    for (r = 0; r < this.rows; r++) for (c = 0; c < this.cols; c++) if (this.grid[r][c] && !this.lockedAt(r, c) && this.playable(r, c)) { cells.push([r, c]); tiles.push(this.grid[r][c]); }
    do {
      for (var i = tiles.length - 1; i > 0; i--) { var j = Math.floor(this.rand() * (i + 1)); var x = tiles[i]; tiles[i] = tiles[j]; tiles[j] = x; }
      cells.forEach(function (p, idx) { this.grid[p[0]][p[1]] = tiles[idx]; }, this);
      tries++;
    } while (tries < 80 && (this.findMatches().length || !this.findHint()));
    cells.forEach(function (p, idx) { moves.push({ id: tiles[idx].id, r: p[0], c: p[1] }); });
    this.stats.shuffles++;
    steps.push({ k: 'shuffle', moves: moves });
    if (this._collect(steps)) this._fall(steps);
  };

  /* A move that would work, or null. */
  P.findHint = function () {
    var dirs = [[0, 1], [1, 0]], r, c;
    for (r = 0; r < this.rows; r++) for (c = 0; c < this.cols; c++) {
      for (var d = 0; d < 2; d++) {
        var r2 = r + dirs[d][0], c2 = c + dirs[d][1];
        if (!this.playable(r, c) || !this.playable(r2, c2)) continue;
        var ta = this.grid[r][c], tb = this.grid[r2] && this.grid[r2][c2];
        if (!ta || !tb || this.lockedAt(r, c) || this.lockedAt(r2, c2)) continue;
        if (ta.sp || tb.sp) return [[r, c], [r2, c2]];
        this.grid[r][c] = tb; this.grid[r2][c2] = ta;
        var ok = this.findMatches().length > 0;
        this.grid[r][c] = ta; this.grid[r2][c2] = tb;
        if (ok) return [[r, c], [r2, c2]];
      }
    }
    return null;
  };

  /* ---------- objectives ---------- */
  P.objectiveProgress = function () {
    var self = this;
    return (this.L.objectives || []).map(function (o) {
      var cur = 0;
      if (o.type === 'collect') cur = self.collected[o.color];
      else if (o.type === 'blockers') { if (o.kind) cur = self.broken[o.kind] || 0; else Object.keys(self.broken).forEach(function (k) { if (k !== 'frost') cur += self.broken[k]; }); }
      else if (o.type === 'score') cur = self.score;
      else if (o.type === 'boss') cur = (self.L.boss.hp - self.bossHp);
      else if (o.type === 'treasure') cur = self.itemsOut;
      else if (o.type === 'energy') cur = self.energy;
      else if (BROKEN_BY[o.type]) cur = self.broken[BROKEN_BY[o.type]] || 0;
      var need = o.type === 'boss' ? self.L.boss.hp : o.n;
      return { type: o.type, color: o.color, kind: o.kind, cur: Math.min(cur, need), need: need, done: cur >= need };
    });
  };
  P._done = function () { return this.objectiveProgress().every(function (o) { return o.done; }); };
  P.stars = function () {
    var s = this.L.stars || [0, 0, 0];
    return this.score >= s[2] ? 3 : this.score >= s[1] ? 2 : 1;
  };
  P.hud = function () {
    return { moves: this.moves, score: this.score, obj: this.objectiveProgress(), bossHp: this.bossHp, time: Math.ceil(this.timeLeft), timed: this.timed, energy: this.energy };
  };

  /* ---------- boosters ---------- */
  P.useBooster = function (kind, pos) {
    var steps = [];
    if (this.state !== 'ready') return { ok: false, steps: steps };
    var self = this;
    if (kind === 'moves') { if (this.timed) this.timeLeft += 15; else this.moves += 5; steps.push({ k: 'hud', hud: this.hud() }); return { ok: true, steps: steps }; }
    if (kind === 'shuffle') { this.state = 'busy'; this._shuffle(steps); this._settleAfterBooster(steps); return { ok: true, steps: steps }; }
    if (!pos || !this.playable(pos[0], pos[1]) && !this.solidAt(pos[0], pos[1])) return { ok: false, steps: steps };
    var t = this.grid[pos[0]][pos[1]], cells = [];
    if (kind === 'hammer') { if ((!t && !this.solidAt(pos[0], pos[1])) || (t && t.item)) return { ok: false, steps: steps }; cells = [pos]; }
    else if (kind === 'strike') { cells = this._area('lightning', pos[0], pos[1]); }
    else if (kind === 'wand') {
      if (!t || t.sp || t.item || t.color < 0) return { ok: false, steps: steps };
      var opts = ['bomb', 'lightning', 'thunder']; t.sp = opts[Math.floor(this.rand() * opts.length)]; this.stats.specials++;
      this.state = 'busy'; steps.push({ k: 'wand', id: t.id, sp: t.sp, color: t.color, r: pos[0], c: pos[1] });
      this._settle(steps, null); this._settleAfterBooster(steps); return { ok: true, steps: steps };
    }
    else if (kind === 'rainbow') {
      if (!t || t.color < 0) return { ok: false, steps: steps };
      for (var r = 0; r < this.rows; r++) for (var c = 0; c < this.cols; c++) { var q = this.grid[r][c]; if (q && q.color === t.color) cells.push([r, c]); }
    } else return { ok: false, steps: steps };
    this.state = 'busy';
    var fxList = [{ type: kind === 'rainbow' ? 'rainbow' : kind === 'strike' ? 'lightning' : 'hammer', r: pos[0], c: pos[1], color: t ? t.color : 0 }];
    var all = this._expand(cells, null, fxList);
    this._clear(all, null, steps, 1, fxList);
    this._fall(steps);
    this._settle(steps, null);
    this._settleAfterBooster(steps);
    return { ok: true, steps: steps };
  };
  P._settleAfterBooster = function (steps) { this._afterMove(steps, false); };

  /* Pre-game boosters picked in the level intro: 'bomb' | 'lightning' | 'rainbow' start on the board, 'shield' guards the level. */
  P.applyStarters = function (list) {
    var self = this, cand = [], r, c;
    for (r = 0; r < this.rows; r++) for (c = 0; c < this.cols; c++) { var t = this.grid[r][c]; if (t && !t.item && !t.sp && this.playable(r, c) && !this.lockedAt(r, c)) cand.push([r, c]); }
    (list || []).forEach(function (k) {
      if (k === 'shield') { if (self.L.boss) self.shield = true; else if (self.timed) self.timeLeft += 10; else self.moves += 3; return; }
      if (!cand.length) return;
      var p = cand.splice(Math.floor(self.rand() * cand.length), 1)[0], tt = self.grid[p[0]][p[1]];
      tt.sp = k === 'bomb' ? 'bomb' : k === 'lightning' ? 'lightning' : 'rainbow'; if (tt.sp === 'rainbow') tt.color = -2;
    });
  };

  /* A copy of the whole game, used by test bots that look one move ahead. */
  P.clone = function () {
    var c = Object.create(Engine.prototype), k;
    for (k in this) if (Object.prototype.hasOwnProperty.call(this, k)) c[k] = this[k];
    c.grid = this.grid.map(function (row) { return row.map(function (t) { return t ? { id: t.id, color: t.color, sp: t.sp, item: t.item } : null; }); });
    c.blk = this.blk.map(function (row) { return row.map(function (b) { return b ? { kind: b.kind, hp: b.hp, max: b.max } : null; }); });
    c.collected = this.collected.slice(); c.broken = Object.assign({}, this.broken); c.stats = Object.assign({}, this.stats);
    c.rand = rng(Math.floor(this.rand() * 4294967295) + 1);
    return c;
  };

  /* Extra moves after a loss ("second chance"). */
  /* the clock of a Time Challenge: the screen calls this once a second while the player can move */
  P.tick = function (dt) {
    if (!this.timed || this.state !== 'ready') return null;
    this.timeLeft = Math.max(0, this.timeLeft - dt);
    if (this.timeLeft <= 0) { this.state = 'lose'; return [{ k: 'end', result: 'lose', hud: this.hud() }]; }
    return [];
  };
  P.reviveWithMoves = function (n) {
    if (this.state !== 'lose') return false;
    if (this.timed) this.timeLeft += 20; else this.moves += n;
    this.state = 'ready';
    var steps = []; if (!this.findHint()) this._shuffle(steps);
    return steps;
  };

  Engine.BROKEN_BY = BROKEN_BY; Engine.BLOCKERS = BLOCKERS; Engine.SPECIALS = SPECIALS; Engine.rng = rng;
  root.CQEngine = Engine;
  if (typeof module !== 'undefined' && module.exports) module.exports = Engine;
})(typeof window !== 'undefined' ? window : globalThis);
