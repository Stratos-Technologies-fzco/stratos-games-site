import { describe, it, expect } from 'vitest';
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { gzipSync } from 'node:zlib';
import { join } from 'node:path';

// First-load budget from the project rules: under 5 MB, no atlas bigger than 2048 x 2048, music not part of the first load.
const root = process.cwd();
const size = (p: string) => statSync(join(root, p)).size;
const built = existsSync(join(root, 'index.html'));

describe('first load budget (built files)', () => {
  it.skipIf(!built)('everything needed for the first screen is under 5 MB', () => {
    const html = readFileSync(join(root, 'index.html'), 'utf8');
    const files = [...html.matchAll(/(?:src|href)="\.\/(build\/[^"]+)"/g)].map((m) => m[1]);
    expect(files.length).toBeGreaterThan(1);
    let total = size('index.html');
    let gz = 0;
    for (const f of files) { total += size(f); gz += gzipSync(readFileSync(join(root, f))).length; }
    const manifest = JSON.parse(readFileSync(join(root, 'assets/farm/asset-manifest.json'), 'utf8'));
    total += size('assets/farm/asset-manifest.json');
    for (const a of manifest.atlases) {
      total += size(a.image) + size(a.json);
      expect(a.size[0]).toBeLessThanOrEqual(2048);
      expect(a.size[1]).toBeLessThanOrEqual(2048);
    }
    for (const i of manifest.images) total += size(i.url);
    // eslint-disable-next-line no-console
    console.log(`FIRST LOAD ${(total / 1048576).toFixed(2)} MB raw, scripts and css ${(gz / 1024).toFixed(0)} KB gzipped`);
    expect(total).toBeLessThan(5 * 1048576);
  });
  it.skipIf(!built)('audio is not part of the first load (it only downloads when sound is turned on)', () => {
    expect(readFileSync(join(root, 'index.html'), 'utf8')).not.toMatch(/\.(ogg|mp3)/);
  });
  it.skipIf(!built)('no single file in the game folder is over 100 MB', () => {
    const walk = (d: string): number => readdirSync(join(root, d), { withFileTypes: true }).reduce((m, e) => {
      if (e.name === 'node_modules' || e.name === 'test-results') return m;
      const p = join(d, e.name);
      return Math.max(m, e.isDirectory() ? walk(p) : size(p));
    }, 0);
    expect(walk('.')).toBeLessThan(100 * 1048576);
  });
  it.skipIf(!built)('reports the events the site requires for a non-kids game (level_start, level_complete, Stratos)', () => {
    const text = readdirSync(join(root, 'build')).filter((x) => x.endsWith('.js')).map((f) => readFileSync(join(root, 'build', f), 'utf8')).join('\n');
    expect(text).toContain('level_start');
    expect(text).toContain('level_complete');
    expect(text).toContain('Stratos');
  });
  it.skipIf(!built)('no outside scripts or styles and no mobile ad IDs', () => {
    const html = readFileSync(join(root, 'index.html'), 'utf8');
    expect(html).not.toMatch(/<script[^>]+src="https?:/);
    expect(html).not.toMatch(/<link[^>]+href="https?:/);
    for (const f of readdirSync(join(root, 'build')).filter((x) => x.endsWith('.js'))) {
      expect(readFileSync(join(root, 'build', f), 'utf8')).not.toContain('ca-app-pub-');
    }
  });
});
