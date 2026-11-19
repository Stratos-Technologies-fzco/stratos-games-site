import { test, expect, Page } from '@playwright/test';

async function openFarm(page: Page) {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  await page.goto('/app.html?debug=1');
  await page.getByTestId('play').click({ timeout: 30000 }); // the home screen comes first
  await expect(page.getByTestId('top-bar')).toBeVisible({ timeout: 30000 });
  return errors;
}

const tilePos = (page: Page, gx: number, gy: number) =>
  page.evaluate(([x, y]) => (window as any).__farm.tileClientPos(x, y), [gx, gy]);

test('loads, renders the canvas and shows the HUD', async ({ page }) => {
  const errors = await openFarm(page);
  const canvas = page.locator('canvas');
  await expect(canvas).toBeVisible();
  const box = await canvas.boundingBox();
  expect(box!.width).toBeGreaterThan(300);
  // WebGL canvases cannot be read back, so check the rendered page: a drawn farm compresses far worse than a flat colour
  await page.waitForTimeout(500);
  const shot = await canvas.screenshot();
  expect(shot.length).toBeGreaterThan(40000);
  await expect(page.getByTestId('coins')).toContainText('100');
  await expect(page.getByTestId('gems')).toContainText('5');
  await expect(page.getByTestId('nav-map')).toHaveAttribute('aria-disabled', 'false'); // every button is real now
  expect(errors).toEqual([]);
});

test('a tile can be selected', async ({ page }) => {
  await openFarm(page);
  const p = await tilePos(page, 6, 10); // (4,10) is an old stump you can clear, so pick plain grass
  await page.mouse.click(p.x, p.y);
  await expect(page.getByTestId('tile-chip')).toContainText('Tile 6, 10');
});

test('clicking the farmhouse and the barn opens their panels', async ({ page }) => {
  await openFarm(page);
  const f = await tilePos(page, 4, 2); // middle of the 3x3 farmhouse footprint
  await page.mouse.click(f.x, f.y - 40);
  await expect(page.getByTestId('info-panel')).toContainText('Farmhouse');
  await page.getByTestId('panel-close').click();
  await expect(page.getByTestId('info-panel')).toHaveCount(0);
  const b = await tilePos(page, 8, 2);
  await page.mouse.click(b.x, b.y - 40);
  await expect(page.getByTestId('info-panel')).toContainText('Barn');
});

test('wheel zoom and drag pan move the camera, resize keeps the layout', async ({ page }) => {
  await openFarm(page);
  const z0 = await page.evaluate(() => (window as any).__farm.zoom());
  await page.mouse.move(640, 360);
  await page.mouse.wheel(0, -300);
  await expect.poll(() => page.evaluate(() => (window as any).__farm.zoom())).toBeGreaterThan(z0);
  const s0 = await page.evaluate(() => (window as any).__farm.scroll());
  await page.mouse.move(600, 300); await page.mouse.down(); await page.mouse.move(520, 260, { steps: 6 }); await page.mouse.up();
  const s1 = await page.evaluate(() => (window as any).__farm.scroll());
  expect(Math.abs(s1.x - s0.x) + Math.abs(s1.y - s0.y)).toBeGreaterThan(10);
  // a drag must not select a tile
  await expect(page.getByTestId('tile-chip')).toHaveCount(0);
  // portrait phone size
  await page.setViewportSize({ width: 390, height: 780 });
  await expect(page.getByTestId('bottom-nav')).toBeVisible();
  const size = await page.evaluate(() => (window as any).__farm.canvasSize());
  expect(size.w).toBe(390);
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
  // all six nav buttons and the coin pill still fit on screen
  for (const id of ['farm', 'shop', 'animals', 'market', 'inventory', 'map']) {
    const bb = await page.getByTestId(`nav-${id}`).boundingBox();
    expect(bb!.x).toBeGreaterThanOrEqual(0);
    expect(bb!.x + bb!.width).toBeLessThanOrEqual(390);
  }
  const gems = await page.getByTestId('settings').boundingBox();
  expect(gems!.x + gems!.width).toBeLessThanOrEqual(390);
});

test('plant wheat, wait, harvest, and coins/XP/inventory persist after reload', async ({ page }) => {
  const errors = await openFarm(page);
  // plot (2,6) is a field tile
  let p = await tilePos(page, 2, 6);
  await page.mouse.click(p.x, p.y);
  await expect(page.getByTestId('seed-panel')).toBeVisible();
  await expect(page.getByTestId('seed-corn')).toBeDisabled(); // locked at level 1
  await page.getByTestId('seed-wheat').click();
  await page.getByTestId('planting-done').click(); // one seed per visit in this test: leave planting mode
  await expect(page.getByTestId('coins')).toContainText('98');
  await expect(page.getByTestId('seed-panel')).toHaveCount(0);
  // not ready yet: tapping shows the countdown instead of harvesting
  p = await tilePos(page, 2, 6);
  await page.mouse.click(p.x, p.y);
  await expect(page.getByTestId('plot-panel')).toContainText('Ready in');
  await page.getByTestId('plot-panel-close').click();
  await expect(page.getByTestId('harvest-all')).toHaveCount(0);
  // fast-forward server time past the 2 minute grow time
  await page.evaluate(() => (window as any).__farm.advance(121000));
  await expect(page.getByTestId('harvest-all')).toBeVisible({ timeout: 5000 });
  p = await tilePos(page, 2, 6);
  await page.mouse.click(p.x, p.y);
  await expect(page.getByTestId('harvest-all')).toHaveCount(0);
  await page.getByTestId('nav-inventory').click();
  await expect(page.getByTestId('inv-wheat')).toContainText('Wheat × 2');
  await page.getByTestId('inventory-panel-close').click();
  // reload: state comes back from the saved farm
  await page.reload();
  await expect(page.getByTestId('resume-note')).toBeVisible({ timeout: 30000 }); // Continue, not Play
  await page.getByTestId('play').click();
  await expect(page.getByTestId('top-bar')).toBeVisible({ timeout: 30000 });
  await expect(page.getByTestId('coins')).toContainText('98');
  await page.getByTestId('nav-inventory').click();
  await expect(page.getByTestId('inv-wheat')).toContainText('Wheat × 2');
  await page.getByTestId('max-wheat').click();
  await page.getByTestId('sell-wheat').click();
  await expect(page.getByTestId('coins')).toContainText('104');
  await expect(page.getByTestId('inventory-empty')).toBeVisible();
  expect(errors).toEqual([]);
});

