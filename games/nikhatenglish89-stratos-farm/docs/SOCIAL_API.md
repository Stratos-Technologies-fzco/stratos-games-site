# SOCIAL_API: what the server must provide before social features go live

**Status: not built, on purpose.** Friends, farm visits, gifts and leaderboards need a real server and Stratos accounts. The Stratos site is static (Vercel, no backend) and its rules say accounts will come from Stratos centrally. So the game ships only the contract (`src/services/social.ts`) and an `OfflineSocial` that answers `needs_accounts` to everything. The Map screen shows that sentence honestly; no fake friends list exists.

## What works today without a server
- **Village map** with tap-to-jump, **village facts**, **neighbours** (the six customers; friendship = orders delivered, counted in `stats["order:<npc>"]`), and **Share my village** (a picture + text through the device share sheet, or a download).

## Contract (`SocialService`)
| Method | Meaning | Server rules (must be enforced by the server, never the browser) |
|---|---|---|
| `friends()` | friend list with name + level | only accepted friendships; no email or personal data in the reply |
| `visit(friendId)` | read-only view of a friend's village | read-only by construction (GET only); ownership check on every id; rate limited |
| `sendGift(friendId, itemId, key)` | one item to a friend | `Idempotency-Key` required; the item is removed from the sender in the same transaction that adds it to the receiver; max one gift per friend per day; a ledger row on both sides; no duplication |
| `leaderboard()` | top rows by a score | score computed on the server from server-held farm state, never sent by the client |

## Suggested endpoints (`/api/v1`)
`GET /social/friends`, `POST /social/friends/requests`, `POST /social/friends/{id}/accept`, `GET /social/visit/{farmId}`, `POST /social/gifts`, `GET /social/leaderboard?period=week`.

## Preconditions (owners: Sarfaraj, Sahil, Sahariar)
1. A Stratos central account system (login that works across games, no per-game sign-up forms).
2. A backend that holds farm state (the game's `FarmService` interface already matches the server model: lazy timers, ledger, idempotency keys), plus rate limiting and an audit log.
3. A moderation decision for names in a kids-category game.
