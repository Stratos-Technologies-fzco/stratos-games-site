// Maze / Path: guide the explorer to the key, follow compass directions,
// and read a simple map (geography for the Treasure Island world).
// Modes: "maze", "compass", "mapread".

import { pulse, shake } from './common.js';

const DIRS = {
  N: { dr: -1, dc: 0 },
  E: { dr: 0, dc: 1 },
  S: { dr: 1, dc: 0 },
  W: { dr: 0, dc: -1 }
};
const DIAG = {
  NE: { dr: -1, dc: 1 },
  SE: { dr: 1, dc: 1 },
  SW: { dr: 1, dc: -1 },
  NW: { dr: -1, dc: -1 }
};
const OPP = { N: 'S', S: 'N', E: 'W', W: 'E' };

// ---------- generation ----------
function buildMaze(size, rng) {
  // walls[r][c] = {N,E,S,W} true when blocked
  const walls = Array.from({ length: size }, () => Array.from({ length: size }, () => ({ N: true, E: true, S: true, W: true })));
  const seen = Array.from({ length: size }, () => Array(size).fill(false));
  const stack = [[0, 0]];
  seen[0][0] = true;
  while (stack.length) {
    const [r, c] = stack[stack.length - 1];
    const options = Object.entries(DIRS).filter(([, d]) => {
      const nr = r + d.dr;
      const nc = c + d.dc;
      return nr >= 0 && nc >= 0 && nr < size && nc < size && !seen[nr][nc];
    });
    if (!options.length) {
      stack.pop();
      continue;
    }
    const [dir, d] = rng.pick(options);
    walls[r][c][dir] = false;
    walls[r + d.dr][c + d.dc][OPP[dir]] = false;
    seen[r + d.dr][c + d.dc] = true;
    stack.push([r + d.dr, c + d.dc]);
  }
  return walls;
}

export function shortestPath(walls, from, to) {
  const size = walls.length;
  const key = (r, c) => r * size + c;
  const prev = new Map([[key(...from), null]]);
  const queue = [from];
  while (queue.length) {
    const [r, c] = queue.shift();
    if (r === to[0] && c === to[1]) break;
    for (const [dir, d] of Object.entries(DIRS)) {
      if (walls[r][c][dir]) continue;
      const n = [r + d.dr, c + d.dc];
      if (!prev.has(key(...n))) {
        prev.set(key(...n), [r, c]);
        queue.push(n);
      }
    }
  }
  const path = [];
  let cur = to;
  while (cur) {
    path.unshift(cur);
    cur = prev.get(key(...cur));
  }
  return path;
}

function mazeRound(p, rng) {
  const size = p.size || 5;
  const walls = buildMaze(size, rng);
  // key goes to the far end: the cell with the longest shortest-path from start
  let best = [size - 1, size - 1];
  let bestLen = 0;
  for (let r = 0; r < size; r++)
    for (let c = 0; c < size; c++) {
      if (r + c < size) continue;
      const len = shortestPath(walls, [0, 0], [r, c]).length;
      if (len > bestLen) {
        bestLen = len;
        best = [r, c];
      }
    }
  return { mode: 'maze', size, walls, start: [0, 0], goal: best, prompt: { key: 'engines.maze.prompt' } };
}

function compassRound(p, rng, ctx) {
  const size = p.size || 5;
  const allowed = p.diagonal ? { ...DIRS, ...DIAG } : DIRS;
  for (let tries = 0; tries < 200; tries++) {
    const start = [rng.int(0, size - 1), rng.int(0, size - 1)];
    let pos = start.slice();
    const moves = [];
    let lastDir = null;
    for (let i = 0; i < (p.steps || 2); i++) {
      const options = Object.keys(allowed).filter((d) => d !== lastDir);
      const dir = rng.pick(options);
      const n = rng.int(1, p.maxDistance || 3);
      const nr = pos[0] + allowed[dir].dr * n;
      const nc = pos[1] + allowed[dir].dc * n;
      if (nr < 0 || nc < 0 || nr >= size || nc >= size) break;
      moves.push({ dir, n });
      pos = [nr, nc];
      lastDir = dir;
    }
    if (moves.length !== (p.steps || 2)) continue;
    if (pos[0] === start[0] && pos[1] === start[1]) continue;
    const landmark = rng.pick(ctx.questions.themes.island.landmarks);
    return { mode: 'compass', size, start, goal: pos, moves, landmark, prompt: { key: 'engines.compass.prompt', vars: { landmark } } };
  }
  throw new Error('Could not build compass round');
}

