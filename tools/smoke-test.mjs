// End-to-end browser test: a robot explorer creates a profile and plays
// through ALL 50 levels in one age band, checking world unlocks, map pieces,
// checkpoint restore after refresh, Camp, Awards and the Parent Area.
//
//   npm run smoke                 (band 0)
//   BAND=2 npm run smoke          (another band)
//   LEVELS=12 npm run smoke       (stop after 12 levels)
//   SHOTS=dir npm run smoke       (save screenshots into dir)
//
// Needs Playwright + Chromium (npx playwright install chromium).

import http from 'node:http';
import { readFile, mkdir } from 'node:fs/promises';
import { execSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { dirname, join, extname, normalize } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..', 'game');
const BAND = Number(process.env.BAND || 0);
const MAX_LEVELS = Number(process.env.LEVELS || 50);
const SHOTS = process.env.SHOTS || '';

async function loadPlaywright() {
  try {
    return await import('playwright');
  } catch {
    const globalRoot = execSync('npm root -g').toString().trim();
    return await import(pathToFileURL(join(globalRoot, 'playwright', 'index.mjs')).href);
  }
}

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.webmanifest': 'application/manifest+json'
};

function startServer() {
  const server = http.createServer(async (req, res) => {
    let path = decodeURIComponent(new URL(req.url, 'http://x').pathname);
    if (path.endsWith('/')) path += 'index.html';
    const file = normalize(join(root, path));
    if (!file.startsWith(root)) {
      res.writeHead(403).end();
      return;
    }
    try {
      const body = await readFile(file);
      res.writeHead(200, { 'Content-Type': TYPES[extname(file)] || 'application/octet-stream' }).end(body);
    } catch {
      res.writeHead(404).end('not found');
    }
  });
  return new Promise((resolve) => server.listen(0, '127.0.0.1', () => resolve(server)));
}

function assert(cond, msg) {
  if (!cond) throw new Error('Assertion failed: ' + msg);
}

const { chromium } = await loadPlaywright();
const server = await startServer();
const base = `http://127.0.0.1:${server.address().port}/`;
const browser = await chromium.launch(
  process.env.PLAYWRIGHT_BROWSERS_PATH ? {} : { executablePath: '/opt/pw-browsers/chromium' }
);
const context = await browser.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, serviceWorkers: 'block' });
const page = await context.newPage();
const errors = [];
page.on('pageerror', (e) => errors.push('pageerror: ' + e.message));
page.on('console', (m) => {
  if (m.type() === 'error') errors.push('console: ' + m.text());
});
await page.addInitScript(() => {
  window.__MI_DEBUG__ = { fast: true };
  // keep speech quiet in CI
  if (window.speechSynthesis) window.speechSynthesis.speak = () => {};
});

let shotN = 0;
async function shot(name) {
  if (!SHOTS) return;
  await mkdir(SHOTS, { recursive: true });
  await page.waitForTimeout(700);
  await page.screenshot({ path: join(SHOTS, `${String(++shotN).padStart(2, '0')}-${name}.png`), fullPage: false });
}

process.on('uncaughtException', async (err) => {
  console.error(err);
  try {
    if (SHOTS) await page.screenshot({ path: join(SHOTS, 'failure.png') });
    console.error('Page text at failure:\n' + (await page.locator('body').innerText()).slice(0, 800));
  } catch {
    /* ignore */
  }
  process.exit(1);
});

const clickText = (text) => page.getByRole('button', { name: text, exact: false }).first().click();

// ---------- first-time journey ----------
await page.goto(base);
await page.waitForSelector('.splash-title');
await shot('splash');
await clickText('Play');
await page.waitForSelector('#nick');
await page.fill('#nick', 'Robo Tester');
await clickText('Next');
await page.waitForSelector('.band-card');
await shot('setup-band');
await page.locator('.band-card').nth(BAND).click();
await page.waitForSelector('.avatar-choice');
await page.locator('.avatar-choice').first().click();
await clickText('Start Adventure');
await page.waitForSelector('.tutorial');
await shot('tutorial');
await clickText('Skip');
await page.waitForSelector('.level-intro');
await shot('level-intro');

// ---------- solver ----------
async function currentRound() {
  return page.evaluate(() => ({ count: window.__MI_DEBUG__.count || 0, round: window.__MI_DEBUG__.round }));
}

