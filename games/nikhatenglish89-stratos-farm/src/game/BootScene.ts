import Phaser from 'phaser';
import { MANIFEST_URL, Manifest, applyUiSkins, registerTextures } from './assets';
import { useFarm } from '../state/store';

/** Loads everything from asset-manifest.json (atlases first). Music is queued later by FarmScene. */
export class BootScene extends Phaser.Scene {
  constructor() { super('Boot'); }

  preload() {
    const store = useFarm.getState();
    this.load.on('progress', (p: number) => store.setProgress(p * 0.95));
    this.load.on('loaderror', (f: Phaser.Loader.File) => store.setLoadError(`Could not load ${f.key}`));
    this.load.json('manifest', MANIFEST_URL);
    this.load.once('filecomplete-json-manifest', () => {
      const m = this.cache.json.get('manifest') as Manifest;
      for (const a of m.atlases) this.load.atlas(a.key, a.image, a.json);
      for (const i of m.images) this.load.image(i.key, i.url);
    });
  }

  create() {
    registerTextures(this.textures);
    applyUiSkins();
    this.scene.start('Farm');
  }
}
