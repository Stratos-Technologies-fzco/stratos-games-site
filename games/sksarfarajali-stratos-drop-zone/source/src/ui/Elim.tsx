import type { Game } from '../game/game';
import type { Result } from '../game/types';
import { useEffect, useState } from 'preact/hooks';
import { isTouch } from '../input';
import { getStats, level as lvlOf } from '../progress';
import { stratosCoins } from '../coins';

const mmss = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;

/** Shown after the player is eliminated while the match carries on: spectator controls on top, the player's summary and exits at the bottom. */
export function Elim({ g, res, spec, alive, onLobby, onAgain }: { g: Game; res: Result; spec: string | null; alive: number; onLobby: () => void; onAgain: () => void }) {
  const t = isTouch(); const [open, setOpen] = useState(true);
  const after = getStats().xp, gained = res.xp + (res.outcome?.bonusXp ?? 0), before = Math.max(0, after - gained), la = lvlOf(after), lb = lvlOf(before), shards = Math.max(0, la.level - lb.level) * 10;
  const [w, setW] = useState(lb.pct); useEffect(() => { const a = setTimeout(() => setW(la.pct), 350), b = setTimeout(() => setOpen(false), 9000); return () => { clearTimeout(a); clearTimeout(b); }; }, []);
  const C = stratosCoins(); const canRevive = !!C && g.reviveCan();   // once per match, paid with Stratos Coins
  return (
    <>
      <div class="spec-bar panel">
        <button class="pill" aria-label="Previous player" onClick={() => g.spectate(-1)}><span>◀{!t && <small> Q</small>}</span></button>
        <div class="spec-name"><small>SPECTATING</small><b>{spec ?? '—'}</b></div>
        <button class="pill" aria-label="Next player" onClick={() => g.spectate(1)}><span>{!t && <small>E </small>}▶</span></button>
        <span class="spec-alive">{alive} alive</span>
      </div>
      <div class={`elim-card glass${open ? '' : ' mini'}`}>
        <div class="elim-h"><b class="t">ELIMINATED</b><span class="t">#{res.placement}<small>/{res.total}</small></span>{res.killer && <em>by {res.killer}</em>}<button class="elim-toggle" aria-label={open ? 'Hide summary' : 'Show summary'} onClick={() => setOpen(!open)}>{open ? '▾' : '▴'}</button></div>
        <div class="elim-xp"><span>{la.level > lb.level ? `LEVEL UP! ${lb.level} → ${la.level}` : `Level ${la.level}`}</span><b>+{gained} XP{shards ? ` · +${shards} Shards` : ''}</b><div class="bar"><i style={{ width: `${Math.round(w * 100)}%` }} /></div></div>
        <div class="elim-tiles">
          <div><b>{res.kills}</b><span>ELIMINATIONS</span></div><div><b>{res.damage.toLocaleString('en-US')}</b><span>DAMAGE</span></div>
          <div><b>{mmss(res.time)}</b><span>SURVIVED</span></div><div><b>{res.tokens}</b><span>TOKENS</span></div>
        </div>
        <div class="elim-btns">{canRevive && <button class="play sm" onClick={() => C!.offer('continue', () => g.revive(), { title: 'Drop back in?', what: 'Another chance' })}>DROP BACK IN</button>}<button class="play sm" onClick={onAgain}>PLAY AGAIN</button><button class="pill" onClick={onLobby}><span>LOBBY</span></button><button class="pill" onClick={() => g.skipToResults()}><span>RESULTS</span></button></div>
        <div class="elim-hint">{t ? 'Drag to look around' : 'Q / E or ← → switch player · drag to orbit'}</div>
      </div>
    </>
  );
}
