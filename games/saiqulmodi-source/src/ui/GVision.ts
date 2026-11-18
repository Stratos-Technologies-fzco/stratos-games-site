// What the pilot sees under G (flight/PilotG.ts): the picture greys out (the 3D view loses its colour), the edges
// close in to a tunnel, then black; negative G tints it red. Layers over the 3D view only; the HUD text stays
// readable except in a full blackout.
import type { PilotVision } from '../flight/PilotG';

export class GVision {
  private tunnel: HTMLDivElement;
  private black: HTMLDivElement;
  private red: HTMLDivElement;
  private last = '';

  constructor(parent: HTMLElement, private view: HTMLCanvasElement) {
    const layer = (cls: string): HTMLDivElement => {
      const d = document.createElement('div');
      d.className = `gvision ${cls}`;
      parent.appendChild(d);
      return d;
    };
    this.tunnel = layer('gv-tunnel');
    this.black = layer('gv-black');
    this.red = layer('gv-red');
    this.set(null);
  }

  set(v: PilotVision | null): void {
    const grey = v ? v.grey : 0;
    const tunnel = v ? v.tunnel : 0;
    const black = v ? v.black : 0;
    const red = v ? v.red : 0;
    const key = `${grey.toFixed(2)}|${tunnel.toFixed(2)}|${black.toFixed(2)}|${red.toFixed(2)}`;
    if (key === this.last) return;
    this.last = key;
    this.view.style.filter = grey > 0.01 ? `grayscale(${grey.toFixed(2)}) brightness(${(1 - 0.25 * grey).toFixed(2)})` : '';
    // tunnel: clear centre shrinking from the whole screen to a small hole
    const hole = 75 - 55 * tunnel;
    this.tunnel.style.opacity = tunnel > 0.01 ? '1' : '0';
    this.tunnel.style.background = `radial-gradient(ellipse at center, rgba(0,0,0,0) ${hole.toFixed(0)}%, rgba(0,0,0,0.97) ${(hole + 18).toFixed(0)}%)`;
    this.black.style.opacity = black.toFixed(2);
    this.red.style.opacity = (0.75 * red).toFixed(2);
  }
}
