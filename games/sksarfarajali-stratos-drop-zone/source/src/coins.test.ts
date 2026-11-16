import { afterEach, describe, expect, it } from 'vitest';
import { stratosCoins } from './coins';

const g = globalThis as unknown as { window?: unknown };

describe('stratosCoins', () => {
  afterEach(() => { delete g.window; });

  it('is null when the page has no Stratos coins', () => {
    g.window = { parent: {} };
    expect(stratosCoins()).toBeNull();
  });

  it('returns the wallet when coins are on and the item has a price', () => {
    const coins = { offer() {}, price: (k: string) => (k === 'continue' ? 15 : null), enabled: () => true };
    const w: Record<string, unknown> = { Stratos: { coins } }; w.parent = w; g.window = w;
    expect(stratosCoins()).toBe(coins);
    expect(stratosCoins('nonsense')).toBeNull();
  });

  it('is null when coins are switched off, and never throws', () => {
    const w: Record<string, unknown> = { Stratos: { coins: { offer() {}, price: () => 15, enabled: () => false } } }; w.parent = w; g.window = w;
    expect(stratosCoins()).toBeNull();
    g.window = { get Stratos(): never { throw new Error('boom'); }, parent: {} };
    expect(stratosCoins()).toBeNull();
  });
});
