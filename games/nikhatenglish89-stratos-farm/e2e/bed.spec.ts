import { test, expect, Page } from '@playwright/test';

async function open(page: Page) {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  await page.addInitScript(() => {
    if (localStorage.getItem('stratos_farm_save_v1')) return;
    const now = Date.now();
    localStorage.setItem('stratos_farm_save_v1', JSON.stringify({
      version: 5, coins: 5000, gems: 5, xp: 40, level: 6, inventory: {}, plots: [], buildings: [], animals: [], jobs: [],
      orders: [], orderCooldowns: {}, orderCounter: 5, expanded: [], clearedObstacles: [], moved: {}, stats: {}, claimed: [],
      daily: { day: -1, ids: [], base: {}, claimed: [] }, tutorialDone: true, nextId: 9, lastSeen: now, ledger: [], nextLedgerId: 1, idem: {}, idemOrder: [],
    }));
  });
  await page.goto('/app.html?debug=1');
  await page.getByTestId('play').click({ timeout: 30000 });
  await expect(page.getByTestId('top-bar')).toBeVisible({ timeout: 30000 });
  await page.waitForTimeout(600);
  return errors;
}
const plant = async (page: Page, gx: number, gy: number, crop: string) => {
  const q = await page.evaluate(([x, y]) => (window as any).__farm.tileClientPos(x, y), [gx, gy]);
  await page.mouse.click(q.x, q.y); await page.waitForTimeout(250);
  await page.getByTestId(`seed-${crop}`).click(); await page.waitForTimeout(350);
  await page.getByTestId('planting-done').click().catch(() => {});
};
const tile = (page: Page, gx: number, gy: number) => page.evaluate(([x, y]) => (window as any).__farm.tileFrame(x, y), [gx, gy]);
const crop = (page: Page, id: string) => page.evaluate((i) => (window as any).__farm.crop(i), id);

test('a tomato bed replaces the soil under it; other crops keep their soil', async ({ page }) => {
  test.setTimeout(120_000);
  const errors = await open(page);
  expect(await tile(page, 2, 6)).toBe('field_plowed');
  await plant(page, 2, 6, 'tomato');
  expect(await tile(page, 2, 6)).toMatch(/^grass/);                      // the bed picture is the soil now
  const c = await crop(page, '2,6');
  expect(c.frame).toBe('tomato_0');                                      // the stage the server returns, nothing else
  expect(c.scale).toBe(1);                                               // whole bed, full size
  await plant(page, 7, 6, 'wheat');
  expect(await tile(page, 7, 6)).toBe('field_plowed');                  // other crops are untouched
  expect((await crop(page, '7,6')).frame).toBe('wheat_1');
  expect(await tile(page, 3, 6)).toBe('field_plowed');                  // the next plot is still plain soil

  // it grows through the stages, and the soil comes back when it is picked
  await page.evaluate(() => (window as any).__farm.advance(1_300_000));
  await page.waitForTimeout(300);
  expect((await crop(page, '2,6')).frame).toBe('tomato_3');
  const q = await page.evaluate(() => (window as any).__farm.tileClientPos(2, 6));
  await page.mouse.click(q.x, q.y); await page.waitForTimeout(500);
  expect(await crop(page, '2,6')).toBeNull();
  expect(await tile(page, 2, 6)).toBe('field_plowed');
  expect(errors).toEqual([]);
});

test('a bed keeps its place in the draw order and the bed survives moving the field', async ({ page }) => {
  test.setTimeout(120_000);
  await open(page);
  await plant(page, 2, 6, 'tomato');
  const a = await crop(page, '2,6');
  // a plot further down the screen (bigger gx+gy) is drawn later, i.e. in front, like every other crop
  await plant(page, 3, 7, 'tomato');
  expect((await crop(page, '3,7')).depth).toBeGreaterThan(a.depth);
  expect(a.frame).toBe('tomato_0');
  // pick the field up and put it somewhere else: the bed goes with it and the old spot is plain land
  const q = await page.evaluate(() => (window as any).__farm.tileClientPos(2, 6));
  await page.mouse.click(q.x, q.y); await page.waitForTimeout(300);
  await page.getByTestId('move-field').click();
  const t = await page.evaluate(() => (window as any).__farm.tileClientPos(0, 5));
  await page.mouse.click(t.x, t.y); await page.waitForTimeout(300);
  await page.getByTestId('place-confirm').click();
  await expect.poll(() => page.evaluate(() => (window as any).__farm.moved())).toMatchObject({ field_a: { gx: 0, gy: 5 } });
  await page.waitForTimeout(400);
  expect(await tile(page, 0, 5)).toMatch(/^grass/);
  expect((await crop(page, '0,5')).frame).toBe('tomato_0');
  expect(await tile(page, 2, 6)).not.toBe('field_plowed');
});
