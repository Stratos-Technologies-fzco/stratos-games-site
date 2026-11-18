import { test, expect, Page } from '@playwright/test';

async function openFarm(page: Page) {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  await page.goto('/app.html?debug=1');
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
  await expect(page.getByTestId('nav-map')).toHaveAttribute('aria-disabled', 'true');
  expect(errors).toEqual([]);
});

test('a tile can be selected', async ({ page }) => {
  await openFarm(page);
  const p = await tilePos(page, 4, 10);
  await page.mouse.click(p.x, p.y);
  await expect(page.getByTestId('tile-chip')).toContainText('Tile 4, 10');
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
  await expect(page.getByTestId('coins')).toContainText('98');
  await expect(page.getByTestId('seed-panel')).toHaveCount(0);
  // not ready yet: tapping shows the countdown instead of harvesting
  p = await tilePos(page, 2, 6);
  await page.mouse.click(p.x, p.y);
  await expect(page.getByTestId('toast')).toContainText('ready in');
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
  await expect(page.getByTestId('top-bar')).toBeVisible({ timeout: 30000 });
  await expect(page.getByTestId('coins')).toContainText('98');
  await page.getByTestId('nav-inventory').click();
  await expect(page.getByTestId('inv-wheat')).toContainText('Wheat × 2');
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
  await expect(page.getByTestId('habitat-meta')).toContainText('Animal feed: 2');
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
  await page.getByTestId('sell1-wheat').click();
  await page.getByTestId('tab-orders').click();
  await page.getByTestId('deliver-0').click();
  await page.getByTestId('market-panel-close').click();
  await page.getByTestId('tutorial-claim').click(); // step 3 (sold something)
  await expect(banner).toContainText('Step 4 of 5');
  // coop + chicken
  await page.getByTestId('nav-animals').click();
  await page.getByTestId('shop-chicken_coop').click();
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
