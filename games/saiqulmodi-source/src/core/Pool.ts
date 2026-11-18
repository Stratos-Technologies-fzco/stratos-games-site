/** Fixed-size object pool: every object is made once at start, nothing is created while playing. */
export interface Poolable {
  active: boolean;
}

export class Pool<T extends Poolable> {
  readonly items: T[];
  private next = 0;

  constructor(size: number, factory: (index: number) => T) {
    this.items = new Array<T>(size);
    for (let i = 0; i < size; i++) this.items[i] = factory(i);
  }

  /** A free object, or null when all are in use. */
  acquire(): T | null {
    const n = this.items.length;
    for (let k = 0; k < n; k++) {
      const i = (this.next + k) % n;
      const it = this.items[i];
      if (!it.active) {
        this.next = (i + 1) % n;
        it.active = true;
        return it;
      }
    }
    return null;
  }

  /** The oldest-handed slot is reused when the pool is full (for cosmetic effects). */
  acquireOrRecycle(): T {
    const free = this.acquire();
    if (free) return free;
    const it = this.items[this.next];
    this.next = (this.next + 1) % this.items.length;
    it.active = true;
    return it;
  }

  countActive(): number {
    let c = 0;
    for (let i = 0; i < this.items.length; i++) if (this.items[i].active) c++;
    return c;
  }

  releaseAll(): void {
    for (let i = 0; i < this.items.length; i++) this.items[i].active = false;
  }
}
