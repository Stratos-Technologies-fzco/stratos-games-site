import Phaser from 'phaser';

export interface Manifest {
  version: number;
  tile: { w: number; h: number };
  atlases: { key: string; image: string; json: string }[];
  images: { key: string; url: string }[];
  audio: {
    music: { key: string; urls: string[]; loop: boolean }[];
    sfx: { key: string; urls: string[]; loop: boolean }[];
  };
}

export const MANIFEST_URL = 'assets/farm/asset-manifest.json';

let textures: Phaser.Textures.TextureManager | null = null;
const urlCache = new Map<string, string>();

/** Called once the atlases are loaded so React can cut frames out of them. */
export function registerTextures(tm: Phaser.Textures.TextureManager) { textures = tm; }

/** Data URL of one atlas frame (cached). Used by React for icons and UI skins; never guesses frame names. */
export function frameUrl(atlas: string, name: string): string {
  const k = `${atlas}/${name}`;
  const hit = urlCache.get(k);
  if (hit) return hit;
  if (!textures) return '';
  const frame = textures.getFrame(atlas, name);
  if (!frame || frame.name === '__BASE') { console.warn(`[assets] missing frame ${k}`); return ''; }
  const canvas = document.createElement('canvas');
  canvas.width = frame.cutWidth; canvas.height = frame.cutHeight;
  canvas.getContext('2d')!.drawImage(frame.source.image as CanvasImageSource, frame.cutX, frame.cutY, frame.cutWidth, frame.cutHeight, 0, 0, frame.cutWidth, frame.cutHeight);
  const url = canvas.toDataURL('image/png');
  urlCache.set(k, url);
  return url;
}

/** UI frames used as CSS skins (set as custom properties on :root once). */
const SKINS: [string, string, string][] = [
  ['--skin-panel', 'atlas_ui_fx', 'panel'],
  ['--skin-hud-pill', 'atlas_ui_fx', 'hud_pill'],
  ['--skin-top-bar', 'atlas_ui_fx', 'top_bar'],
  ['--skin-bottom-nav', 'atlas_ui_fx', 'bottom_nav'],
  ['--skin-btn-green', 'atlas_ui_fx', 'button_green'],
  ['--skin-btn-disabled', 'atlas_ui_fx', 'button_disabled'],
  ['--skin-btn-round', 'atlas_ui_fx', 'button_round'],
  ['--skin-ribbon', 'atlas_ui_fx', 'ribbon_header'],
  ['--skin-toast', 'atlas_ui_fx', 'toast'],
  ['--skin-avatar', 'atlas_ui_fx', 'avatar_frame'],
  ['--skin-bar-bg', 'atlas_ui_fx', 'progress_bg'],
  ['--skin-bar-fill', 'atlas_ui_fx', 'progress_fill_green'],
  ['--skin-soon', 'atlas_ui_fx', 'coming_soon_tag'],
];

export function applyUiSkins() {
  const root = document.documentElement;
  for (const [prop, atlas, name] of SKINS) {
    const u = frameUrl(atlas, name);
    if (u) root.style.setProperty(prop, `url(${u})`);
  }
}
