import { test, expect, Page } from '@playwright/test';

const SAVE = () => {
  const now = Date.now();
  return {
    version: 4, coins: 5000, gems: 5, xp: 40, level: 13, inventory: { wheat: 5 }, plots: [], buildings: [], animals: [], jobs: [],
    orders: [], orderCooldowns: {}, orderCounter: 5, expanded: [], clearedObstacles: [], stats: {}, claimed: [],
    daily: { day: -1, ids: [], base: {}, claimed: [] }, tutorialDone: true, nextId: 9, lastSeen: now, ledger: [], nextLedgerId: 1, idem: {}, idemOrder: [],
  };
};
async function openFarm(page: Page) {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  await page.addInitScript((save) => { if (!localStorage.getItem('stratos_farm_save_v1')) localStorage.setItem('stratos_farm_save_v1', JSON.stringify(save)); }, SAVE());
  await page.goto('/app.html?debug=1');
  await page.getByTestId('play').click({ timeout: 30000 });
  await expect(page.getByTestId('top-bar')).toBeVisible({ timeout: 30000 });
  await page.waitForTimeout(600);
  return errors;
}
const tap = async (page: Page, gx: number, gy: number, dy = 0) => {
  const q = await page.evaluate(([x, y]) => (window as any).__farm.tileClientPos(x, y), [gx, gy]);
  await page.mouse.click(q.x, q.y + dy); await page.waitForTimeout(250);
};
const moved = (page: Page) => page.evaluate(() => (window as any).__farm.moved());

test('move a field with its crops, a lamp post and a rock; it all survives a reload', async ({ page }) => {
  test.setTimeout(120_000);
  const errors = await openFarm(page);

  // plant, then pick the whole field up (from the panel of a growing crop)
  await tap(page, 2, 6);
  await page.getByTestId('seed-wheat').click();
  await page.getByTestId('planting-done').click().catch(() => {});
  await tap(page, 2, 6);
  await expect(page.getByTestId('plot-panel')).toBeVisible();
  await page.getByTestId('move-field').click();
  await expect(page.getByTestId('placement-bar')).toContainText('Tap a new spot');
  await tap(page, 3, 5);                                        // overlaps the path, the lamp post and the scarecrow's neighbour: not allowed to be confirmed if blocked
  await tap(page, 0, 5);
  await expect(page.getByTestId('placement-bar')).toContainText('Looks good');
  await page.getByTestId('place-confirm').click();
  await expect.poll(() => moved(page)).toMatchObject({ field_a: { gx: 0, gy: 5 } });
  expect(await page.evaluate(() => (window as any).__farm.plot('0,5')?.cropId)).toBe('wheat');
  expect(await page.evaluate(() => (window as any).__farm.plot('2,6'))).toBeNull();

  // a lamp post: tap it, move it
  await tap(page, 4, 5, -30);
  await expect(page.getByTestId('object-panel')).toContainText('Lamp post');
  await page.getByTestId('move-object').click();
  await tap(page, 1, 0);
  await page.getByTestId('place-confirm').click();
  await expect.poll(() => moved(page)).toMatchObject({ lamp: { gx: 1, gy: 0 } });

  // blocked spots say so and cannot be confirmed
  await tap(page, 6, 4, -30);                                    // the well
  await page.getByTestId('move-object').click();
  await tap(page, 10, 4);                                        // the pond
  await expect(page.getByTestId('placement-bar')).toContainText('locked or water');
  await expect(page.getByTestId('place-confirm')).toBeDisabled();
  await page.getByTestId('place-cancel').click();
  expect(await moved(page)).not.toHaveProperty('well');

  // a bush and a pine tree move too; its own spot is refused with a reason
  await tap(page, 0, 8, -20);
  await page.getByTestId('move-object').click();
  await tap(page, 0, 8);
  await expect(page.getByTestId('placement-bar')).toContainText('already stands here');
  await tap(page, 2, 3);
  await page.getByTestId('place-confirm').click();
  await tap(page, 11, 1, -20);
  await page.getByTestId('move-object').click();
  await tap(page, 6, 2);
  await page.getByTestId('place-confirm').click();
  await expect.poll(() => moved(page)).toMatchObject({ bush_1: { gx: 2, gy: 3 }, tree_pine_1: { gx: 6, gy: 2 } });

  // a rock keeps its Clear option and gains Move
  await tap(page, 10, 10, -10);
  await expect(page.getByTestId('obstacle-panel')).toBeVisible();
  await page.getByTestId('move-object').click();
  await tap(page, 1, 2);
  await page.getByTestId('place-confirm').click();
  await expect.poll(() => moved(page)).toMatchObject({ rock_1: { gx: 1, gy: 2 } });

  // Escape while moving cancels and leaves things where they were
  await tap(page, 4, 7, -30);                                    // scarecrow
  await page.getByTestId('move-object').click();
  await tap(page, 2, 2);
  await page.keyboard.press('Escape');
  await expect(page.getByTestId('placement-bar')).toHaveCount(0);
  expect(await moved(page)).not.toHaveProperty('scarecrow');

  // reload: everything stays where it was put
  await page.reload();
  await page.getByTestId('play').click();
  await expect(page.getByTestId('top-bar')).toBeVisible();
  await page.waitForTimeout(600);
  expect(await moved(page)).toMatchObject({ field_a: { gx: 0, gy: 5 }, lamp: { gx: 1, gy: 0 }, rock_1: { gx: 1, gy: 2 } });
  expect(await page.evaluate(() => (window as any).__farm.plot('0,5')?.cropId)).toBe('wheat');
  expect(errors).toEqual([]);
});
