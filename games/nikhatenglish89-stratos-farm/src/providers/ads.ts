// Ad provider contract. The game has NO ads today (kids category). If ads are ever switched on, the site owners set them up once
// (see the repo CLAUDE.md) and a real provider replaces the mock. Only a mock exists here.

export type AdPlacement = 'second_chance' | 'double_reward' | 'hint';
export interface AdResult { rewarded: boolean; reason?: 'not_available' | 'closed_early' | 'error' }

export interface AdProvider {
  readonly name: string;
  isAvailable(placement: AdPlacement): boolean;
  /** Show a rewarded ad. The reward is granted by the CALLER only when rewarded is true. */
  showRewarded(placement: AdPlacement): Promise<AdResult>;
}

/** Test double: never shows anything, answers as configured and counts calls. */
export class MockAdProvider implements AdProvider {
  readonly name = 'mock';
  calls: AdPlacement[] = [];
  constructor(private outcome: AdResult = { rewarded: true }, private available = true) {}
  isAvailable() { return this.available; }
  async showRewarded(placement: AdPlacement): Promise<AdResult> {
    this.calls.push(placement);
    if (!this.available) return { rewarded: false, reason: 'not_available' };
    return this.outcome;
  }
}

/** Run a reward only after a finished ad. Without a provider (today) the player gets nothing extra and nothing breaks. */
export async function withRewardedAd(provider: AdProvider | null, placement: AdPlacement, grant: () => void): Promise<boolean> {
  if (!provider || !provider.isAvailable(placement)) return false;
  const r = await provider.showRewarded(placement);
  if (!r.rewarded) return false;
  grant();
  return true;
}
