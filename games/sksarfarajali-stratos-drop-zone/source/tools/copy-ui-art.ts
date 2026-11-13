// Copies the game-ready UI art into public/ui/ (keeping the folder structure) and writes the ui asset manifest.
// Source folder: $UI_ART_DIR, or an Artifacts_GameReady folder next to the project. If none is found but public/ui is already there
// (committed to the repo), it does nothing and succeeds. It never reads from Artifacts/ (the raw originals) and never copies Image3.
import { copyFileSync, existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { basename, dirname, extname, join, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, '..');
const GROUPS = ['backgrounds', 'loading', 'cards', 'banners', 'social'];
const candidates = [
  process.env.UI_ART_DIR, resolve(root, '..', 'Artifacts_GameReady'), resolve(root, '..', '..', 'Artifacts_GameReady'),
  resolve(root, '..', '..', '..', '..', 'Artifacts_GameReady'), 'C:/Users/Public/Sarfaraj/Battle_Royale/Artifacts_GameReady',
].filter((p): p is string => !!p);
const source = candidates.find((p) => existsSync(join(p, 'asset_list.json')));
const out = join(root, 'public', 'ui');

function assertSafe(file: string) {
  const parts = resolve(file).split(sep);
  if (parts.includes('Artifacts')) throw new Error(`Refusing to copy from the raw Artifacts folder: ${file}`);
  if (/^image\d+/i.test(basename(file))) throw new Error(`Refusing to copy a raw source image (Image3 and friends are never used): ${file}`);
}
function walk(dir: string): string[] {
  return readdirSync(dir).flatMap((n) => { const p = join(dir, n); return statSync(p).isDirectory() ? walk(p) : [p]; });
}

if (!source) {
  if (existsSync(join(out, 'backgrounds'))) { console.log('copy-ui-art: no Artifacts_GameReady folder found, using the art already in public/ui'); process.exit(0); }
  console.error('copy-ui-art: Artifacts_GameReady not found. Set UI_ART_DIR to its path.'); process.exit(1);
}
let n = 0, bytes = 0;
for (const g of GROUPS) {
  const from = join(source, g); if (!existsSync(from)) { console.warn(`copy-ui-art: missing group ${g}`); continue; }
  for (const f of walk(from)) {
    assertSafe(f); const ext = extname(f).toLowerCase(); if (ext !== '.webp' && ext !== '.jpg') continue;
    const rel = f.slice(source.length + 1); const dest = join(out, rel); mkdirSync(dirname(dest), { recursive: true }); copyFileSync(f, dest); n++; bytes += statSync(f).size;
  }
}
mkdirSync(join(root, 'src', 'data'), { recursive: true });
const list = JSON.parse(readFileSync(join(source, 'asset_list.json'), 'utf8'));
writeFileSync(join(root, 'src', 'data', 'ui_assets.json'), JSON.stringify(list));
console.log(`copy-ui-art: copied ${n} files (${(bytes / 1048576).toFixed(1)} MB) from ${source} to public/ui, manifest has ${list.length} assets`);
