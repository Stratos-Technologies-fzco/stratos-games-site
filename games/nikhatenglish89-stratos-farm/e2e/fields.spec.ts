import { test, expect } from '@playwright/test';

test('buy a new field in the shop, carry it, plant on it', async ({ page }) => {
  test.setTimeout(120_000);
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  await page.addInitScript(() => {
    if (localStorage.getItem('stratos_farm_save_v1')) return;
    const now = Date.now();
    localStorage.setItem('stratos_farm_save_v1', JSON.stringify({
      version: 5, coins: 5000, gems: 5, xp: 40, level: 3, inventory: { wheat: 5 }, plots: [], buildings: [], animals: [], jobs: [],
      orders: [], orderCooldowns: {}, orderCounter: 5, expanded: [], clearedObstacles: [], moved: {}, stats: {}, claimed: [],
      daily: { day: -1, ids: [], base: {}, claimed: [] }, tutorialDone: true, nextId: 9, lastSeen: now, ledger: [], nextLedgerId: 1, idem: {}, idemOrder: [],
    }));
  });
  await page.goto('/app.html?debug=1');
  await page.getByTestId('play').click({ timeout: 30000 });
  await expect(page.getByTestId('top-bar')).toBeVisible({ timeout: 30000 });
  await page.getByTestId('nav-shop').click();
  await page.getByTestId('tab-fields').click();
  await expect(page.getByTestId('buy-field')).toContainText('30');
  await page.getByTestId('buy-field').click();
  await expect(page.getByTestId('placement-bar')).toContainText('Tap a new spot');
  const m = await page.evaluate(() => (window as any).__farm.moved());
  expect(m.field_d).toBeTruthy();
  await page.getByTestId('place-cancel').click();                   // keep it where it landed
  expect(await page.evaluate(() => (window as any).__farm.plot(`${(window as any).__farm.moved().field_d.gx},${(window as any).__farm.moved().field_d.gy}`))).not.toBeNull();
  // plant on it
  const q = await page.evaluate(() => { const f = (window as any).__farm; const d = f.moved().field_d; return f.tileClientPos(d.gx, d.gy); });
  await page.mouse.click(q.x, q.y); await page.waitForTimeout(300);
  await page.getByTestId('seed-wheat').click();
  await page.waitForTimeout(300);
  const d = await page.evaluate(() => (window as any).__farm.moved().field_d);
  expect(await page.evaluate((id) => (window as any).__farm.plot(id)?.cropId, `${d.gx},${d.gy}`)).toBe('wheat');
  expect(errors).toEqual([]);
});

test('the map shows a bought field where it stands', async ({ page }) => {
  test.setTimeout(90_000);
  await page.addInitScript(() => {
    if (localStorage.getItem('stratos_farm_save_v1')) return;
    const now = Date.now();
    localStorage.setItem('stratos_farm_save_v1', JSON.stringify({
      version: 5, coins: 5000, gems: 5, xp: 40, level: 3, inventory: {}, plots: [], buildings: [], animals: [], jobs: [],
      orders: [], orderCooldowns: {}, orderCounter: 5, expanded: [], clearedObstacles: [], moved: { field_a: { gx: 0, gy: 0 }, field_d: { gx: 9, gy: 11 } }, stats: {}, claimed: [],
      daily: { day: -1, ids: [], base: {}, claimed: [] }, tutorialDone: true, nextId: 9, lastSeen: now, ledger: [], nextLedgerId: 1, idem: {}, idemOrder: [],
    }));
  });
  await page.goto('/app.html?debug=1');
  await page.getByTestId('play').click({ timeout: 30000 });
  await expect(page.getByTestId('top-bar')).toBeVisible({ timeout: 30000 });
  await page.getByTestId('nav-map').click();
  const fills = async (gx: number, gy: number) => page.evaluate(([x, y]) => {
    const r = [...document.querySelectorAll('[data-testid=minimap] rect')].filter((e) => Math.abs(+e.getAttribute('x')! - 0) >= 0);
    const cell = +(document.querySelector('[data-testid=minimap] rect')!.getAttribute('width')!);
    const hit = r.find((e) => +e.getAttribute('x')! === x * cell && +e.getAttribute('y')! === y * cell);
    return hit?.getAttribute('fill') ?? null;
  }, [gx, gy]);
  const soil = await fills(7, 6);              // a field nobody moved
  expect(await fills(0, 0)).toBe(soil);        // the moved field's soil is drawn at its new spot
  expect(await fills(2, 6)).not.toBe(soil);    // and its old spot is grass again
  expect(await fills(9, 11)).toBe(soil);       // the bought plot is on the map too
});

test('a locked land tile says "locked land" and no tile numbers', async ({ page }) => {
  test.setTimeout(90_000);
  await page.goto('/app.html?debug=1');
  await page.getByTestId('play').click({ timeout: 30000 });
  await expect(page.getByTestId('top-bar')).toBeVisible({ timeout: 30000 });
  await page.waitForTimeout(600);
  // the lots for sale start right of the island: tap tiles there until one answers
  let found = false;
  for (const [gx, gy] of [[12, 5], [12, 6], [12, 4], [13, 5], [12, 7], [13, 9], [12, 9]]) {
    const q = await page.evaluate(([x, y]) => (window as any).__farm.tileClientPos(x, y), [gx, gy]);
    if (q.x < 0 || q.x > 1270 || q.y < 80 || q.y > 640) continue;
    await page.mouse.click(q.x, q.y); await page.waitForTimeout(300);
    if (await page.getByTestId('tile-chip').count()) { found = true; break; }
  }
  expect(found).toBe(true);
  await expect(page.getByTestId('tile-chip')).toHaveText(/^locked land$/i);
  expect(await page.getByTestId('tile-chip').innerText()).not.toMatch(/\d/);
});