test('animals and production: egg, wheat -> flour -> bread, and it all survives a reload', async ({ page }) => {
  // start from a seeded save (only when none exists, so the reload below keeps the real one)
  await page.addInitScript(() => {
    if (localStorage.getItem('stratos_farm_save_v1')) return;
    localStorage.setItem('stratos_farm_save_v1', JSON.stringify({
      version: 2, coins: 2000, gems: 5, xp: 0, level: 2, inventory: { wheat: 6, animal_feed: 3 },
      plots: [], buildings: [], animals: [], jobs: [], nextId: 1, lastSeen: Date.now(), ledger: [], nextLedgerId: 1, idem: {}, idemOrder: [],
    }));
  });
  const errors = await openFarm(page);
  const place = async (shopId: string, tab: 'habitats' | 'factories', gx: number, gy: number) => {
    await page.getByTestId(tab === 'habitats' ? 'nav-animals' : 'nav-shop').click();
    await page.getByTestId(`shop-${shopId}`).click();
    await expect(page.getByTestId('placement-bar')).toBeVisible();
    const p = await tilePos(page, gx, gy);
    await page.mouse.click(p.x, p.y);
    await expect(page.getByTestId('place-confirm')).toBeEnabled();
    await page.getByTestId('place-confirm').click();
    await expect(page.getByTestId('placement-bar')).toHaveCount(0);
  };
  const openBuilding = async (gx: number, gy: number) => {
    const p = await tilePos(page, gx + 1, gy + 1); // middle of the 2x2 footprint
    await page.mouse.click(p.x, p.y - 50);
    await expect(page.getByTestId('building-panel')).toBeVisible();
  };

  // an invalid spot (on the farmhouse) cannot be confirmed
  await page.getByTestId('nav-animals').click();
  await page.getByTestId('shop-chicken_coop').click();
  await expect(page.getByTestId('placement-bar')).toBeVisible(); // placing starts a moment after the click (it waits to see if it is a double-click)
  const bad = await tilePos(page, 4, 2);
  await page.mouse.click(bad.x, bad.y);
  await expect(page.getByTestId('place-confirm')).toBeDisabled();
  await page.getByTestId('place-cancel').click();

  await place('chicken_coop', 'habitats', 0, 2);
  await place('flour_mill', 'factories', 0, 5);
  await place('bakery', 'factories', 5, 8);
  await expect(page.getByTestId('coins')).toContainText(String(2000 - 60 - 120 - 250));

  // chicken: buy, feed, wait 10 minutes, collect an egg
  await openBuilding(0, 2);
  await page.getByTestId('buy-animal').click();
  await expect(page.getByTestId('habitat-meta')).toContainText('1 / 4');
  await page.getByTestId('feed').click();
  await expect(page.getByTestId('habitat-meta')).toContainText('Animal feed: 5'); // 3 seeded + 3 starter gift - 1
  await expect(page.getByTestId('collect')).toBeDisabled();
  await page.evaluate(() => (window as any).__farm.advance(601000));
  await expect(page.getByTestId('collect')).toBeEnabled({ timeout: 5000 });
  await page.getByTestId('collect').click();
  await page.getByTestId('building-panel-close').click();

  // flour mill: 3 wheat -> flour (twice), then bakery: 2 flour -> bread
  await openBuilding(0, 5);
  await page.getByTestId('recipe-flour').click();
  await page.getByTestId('recipe-flour').click();
  await expect(page.getByTestId('queue-meta')).toContainText('2 / 2');
  await page.evaluate(() => (window as any).__farm.advance(601000));
  await expect(page.getByTestId('collect')).toContainText('(2)', { timeout: 5000 });
  await page.getByTestId('collect').click();
  await page.getByTestId('building-panel-close').click();
  await openBuilding(5, 8);
  await page.getByTestId('recipe-bread').click();
  await page.evaluate(() => (window as any).__farm.advance(601000));
  await expect(page.getByTestId('collect')).toContainText('(1)', { timeout: 5000 });
  await page.getByTestId('collect').click();
  await page.getByTestId('building-panel-close').click();

  // reload: buildings, animal and items come back from the save
  await page.reload();
  await expect(page.getByTestId('resume-note')).toBeVisible({ timeout: 30000 }); // Continue, not Play
  await page.getByTestId('play').click();
  await expect(page.getByTestId('top-bar')).toBeVisible({ timeout: 30000 });
  await page.getByTestId('nav-inventory').click();
  await expect(page.getByTestId('inv-egg')).toContainText('Egg × 1');
  await expect(page.getByTestId('inv-bread')).toContainText('Bread × 1');
  await page.getByTestId('inventory-panel-close').click();
  await openBuilding(0, 2);
  await expect(page.getByTestId('habitat-meta')).toContainText('1 / 4');
  expect(errors).toEqual([]);
});

test('first session: the five tutorial steps, with a real order and a real sale', async ({ page }) => {
  const errors = await openFarm(page);
  const banner = page.getByTestId('tutorial');
  await expect(banner).toContainText('Step 1 of 5');
  const plant = async (gx: number, gy: number) => {
    const p = await tilePos(page, gx, gy);
    await page.mouse.click(p.x, p.y);
    await page.getByTestId('seed-wheat').click();
    await page.getByTestId('planting-done').click(); // one seed per visit in this test: leave planting mode
  };
  await plant(2, 6);
  await plant(3, 6);
  await page.getByTestId('tutorial-claim').click(); // step 1
  await expect(banner).toContainText('Step 2 of 5');
  await page.evaluate(() => (window as any).__farm.advance(121000));
  await expect(page.getByTestId('harvest-all')).toBeVisible({ timeout: 5000 });
  await page.getByTestId('harvest-all').click();
  await page.getByTestId('tutorial-claim').click(); // step 2
  await expect(banner).toContainText('Step 3 of 5');
  // market: sell one wheat, then deliver Old Joe's order (2 wheat)
  await page.getByTestId('nav-market').click();
  await expect(page.getByTestId('order-0')).toContainText('Old Joe');
  await page.getByTestId('tab-sell').click();
  await page.getByTestId('sell-wheat').click(); // quantity starts at 1
  await page.getByTestId('tab-orders').click();
  await page.getByTestId('deliver-0').click();
  await page.getByTestId('market-panel-close').click();
  await page.getByTestId('tutorial-claim').click(); // step 3 (sold something)
  await expect(banner).toContainText('Step 4 of 5');
  // coop + chicken
  await page.getByTestId('nav-animals').click();
  await page.getByTestId('shop-chicken_coop').click();
  await expect(page.getByTestId('placement-bar')).toBeVisible(); // placing starts a moment after the click (it waits to see if it is a double-click)
  const spot = await tilePos(page, 0, 2);
  await page.mouse.click(spot.x, spot.y);
  await page.getByTestId('place-confirm').click();
  const body = await tilePos(page, 1, 3);
  await page.mouse.click(body.x, body.y - 50);
  await page.getByTestId('buy-animal').click();
  await page.getByTestId('building-panel-close').click();
  await page.getByTestId('tutorial-claim').click(); // step 4
  await expect(banner).toContainText('Step 5 of 5');
  await page.getByTestId('tutorial-claim').click(); // step 5 (the order was already delivered)
  await expect(banner).toHaveCount(0);
  // it stays finished after a reload
  await page.reload();
  await expect(page.getByTestId('resume-note')).toBeVisible({ timeout: 30000 }); // Continue, not Play
  await page.getByTestId('play').click();
  await expect(page.getByTestId('top-bar')).toBeVisible({ timeout: 30000 });
  await expect(page.getByTestId('tutorial')).toHaveCount(0);
  expect(errors).toEqual([]);
});