function mapreadRound(p, rng, ctx) {
  const size = p.size || 5;
  const landmarks = ctx.questions.themes.island.mapLandmarks;
  for (let tries = 0; tries < 300; tries++) {
    const picks = rng.sample(landmarks, p.landmarks || 5);
    const cells = rng.sample(Array.from({ length: size * size }, (_, i) => i), picks.length);
    const placed = picks.map((lm, i) => ({ ...lm, r: Math.floor(cells[i] / size), c: cells[i] % size }));
    const from = rng.pick(placed);
    const dirs = rng.shuffle(Object.keys(DIRS));
    for (const dir of dirs) {
      // landmarks strictly in that direction on the same row/column
      const d = DIRS[dir];
      const inLine = placed.filter((lm) => {
        if (lm === from) return false;
        if (d.dr === 0) return lm.r === from.r && Math.sign(lm.c - from.c) === d.dc;
        return lm.c === from.c && Math.sign(lm.r - from.r) === d.dr;
      });
      if (inLine.length !== 1) continue;
      const answer = inLine[0];
      return {
        mode: 'mapread',
        size,
        placed,
        from: from.name,
        dir,
        answer: answer.name,
        prompt: { key: 'engines.mapread.prompt', vars: { dir: '@engines.dirLower.' + dir, from: from.label } }
      };
    }
  }
  throw new Error('Could not build map-reading round');
}

export function generate(p, rng, ctx) {
  const rounds = [];
  for (let i = 0; i < (p.rounds || 2); i++) {
    const mode = p.mode === 'mixed' ? ['maze', 'compass', 'mapread'][i % 3] : p.mode || 'maze';
    if (mode === 'compass') rounds.push(compassRound({ ...p, size: p.compassSize || p.size }, rng, ctx));
    else if (mode === 'mapread') rounds.push(mapreadRound({ ...p, size: p.mapSize || p.size }, rng, ctx));
    else rounds.push(mazeRound(p, rng));
  }
  return rounds;
}

// ---------- rendering ----------
function compassRose(h, t) {
  return h(
    'div.compass-rose',
    { 'aria-label': t('engines.maze.compassLabel') },
    h('span.cr-n', 'N'),
    h('span.cr-e', 'E'),
    h('span.cr-s', 'S'),
    h('span.cr-w', 'W'),
    h('span.cr-c', '🧭')
  );
}

function renderMaze(round, api) {
  const { h } = api;
  const { size, walls } = round;
  let pos = round.start.slice();
  const cells = [];
  const grid = h('div.maze', { style: { '--n': size } });
  for (let r = 0; r < size; r++)
    for (let c = 0; c < size; c++) {
      const w = walls[r][c];
      const cell = h(
        'div.maze-cell' + (w.N ? '.wn' : '') + (w.E ? '.we' : '') + (w.S ? '.ws' : '') + (w.W ? '.ww' : ''),
        { onclick: () => tapCell(r, c) }
      );
      cells.push(cell);
      grid.appendChild(cell);
    }
  const cellAt = (r, c) => cells[r * size + c];
  cellAt(...round.goal).classList.add('goal');
  cellAt(...round.goal).textContent = '🗝️';

  const explorer = h('span.maze-explorer', api.avatar || '🧒');
  function draw() {
    cellAt(...pos).appendChild(explorer);
  }
  function move(dir) {
    if (api.locked()) return;
    const [r, c] = pos;
    if (walls[r][c][dir]) {
      shake(explorer);
      return;
    }
    api.sfx('tap');
    pos = [r + DIRS[dir].dr, c + DIRS[dir].dc];
    cellAt(r, c).classList.add('trail');
    draw();
    if (pos[0] === round.goal[0] && pos[1] === round.goal[1]) api.correct();
  }
  function tapCell(r, c) {
    const dr = r - pos[0];
    const dc = c - pos[1];
    const dir = Object.keys(DIRS).find((k) => DIRS[k].dr === dr && DIRS[k].dc === dc);
    if (dir) move(dir);
  }
  const onKey = (e) => {
    const map = { ArrowUp: 'N', ArrowRight: 'E', ArrowDown: 'S', ArrowLeft: 'W' };
    if (map[e.key]) {
      e.preventDefault();
      move(map[e.key]);
    }
  };
  document.addEventListener('keydown', onKey);
  api.onCleanup(() => document.removeEventListener('keydown', onKey));

  const pad = h(
    'div.dpad',
    ['N', 'W', 'E', 'S'].map((d) =>
      h(
        'button.dpad-btn.dpad-' + d,
        { type: 'button', onclick: () => move(d), 'aria-label': api.t('engines.dir.' + d) },
        h('span.dpad-arrow', { 'aria-hidden': 'true' }, { N: '▲', E: '▶', S: '▼', W: '◀' }[d]),
        h('span.dpad-letter', d)
      )
    )
  );
  api.setHint(() => {
    const path = shortestPath(walls, pos, round.goal).slice(1, 4);
    path.forEach(([r, c]) => pulse(cellAt(r, c), 'hint-path', 2500));
    return path.length > 0;
  });
  draw();
  api.el.append(h('div.maze-wrap', grid, compassRose(h, api.t)), pad);
}

