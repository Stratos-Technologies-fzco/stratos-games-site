// Phase 5 (social). Friends, farm visits, gifts and leaderboards need a real server and Stratos accounts, which the static
// site does not have yet. This file is the contract the game will call once they exist (see docs/SOCIAL_API.md).
// Until then the only implementation says plainly that it is unavailable, so no screen can pretend otherwise.

export interface Friend { id: string; name: string; level: number }
export interface LeaderRow { rank: number; name: string; level: number; score: number }
export type SocialError = 'needs_accounts' | 'not_found' | 'rate_limited';
export type SocialResult<T> = { ok: true; value: T } | { ok: false; error: SocialError };

export interface SocialService {
  /** false while there is no server / account system behind it. */
  readonly available: boolean;
  readonly reason: string;
  friends(): Promise<SocialResult<Friend[]>>;
  /** Read-only look at a friend's farm. The server must enforce that nothing can be changed. */
  visit(friendId: string): Promise<SocialResult<{ level: number; buildings: number }>>;
  /** One gift per friend per day, taken from the sender's stock by the server (no duplication). */
  sendGift(friendId: string, itemId: string, key: string): Promise<SocialResult<{ sent: true }>>;
  leaderboard(): Promise<SocialResult<LeaderRow[]>>;
}

export class OfflineSocial implements SocialService {
  readonly available = false;
  readonly reason = 'Friends, visits, gifts and leaderboards need Stratos accounts. They are coming later.';
  private no = <T>(): Promise<SocialResult<T>> => Promise.resolve({ ok: false, error: 'needs_accounts' });
  friends() { return this.no<Friend[]>(); }
  visit() { return this.no<{ level: number; buildings: number }>(); }
  sendGift() { return this.no<{ sent: true }>(); }
  leaderboard() { return this.no<LeaderRow[]>(); }
}

export const social: SocialService = new OfflineSocial();
