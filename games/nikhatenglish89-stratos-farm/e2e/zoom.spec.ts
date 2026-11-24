import { test, expect } from '@playwright/test';

test('zoom buttons zoom in and out', async ({ page }) => {
  test.setTimeout(90_000);
  await page.goto('/app.html?debug=1');
  await page.getByTestId('play').click({ timeout: 30000 });
  await expect(page.getByTestId('top-bar')).toBeVisible({ timeout: 30000 });
  await page.waitForTimeout(600);
  const z = () => page.evaluate(() => (window as any).__farm.zoom());
  const a = await z();
  await page.getByTestId('zoom-in').click(); await page.waitForTimeout(200);
  const b = await z();
  expect(b).toBeGreaterThan(a);
  await page.getByTestId('zoom-out').click(); await page.getByTestId('zoom-out').click(); await page.waitForTimeout(200);
  expect(await z()).toBeLessThan(b);
});

test('zoom and recenter buttons are on screen and do not cover the bottom bar', async ({ page }) => {
  test.setTimeout(90_000);
  await page.goto('/app.html?debug=1');
  await page.getByTestId('play').click({ timeout: 30000 });
  await expect(page.getByTestId('top-bar')).toBeVisible({ timeout: 30000 });
  const nav = (await page.getByTestId('bottom-nav').boundingBox())!;
  for (const id of ['zoom-in', 'zoom-out', 'recenter']) {
    const b = (await page.getByTestId(id).boundingBox())!;
    expect(b.x, id).toBeGreaterThan(0); expect(b.x + b.width, id).toBeLessThanOrEqual(1280);
    expect(b.y, id).toBeGreaterThan(70); expect(b.y + b.height, id).toBeLessThanOrEqual(nav.y);
  }
});
