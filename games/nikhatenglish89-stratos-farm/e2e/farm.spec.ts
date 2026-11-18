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
  await expect(page.getByTestId('nav-shop')).toHaveAttribute('aria-disabled', 'true');
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
