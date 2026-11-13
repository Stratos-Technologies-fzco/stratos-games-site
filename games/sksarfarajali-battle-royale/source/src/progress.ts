// Progression stored on the player's own device: stats, XP and level, daily missions, achievements and a local leaderboard.
import type { Result } from './game/types';

export interface Stats { matches: number; wins: number; kills: number; deaths: number; damage: number; headshots: number; seconds: number; xp: number; best: number; top5: number }
export interface Mission { id: string; text: string; target: number; metric: 'kills' | 'headshots' | 'damage' | 'seconds' | 'wins' | 'top10' | 'matches'; reward: number }
export interface MissionState { date: string; progress: Record<string, number>; done: Record<string, boolean> }
export interface Achievement { id: string; name: string; text: string; test: (s: Stats, r: Result) => boolean }
export interface Run { score: number; placement: number; kills: number; date: string; win: boolean }
export interface MatchOutcome { missionsDone: Mission[]; achievements: Achievement[]; bonusXp: number; score: number }

const SK = 'sdz-stats', MK = 'sdz-daily', AK = 'sdz-ach', BK = 'sdz-board';
const read = <T,>(k: string, d: T): T => { try { const v = localStorage.getItem(k); return v ? { ...d, ...JSON.parse(v) } : d; } catch { return d; } };
const write = (k: string, v: unknown) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* storage unavailable */ } };
const EMPTY: Stats = { matches: 0, wins: 0, kills: 0, deaths: 0, damage: 0, headshots: 0, seconds: 0, xp: 0, best: 99, top5: 0 };
export const getStats = (): Stats => read(SK, EMPTY);

export const level = (xp: number) => { let l = 1, need = 100; while (xp >= need) { xp -= need; l++; need = 100 + l * 40; } return { level: l, into: xp, need, pct: xp / need }; };

const POOL: Mission[] = [
  { id: 'kills3', text: 'Eliminate 3 players', target: 3, metric: 'kills', reward: 60 },
  { id: 'kills6', text: 'Eliminate 6 players (across matches)', target: 6, metric: 'kills', reward: 90 },
  { id: 'head2', text: 'Land 2 headshots', target: 2, metric: 'headshots', reward: 60 },
  { id: 'dmg500', text: 'Deal 500 damage', target: 500, metric: 'damage', reward: 60 },
  { id: 'dmg1000', text: 'Deal 1000 damage', target: 1000, metric: 'damage', reward: 90 },
  { id: 'live4', text: 'Survive for 4 minutes in total', target: 240, metric: 'seconds', reward: 60 },
  { id: 'top10', text: 'Finish in the top 10', target: 1, metric: 'top10', reward: 70 },
  { id: 'win1', text: 'Win a match', target: 1, metric: 'wins', reward: 150 },
  { id: 'play3', text: 'Play 3 matches', target: 3, metric: 'matches', reward: 50 },
];
export const today = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; };
/** Three missions per day, the same for everyone on a given date. */
export function dailyMissions(date = today()): Mission[] {
  let h = 0; for (const c of date) h = (h * 31 + c.charCodeAt(0)) >>> 0; const pool = [...POOL], out: Mission[] = [];
  while (out.length < 3) { h = (Math.imul(h, 1664525) + 1013904223) >>> 0; out.push(pool.splice(h % pool.length, 1)[0]); }
  if (!out.some((m) => m.metric === 'wins' || m.metric === 'top10' || m.metric === 'matches')) out[2] = POOL.find((m) => m.id === 'play3')!;
  return out;
}
export function missionState(): MissionState { const s = read<MissionState>(MK, { date: today(), progress: {}, done: {} }); return s.date === today() ? s : { date: today(), progress: {}, done: {} }; }

export const ACHIEVEMENTS: Achievement[] = [
  { id: 'first', name: 'First drop', text: 'Finish your first match', test: (s) => s.matches >= 1 },
  { id: 'kill1', name: 'First blood', text: 'Eliminate a player', test: (s) => s.kills >= 1 },
  { id: 'win1', name: 'Storm cleared', text: 'Win a match', test: (s) => s.wins >= 1 },
  { id: 'win5', name: 'Island legend', text: 'Win 5 matches', test: (s) => s.wins >= 5 },
  { id: 'kills25', name: 'Hunter', text: 'Eliminate 25 players in total', test: (s) => s.kills >= 25 },
  { id: 'kills100', name: 'Apex', text: 'Eliminate 100 players in total', test: (s) => s.kills >= 100 },
  { id: 'head10', name: 'Sharp eye', text: 'Land 10 headshots in total', test: (s) => s.headshots >= 10 },
  { id: 'top5', name: 'Final five', text: 'Finish in the top 5', test: (_s, r) => r.placement <= 5 },
  { id: 'dmg1500', name: 'Heavy hitter', text: 'Deal 1500 damage in one match', test: (_s, r) => r.damage >= 1500 },
  { id: 'surv5', name: 'Survivor', text: 'Survive 5 minutes in one match', test: (_s, r) => r.time >= 300 },
];
export const unlocked = (): Record<string, boolean> => read<Record<string, boolean>>(AK, {});

export const runScore = (r: Result) => r.kills * 100 + Math.max(0, 25 - r.placement) * 20 + Math.round(r.damage / 10) + (r.win ? 500 : 0);
export const board = (): Run[] => { try { const v = JSON.parse(localStorage.getItem(BK) ?? '[]'); return Array.isArray(v) ? v : []; } catch { return []; } };
/** Best runs from the last 7 days. */
export const weeklyBoard = (): Run[] => { const cut = Date.now() - 7 * 864e5; return board().filter((r) => new Date(r.date).getTime() >= cut).sort((a, b) => b.score - a.score).slice(0, 10); };

/** Record a finished match. Returns what was earned so the results screen can show it. */
export function recordMatch(r: Result): MatchOutcome {
  const s = getStats(); s.matches++; s.wins += r.win ? 1 : 0; s.kills += r.kills; s.deaths += r.win ? 0 : 1; s.damage += r.damage; s.headshots += r.headshots; s.seconds += r.time; s.best = Math.min(s.best, r.placement); s.top5 += r.placement <= 5 ? 1 : 0; s.xp += r.xp;
  const ms = missionState(), missions = dailyMissions(), missionsDone: Mission[] = []; let bonus = 0;
  const gain: Record<Mission['metric'], number> = { kills: r.kills, headshots: r.headshots, damage: r.damage, seconds: r.time, wins: r.win ? 1 : 0, top10: r.placement <= 10 ? 1 : 0, matches: 1 };
  for (const m of missions) { if (ms.done[m.id]) continue; ms.progress[m.id] = Math.min(m.target, (ms.progress[m.id] ?? 0) + gain[m.metric]); if (ms.progress[m.id] >= m.target) { ms.done[m.id] = true; missionsDone.push(m); bonus += m.reward; } }
  s.xp += bonus; write(SK, s); write(MK, ms);
  const un = unlocked(), newly: Achievement[] = []; for (const a of ACHIEVEMENTS) if (!un[a.id] && a.test(s, r)) { un[a.id] = true; newly.push(a); } write(AK, un);
  const score = runScore(r), runs = board(); runs.push({ score, placement: r.placement, kills: r.kills, date: new Date().toISOString(), win: r.win }); write(BK, runs.sort((a, b) => b.score - a.score).slice(0, 50));
  return { missionsDone, achievements: newly, bonusXp: bonus, score };
}
