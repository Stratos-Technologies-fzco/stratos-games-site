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
  return errors;
}

test('only one big screen is open at a time, and the Farm button shows the farm', async ({ page }) => {
  test.setTimeout(90_000);
  const errors = await openFarm(page);
  const panels = page.locator('.info-panel');
  await page.getByTestId('nav-map').click();
  await expect(page.getByTestId('minimap')).toBeVisible();
  await page.getByTestId('quests-btn').click();                       // the reported bug: the map stayed open underneath
  await expect(panels).toHaveCount(1);
  await expect(page.getByTestId('minimap')).toHaveCount(0);
  await page.getByTestId('nav-shop').click();
  await expect(panels).toHaveCount(1);
  await page.getByTestId('nav-market').click();
  await expect(panels).toHaveCount(1);
  await page.getByTestId('nav-inventory').click();
  await expect(panels).toHaveCount(1);
  await page.getByTestId('nav-map').click();
  await expect(panels).toHaveCount(1);
  await page.getByTestId('nav-farm').click();                         // Farm: everything closes
  await expect(panels).toHaveCount(0);
  expect(errors).toEqual([]);
});
