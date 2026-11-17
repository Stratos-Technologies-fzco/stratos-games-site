import { describe, expect, it } from 'vitest';
import { swayWeights } from './wind';

describe('wind sway weights', () => {
  it('is 0 at the base of a plant and grows toward the top', () => {
    const ys = [0, 1, 2, 3, 4, 5, 6]; const w = swayWeights(ys);
    expect(w[0]).toBe(0); expect(w[6]).toBeCloseTo(1, 6); for (let i = 1; i < w.length; i++) expect(w[i]).toBeGreaterThan(w[i - 1]);
  });
  it('keeps the lower trunk nearly still: the middle moves much less than the top', () => { const w = swayWeights([0, 3, 6]); expect(w[1]).toBeLessThan(0.3 * w[2]); });
  it('works from any base height, since plants stand on hills', () => { const a = swayWeights([0, 3, 6]), b = swayWeights([40, 43, 46]); a.forEach((v, i) => expect(b[i]).toBeCloseTo(v, 6)); });
  it('small plants (grass, bushes) sway much less than tall trees', () => { expect(swayWeights([0, 0.6])[1]).toBeLessThan(0.2); expect(swayWeights([0, 8])[1]).toBeCloseTo(1, 6); });
  it('a flat or empty shape does not move and does not produce NaN', () => { expect(Array.from(swayWeights([2, 2, 2]))).toEqual([0, 0, 0]); expect(swayWeights([]).length).toBe(0); });
});
