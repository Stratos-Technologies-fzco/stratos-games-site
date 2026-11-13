import { useEffect, useRef, useState } from 'preact/hooks';
import B from '../balance.json';
import { Game } from '../game/game';
import { audio } from '../audio';
import { initInput, input, isTouch, press, saveSettings, setPauseHandler, settings, touch } from '../input';
import { SURVIVORS, type Survivor } from '../render/character';
import { Hud as HudView } from './Hud';
import { track } from '../analytics';

type Screen = 'loading' | 'lobby' | 'match';
const stats = () => { try { return JSON.parse(localStorage.getItem('sdz-stats') ?? '{}'); } catch { return {}; } };
const level = (xp: number) => { let l = 1, need = 100; while (xp >= need) { xp -= need; l++; need = 100 + l * 40; } return { l, pct: xp / need }; };

export function App() {
  const canvas = useRef<HTMLCanvasElement>(null); const game = useRef<Game | null>(null);
  const [progress, setProgress] = useState(0); const [screen, setScreen] = useState<Screen>('loading'); const [, tick] = useState(0);
  const [tab, setTab] = useState<'play' | 'survivors' | 'locker' | 'ranks' | 'missions'>('play'); const [mode, setMode] = useState<'solo' | 'training'>('solo');
  const [sv, setSv] = useState<Survivor>((localStorage.getItem('sdz-sv') as Survivor) || 'survivor_kiran'); const [settingsOpen, setSettingsOpen] = useState(false); const [pause, setPause] = useState(false);
  const [bots, setBots] = useState(false); const [err, setErr] = useState('');

  useEffect(() => {
    const g = new Game(canvas.current!); game.current = g; (window as unknown as { game: Game }).game = g;
    g.onChange = () => tick((n) => n + 1);
    initInput(canvas.current!, () => g.kioskOpen || g.mapOpen || !!g.hud.result);
    setPauseHandler(() => { if (g.phase === 'playing' || g.phase === 'flight') { g.setPaused(true); setPause(true); } });
    g.init(setProgress).then(() => { setScreen('lobby'); track('game_open'); }).catch((e) => { console.error(e); setErr(String(e?.message ?? e)); });
    const unlock = () => { audio.unlock(); audio.startMusic('lobby'); removeEventListener('pointerdown', unlock); };
    addEventListener('pointerdown', unlock); document.documentElement.classList.toggle('reduce', settings.reduceMotion);
    return () => g.dispose();
  }, []);

  const g = game.current; const hud = g?.hud;
  const play = async () => {
    if (!g) return; audio.unlock(); audio.play('tap'); localStorage.setItem('sdz-sv', sv); setScreen('match'); setPause(false);
    try { if (isTouch()) { document.documentElement.requestFullscreen?.().catch(() => {}); (navigator as unknown as { wakeLock?: { request: (t: string) => Promise<unknown> } }).wakeLock?.request('screen').catch(() => {}); } } catch { /* optional */ }
    await g.start(mode, sv, { bots }); tick((n) => n + 1);
  };
  const backToLobby = () => { g?.toLobby(); setScreen('lobby'); setPause(false); };
  const st = stats(); const lv = level(st.xp ?? 0); const svDef = SURVIVORS.find((s) => s.id === sv)!;
  const upd = (fn: () => void) => { fn(); saveSettings(); document.documentElement.classList.toggle('reduce', settings.reduceMotion); for (const k of ['master', 'music', 'sfx', 'ui'] as const) audio.setVolume(k, settings[k]); tick((n) => n + 1); };

  return (
    <>
      <canvas id="view" ref={canvas} />
      {screen === 'loading' && (
        <div class="full center"><div class="title">STRATOS DROP ZONE<small>VAYU ISLAND</small></div><div class="bar"><i style={{ width: `${Math.round(progress * 100)}%` }} /></div><div class="note">{err ? `Could not start: ${err}` : 'Loading the island…'}</div></div>
      )}
      {screen === 'lobby' && (
        <div class="lobby">
          <div class="top">
            <div class="chip panel"><div class="av"><img src={`art/${svDef.id.replace('survivor_', 'character_')}.jpg`} alt="" /></div><div><div class="t" style="font-size:15px">You · Lv {lv.l}</div><div class="xpbar"><i style={{ width: `${lv.pct * 100}%` }} /></div></div></div>
            <div class="title">STRATOS DROP ZONE<small>VAYU ISLAND · SOLO</small></div>
            <div style="display:flex;gap:8px;align-items:center"><div class="panel t" style="padding:8px 12px">◆ {Math.max(0, lv.l - 1) * 10}</div><button class="btn" aria-label="Settings" onClick={() => setSettingsOpen(true)}>⚙</button></div>
          </div>
          <div class="mid">
            <div class="col">
              <button class={`btn ${mode === 'solo' ? 'sel' : ''}`} onClick={() => setMode('solo')}>Solo · 24 players</button>
              <button class={`btn ${mode === 'training' ? 'sel' : ''}`} onClick={() => setMode('training')}>Training</button>
              <button class="btn" disabled style="opacity:.5">Squad · Coming soon</button>
              <div class="map-card panel"><b>Vayu Island</b>640 × 640 m · 10 locations · 6 storm phases · about 5½ minutes</div>
            </div>
            <div class="stage">{tab === 'play' && <img src={`art/${svDef.id.replace('survivor_', 'character_')}.jpg`} alt={svDef.name} />}</div>
            <div class="col">
              <div class="panel" style="padding:10px"><div class="t" style="font-size:14px">Offline match</div><div class="note">Plays on your device. No sign-up. Bots fill every empty slot.</div></div>
              {mode === 'training' && <label class="panel" style="padding:8px;font-size:13px;display:flex;gap:8px;align-items:center"><input type="checkbox" checked={bots} onChange={(e) => setBots((e.target as HTMLInputElement).checked)} /> Add 3 easy bots</label>}
              <button class="btn primary" style="min-height:64px" onClick={play}>PLAY</button>
              <div class="note" style="text-align:center">{svDef.name} · {svDef.role}</div>
            </div>
          </div>
          <div class="nav">
            {(['play', 'survivors', 'locker', 'ranks', 'missions'] as const).map((t) => <button class={`btn ${tab === t ? 'on' : ''}`} onClick={() => { audio.play('tap'); setTab(t); }}>{t[0].toUpperCase() + t.slice(1)}</button>)}
          </div>
          {tab === 'survivors' && (
            <div class="modal" onClick={() => setTab('play')}><div class="card" onClick={(e) => e.stopPropagation()}><h2>Survivors</h2>
              <div class="survivors">{SURVIVORS.map((s) => <div class={`sv ${s.id === sv ? 'on' : ''}`} onClick={() => setSv(s.id)}><img src={`art/${s.id.replace('survivor_', 'character_')}.jpg`} alt={s.name} /><b>{s.name}</b><span>{s.role}</span><span style={{ display: 'block', color: s.color }}>{B.perksEnabled ? s.perk : 'Cosmetic in v1'}</span></div>)}</div>
              <p class="note">Perks switch on in a later update. For now every survivor plays the same.</p><button class="btn primary" onClick={() => setTab('play')}>Done</button></div></div>
          )}
          {(tab === 'locker' || tab === 'missions') && <div class="modal" onClick={() => setTab('play')}><div class="card center"><h2>{tab === 'locker' ? 'Locker' : 'Missions'}</h2><p>Coming soon.</p><button class="btn" onClick={() => setTab('play')}>Back</button></div></div>}
          {tab === 'ranks' && <div class="modal" onClick={() => setTab('play')}><div class="card"><h2>Your record</h2>
            <div class="row"><span>Matches</span><b>{st.matches ?? 0}</b></div><div class="row"><span>Wins</span><b>{st.wins ?? 0}</b></div><div class="row"><span>Eliminations</span><b>{st.kills ?? 0}</b></div><div class="row"><span>Best placement</span><b>{st.best && st.best < 99 ? `#${st.best}` : '-'}</b></div><div class="row"><span>XP</span><b>{st.xp ?? 0}</b></div>
            <p class="note">Weekly leaderboards arrive when online play does. This is stored on your device.</p><button class="btn" onClick={() => setTab('play')}>Back</button></div></div>}
        </div>
      )}
      {screen === 'match' && g && hud && <HudView g={g} hud={hud} onPause={() => { g.setPaused(true); setPause(true); }} onLobby={backToLobby} onAgain={() => play()} />}
      {pause && screen === 'match' && (
        <div class="modal"><div class="card center"><h2>Paused</h2><button class="btn primary" onClick={() => { g?.setPaused(false); setPause(false); }}>Resume</button><button class="btn" onClick={() => setSettingsOpen(true)}>Settings</button><button class="btn" onClick={backToLobby}>Leave match</button></div></div>
      )}
      {settingsOpen && (
        <div class="modal" onClick={() => setSettingsOpen(false)}><div class="card" onClick={(e) => e.stopPropagation()}><h2>Settings</h2>
          <div class="row"><span>Graphics</span><select value={settings.quality} onChange={(e) => upd(() => (settings.quality = (e.target as HTMLSelectElement).value as typeof settings.quality))}><option value="auto">Auto</option><option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option></select></div>
          <div class="row"><span>Resolution scale</span><input type="range" min="0.5" max="1" step="0.05" value={settings.resScale} onInput={(e) => upd(() => (settings.resScale = +(e.target as HTMLInputElement).value))} /></div>
          <div class="row"><span>Show FPS</span><input type="checkbox" checked={settings.fps} onChange={(e) => upd(() => (settings.fps = (e.target as HTMLInputElement).checked))} /></div>
          <div class="row"><span>Look sensitivity</span><input type="range" min="0.3" max="3" step="0.1" value={settings.sensitivity} onInput={(e) => upd(() => (settings.sensitivity = +(e.target as HTMLInputElement).value))} /></div>
          <div class="row"><span>Aim assist (touch)</span><input type="checkbox" checked={settings.aimAssist} onChange={(e) => upd(() => (settings.aimAssist = (e.target as HTMLInputElement).checked))} /></div>
          {(['master', 'music', 'sfx', 'ui'] as const).map((k) => <div class="row"><span>{k[0].toUpperCase() + k.slice(1)} volume</span><input type="range" min="0" max="1" step="0.05" value={settings[k]} onInput={(e) => upd(() => (settings[k] = +(e.target as HTMLInputElement).value))} /></div>)}
          <div class="row"><span>Reduce motion</span><input type="checkbox" checked={settings.reduceMotion} onChange={(e) => upd(() => (settings.reduceMotion = (e.target as HTMLInputElement).checked))} /></div>
          <p class="note">Keys: WASD move · mouse look · click fire · right-click aim · R reload · Space jump · C crouch · Shift sprint · F pick up · 1-4 weapons · G grenade · B barrier · H heal · Tab pack · M map · Esc pause</p>
          <button class="btn primary" onClick={() => setSettingsOpen(false)}>Done</button></div></div>
      )}
      <div class="full center rotate"><div class="ico">⟳</div><div class="title">Rotate your phone</div><div class="note">Stratos Drop Zone plays in landscape.</div></div>
    </>
  );
}
void input; void press; void touch;
