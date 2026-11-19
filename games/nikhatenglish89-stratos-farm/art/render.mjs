// Renders every SVG in jobs.json to a transparent PNG with Chromium (instead of rsvg-convert). Run from the game folder: node art/render.mjs
import { chromium } from '@playwright/test';
import { readFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const jobs = JSON.parse(readFileSync(resolve(here, 'jobs.json'), 'utf8'));
const browser = await chromium.launch();
const page = await browser.newPage({ deviceScaleFactor: 1 });
let n = 0;
for (const j of jobs) {
  const svg = readFileSync(resolve(here, j.svg));
  await page.setViewportSize({ width: j.w, height: j.h });
  await page.setContent(`<html><body style="margin:0;background:transparent"><img id="i" width="${j.w}" height="${j.h}" src="data:image/svg+xml;base64,${svg.toString('base64')}"></body></html>`);
  await page.evaluate(() => document.getElementById('i').decode());
  const out = resolve(here, j.png);
  mkdirSync(dirname(out), { recursive: true });
  await page.screenshot({ path: out, omitBackground: true, clip: { x: 0, y: 0, width: j.w, height: j.h } });
  n++;
}
await browser.close();
console.log(n, 'PNGs written');
