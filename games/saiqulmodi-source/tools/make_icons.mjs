// App icons for Jet vs Missile from the game's emblem (src/ui/Logo.ts, emblemSvg(false): no words).
// Renders the vector emblem with headless Chrome straight at each size (sharp at 180 / 192 / 512).
//   any       : emblem on transparent corners          -> public/icons/icon-192.png, icon-512.png
//   maskable  : full-bleed night sky, emblem at 80 %    -> public/icons/icon-maskable-512.png (Android safe zone)
//   apple     : full-bleed night sky, emblem at 92 %    -> public/icons/apple-touch-icon.png (iOS has no transparency)
// Run from web/:  node tools/make_icons.mjs   (replaces the older Pillow drawing in tools/make_icons.py)
import { build } from 'esbuild';
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const web = resolve(here, '..');
const out = join(here, '.out');
mkdirSync(out, { recursive: true });

await build({ entryPoints: [join(web, 'src/ui/Logo.ts')], bundle: true, format: 'esm', platform: 'node', outfile: join(out, 'logo.mjs'), logLevel: 'warning' });
const { emblemSvg } = await import(pathToFileURL(join(out, 'logo.mjs')).href + `?t=${Date.now()}`);
const svg = emblemSvg(false).trim();
writeFileSync(join(out, 'emblem.svg'), svg);

const chrome = [
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
].find((p) => existsSync(p));
if (!chrome) throw new Error('Chrome / Edge not found');

function render(name, size, scale, background) {
  const inner = Math.round(size * scale);
  const html = `<!doctype html><html><head><style>
    html,body{margin:0;width:${size}px;height:${size}px;overflow:hidden;background:${background};}
    body{display:flex;align-items:center;justify-content:center;}
    svg{width:${inner}px;height:${inner}px;display:block;}
  </style></head><body>${svg}</body></html>`;
  const page = join(out, `${name}.html`);
  writeFileSync(page, html);
  const target = join(web, 'public/icons', `${name}.png`);
  execFileSync(chrome, [
    '--headless=new', '--disable-gpu', '--hide-scrollbars', '--force-device-scale-factor=1',
    '--default-background-color=00000000', `--window-size=${size},${size}`, `--screenshot=${target}`,
    pathToFileURL(page).href,
  ], { stdio: 'ignore' });
  console.log('wrote', target);
}

const NIGHT = 'radial-gradient(circle at 50% 62%, #3a1a5e 0%, #12123c 55%, #050716 100%)';
render('icon-512', 512, 1, 'transparent');
render('icon-192', 192, 1, 'transparent');
render('icon-maskable-512', 512, 0.8, NIGHT);
render('apple-touch-icon', 180, 0.92, NIGHT);