test('expand land, build on it, move and remove a building, claim a quest', async ({ page }) => {
  await page.addInitScript(() => {
    if (localStorage.getItem('stratos_farm_save_v1')) return;
    localStorage.setItem('stratos_farm_save_v1', JSON.stringify({
      version: 2, coins: 3000, gems: 5, xp: 0, level: 4, inventory: { flour: 5 },
      plots: [], buildings: [], animals: [], jobs: [], nextId: 1, lastSeen: Date.now(), ledger: [], nextLedgerId: 1, idem: {}, idemOrder: [],
    }));
  });
  const errors = await openFarm(page);
  await page.getByTestId('tutorial-skip').click();
  // building on locked land is refused
  await page.getByTestId('nav-animals').click();
  await page.getByTestId('shop-chicken_coop').click();
  await expect(page.getByTestId('placement-bar')).toBeVisible(); // placing starts a moment after the click (it waits to see if it is a double-click)
  let p = await tilePos(page, 8, 8);
  await page.mouse.click(p.x, p.y);
  await expect(page.getByTestId('place-confirm')).toBeDisabled();
  await page.getByTestId('place-cancel').click();
  // tapping the locked patch opens the expansion panel
  p = await tilePos(page, 8, 8);
  await page.mouse.click(p.x, p.y);
  await expect(page.getByTestId('expansion-panel')).toBeVisible();
  await page.getByTestId('expand-confirm').click();
  await expect(page.getByTestId('coins')).toContainText('2700');
  // now the same spot works
  await page.getByTestId('nav-animals').click();
  await page.getByTestId('shop-chicken_coop').click();
  await expect(page.getByTestId('placement-bar')).toBeVisible(); // placing starts a moment after the click (it waits to see if it is a double-click)
  p = await tilePos(page, 8, 8);
  await page.mouse.click(p.x, p.y);
  await expect(page.getByTestId('place-confirm')).toBeEnabled();
  await page.getByTestId('place-confirm').click();
  await expect(page.getByTestId('coins')).toContainText('2640');
  // move it to a free spot
  const open = async (gx: number, gy: number) => {
    const q = await tilePos(page, gx + 1, gy + 1);
    await page.mouse.click(q.x, q.y - 50);
    await expect(page.getByTestId('building-panel')).toBeVisible();
  };
  await open(8, 8);
  await page.getByTestId('move').click();
  p = await tilePos(page, 0, 2);
  await page.mouse.click(p.x, p.y);
  await page.getByTestId('place-confirm').click();
  await open(0, 2);
  // remove it: two taps, half the price comes back
  await page.getByTestId('remove').click();
  await page.getByTestId('remove').click();
  await expect(page.getByTestId('coins')).toContainText('2670');
  // quests panel opens and lists today's quests
  await page.getByTestId('quests-btn').click();
  await expect(page.getByTestId('quests-panel')).toBeVisible();
  await page.getByTestId('qtab-achievements').click();
  await expect(page.getByTestId('quest-ach_level_3')).toBeVisible();
  await page.getByTestId('claim-ach_level_3').click(); // level 4 already passed level 3
  await expect(page.getByTestId('gems')).toContainText('6');
  expect(errors).toEqual([]);
});

test('home screen: logo, how to play, tips, about, sound off by default, Continue after progress', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  await page.goto('/app.html?debug=1');
  await expect(page.getByTestId('home')).toBeVisible({ timeout: 30000 });
  await expect(page.locator('.home img.logo')).toBeVisible();
  await expect(page.getByTestId('play')).toHaveText('Play'); // nothing to continue yet
  await expect(page.getByTestId('home-music')).toHaveAttribute('aria-pressed', 'false'); // sound is off by default
  await expect(page.getByTestId('home-sfx')).toHaveAttribute('aria-pressed', 'false');
  await expect(page.getByTestId('home-tip')).toContainText('Tip:');
  await page.getByTestId('home-how').click();
  await expect(page.getByTestId('how-panel')).toContainText('Your first five steps');
  await expect(page.getByTestId('how-panel')).toContainText('Stratos Coins');
  await page.getByTestId('how-panel-close').click();
  await page.getByTestId('home-tips').click();
  await expect(page.getByTestId('tips-panel')).toContainText('Plant wheat first');
  await page.getByTestId('tips-panel-close').click();
  await page.getByTestId('home-about').click();
  await expect(page.getByTestId('about-panel')).toContainText('Nikhat Sultana');
  await expect(page.getByTestId('about-panel')).toContainText('Is Stratos Farm free?');
  await page.getByTestId('about-panel-close').click();
  // no Stratos site around: no Stratos Coins chip
  await expect(page.getByTestId('home-stratos')).toHaveCount(0);
  await page.getByTestId('play').click();
  await expect(page.getByTestId('stratos-coins')).toHaveCount(0);
  // settings: toggles and back to the home screen
  await page.getByTestId('settings').click();
  await expect(page.getByTestId('settings-panel')).toBeVisible();
  await page.getByTestId('set-sfx').click();
  await expect(page.getByTestId('set-sfx')).toHaveAttribute('aria-pressed', 'true');
  await page.getByTestId('set-sfx').click();
  await page.getByTestId('set-how').click();
  await expect(page.getByTestId('how-panel')).toBeVisible();
  await page.getByTestId('how-panel-close').click();
  // make some progress, go home: the button now says Continue
  const p = await tilePos(page, 2, 6);
  await page.mouse.click(p.x, p.y);
  await page.getByTestId('seed-wheat').click();
  await page.getByTestId('planting-done').click(); // one seed per visit in this test: leave planting mode
  await page.getByTestId('settings').click();
  await page.getByTestId('set-home').click();
  await expect(page.getByTestId('play')).toHaveText('Continue');
  await expect(page.getByTestId('resume-note')).toContainText('Level 1');
  await page.getByTestId('play').click();
  await expect(page.getByTestId('top-bar')).toBeVisible();
  expect(errors).toEqual([]);
});

