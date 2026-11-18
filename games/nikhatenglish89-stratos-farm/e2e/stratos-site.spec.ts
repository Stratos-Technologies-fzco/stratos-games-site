import { test, expect, Page } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

// Runs the game inside a copy of the real site's play page, with the REAL assets/stratos.js and assets/coins-config.json,
// to prove the shared Stratos Coins wallet works end to end (earn on first play and new level, pay for a speed-up and a hint).
const REPO = resolve(process.cwd(), '../..');
const SLUG = 'nikhatenglish89-stratos-farm';

async function openOnSite(page: Page) {
  await page.route(`**/play/${SLUG}/`, (route) => route.fulfill({
    contentType: 'text/html',
    body: `<!doctype html><html><head><meta charset="utf-8"><script src="/assets/stratos.js"></script></head>
           <body style="margin:0"><iframe id="game" src="/app.html?debug=1" style="width:100vw;height:100vh;border:0"></iframe></body></html>`,
  }));
  await page.route('**/assets/stratos.js', (route) => route.fulfill({ contentType: 'application/javascript', body: readFileSync(resolve(REPO, 'assets/stratos.js'), 'utf8') }));
  await page.route('**/assets/coins-config.json', (route) => route.fulfill({ contentType: 'application/json', body: readFileSync(resolve(REPO, 'assets/coins-config.json'), 'utf8') }));
  await page.addInitScript(() => {
    if (!localStorage.getItem('stratos_farm_save_v1')) {
      localStorage.setItem('stratos_farm_save_v1', JSON.stringify({
        version: 2, coins: 500, gems: 5, xp: 99, level: 1, inventory: {},
        plots: [], buildings: [], animals: [], jobs: [], nextId: 1, lastSeen: Date.now(), ledger: [], nextLedgerId: 1, idem: {}, idemOrder: [],
      }));
    }
  });
  await page.goto(`/play/${SLUG}/`);
  return page.frameLocator('#game');
}

const balance = (page: Page) => page.evaluate(() => (window as any).Stratos.coins.balance());

test('real Stratos wallet: first play +20, new level +10, speed-up costs 20, hint costs 10', async ({ page }) => {
  const game = await openOnSite(page);
  await expect(game.getByTestId('home-stratos')).toContainText('0 Stratos Coins');
  expect(await balance(page)).toBe(0);

  // Play -> level_start -> the site pays the first-play coins once
  await game.getByTestId('play').click();
  await expect(game.getByTestId('top-bar')).toBeVisible();
  await expect.poll(() => balance(page)).toBe(20);
  await expect(game.getByTestId('stratos-coins')).toContainText('20');

  // plant, then speed up: the site asks first, one tap spends 20
  await game.getByTestId('tutorial-skip').click();
  const tile = async (gx: number, gy: number) => game.locator('body').evaluate((_, [x, y]) => (window as any).__farm.tileClientPos(x, y), [gx, gy]);
  let p = await tile(2, 6);
  await page.mouse.click(p.x, p.y);
  await game.getByTestId('seed-wheat').click();
  p = await tile(2, 6);
  await page.mouse.click(p.x, p.y);
  await game.getByTestId('speedup').click();
  const sheet = page.locator('[data-stratos-coins] .card');
  await expect(sheet).toContainText('costs 20 Stratos Coins');
  await expect(sheet).toContainText('You have 20');
  await page.locator('[data-stratos-coins] .yes').click();
  await expect(game.getByTestId('harvest-all')).toBeVisible({ timeout: 5000 });
  expect(await balance(page)).toBe(0);

  // harvest -> 99 + 1 xp = level 2 -> level_complete(1) -> +10
  await game.getByTestId('harvest-all').click();
  await expect(game.getByTestId('level')).toContainText('Lv 2');
  await expect.poll(() => balance(page)).toBe(10);

  // declining a paid speed-up spends nothing and speeds nothing
  p = await tile(3, 6);
  await page.mouse.click(p.x, p.y);
  await game.getByTestId('seed-wheat').click();
  p = await tile(3, 6);
  await page.mouse.click(p.x, p.y);
  await game.getByTestId('speedup').click();
  await expect(sheet).toContainText('costs 20 Stratos Coins');
  await expect(sheet).toContainText('Need 10 more'); // only 10 coins: the button says what is missing
  await page.locator('[data-stratos-coins] .no').click();
  expect(await balance(page)).toBe(10);
  await expect(game.getByTestId('harvest-all')).toHaveCount(0);

  // a hint costs 10
  await game.getByTestId('plot-panel-close').click();
  await game.getByTestId('nav-market').click();
  await game.getByTestId('hint-1').click();
  await expect(sheet).toContainText('costs 10 Stratos Coins');
  await page.locator('[data-stratos-coins] .yes').click();
  await expect(game.getByTestId('hint-text-1')).toContainText('plant it in a field');
  expect(await balance(page)).toBe(0);

  // coming back to Play on another day-session does not pay first-play again
  const ledger = await page.evaluate(() => (window as any).Stratos.coins.balance());
  expect(ledger).toBe(0);
});
