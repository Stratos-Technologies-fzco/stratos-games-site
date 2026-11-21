import { test, expect, Page } from '@playwright/test';

// Pop-ups dock on the left (low on a portrait phone) so the farm stays visible, and they never show a scroll bar.
async function openFarm(page: Page) {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  await page.goto('/app.html?debug=1');
  await page.getByTestId('play').click({ timeout: 30000 });
  await expect(page.getByTestId('top-bar')).toBeVisible({ timeout: 30000 });
  return errors;
}
const tilePos = (page: Page, gx: number, gy: number) => page.evaluate(([x, y]) => (window as any).__farm.tileClientPos(x, y), [gx, gy]);

const DOCK_SAVE = () => {
  const now = Date.now();
  const inv: Record<string, number> = {};
  for (const k of ['wheat', 'carrot', 'corn', 'onion', 'tomato', 'potato', 'egg', 'milk', 'flour', 'bread', 'cheese', 'sugar', 'wood', 'stone', 'animal_feed']) inv[k] = 5;
  return {
    version: 4, coins: 90000, gems: 5, xp: 40, level: 13, inventory: inv, plots: [],
    buildings: [
      { id: 'b1', type: 'chicken_coop', gx: 0, gy: 2, level: 3 }, { id: 'b2', type: 'bakery', gx: 0, gy: 5, level: 3 },
      { id: 'b3', type: 'feed_mill', gx: 5, gy: 8, level: 1 }, { id: 'b4', type: 'decor_bench', gx: 4, gy: 10, level: 1 },
    ],
    animals: Array.from({ length: 8 }, (_, i) => ({ id: `a${i}`, type: 'chicken', buildingId: 'b1', readyAt: i % 2 ? now + 60000 : null, hungrySince: i % 2 ? null : now, happiness: 100 })),
    jobs: [0, 1, 2, 3].map((i) => ({ id: `j${i}`, buildingId: 'b2', recipeId: 'bread', startAt: now, readyAt: now + 300000 + i * 1000 })),
    orders: [], orderCooldowns: {}, orderCounter: 5, expanded: [], clearedObstacles: [],
    stats: { order: 12, 'order:old_joe': 4, harvest: 40 }, claimed: [], daily: { day: -1, ids: [], base: {}, claimed: [] }, tutorialDone: true,
    nextId: 20, lastSeen: now, ledger: [], nextLedgerId: 1, idem: {}, idemOrder: [],
  };
};

async function expectDockedAndFitting(page: Page, label: string, portrait: boolean) {
  const m = await page.evaluate(() => {
    const panel = document.querySelector('.info-panel') as HTMLElement | null;
    if (!panel) return null;
    const r = panel.getBoundingClientRect();
    const fit = panel.querySelector('.panel-fit') as HTMLElement;
    const fr = fit.getBoundingClientRect();
    const top = (document.querySelector('[data-testid="top-bar"]') as HTMLElement).getBoundingClientRect();
    const nav = (document.querySelector('[data-testid="bottom-nav"]') as HTMLElement).getBoundingClientRect();
    let scrolls = 0;                                  // anything inside that is a scroll box that really scrolls?
    for (const el of Array.from(panel.querySelectorAll('*'))) {
      const st = getComputedStyle(el as HTMLElement);
      if (/(auto|scroll)/.test(st.overflowY) && (el as HTMLElement).scrollHeight > (el as HTMLElement).clientHeight + 1) scrolls++;
    }
    const cut = Array.from(panel.querySelectorAll('button, .row, .ribbon')).filter((el) => {
      const b = el.getBoundingClientRect();
      return b.height > 0 && (b.bottom > r.bottom + 1 || b.top < r.top - 1);
    }).length;
    return { left: r.left, right: r.right, top: r.top, bottom: r.bottom, w: innerWidth, h: innerHeight, topBarBottom: top.bottom, navTop: nav.top, fitBottom: fr.bottom, scrolls, cut };
  });
  expect(m, `${label}: no panel`).not.toBeNull();
  const x = m!;
  expect(x.scrolls, `${label}: has a scroll box`).toBe(0);
  expect(x.cut, `${label}: something is cut off`).toBe(0);
  expect(x.fitBottom, `${label}: content spills below the frame`).toBeLessThanOrEqual(x.bottom + 1);
  expect(x.top, `${label}: overlaps the top bar`).toBeGreaterThanOrEqual(x.topBarBottom - 1);
  expect(x.bottom, `${label}: overlaps the bottom buttons`).toBeLessThanOrEqual(x.navTop + 1);
  if (portrait) {
    expect(x.top, `${label}: a phone pop-up should leave the farm visible above it`).toBeGreaterThan(x.h * 0.3);
  } else {
    expect(x.left, `${label}: not on the left`).toBeLessThan(30);
    expect(x.right, `${label}: hides too much of the farm`).toBeLessThan(x.w * (x.h < 520 ? 0.7 : 0.58));
  }
}

