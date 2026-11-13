import type { Result } from '../game/types';
import { getStats, level as lvlOf } from '../progress';
import { Avatar } from './Lobby';
import { Pic } from './art';
import { currentOutfit } from './outfits';

const mmss = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;

/** Results screen: the hero picture, live text on top. A loss uses the same picture, desaturated and darker. */
export function Results({ res, onAgain, onLobby }: { res: Result; onAgain: () => void; onLobby: () => void }) {
  const after = getStats().xp, before = Math.max(0, after - res.xp - (res.outcome?.bonusXp ?? 0));
  const la = lvlOf(after), lb = lvlOf(before), shards = Math.max(0, la.level - lb.level) * 10, gained = res.xp + (res.outcome?.bonusXp ?? 0);
  const outfit = currentOutfit(la.level);
  // at most two lines fit under the level bar: achievements and missions first, then the rest
  const lines = [...(res.outcome?.achievements.map((a) => '★ ' + a.name + ': ' + a.text) ?? []), ...(res.outcome?.missionsDone.map((m) => '✓ Mission: ' + m.text) ?? []), ...(!res.win && res.killer ? ['Eliminated by ' + res.killer] : []), ...(res.outcome ? ['Tokens ' + res.tokens + ' · Score ' + res.outcome.score] : [])].slice(0, 2);
  const share = () => { const t = `I placed #${res.placement} in Stratos Drop Zone with ${res.kills} eliminations! https://stratos.games`; (navigator.share ? navigator.share({ text: t }) : navigator.clipboard?.writeText(t))?.catch?.(() => {}); };
  return (
    <div class={`rs ${res.win ? 'win' : 'lose'}`}>
      <Pic name="backgrounds/victory_bg_1920" cls="bgpic kb rs-bg" pos="70% center" lazy={false} />
      <div class="rs-shade" />
      <div class="rs-col">
        <div class="rs-eyebrow"><Avatar outfit={outfit} cls="rs-av" /><span class="lbl">VAYU ISLAND · SOLO · {outfit.name.toUpperCase()}</span></div>
        <div class="rs-head"><h1 class={`t ${res.win ? 'win' : 'lose'}`}>{res.win ? <>STORM<br />CLEARED</> : 'ELIMINATED'}</h1><div class="rs-place t">#{res.placement}<small>/{res.total}</small></div></div>
        <div class="rs-tiles">
          <div class="glass"><b class="t">{res.kills}</b><span>KILLS</span></div><div class="glass"><b class="t">{res.damage.toLocaleString('en-US')}</b><span>DAMAGE</span></div>
          <div class="glass"><b class="t">{mmss(res.time)}</b><span>SURVIVED</span></div><div class="glass"><b class="t">{res.headshots}</b><span>HEADSHOTS</span></div>
        </div>
        <div class="rs-lvl"><span>{la.level > lb.level ? `Level ${lb.level} → ${la.level}` : `Level ${la.level}`}</span><b>+{gained} XP{shards ? ` · +${shards} Shards` : ''}</b></div>
        <div class="rs-bar"><i style={{ width: `${Math.round(la.pct * 100)}%` }} /></div>
        {lines.length > 0 && <div class="rs-extra">{lines.map((l) => <span key={l}>{l}</span>)}</div>}
        <div class="rs-btns"><button class="play sm" onClick={onAgain}>PLAY AGAIN</button><button class="pill" onClick={onLobby}><span>LOBBY</span></button><button class="pill" onClick={share}><span>SHARE</span></button></div>
      </div>
    </div>
  );
}
