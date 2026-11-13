import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { beforeEach, describe, expect, it } from 'vitest';
import B from '../balance.json';
import tips from '../data/tips.json';
import assets from '../data/ui_assets.json';

const store = new Map<string, string>();
(globalThis as unknown as { localStorage: Storage }).localStorage = { getItem: (k: string) => store.get(k) ?? null, setItem: (k: string, v: string) => void store.set(k, v), removeItem: (k: string) => void store.delete(k), clear: () => store.clear(), key: () => null, length: 0 };
const { pickLoading } = await import('./Matchmaking');
const { OUTFITS, currentOutfit, isUnlocked } = await import('./outfits');
const { setOutfit } = await import('../progress');
const publicUi = resolve(__dirname, '../../public/ui');
beforeEach(() => store.clear());

describe('ui art manifest', () => {
  it('lists 30 assets, each with a webp and a jpg fallback on disk', () => {
    expect(assets.length).toBe(30);
    for (const a of assets) { expect(existsSync(join(publicUi, a.file)), a.file).toBe(true); expect(existsSync(join(publicUi, a.fallback)), a.fallback).toBe(true); }
  });
  it('never includes a raw source image (Image3 in particular)', () => {
    const all = (d: string): string[] => readdirSync(d).flatMap((n) => (statSync(join(d, n)).isDirectory() ? all(join(d, n)) : [join(d, n)]));
    for (const f of all(publicUi)) expect(/image\d+/i.test(f), f).toBe(false);
    expect(JSON.stringify(assets).toLowerCase()).not.toContain('image3');
  });
  it('keeps the first load small: the preloaded lobby backgrounds are under 250 KB each', () => {
    for (const n of ['lobby_bg_1280.webp', 'lobby_bg_1920.webp']) expect(statSync(join(publicUi, 'backgrounds', n)).size).toBeLessThan(250 * 1024);
  });
  it('has the share image base and the generated og-image', () => {
    expect(existsSync(join(publicUi, 'social/og_base_1200x630.webp'))).toBe(true); expect(existsSync(resolve(__dirname, '../../public/og-image.png'))).toBe(true);
  });
  it('index.html preloads only the lobby background and has og and twitter tags', () => {
    const html = readFileSync(resolve(__dirname, '../../index.html'), 'utf8');
    expect(html.match(/rel="preload"/g)?.length).toBe(2); expect(html).toContain('lobby_bg_1280.webp'); expect(html).toContain('lobby_bg_1920.webp');
    for (const t of ['og:title', 'og:image', 'og:description', 'twitter:card', 'twitter:image']) expect(html).toContain(t);
  });
});

describe('loading screens', () => {
  it('maps all six images to a location and a loot tier', () => {
    expect(Object.keys(tips.images)).toHaveLength(6);
    expect(tips.images.loading_01_salt_docks.name).toBe('Salt Docks'); expect(tips.images.loading_02_harbour_dusk.name).toBe('Harbour Road');
    expect(tips.images.loading_03_radar_outpost.name).toBe('Radar Ridge'); expect(tips.images.loading_04_monsoon_rain.name).toBe('Monsoon Dam');
    expect(tips.images.loading_05_perimeter_watch.name).toBe('Radar Ridge'); expect((tips.images.loading_06_firefight as { random?: boolean }).random).toBe(true);
    for (const k of Object.keys(tips.images)) expect(assets.some((a) => a.file === `loading/${k}.webp`), k).toBe(true);
  });
  it('never shows the same image twice in a row', () => {
    let last = -1; for (let i = 0; i < 300; i++) { const p = pickLoading(); expect(p.index).not.toBe(last); last = p.index; }
  });
  it('picks a random location for image 06', () => {
    const names = new Set<string>(); for (let i = 0; i < 400; i++) { const p = pickLoading(); if (p.image.endsWith('06_firefight')) names.add(p.name); } expect(names.size).toBeGreaterThan(2);
  });
  it('has at least 8 tips, each short', () => { expect(tips.tips.length).toBeGreaterThanOrEqual(8); for (const t of tips.tips) expect(t.length).toBeLessThan(100); });
});

describe('locker outfits', () => {
  it('takes the unlock levels from balance.json', () => {
    const chrome = OUTFITS.find((o) => o.id === 'chrome_vanguard')!, ember = OUTFITS.find((o) => o.id === 'ember_vanguard')!;
    expect(chrome.unlockLevel).toBe(B.outfits.chrome_vanguard.unlockLevel); expect(chrome.unlockLevel).toBe(10); expect(chrome.rarityName).toBe('LEGENDARY'); expect(chrome.color).toBe('#FFB020');
    expect(ember.unlockLevel).toBe(5); expect(ember.rarityName).toBe('EPIC'); expect(ember.color).toBe('#A78BFA');
  });
  it('offers the four survivors by default, and every image exists', () => {
    expect(OUTFITS.filter((o) => o.kind === 'survivor')).toHaveLength(4);
    for (const o of OUTFITS.filter((x) => x.kind === 'vanguard')) for (const f of o.frames) { expect(existsSync(resolve(__dirname, '../../public', f.src)), f.src).toBe(true); expect(existsSync(resolve(__dirname, '../../public', f.webp!)), f.webp).toBe(true); }
    expect(OUTFITS.find((o) => o.id === 'chrome_vanguard')!.frames).toHaveLength(3);
  });
  it('locks Vanguard outfits below their level and never equips a locked one', () => {
    const chrome = OUTFITS.find((o) => o.id === 'chrome_vanguard')!;
    expect(isUnlocked(chrome, 9)).toBe(false); expect(isUnlocked(chrome, 10)).toBe(true);
    setOutfit('chrome_vanguard'); expect(currentOutfit(3).id).toBe('survivor_kiran'); expect(currentOutfit(10).id).toBe('chrome_vanguard');
  });
  it('saves the equipped outfit in the profile', () => { setOutfit('ember_vanguard'); expect(currentOutfit(7).id).toBe('ember_vanguard'); localStorage.setItem('sdz-sv', 'survivor_meera'); setOutfit('survivor_meera'); expect(currentOutfit(1).id).toBe('survivor_meera'); });
});