async function solve(round, { makeMistake = false, useHint = false } = {}) {
  if (useHint) await page.locator('.btn-hint').click();
  if ('options' in round && 'answer' in round) {
    if (makeMistake) {
      const wrong = round.options.find((o) => o !== round.answer);
      const btn = page.locator(`.choice[data-value="${String(wrong).replace(/"/g, '\\"')}"]`);
      if (await btn.isEnabled()) await btn.click();
    }
    await page.locator(`.choice[data-value="${String(round.answer).replace(/"/g, '\\"')}"]`).click();
  } else if (round.type === 'order') {
    const chosen = await page.locator('.order-chosen').count();
    await page.evaluate((items) => {
      const pool = [...document.querySelectorAll('.order-item')];
      for (const item of items) pool.find((b) => !b.disabled && b.textContent === item).click();
    }, round.items.slice(chosen));
  } else if (round.word) {
    await page.evaluate((word) => {
      const slots = [...document.querySelectorAll('.slot')];
      const filled = slots.filter((s) => s.classList.contains('filled')).length;
      const tiles = [...document.querySelectorAll('.tile')];
      for (const ch of word.slice(filled)) {
        const t = tiles.find((x) => !x.disabled && x.textContent === ch);
        t.click();
      }
    }, round.word);
  } else if (round.seq) {
    await page.waitForSelector('.crystal-grid:not(.disabled)');
    await page.evaluate((seq) => {
      const b = document.querySelectorAll('.crystal');
      seq.forEach((i) => b[i].click());
    }, round.seq);
  } else if (round.items) {
    await page.evaluate((items) => {
      const els = document.querySelectorAll('.hunt-item');
      items.forEach((it, i) => it.target && !els[i].classList.contains('found') && els[i].click());
    }, round.items);
  } else if (round.diffs) {
    await page.evaluate((diffs) => {
      const left = document.querySelector('.spot-panel[data-side="left"]').children;
      diffs.forEach((i) => !left[i].classList.contains('found') && left[i].click());
    }, round.diffs);
  } else if (round.mode === 'maze') {
    await page.evaluate(async (r) => {
      const { shortestPath } = await import('./js/minigames/maze-path.js');
      const cells = document.querySelectorAll('.maze-cell');
      const here = [...cells].findIndex((c) => c.querySelector('.maze-explorer'));
      const from = [Math.floor(here / r.size), here % r.size];
      for (const [row, col] of shortestPath(r.walls, from, r.goal).slice(1)) cells[row * r.size + col].click();
    }, round);
  } else if (round.mode === 'compass') {
    await page.locator('.map-cell').nth(round.goal[0] * round.size + round.goal[1]).click();
  } else if (round.mode === 'mapread') {
    const lm = round.placed.find((p) => p.name === round.answer);
    await page.locator('.map-cell').nth(lm.r * round.size + lm.c).click();
  } else {
    throw new Error('Unknown round shape: ' + JSON.stringify(round).slice(0, 200));
  }
}

async function playLevel(levelNo) {
  await page.locator('.level-intro .btn-primary').click();
  await page.waitForSelector('.scene-clue');
  if (levelNo === 1) await shot('explore');
  await page.locator('.scene-clue').click({ force: true });
  await page.waitForSelector('.game');
  let lastCount = -1;
  let roundNo = 0;
  for (let guard = 0; guard < 40; guard++) {
    if (await page.locator('.reward').count()) break;
    const { count, round } = await currentRound();
    if (count === lastCount) {
      await page.waitForTimeout(40);
      continue;
    }
    lastCount = count;
    roundNo++;
    if ((process.env.SHOTS_ALL || levelNo <= 8) && roundNo === 1) await shot('game-' + levelNo);
    // exercise the retry + hint paths on a few levels
    await solve(round, { makeMistake: levelNo === 1 && roundNo === 1, useHint: levelNo === 3 && roundNo === 1 });
    await page.waitForFunction((c) => window.__MI_DEBUG__.count !== c || document.querySelector('.reward'), count, { timeout: 15000 });
  }
  await page.waitForSelector('.reward');
}

// ---------- checkpoint restore: refresh in the middle of level 1 ----------
{
  await page.locator('.level-intro .btn-primary').click();
  await page.locator('.scene-clue').click({ force: true });
  await page.waitForSelector('.game');
  const { round } = await currentRound();
  await solve(round);
  await page.waitForFunction(() => window.__MI_DEBUG__.count >= 2);
  await page.waitForTimeout(200);
  await page.reload();
  await page.waitForSelector('.modal');
  assert((await page.locator('.modal').innerText()).includes('carry on'), 'resume dialog after refresh');
  await shot('resume');
  await clickText('Start again');
  await page.waitForSelector('.level-intro');
}