for (const [w, h, portrait] of [[1280, 720, false], [1024, 600, false], [800, 450, false], [390, 844, true], [360, 640, true]] as const) {
  test(`every pop-up is docked, fits its window and has no scroll bar (${w}x${h})`, async ({ page }) => {
    test.setTimeout(150_000);                        // about 30 pop-up states per size, and the runner may be busy
    await page.setViewportSize({ width: w, height: h });
    await page.addInitScript((save) => { if (!localStorage.getItem('stratos_farm_save_v1')) localStorage.setItem('stratos_farm_save_v1', JSON.stringify(save)); }, DOCK_SAVE());
    const errors = await openFarm(page);
    const check = (label: string) => expectDockedAndFitting(page, `${w}x${h} ${label}`, portrait);
    const close = async () => { await page.keyboard.press('Escape'); await expect(page.locator('.info-panel')).toHaveCount(0); };
    const tap = async (gx: number, gy: number, dy = 0) => { const q = await tilePos(page, gx, gy); await page.mouse.click(q.x, q.y + dy); };
    await page.keyboard.press('r');

    await tap(2, 6); await expect(page.getByTestId('seed-panel')).toBeVisible(); await check('seed list'); await close();
    for (const tab of ['factories', 'habitats', 'decor']) {
      await page.getByTestId(tab === 'habitats' ? 'nav-animals' : 'nav-shop').click();
      await page.getByTestId(`tab-${tab}`).click();
      await check(`shop ${tab}`);
      await close();
    }
    await page.getByTestId('nav-market').click();
    await check('market orders');
    await page.getByTestId('tab-sell').click();
    await check('market sell');
    await close();
    await page.getByTestId('nav-inventory').click(); await check('inventory'); await close();
    await page.getByTestId('quests-btn').click();
    for (const t of ['daily', 'goals', 'achievements']) { await page.getByTestId(`qtab-${t}`).click(); await check(`quests ${t}`); }
    await close();
    await page.getByTestId('nav-map').click();
    for (const t of ['map', 'village', 'neighbours']) { await page.getByTestId(`maptab-${t}`).click(); await check(`map ${t}`); }
    await close();
    await page.getByTestId('settings').click(); await check('settings');
    await page.getByTestId('set-how').click();
    for (const t of ['steps', 'controls', 'coins']) { await page.getByTestId(`how-${t}`).click(); await check(`how to play ${t}`); }
    await close();
    await page.getByTestId('settings').click(); await page.getByRole('button', { name: 'About', exact: true }).click();
    for (const t of ['about', 'questions', 'credits']) { await page.getByTestId(`about-tab-${t}`).click(); await check(`about ${t}`); }
    await close();
    await page.getByTestId('settings').click(); await page.getByRole('button', { name: 'Tips', exact: true }).click(); await check('tips'); await close();
    // a full habitat (8 animals), a factory with a full queue, a decoration
    await page.evaluate(() => (window as any).__farm.openBuilding('b1')); await expect(page.getByTestId('building-panel')).toContainText('Chicken Coop'); await check('habitat'); await close();
    await page.evaluate(() => (window as any).__farm.openBuilding('b2')); await expect(page.getByTestId('building-panel')).toContainText('Bakery'); await check('factory'); await close();
    await page.evaluate(() => (window as any).__farm.openBuilding('b4')); await expect(page.getByTestId('building-panel')).toContainText('bench'); await check('decoration'); await close();
    expect(errors).toEqual([]);
  });
}