test('Stratos Coins: first-play and level events, balance chip, paid speed-up and hint', async ({ page }) => {
  await page.addInitScript(() => {
    const w = window as any;
    w.__events = []; w.__offers = [];
    w.Stratos = {
      track: (name: string, d: unknown) => w.__events.push([name, d]),
      coins: { balance: () => 42, onChange: () => () => undefined, offer: (kind: string, done: () => void) => { w.__offers.push(kind); done(); } },
    };
    if (!localStorage.getItem('stratos_farm_save_v1')) {
      localStorage.setItem('stratos_farm_save_v1', JSON.stringify({
        version: 2, coins: 500, gems: 5, xp: 99, level: 1, inventory: {},
        plots: [], buildings: [], animals: [], jobs: [], nextId: 1, lastSeen: Date.now(), ledger: [], nextLedgerId: 1, idem: {}, idemOrder: [],
      }));
    }
  });
  await page.goto('/app.html?debug=1');
  await expect(page.getByTestId('home-stratos')).toContainText('42 Stratos Coins');
  await page.getByTestId('play').click();
  await expect(page.getByTestId('top-bar')).toBeVisible({ timeout: 30000 });
  await expect(page.getByTestId('stratos-coins')).toContainText('42');
  // Play reports level_start (pays the first-play Stratos Coins on the site)
  expect(await page.evaluate(() => (window as any).__events)).toContainEqual(['level_start', { level: 1 }]);
  // speed-up goes through the wallet
  await page.getByTestId('tutorial-skip').click();
  const p = await tilePos(page, 2, 6);
  await page.mouse.click(p.x, p.y);
  await page.getByTestId('seed-wheat').click();
  await page.getByTestId('planting-done').click(); // one seed per visit in this test: leave planting mode
  const q = await tilePos(page, 2, 6);
  await page.mouse.click(q.x, q.y);
  await expect(page.getByTestId('plot-panel')).toContainText('Ready in');
  await page.getByTestId('speedup').click();
  expect(await page.evaluate(() => (window as any).__offers)).toEqual(['boost']);
  await expect(page.getByTestId('harvest-all')).toBeVisible({ timeout: 5000 });
  // harvesting the 99 -> 100 xp levels up: level_complete for level 1 is reported
  await page.getByTestId('harvest-all').click();
  await expect(page.getByTestId('level')).toContainText('Lv 2');
  expect(await page.evaluate(() => (window as any).__events)).toContainEqual(['level_complete', { level: 1 }]);
  // an order we cannot fill yet offers a paid hint
  await page.getByTestId('nav-market').click();
  await page.getByTestId('tab-orders').click();
  const hintBtn = page.getByTestId('hint-1');
  await expect(hintBtn).toBeVisible();
  await hintBtn.click();
  expect(await page.evaluate(() => (window as any).__offers)).toEqual(['boost', 'hint']);
  await expect(page.getByTestId('hint-text-1')).toContainText('plant it in a field');
});

test('sound stays silent and undownloaded until the player turns it on, and the choice is remembered', async ({ page }) => {
  const audio: string[] = [];
  page.on('request', (r) => { if (/\.(ogg|mp3)(\?|$)/.test(r.url())) audio.push(r.url()); });
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  await page.goto('/app.html?debug=1');
  await page.getByTestId('play').click({ timeout: 30000 });
  await page.getByTestId('top-bar').waitFor();
  await page.waitForTimeout(1500);
  expect(audio).toEqual([]); // nothing downloaded by default
  await page.getByTestId('settings').click();
  await page.getByTestId('set-music').click();
  await expect(page.getByTestId('set-music')).toHaveAttribute('aria-pressed', 'true');
  await expect.poll(() => audio.length, { timeout: 15000 }).toBeGreaterThan(5); // the files load only now
  expect(audio.some((u) => u.includes('music_farm_day'))).toBe(true);
  await page.reload();
  await page.getByTestId('home-music').waitFor({ timeout: 30000 });
  await expect(page.getByTestId('home-music')).toHaveAttribute('aria-pressed', 'true'); // remembered
  expect(errors).toEqual([]);
});

test('selling lets you choose the quantity (stepper, typing, Max) and sells exactly that many', async ({ page }) => {
  await page.addInitScript(() => {
    if (localStorage.getItem('stratos_farm_save_v1')) return;
    localStorage.setItem('stratos_farm_save_v1', JSON.stringify({
      version: 2, coins: 100, gems: 5, xp: 0, level: 1, inventory: { wheat: 10, carrot: 4 },
      plots: [], buildings: [], animals: [], jobs: [], nextId: 1, lastSeen: Date.now(), ledger: [], nextLedgerId: 1, idem: {}, idemOrder: [],
    }));
  });
  await openFarm(page);
  await page.getByTestId('tutorial-skip').click();
  await page.getByTestId('nav-inventory').click();
  const sell = page.getByTestId('sell-wheat');
  await expect(sell).toContainText('Sell 1');
  await page.getByTestId('plus-wheat').click();
  await page.getByTestId('plus-wheat').click();
  await expect(sell).toContainText('Sell 3 · 9');           // 3 x 3 coins
  await page.getByTestId('qty-wheat').fill('4');             // typing works too
  await expect(sell).toContainText('Sell 4 · 12');
  await page.getByTestId('qty-wheat').fill('99');            // more than owned is clamped on blur
  await page.getByTestId('qty-wheat').blur();
  await expect(page.getByTestId('qty-wheat')).toHaveValue('10');
  await page.getByTestId('qty-wheat').fill('4');
  await sell.click();
  await expect(page.getByTestId('coins')).toContainText('112'); // 100 + 4 x 3
  await expect(page.getByTestId('inv-wheat')).toContainText('Wheat × 6'); // exactly 4 sold, not all
  await expect(page.getByTestId('qty-wheat')).toHaveValue('1'); // picker resets
  await expect(page.getByTestId('minus-wheat')).toBeDisabled(); // cannot go below 1
  await expect(page.getByTestId('qty-wheat')).toHaveValue('1');
  await page.getByTestId('inventory-panel-close').click();
  // same picker in the Market
  await page.getByTestId('nav-market').click();
  await page.getByTestId('tab-sell').click();
  await page.getByTestId('max-carrot').click();
  await expect(page.getByTestId('sell-carrot')).toContainText('Sell 4 · 24');
  await page.getByTestId('minus-carrot').click();
  await page.getByTestId('sell-carrot').click();            // sells 3 of 4
  await expect(page.getByTestId('market-carrot')).toContainText('Carrot × 1');
  await expect(page.getByTestId('coins')).toContainText('130'); // 112 + 3 x 6
});

test('shop: select a spot, then double-click a building to place it right there', async ({ page }) => {
  await page.addInitScript(() => {
    if (localStorage.getItem('stratos_farm_save_v1')) return;
    localStorage.setItem('stratos_farm_save_v1', JSON.stringify({
      version: 2, coins: 2000, gems: 5, xp: 0, level: 4, inventory: {},
      plots: [], buildings: [], animals: [], jobs: [], nextId: 1, lastSeen: Date.now(), ledger: [], nextLedgerId: 1, idem: {}, idemOrder: [],
    }));
  });
  const errors = await openFarm(page);
  await page.getByTestId('tutorial-skip').click();

  // no spot selected: a double-click explains what to do and builds nothing
  await page.getByTestId('nav-animals').click();
  await expect(page.getByTestId('shop-hint')).toContainText('tap a spot on the farm first');
  await page.getByTestId('shop-chicken_coop').dblclick();
  await expect(page.getByTestId('toast')).toContainText('Tap a spot on the farm first');
  await expect(page.getByTestId('coins')).toContainText('2000');
  await page.getByTestId('shop-panel-close').click();

  // a bad spot (the farmhouse) is refused
  let p = await tilePos(page, 4, 2);
  await page.mouse.click(p.x, p.y + 60);
  await page.getByTestId('nav-animals').click();
  await page.getByTestId('shop-chicken_coop').dblclick();
  await expect(page.getByTestId('toast')).toContainText('already there'); // and it says why
  await expect(page.getByTestId('coins')).toContainText('2000');
  await page.getByTestId('shop-panel-close').click();

  // select a free spot, double-click: built at once, no placement bar
  p = await tilePos(page, 0, 2);
  await page.mouse.click(p.x, p.y);
  await page.getByTestId('nav-animals').click();
  await expect(page.getByTestId('shop-hint')).toContainText('Selected spot: 0, 2');
  await page.getByTestId('shop-chicken_coop').dblclick();
  await expect(page.getByTestId('coins')).toContainText('1940');
  await expect(page.getByTestId('shop-panel')).toHaveCount(0);
  await expect(page.getByTestId('placement-bar')).toHaveCount(0);
  const body = await tilePos(page, 1, 3);
  await page.mouse.click(body.x, body.y - 50);
  await expect(page.getByTestId('building-panel')).toContainText('Chicken Coop');
  await page.getByTestId('building-panel-close').click();

  // a factory works the same way
  p = await tilePos(page, 0, 5);
  await page.mouse.click(p.x, p.y);
  await page.getByTestId('nav-shop').click();
  await page.getByTestId('shop-flour_mill').dblclick();
  await expect(page.getByTestId('coins')).toContainText('1820');

  // a single click still works the old way, and starts on the selected spot
  p = await tilePos(page, 5, 8); // a free 2x2 spot
  await page.mouse.click(p.x, p.y);
  await page.getByTestId('nav-animals').click();
  await page.getByTestId('shop-chicken_coop').click();
  await expect(page.getByTestId('placement-bar')).toBeVisible(); // placing starts a moment after the click (it waits to see if it is a double-click)
  await expect(page.getByTestId('placement-bar')).toBeVisible();
  await expect(page.getByTestId('place-confirm')).toBeEnabled(); // the ghost is already on the selected spot
  await page.getByTestId('place-cancel').click();
  expect(errors).toEqual([]);
});