function gridMap(h, size, onTap) {
  const cells = [];
  const grid = h('div.mapgrid', { style: { '--n': size } });
  for (let r = 0; r < size; r++)
    for (let c = 0; c < size; c++) {
      const cell = h('button.map-cell', { type: 'button', onclick: () => onTap(r, c, cell) });
      cells.push(cell);
      grid.appendChild(cell);
    }
  return { grid, at: (r, c) => cells[r * size + c], cells };
}

function renderCompass(round, api) {
  const { h } = api;
  const map = gridMap(h, round.size, (r, c, cell) => {
    if (api.locked()) return;
    if (r === round.goal[0] && c === round.goal[1]) {
      cell.textContent = round.landmark;
      cell.classList.add('is-correct');
      api.correct();
    } else {
      shake(cell);
      api.wrong();
    }
  });
  const start = map.at(...round.start);
  start.textContent = api.avatar || '🧒';
  start.classList.add('start');
  const list = h(
    'ol.moves',
    round.moves.map((m) => h('li', api.t('engines.compass.move', { n: m.n, dir: api.t('engines.dir.' + m.dir), steps: api.t(m.n === 1 ? 'engines.compass.step' : 'engines.compass.steps') })))
  );
  let hintStep = 0;
  api.setHint(() => {
    let [r, c] = round.start;
    const upto = Math.min(round.moves.length, ++hintStep);
    for (let i = 0; i < upto; i++) {
      const m = round.moves[i];
      const d = DIRS[m.dir] || DIAG[m.dir];
      for (let k = 0; k < m.n; k++) {
        r += d.dr;
        c += d.dc;
        map.at(r, c).classList.add('trail');
      }
    }
    return true;
  });
  api.el.append(h('div.compass-layout', list, h('div.maze-wrap', map.grid, compassRose(h, api.t))));
}

function renderMapread(round, api) {
  const { h } = api;
  const byCell = new Map(round.placed.map((lm) => [lm.r * round.size + lm.c, lm]));
  const map = gridMap(h, round.size, (r, c, cell) => {
    if (api.locked()) return;
    const lm = byCell.get(r * round.size + c);
    if (!lm) return;
    if (lm.name === round.answer) {
      cell.classList.add('is-correct');
      api.correct();
    } else {
      shake(cell);
      api.wrong();
    }
  });
  for (const lm of round.placed) {
    const cell = map.at(lm.r, lm.c);
    cell.textContent = lm.emoji;
    cell.classList.add('landmark');
    cell.setAttribute('aria-label', lm.label);
    cell.title = lm.label;
    if (lm.name === round.from) cell.classList.add('from');
  }
  api.setHint(() => {
    const from = round.placed.find((lm) => lm.name === round.from);
    const d = DIRS[round.dir];
    let r = from.r + d.dr;
    let c = from.c + d.dc;
    while (r >= 0 && c >= 0 && r < round.size && c < round.size) {
      pulse(map.at(r, c), 'hint-path', 2500);
      r += d.dr;
      c += d.dc;
    }
    return true;
  });
  const legend = h(
    'ul.legend',
    round.placed.map((lm) => h('li', h('span', lm.emoji), ' ', lm.label))
  );
  api.el.append(h('div.compass-layout', legend, h('div.maze-wrap', map.grid, compassRose(h, api.t))));
}

export function render(round, api) {
  if (round.mode === 'compass') return renderCompass(round, api);
  if (round.mode === 'mapread') return renderMapread(round, api);
  return renderMaze(round, api);
}