let played = 0;
const levelTimes = [];
for (let n = 1; n <= MAX_LEVELS; n++) {
  const t0 = Date.now();
  await playLevel(n);
  levelTimes.push(Date.now() - t0);
  played++;
  const title = await page.locator('.topbar-title').innerText();
  const stars = await page.locator('.big-star').count();
  assert(stars === 3, 'reward shows stars');
  if (n === 1 || n === 10) await shot('reward-' + n);
  process.stdout.write(`✓ ${String(n).padStart(2)} ${title}\n`);
  if (n === MAX_LEVELS) break;
  // continue to the next level: Next level / Go to world / treasure
  const modalOpen = await page.locator('.modal').count();
  if (modalOpen || n % 10 === 0) {
    await page.waitForSelector('.modal', { timeout: 4000 }).catch(() => {});
    if (await page.locator('.modal').count()) {
      await shot('map-piece-' + n);
      await page.locator('.modal .btn').first().click();
    }
  }
  const next = page.locator('.reward-actions .btn-primary');
  await next.click();
  await page.waitForSelector('.world-screen, .level-intro', { timeout: 8000 });
  if (await page.locator('.world-screen').count()) {
    await page.locator('.level-btn.next').click();
  }
  await page.waitForSelector('.level-intro', { timeout: 8000 });
}

if (MAX_LEVELS >= 50) {
  await page.locator('.reward-actions .btn-primary').click();
  await page.waitForSelector('.ending');
  await shot('ending');
}

// ---------- persistence, map, awards, camp ----------
await page.goto(base + '#/map');
await page.reload();
await page.waitForSelector('.sea');
await shot('map');
const progress = await page.evaluate(async () => {
  const req = indexedDB.open('mystery-island');
  const db = await new Promise((r) => (req.onsuccess = () => r(req.result)));
  const all = await new Promise((r) => {
    const q = db.transaction('profiles').objectStore('profiles').getAll();
    q.onsuccess = () => r(q.result);
  });
  const p = all[0];
  return { levels: Object.keys(p.levels).length, pieces: p.mapPieces.length, coins: p.coins, gems: p.gems, ach: Object.keys(p.achievements).length };
});
console.log('saved progress after reload:', progress);
assert(progress.levels === played, `saved ${progress.levels} levels, expected ${played}`);
if (MAX_LEVELS >= 50) assert(progress.pieces === 4, 'all four map pieces');

await page.locator('.nav-btn', { hasText: 'Awards' }).click();
await page.waitForSelector('.award-grid');
assert((await page.locator('.award.earned').count()) === progress.ach, 'earned awards shown');
await shot('awards');

await page.goto(base + '#/camp');
await page.waitForSelector('.item-grid');
await page.locator('.item-card .btn-primary').first().click();
await page.waitForSelector('.camp-avatar .avatar-hat');
await shot('camp');

// ---------- parent area ----------
await page.goto(base + '#/parent');
await page.waitForSelector('.hold-btn');
const hold = page.locator('.hold-btn');
const box = await hold.boundingBox();
await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
await page.mouse.down();
await page.waitForTimeout(3300);
await page.mouse.up();
await page.waitForSelector('.gate-words');
const words = (await page.locator('.gate-words').innerText()).split('·').map((w) => w.trim());
const WORDS = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine'];
for (const w of words) await page.locator('.key', { hasText: new RegExp(`^${WORDS.indexOf(w)}$`) }).click();
await page.waitForSelector('.parent-profile');
const dash = await page.locator('.parent-profile').innerText();
assert(dash.includes(`${played} / 50`), 'dashboard shows levels');
await shot('parent');

// desktop layout check
await page.setViewportSize({ width: 1280, height: 800 });
await page.goto(base + '#/map');
await page.waitForSelector('.sea');
await shot('map-desktop');
const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1);
assert(!overflow, 'no horizontal scroll on desktop map');

// reset everything
await page.goto(base + '#/parent');
await page.waitForSelector('.parent-profile');
await clickText('Reset everything');
await page.locator('.modal .btn-danger').click();
await page.locator('.modal .btn-danger').click();
await page.waitForSelector('.splash-title');
await clickText('Play');
await page.waitForSelector('#nick');

await browser.close();
server.close();

const avg = Math.round(levelTimes.reduce((a, b) => a + b, 0) / levelTimes.length);
if (errors.length) {
  console.error('Browser errors:\n' + errors.join('\n'));
  process.exit(1);
}
console.log(`\nSmoke test passed: ${played} levels in band ${BAND} (avg ${avg} ms/level), no browser errors.`);