test('Map: village map, jump to a building, neighbours, honest social note, share', async ({ page }) => {
  await page.addInitScript(() => {
    if (localStorage.getItem('stratos_farm_save_v1')) return;
    const now = Date.now();
    localStorage.setItem('stratos_farm_save_v1', JSON.stringify({
      version: 3, coins: 900, gems: 5, xp: 0, level: 4, inventory: {},
      plots: [], buildings: [{ id: 'b1', type: 'chicken_coop', gx: 0, gy: 2, level: 1 }],
      animals: [{ id: 'a1', type: 'chicken', buildingId: 'b1', readyAt: now - 1000, hungrySince: null, happiness: 100 }], jobs: [],
      orders: [], orderCooldowns: {}, orderCounter: 5, expanded: [], stats: { order: 4, 'order:old_joe': 4, harvest: 7 }, claimed: [],
      daily: { day: -1, ids: [], base: {}, claimed: [] }, tutorialDone: true,
      nextId: 5, lastSeen: now, ledger: [], nextLedgerId: 1, idem: {}, idemOrder: [],
    }));
  });
  const errors = await openFarm(page);
  await page.getByTestId('nav-map').click();
  await expect(page.getByTestId('map-panel')).toBeVisible();
  await expect(page.getByTestId('minimap')).toBeVisible();
  await expect(page.getByTestId('village-facts')).toContainText('buildings');
  await expect(page.getByTestId('neighbour-old_joe')).toContainText('4 orders delivered');
  await expect(page.getByTestId('neighbour-priya')).toContainText('Has not met you yet');
  await expect(page.getByTestId('social-note')).toContainText('need Stratos accounts'); // honest: no fake friends list
  // tap the coop on the map: the map closes, the camera flies there and its panel opens
  await page.getByTestId('map-b1').click();
  await expect(page.getByTestId('map-panel')).toHaveCount(0);
  await expect(page.getByTestId('building-panel')).toContainText('Chicken Coop');
  await page.getByTestId('building-panel-close').click();
  // locked land on the map opens the expansion panel
  await page.getByTestId('nav-map').click();
  await page.getByTestId('map-expansion-south_meadow').click();
  await expect(page.getByTestId('expansion-panel')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByTestId('expansion-panel')).toHaveCount(0);
  // sharing produces a picture (download fallback in a desktop test browser)
  await page.getByTestId('nav-map').click();
  const download = page.waitForEvent('download', { timeout: 10000 });
  await page.getByTestId('share-village').click();
  expect((await download).suggestedFilename()).toBe('my-stratos-farm.png');
  await expect(page.getByTestId('share-result')).toContainText('Picture saved');
  expect(errors).toEqual([]);
});

test('keyboard: arrow keys move the camera, plus and minus zoom, Escape closes panels', async ({ page }) => {
  await openFarm(page);
  // zoom in first: when the whole island fits the window the camera has nowhere to move
  const z0 = await page.evaluate(() => (window as any).__farm.zoom());
  for (let i = 0; i < 4; i++) await page.keyboard.press('+');
  expect(await page.evaluate(() => (window as any).__farm.zoom())).toBeGreaterThan(z0);
  const s0 = await page.evaluate(() => (window as any).__farm.scroll());
  await page.keyboard.press('ArrowRight');
  await page.keyboard.press('ArrowDown');
  const s1 = await page.evaluate(() => (window as any).__farm.scroll());
  expect(s1.x).toBeGreaterThan(s0.x);
  expect(s1.y).toBeGreaterThan(s0.y);
  await page.getByTestId('nav-inventory').click();
  await expect(page.getByTestId('inventory-panel')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByTestId('inventory-panel')).toHaveCount(0);
  // Reduce effects can be switched on in Settings and is remembered
  await page.getByTestId('settings').click();
  await page.getByTestId('set-lowfx').click();
  await expect(page.getByTestId('set-lowfx')).toHaveAttribute('aria-pressed', 'true');
  await page.reload();
  await page.getByTestId('play').click();
  await page.getByTestId('settings').click();
  await expect(page.getByTestId('set-lowfx')).toHaveAttribute('aria-pressed', 'true');
});

test('backup: save a backup file, change the farm, restore it; a wrong file is refused', async ({ page }) => {
  await page.addInitScript(() => {
    if (localStorage.getItem('stratos_farm_save_v1')) return;
    localStorage.setItem('stratos_farm_save_v1', JSON.stringify({
      version: 2, coins: 500, gems: 5, xp: 0, level: 1, inventory: {},
      plots: [], buildings: [], animals: [], jobs: [], nextId: 1, lastSeen: Date.now(), ledger: [], nextLedgerId: 1, idem: {}, idemOrder: [],
    }));
  });
  await openFarm(page);
  await page.getByTestId('tutorial-skip').click();
  // plant once so a signed save exists, then back it up (coins 498)
  let p = await tilePos(page, 2, 6);
  await page.mouse.click(p.x, p.y);
  await page.getByTestId('seed-wheat').click();
  await page.getByTestId('planting-done').click(); // one seed per visit in this test: leave planting mode
  await expect(page.getByTestId('coins')).toContainText('498');
  await page.getByTestId('settings').click();
  const dl = page.waitForEvent('download');
  await page.getByTestId('set-export').click();
  const file = await dl;
  expect(file.suggestedFilename()).toBe('stratos-farm-backup.json');
  const path = await file.path();
  // change the farm afterwards (coins 494)
  await page.getByTestId('settings-panel-close').click();
  p = await tilePos(page, 3, 6);
  await page.mouse.click(p.x, p.y);
  await page.getByTestId('seed-carrot').click();
  await expect(page.getByTestId('coins')).toContainText('494');
  // a wrong file is refused and nothing changes
  await page.getByTestId('settings').click();
  await page.getByTestId('set-import').setInputFiles({ name: 'x.json', mimeType: 'application/json', buffer: Buffer.from('{"hello":"world"}') });
  await expect(page.getByTestId('toast')).toContainText('not a Stratos Farm backup');
  await expect(page.getByTestId('coins')).toContainText('494');
  // the real backup restores the farm as it was (the page reloads)
  await page.getByTestId('set-import').setInputFiles(path!);
  await page.getByTestId('resume-note').waitFor({ timeout: 30000 });
  await page.getByTestId('play').click();
  await expect(page.getByTestId('coins')).toContainText('498');
});


