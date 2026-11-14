// UI art: the `ui` group of the asset manifest, plus small helpers. Every image has a .webp (used first) and a .jpg fallback.
import list from '../data/ui_assets.json';

export interface UiAsset { file: string; fallback: string; size: string; use: string; kb_webp: number; source: string }
/** Asset manifest, `ui` group. Generated from Artifacts_GameReady/asset_list.json by tools/copy-ui-art.ts. */
export const manifest = { ui: list as UiAsset[] };
const strip = (p: string) => p.replace(/\.(webp|jpg)$/, '');
export const uiNames = manifest.ui.map((a) => strip(a.file));
export const webp = (n: string) => `ui/${n}.webp`;
export const jpg = (n: string) => `ui/${n}.jpg`;
export const abs = (p: string) => new URL(p, document.baseURI).href;

/** Warm the cache for images a screen is about to need. Nothing else is fetched until it is shown. */
export function preloadUi(names: string[]) { for (const n of names) { const i = new Image(); i.decoding = 'async'; i.src = webp(n); } }

/** Picture with webp first and jpg as the fallback. Text is never baked into these images. Decorative by default (empty alt). */
export function Pic({ name, alt = '', cls, pos, lazy = true }: { name: string; alt?: string; cls?: string; pos?: string; lazy?: boolean }) {
  if (import.meta.env.DEV && !uiNames.includes(name)) console.warn('Unknown ui asset:', name);
  return (
    <picture class={cls}>
      <source srcset={webp(name)} type="image/webp" />
      <img src={jpg(name)} alt={alt} aria-hidden={alt ? undefined : 'true'} loading={lazy ? 'lazy' : 'eager'} decoding="async" draggable={false} style={pos ? `object-position:${pos}` : undefined} />
    </picture>
  );
}

/** Lobby background: the 1280 version on phones and the 1920 version on desktop. This is the only image preloaded (see index.html). */
export function LobbyBg() {
  const a = 'backgrounds/lobby_bg_1280', b = 'backgrounds/lobby_bg_1920';
  return (
    <picture class="bgpic kb">
      <source media="(max-width: 899px)" srcset={webp(a)} type="image/webp" />
      <source media="(max-width: 899px)" srcset={jpg(a)} type="image/jpeg" />
      <source srcset={webp(b)} type="image/webp" />
      <img src={jpg(b)} alt="" aria-hidden="true" decoding="async" draggable={false} />
    </picture>
  );
}

/** Sets --menu-bg, the blurred backdrop used behind Settings, Locker, Ranks, Missions and other panels. */
export function setupBackdrops() {
  const n = 'backgrounds/menu_bg_blur_1280';
  const ok = typeof CSS !== 'undefined' && CSS.supports('background-image', 'image-set(url("a.webp") type("image/webp"))');
  document.documentElement.style.setProperty('--menu-bg', ok ? `image-set(url("${abs(webp(n))}") type("image/webp"), url("${abs(jpg(n))}") type("image/jpeg"))` : `url("${abs(jpg(n))}")`);
}
