import { cellsOf, Footprint } from './grid';

/** Tracks which tiles hold which object. Keys are "gx,gy". */
export class OccupancyMap {
  private cells = new Map<string, string>();
  constructor(readonly cols: number, readonly rows: number) {}

  private key(gx: number, gy: number) { return `${gx},${gy}`; }
  inBounds(gx: number, gy: number) { return gx >= 0 && gy >= 0 && gx < this.cols && gy < this.rows; }
  occupantAt(gx: number, gy: number): string | undefined { return this.cells.get(this.key(gx, gy)); }
  isFree(gx: number, gy: number) { return this.inBounds(gx, gy) && !this.cells.has(this.key(gx, gy)); }

  /** Place an object; returns false (and changes nothing) if any cell is out of bounds or taken. */
  place(id: string, gx: number, gy: number, fp: Footprint): boolean {
    const cs = cellsOf(gx, gy, fp);
    if (!cs.every((c) => this.isFree(c.gx, c.gy))) return false;
    cs.forEach((c) => this.cells.set(this.key(c.gx, c.gy), id));
    return true;
  }

  remove(id: string) {
    for (const [k, v] of [...this.cells]) if (v === id) this.cells.delete(k);
  }

  get size() { return this.cells.size; }
}