test('placing: the selected tile can be any part of the building, and the ghost stays put until you tap', async ({ page }) => {
  await page.addInitScript(() => {
    if (localStorage.getItem('stratos_farm_save_v1')) return;
    localStorage.setItem('stratos_farm_save_v1', JSON.stringify({
      version: 2, coins: 2000, gems: 5, xp: 0, level: 4, inventory: {},
      plots: [], buildings: [], animals: [], jobs: [], nextId: 1, lastSeen: Date.now(), ledger: [], nextLedgerId: 1, idem: {}, idemOrder: [],
    }));
  });
  const errors = await openFarm(page);
  await page.getByTestId('tutorial-skip').click();
  const ghost = () => page.evaluate(() => (window as any).__farm.ghost());

  // (9,10) as the top corner would hit the rock at (10,10); the building fits when that tile is its other corner
  let p = await tilePos(page, 9, 10);
  await page.mouse.click(p.x, p.y);
  await page.getByTestId('nav-animals').click();
  await page.getByTestId('shop-chicken_coop').dblclick();
  await expect(page.getByTestId('coins')).toContainText('1940');
  await expect(page.getByTestId('toast')).not.toContainText('already there');
  const q = await tilePos(page, 9, 11);
  await page.mouse.click(q.x, q.y - 50);
  await expect(page.getByTestId('building-panel')).toContainText('Chicken Coop');
  await page.getByTestId('building-panel-close').click();

  // a slower double-click (about a third of a second apart) still counts as a double-click
  p = await tilePos(page, 0, 5);
  await page.mouse.click(p.x, p.y);
  await page.getByTestId('nav-shop').click();
  const row = page.getByTestId('shop-flour_mill');
  await row.dispatchEvent('click'); // dispatched directly so test-runner overhead does not stretch the gap
  await page.waitForTimeout(300);
  await row.dispatchEvent('click');
  await expect(page.getByTestId('coins')).toContainText('1820');
  await expect(page.getByTestId('placement-bar')).toHaveCount(0);

  // placing by single click: the ghost starts on the selected spot and does NOT follow the mouse
  p = await tilePos(page, 5, 8);
  await page.mouse.click(p.x, p.y);
  await page.getByTestId('nav-animals').click();
  await page.getByTestId('shop-chicken_coop').click();
  await expect(page.getByTestId('placement-bar')).toBeVisible();
  await expect.poll(ghost).toEqual({ gx: 5, gy: 8 });
  const far = await tilePos(page, 1, 9);
  await page.mouse.move(far.x, far.y, { steps: 8 });
  await page.waitForTimeout(300);
  expect(await ghost()).toEqual({ gx: 5, gy: 8 });          // moving the mouse changes nothing
  await page.mouse.click(far.x, far.y);                      // only a tap moves it
  await expect.poll(ghost).toEqual({ gx: 1, gy: 9 });
  await page.getByTestId('place-cancel').click();
  expect(errors).toEqual([]);
});


test('feeding: a new player gets starter feed, and with none the panel says exactly what to do', async ({ page }) => {
  await page.addInitScript(() => {
    if (localStorage.getItem('stratos_farm_save_v1')) return;
    localStorage.setItem('stratos_farm_save_v1', JSON.stringify({
      version: 2, coins: 800, gems: 5, xp: 0, level: 1, inventory: {},
      plots: [], buildings: [], animals: [], jobs: [], nextId: 1, lastSeen: Date.now(), ledger: [], nextLedgerId: 1, idem: {}, idemOrder: [],
    }));
  });
  const errors = await openFarm(page);
  await page.getByTestId('tutorial-skip').click();
  let p = await tilePos(page, 0, 2);
  await page.mouse.click(p.x, p.y);
  await page.getByTestId('nav-animals').click();
  await page.getByTestId('shop-chicken_coop').dblclick();
  const body = await tilePos(page, 1, 3);
  await page.mouse.click(body.x, body.y - 50);
  await page.getByTestId('buy-animal').click();
  await expect(page.getByTestId('habitat-meta')).toContainText('Animal feed: 3');   // the first chicken brings 3
  await expect(page.getByTestId('no-feed')).toHaveCount(0);
  await page.getByTestId('feed').click();
  await expect(page.getByTestId('habitat-meta')).toContainText('Animal feed: 2');
  // a second chicken is hungry; use up the feed, then the panel explains how to get more
  await page.getByTestId('buy-animal').click();
  await page.getByTestId('feed').click();
  await page.getByTestId('buy-animal').click();
  await page.getByTestId('feed').click();
  await page.getByTestId('buy-animal').click();
  await expect(page.getByTestId('habitat-meta')).toContainText('Animal feed: 0');
  await expect(page.getByTestId('no-feed')).toContainText('Feed Mill');
  await expect(page.getByTestId('no-feed')).toContainText('3 wheat');
  await page.getByTestId('feed').click();
  await expect(page.getByTestId('toast')).toContainText('No animal feed');
  expect(errors).toEqual([]);
});

test('a bigger farm: clear the land next to the island, build on it, and the next lot appears', async ({ page }) => {
  await page.addInitScript(() => {
    if (localStorage.getItem('stratos_farm_save_v1')) return;
    localStorage.setItem('stratos_farm_save_v1', JSON.stringify({
      version: 2, coins: 20000, gems: 5, xp: 0, level: 6, inventory: { flour: 20, bread: 20, cheese: 10 },
      plots: [], buildings: [], animals: [], jobs: [], nextId: 1, lastSeen: Date.now(), ledger: [], nextLedgerId: 1, idem: {}, idemOrder: [],
    }));
  });
  const errors = await openFarm(page);
  await page.getByTestId('tutorial-skip').click();
  // open sea is not a tile: tapping it selects nothing
  const sea = await tilePos(page, 3, 18);
  await page.mouse.click(sea.x, sea.y);
  await expect(page.getByTestId('tile-chip')).toHaveCount(0);
  // the lot east of the island is for sale; the one beyond it is not (yet)
  let p = await tilePos(page, 13, 1);
  await page.mouse.click(p.x, p.y);
  await expect(page.getByTestId('expansion-panel')).toContainText('Land lot');
  await page.getByTestId('expand-confirm').click();
  await expect(page.getByTestId('coins')).toContainText('19650'); // 350 coins
  await expect(page.getByTestId('toast')).toContainText('New land cleared');
  // rocks and trees came with the new land; pick a tile in it where none stands, then double-click a coop onto it
  const free = await page.evaluate(() => {
    const taken = new Set((window as any).__farm.obstacles().map((o: any) => `${o.gx},${o.gy}`));
    for (let x = 13; x < 16; x++) for (let y = 1; y < 3; y++) {
      // a coop needs this tile plus its right and lower neighbours (or a shifted fit): look for a free 2x2 inside the lot
      if (![[0, 0], [1, 0], [0, 1], [1, 1]].some(([dx, dy]) => taken.has(`${x + dx},${y + dy}`))) return { gx: x, gy: y };
    }
    return null;
  });
  expect(free).not.toBeNull();
  p = await tilePos(page, free!.gx, free!.gy);
  await page.mouse.click(p.x, p.y);
  await page.getByTestId('nav-animals').click();
  await page.getByTestId('shop-chicken_coop').dblclick();
  await expect(page.getByTestId('coins')).toContainText('19590');
  // clearing it revealed the next lot to the east (zoom out a little so it is on screen)
  for (let i = 0; i < 4; i++) await page.keyboard.press('-');
  p = await tilePos(page, 17, 1);
  await page.mouse.click(p.x, p.y);
  await expect(page.getByTestId('expansion-panel')).toBeVisible();
  await page.keyboard.press('Escape');
  // the map shows the bigger village, with the new building
  await page.getByTestId('nav-map').click();
  await expect(page.getByTestId('village-facts')).toContainText('1/29');
  await expect(page.getByTestId('map-expansion-lot_4_0')).toBeVisible();
  expect(errors).toEqual([]);
});

test('more to do on the land: clear a rock, buy decorations, turn a building around', async ({ page }) => {
  await page.addInitScript(() => {
    if (localStorage.getItem('stratos_farm_save_v1')) return;
    localStorage.setItem('stratos_farm_save_v1', JSON.stringify({
      version: 2, coins: 3000, gems: 5, xp: 0, level: 4, inventory: {},
      plots: [], buildings: [], animals: [], jobs: [], nextId: 1, lastSeen: Date.now(), ledger: [], nextLedgerId: 1, idem: {}, idemOrder: [],
    }));
  });
  const errors = await openFarm(page);
  await page.getByTestId('tutorial-skip').click();

  // the big rock at (10,10): tap it, see what it costs and gives, clear it
  let p = await tilePos(page, 10, 10);
  await page.mouse.click(p.x, p.y - 20);
  await expect(page.getByTestId('obstacle-panel')).toContainText('Big rock');
  await expect(page.getByTestId('obstacle-panel')).toContainText('Stone');
  await page.getByTestId('clear-confirm').click();
  await expect(page.getByTestId('coins')).toContainText('2960');
  await expect(page.getByTestId('obstacle-panel')).toHaveCount(0);
  await page.getByTestId('nav-inventory').click();
  await expect(page.getByTestId('inv-stone')).toContainText('Stone × 3');   // wood and stone show up as items you can sell
  await page.getByTestId('inventory-panel-close').click();
  // the tile is free now: a decoration fits right where the rock was (select it, double-click in the Decor tab)
  p = await tilePos(page, 10, 10);
  await page.mouse.click(p.x, p.y);
  await expect(page.getByTestId('tile-chip')).toContainText('Tile 10, 10');
  await page.getByTestId('nav-shop').click();
  await page.getByTestId('tab-decor').click();
  await page.getByTestId('shop-decor_bench').dblclick();
  await expect(page.getByTestId('coins')).toContainText('2935');

  // open the bench: turn it around, then it is mirrored (the panel offers Turn around)
  const b = await tilePos(page, 10, 10);
  await page.mouse.click(b.x, b.y - 10);
  await expect(page.getByTestId('building-panel')).toContainText('Garden bench');
  await page.getByTestId('rotate').click();
  await page.getByTestId('building-panel-close').click();
  const saved = await page.evaluate(() => JSON.parse(localStorage.getItem('stratos_farm_save_v1')!).buildings);
  expect(saved[0].flipped).toBe(true);

  // a new building can be turned before it is placed
  p = await tilePos(page, 0, 2);
  await page.mouse.click(p.x, p.y);
  await page.getByTestId('nav-animals').click();
  await page.getByTestId('shop-chicken_coop').click();
  await expect(page.getByTestId('placement-bar')).toBeVisible();
  await page.getByTestId('place-turn').click();
  await expect(page.getByTestId('place-turn')).toHaveAttribute('aria-pressed', 'true');
  await page.getByTestId('place-confirm').click();
  const saved2 = await page.evaluate(() => JSON.parse(localStorage.getItem('stratos_farm_save_v1')!).buildings);
  expect(saved2.find((x: any) => x.type === 'chicken_coop').flipped).toBe(true);

  // the map and the quest list know about all this
  await page.getByTestId('nav-map').click();
  await expect(page.getByTestId('village-facts')).toContainText('buildings');
  await page.keyboard.press('Escape');
  expect(errors).toEqual([]);
});

test('two flours queued together finish together (no waiting in line)', async ({ page }) => {
  await page.addInitScript(() => {
    if (localStorage.getItem('stratos_farm_save_v1')) return;
    localStorage.setItem('stratos_farm_save_v1', JSON.stringify({
      version: 2, coins: 3000, gems: 5, xp: 0, level: 2, inventory: { wheat: 9 },
      plots: [], buildings: [], animals: [], jobs: [], nextId: 1, lastSeen: Date.now(), ledger: [], nextLedgerId: 1, idem: {}, idemOrder: [],
    }));
  });
  await openFarm(page);
  await page.getByTestId('tutorial-skip').click();
  let p = await tilePos(page, 0, 5);
  await page.mouse.click(p.x, p.y);
  await page.getByTestId('nav-shop').click();
  await page.getByTestId('shop-flour_mill').dblclick();
  const q = await tilePos(page, 1, 6);
  await page.mouse.click(q.x, q.y - 50);
  await page.getByTestId('recipe-flour').click();
  await page.getByTestId('recipe-flour').click();
  const times = await page.locator('[data-testid^="job-"] small').allTextContents();
  expect(times).toHaveLength(2);
  expect(times[0]).toBe(times[1]);                       // the same time left on both
  await page.evaluate(() => (window as any).__farm.advance(301000));
  await expect(page.getByTestId('collect')).toContainText('(2)', { timeout: 5000 });
});

test('new crops and animals work in the game: seed list, horse stable, horse, feed', async ({ page }) => {
  await page.addInitScript(() => {
    if (localStorage.getItem('stratos_farm_save_v1')) return;
    localStorage.setItem('stratos_farm_save_v1', JSON.stringify({
      version: 2, coins: 5000, gems: 5, xp: 0, level: 13, inventory: {},
      plots: [], buildings: [], animals: [], jobs: [], nextId: 1, lastSeen: Date.now(), ledger: [], nextLedgerId: 1, idem: {}, idemOrder: [],
    }));
  });
  const errors = await openFarm(page);
  await page.getByTestId('tutorial-skip').click();
  // the seed list has all 16 crops, the four new ones included, and onion plants for 5 coins
  let p = await tilePos(page, 2, 6);
  await page.mouse.click(p.x, p.y);
  for (const id of ['onion', 'blueberry', 'peanut', 'lavender']) await expect(page.getByTestId(`seed-${id}`)).toBeVisible();
  await expect(page.locator('button[data-testid^="seed-"]:not([data-testid="seed-panel-close"])')).toHaveCount(16);
  await page.getByTestId('seed-onion').click();
  await expect(page.getByTestId('coins')).toContainText('4995');
  // the horse stable and the horse
  p = await tilePos(page, 0, 2);
  await page.mouse.click(p.x, p.y);
  await page.getByTestId('nav-animals').click();
  await expect(page.locator('button[data-testid^="shop-"]:not([data-testid="shop-panel-close"])')).toHaveCount(9); // nine animal homes
  await page.getByTestId('shop-horse_stable').dblclick();
  await expect(page.getByTestId('coins')).toContainText('4195');
  const body = await tilePos(page, 1, 3);
  await page.mouse.click(body.x, body.y - 50);
  await expect(page.getByTestId('building-panel')).toContainText('Horse Stable');
  await page.getByTestId('buy-animal').click();                      // 700 coins, and the first animal brings 3 feed
  await expect(page.getByTestId('habitat-meta')).toContainText('Animal feed: 3');
  await page.getByTestId('feed').click();
  await expect(page.getByTestId('habitat-meta')).toContainText('Animal feed: 2');
  await page.evaluate(() => (window as any).__farm.advance(3601000));
  await expect(page.getByTestId('collect')).toBeEnabled({ timeout: 5000 });
  await page.getByTestId('collect').click();
  await page.getByTestId('building-panel-close').click();
  await page.getByTestId('nav-inventory').click();
  await expect(page.getByTestId('inv-horsehair')).toContainText('Horsehair × 1');
  expect(errors).toEqual([]);
});

const seedSave = (coins: number) => ({
  version: 2, coins, gems: 5, xp: 0, level: 2, inventory: {},
  plots: [], buildings: [], animals: [], jobs: [], nextId: 1, lastSeen: Date.now(), ledger: [], nextLedgerId: 1, idem: {}, idemOrder: [],
});

test('planting mode: pick a seed once, then one tap per field plants it', async ({ page }) => {
  await page.addInitScript((save) => { if (!localStorage.getItem('stratos_farm_save_v1')) localStorage.setItem('stratos_farm_save_v1', JSON.stringify({ ...save, lastSeen: Date.now() })); }, seedSave(100));
  const errors = await openFarm(page);
  await page.getByTestId('tutorial-skip').click();
  const tap = async (gx: number, gy: number) => { const q = await tilePos(page, gx, gy); await page.mouse.click(q.x, q.y); };

  // the first field opens the seed list as before; choosing wheat plants it AND keeps planting mode on
  await tap(2, 6);
  await page.getByTestId('seed-wheat').click();
  await expect(page.getByTestId('coins')).toContainText('98');
  await expect(page.getByTestId('planting-bar')).toContainText('Planting Wheat');
  // now a single tap on each empty field plants wheat, with no seed list in between
  for (const [x, y] of [[3, 6], [2, 7], [3, 7]]) await tap(x, y);
  await expect(page.getByTestId('coins')).toContainText('92');            // 4 seeds x 2 coins
  await expect(page.getByTestId('seed-panel')).toHaveCount(0);
  const planted = await page.evaluate(() => JSON.parse(localStorage.getItem('stratos_farm_save_v1')!).plots.filter((p: any) => p.cropId === 'wheat').length);
  expect(planted).toBe(4);
  // tapping a growing field in planting mode only says how long it needs: no panel, no second seed
  await tap(3, 7);
  await expect(page.getByTestId('toast')).toContainText('ready in');
  await expect(page.getByTestId('plot-panel')).toHaveCount(0);
  await expect(page.getByTestId('coins')).toContainText('92');
  // change the seed without leaving the mode, then plant a carrot (4 coins) on another field
  await page.getByTestId('planting-change').click();
  await page.getByTestId('seed-carrot').click();
  await expect(page.getByTestId('planting-bar')).toContainText('Planting Carrot');
  await tap(7, 6);
  await expect(page.getByTestId('coins')).toContainText('88');
  // ripe wheat is still picked with a tap; the emptied field then takes the current seed (carrot, 4 coins) with one more tap
  await page.evaluate(() => (window as any).__farm.advance(121000));
  await expect(page.getByTestId('harvest-all')).toBeVisible({ timeout: 5000 });
  await tap(2, 6);
  await expect(page.getByTestId('coins')).toContainText('88');            // picking costs nothing
  await tap(2, 6);
  await expect(page.getByTestId('coins')).toContainText('84');
  // Done ends the mode: the next empty field opens the seed list again
  await page.getByTestId('planting-done').click();
  await expect(page.getByTestId('planting-bar')).toHaveCount(0);
  await tap(8, 6);
  await expect(page.getByTestId('seed-panel')).toBeVisible();
  expect(errors).toEqual([]);
});

test('planting mode stops by itself when the coins run out', async ({ page }) => {
  await page.addInitScript((save) => { if (!localStorage.getItem('stratos_farm_save_v1')) localStorage.setItem('stratos_farm_save_v1', JSON.stringify({ ...save, lastSeen: Date.now() })); }, seedSave(5));
  await openFarm(page);
  await page.getByTestId('tutorial-skip').click();
  const tap = async (gx: number, gy: number) => { const q = await tilePos(page, gx, gy); await page.mouse.click(q.x, q.y); };
  await tap(2, 6);
  await page.getByTestId('seed-wheat').click();                           // 5 -> 3
  await tap(3, 6);                                                        // 3 -> 1
  await expect(page.getByTestId('coins')).toContainText('1');
  await tap(2, 7);                                                        // 1 coin is not enough: says so and leaves planting mode
  await expect(page.getByTestId('toast')).toContainText('Not enough coins');
  await expect(page.getByTestId('planting-bar')).toHaveCount(0);
});

test('planting mode ends with Escape, and when another screen is opened', async ({ page }) => {
  await page.addInitScript((save) => { if (!localStorage.getItem('stratos_farm_save_v1')) localStorage.setItem('stratos_farm_save_v1', JSON.stringify({ ...save, lastSeen: Date.now() })); }, seedSave(100));
  await openFarm(page);
  await page.getByTestId('tutorial-skip').click();
  const tap = async (gx: number, gy: number) => { const q = await tilePos(page, gx, gy); await page.mouse.click(q.x, q.y); };
  await tap(2, 6);
  await page.getByTestId('seed-wheat').click();
  await expect(page.getByTestId('planting-bar')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByTestId('planting-bar')).toHaveCount(0);
  await tap(3, 6);
  await page.getByTestId('seed-wheat').click();
  await expect(page.getByTestId('planting-bar')).toBeVisible();
  await page.getByTestId('nav-inventory').click();                        // opening another screen ends it
  await expect(page.getByTestId('planting-bar')).toHaveCount(0);
});
