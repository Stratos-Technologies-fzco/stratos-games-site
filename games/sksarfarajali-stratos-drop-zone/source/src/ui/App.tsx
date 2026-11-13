import { useEffect, useRef, useState } from 'preact/hooks';
import B from '../balance.json';
import { Game } from '../game/game';
import { audio } from '../audio';
import { initInput, input, isTouch, press, saveSettings, setPauseHandler, settings, touch } from '../input';
import { SURVIVORS, type Survivor } from '../render/character';
import { Hud as HudView } from './Hud';
import { track } from '../analytics';
import { Turntable } from './Turntable';
import { ACHIEVEMENTS, dailyMissions, getStats, level as lvlOf, missionState, unlocked, weeklyBoard } from '../progress';

type Screen = 'loading' | 'lobby' | 'match';

export function App() {
  const canvas = useRef<HTMLCanvasElement>(null); const game = useRef<Game | null>(null);
  const [progress, setProgress] = useState(0); const [screen, setScreen] = useState<Screen>('loading'); const [, tick] = useState(0);
  const [tab, setTab] = useState<'play' | 'survivors' | 'locker' | 'ranks' | 'missions'>('play'); const [mode, setMode] = useState<'solo' | 'training'>('solo');
  const [sv, setSv] = useState<Survivor>((localStorage.getItem('sdz-sv') as Survivor) || 'survivor_kiran'); const [settingsOpen, setSettingsOpen] = useState(false); const [pause, setPause] = useState(false);
  const [info, setInfo] = useState<'' | 'how' | 'about'>(''); const [musicOn, setMusicOn] = useState(settings.musicOn); const [demo, setDemo] = useState(false);
  const [diff, setDiff] = useState<'easy' | 'normal' | 'hard'>((localStorage.getItem('sdz-diff') as 'easy' | 'normal' | 'hard') || 'normal');
  const [bots, setBots] = useState(false); const [err, setErr] = useState('');

  useEffect(() => {
    const g = new Game(canvas.current!); game.current = g; (window as unknown as { game: Game }).game = g;
    g.onChange = () => tick((n) => n + 1);
    initInput(canvas.current!, () => g.kioskOpen || g.mapOpen || !!g.hud.result);
    setPauseHandler(() => { if (g.phase === 'playing' || g.phase === 'flight') { g.setPaused(true); setPause(true); } });
    g.init(setProgress).then(() => { setScreen('lobby'); track('game_open'); }).catch((e) => { console.error(e); setErr(String(e?.message ?? e)); });
    const unlock = () => { audio.unlock(); audio.startMusic('lobby'); removeEventListener('pointerdown', unlock); };
    addEventListener('pointerdown', unlock); document.documentElement.classList.toggle('reduce', settings.reduceMotion); document.documentElement.style.setProperty('--ui', String(settings.uiScale));
    return () => g.dispose();
  }, []);

  const g = game.current; const hud = g?.hud;
  const play = async (m: 'solo' | 'training' = mode, d: boolean = demo) => {
    if (!g) return; audio.unlock(); audio.play('tap'); localStorage.setItem('sdz-sv', sv); setScreen('match'); setPause(false);
    try { if (isTouch()) { document.documentElement.requestFullscreen?.().catch(() => {}); (navigator as unknown as { wakeLock?: { request: (t: string) => Promise<unknown> } }).wakeLock?.request('screen').catch(() => {}); } } catch { /* optional */ }
    await g.start(m, sv, { bots, demo: d, difficulty: diff }); tick((n) => n + 1);
  };
  const toggleMusic = () => { settings.musicOn = !settings.musicOn; setMusicOn(settings.musicOn); audio.unlock(); audio.setMusicOn(settings.musicOn); saveSettings(); };
  const backToLobby = () => { g?.toLobby(); setScreen('lobby'); setPause(false); };
  const st = getStats(); const lv0 = lvlOf(st.xp); const lv = { l: lv0.level, pct: lv0.pct }; const svDef = SURVIVORS.find((s) => s.id === sv)!;
  const upd = (fn: () => void) => { fn(); saveSettings(); document.documentElement.classList.toggle('reduce', settings.reduceMotion); for (const k of ['master', 'music', 'sfx', 'ui'] as const) audio.setVolume(k, settings[k]); audio.setMusicOn(settings.musicOn); document.documentElement.style.setProperty('--ui', String(settings.uiScale)); tick((n) => n + 1); };

  return (
    <>
      <canvas id="view" ref={canvas} />
      {screen === 'loading' && (
        <div class="full center"><div class="title">STRATOS DROP ZONE<small>VAYU ISLAND</small></div><div class="bar"><i style={{ width: `${Math.round(progress * 100)}%` }} /></div><div class="note">{err ? `Could not start: ${err}` : 'Loading the island…'}</div></div>
      )}
      {screen === 'lobby' && (
        <div class="lobby">
          <div class="top">
            <div class="chip panel"><div class="av"><img src={`art/${svDef.id.replace('survivor_', 'character_')}_face.jpg`} alt="" /></div><div><div class="t" style="font-size:15px">You · Lv {lv.l}</div><div class="xpbar"><i style={{ width: `${lv.pct * 100}%` }} /></div></div></div>
            <div class="title">STRATOS DROP ZONE<small>VAYU ISLAND · SOLO</small></div>
            <div style="display:flex;gap:8px;align-items:center"><div class="panel t" style="padding:8px 12px">◆ {Math.max(0, lv.l - 1) * 10}</div><button class="btn" aria-label={musicOn ? 'Music on' : 'Music off'} title="Music" onClick={toggleMusic}>{musicOn ? '♪' : '♪̸'}</button><button class="btn" aria-label="How to play" title="How to play" onClick={() => setInfo('how')}>?</button><button class="btn" aria-label="About" title="About" onClick={() => setInfo('about')}>i</button><button class="btn" aria-label="Settings" onClick={() => setSettingsOpen(true)}>⚙</button></div>
          </div>
          <div class="mid">
            <div class="col">
              <button class={`btn ${mode === 'solo' && !demo ? 'sel' : ''}`} onClick={() => { setMode('solo'); setDemo(false); void play('solo', false); }}>Solo · 24 players</button>
              <button class={`btn ${mode === 'training' && !demo ? 'sel' : ''}`} onClick={() => { setMode('training'); setDemo(false); void play('training', false); }}>Training</button>
              <button class={`btn ${demo ? 'sel' : ''}`} onClick={() => { setMode('training'); setDemo(true); void play('training', true); }}>Demo · learn in 1 min</button>
              <button class="btn" disabled style="opacity:.5">Squad · Coming soon</button>
              <div class="map-card panel"><b>Vayu Island</b>640 × 640 m · 10 locations · 6 storm phases · about 5½ minutes</div>
            </div>
            <div class="stage">{tab === 'play' && <Turntable survivor={sv} />}</div>
            <div class="col">
              <div class="panel" style="padding:10px"><div class="t" style="font-size:14px">Offline match</div><div class="note">Plays on your device. No sign-up. Bots fill every empty slot.</div></div>
              <div class="panel" style="padding:8px"><div class="note" style="margin-bottom:4px">Bot difficulty</div><div style="display:flex;gap:6px">{(['easy', 'normal', 'hard'] as const).map((d) => <button class={'btn ' + (diff === d ? 'sel' : '')} style="min-width:0;flex:1;padding:0 4px;font-size:13px" onClick={() => { setDiff(d); localStorage.setItem('sdz-diff', d); }}>{d[0].toUpperCase() + d.slice(1)}</button>)}</div></div>
              {<label class="panel" style="padding:8px;font-size:13px;display:flex;gap:8px;align-items:center"><input type="checkbox" checked={bots} onChange={(e) => setBots((e.target as HTMLInputElement).checked)} /> Training: add 3 easy bots</label>}
              <button class="btn primary" style="min-height:64px" onClick={() => void play()}>PLAY</button>
              <div class="note" style="text-align:center">{svDef.name} · {svDef.role}</div>
            </div>
          </div>
          <div class="nav">
            {(['play', 'survivors', 'locker', 'ranks', 'missions'] as const).map((t) => <button class={`btn ${tab === t ? 'on' : ''}`} onClick={() => { audio.play('tap'); setTab(t); }}>{t[0].toUpperCase() + t.slice(1)}</button>)}
          </div>
          {tab === 'survivors' && (
            <div class="modal" onClick={() => setTab('play')}><div class="card" onClick={(e) => e.stopPropagation()}><h2>Survivors</h2>
              <div class="survivors">{SURVIVORS.map((s) => <div class={`sv ${s.id === sv ? 'on' : ''}`} onClick={() => setSv(s.id)}><img src={`art/${s.id.replace('survivor_', 'character_')}_face.jpg`} alt={s.name} /><b>{s.name}</b><span>{s.role}</span><span style={{ display: 'block', color: s.color }}>{B.perksEnabled ? s.perk : 'Cosmetic in v1'}</span></div>)}</div>
              <p class="note">Perks switch on in a later update. For now every survivor plays the same.</p><button class="btn primary" onClick={() => setTab('play')}>Done</button></div></div>
          )}
          {tab === 'missions' && <MissionsModal onClose={() => setTab('play')} />}
          {tab === 'ranks' && <RanksModal onClose={() => setTab('play')} />}
          {tab === 'locker' && <div class="modal" onClick={() => setTab('play')}><div class="card center"><h2>{tab === 'locker' ? 'Locker' : 'Missions'}</h2><p>Coming soon.</p><button class="btn" onClick={() => setTab('play')}>Back</button></div></div>}
          
        </div>
      )}
      {info === 'how' && <div class="modal" onClick={() => setInfo('')}><div class="card" onClick={(e) => e.stopPropagation()}><h2>How to play</h2>
        <div class="row"><span>Goal</span><b>Be the last one alive</b></div><div class="row"><span>1. Jump</span><span>Fly over the island, then press JUMP (or Space). You auto-jump at the end.</span></div><div class="row"><span>2. Loot</span><span>Find weapons, ammo, armour and healing in buildings.</span></div><div class="row"><span>3. Survive</span><span>The violet Monsoon Wall shrinks the safe circle. Stay inside it.</span></div>
        <h2 style="margin-top:12px">Computer</h2><p class="note">WASD move · mouse look · click fire · right-click aim · R reload · Space jump · C crouch · Shift sprint · F pick up · 1-4 weapons · G grenade · B barrier · H heal · Tab pack · M map · Esc pause</p>
        <h2>Phone</h2><p class="note">Left thumb moves (push to the edge to sprint). Right thumb looks. FIRE shoots (hold to keep firing). AIM, JUMP, CROUCH and RELOAD sit on the right. Tap the minimap for the full map.</p>
        <button class="btn primary" onClick={() => setInfo('')}>Got it</button></div></div>}
      {info === 'about' && <div class="modal" onClick={() => setInfo('')}><div class="card" onClick={(e) => e.stopPropagation()}><h2>About</h2>
        <p>Stratos Drop Zone is a quick battle royale on Vayu Island, a made-up monsoon coast. It runs in your browser with no download and no sign-up.</p><p>Made by Sk Sarfaraj Ali for stratos.games. All models, sounds and art are original to this game.</p><p class="note">This version plays offline against bots. Online matches may come later.</p>
        <button class="btn primary" onClick={() => setInfo('')}>Close</button></div></div>}
      {screen === 'match' && g && hud && <HudView g={g} hud={hud} onPause={() => { g.setPaused(true); setPause(true); }} onLobby={backToLobby} onAgain={() => void play()} />}
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
          <div class="row"><span>Auto-pickup ammo, healing and gadgets</span><input type="checkbox" checked={settings.autoPickup} onChange={(e) => upd(() => (settings.autoPickup = (e.target as HTMLInputElement).checked))} /></div>
          <div class="row"><span>HUD size</span><input type="range" min="0.7" max="1.4" step="0.1" value={settings.uiScale} onInput={(e) => upd(() => (settings.uiScale = +(e.target as HTMLInputElement).value))} /></div>
          <div class="row"><span>Reduce motion</span><input type="checkbox" checked={settings.reduceMotion} onChange={(e) => upd(() => (settings.reduceMotion = (e.target as HTMLInputElement).checked))} /></div>
          <p class="note">Keys: WASD move · mouse look · click fire · right-click aim · R reload · Space jump · C crouch · Shift sprint · F pick up · 1-4 weapons · G grenade · B barrier · H heal · Tab pack · M map · Esc pause</p>
          <button class="btn primary" onClick={() => setSettingsOpen(false)}>Done</button></div></div>
      )}
      <div class="full center rotate"><div class="ico">⟳</div><div class="title">Rotate your phone</div><div class="note">Stratos Drop Zone plays in landscape.</div></div>
    </>
  );
}
void input; void press; void touch;

function MissionsModal({ onClose }: { onClose: () => void }) {
  const ms = missionState(), list = dailyMissions();
  return (
    <div class="modal" onClick={onClose}><div class="card" onClick={(e) => e.stopPropagation()}><h2>Daily missions</h2>
      {list.map((m) => { const p = ms.progress[m.id] ?? 0, done = !!ms.done[m.id]; return <div class="row" key={m.id}><span>{done ? '✓ ' : ''}{m.text}<div class="xpbar" style="width:160px;margin-top:4px"><i style={{ width: Math.min(100, (p / m.target) * 100) + '%', background: done ? 'var(--green)' : 'var(--violet)' }} /></div></span><b style={{ color: done ? 'var(--green)' : 'var(--amber)' }}>{done ? 'Done' : '+' + m.reward + ' XP'}</b></div>; })}
      <p class="note">New missions every day. Finish a match to make progress. Rewards are added to your XP automatically.</p><button class="btn primary" onClick={onClose}>Back</button></div></div>
  );
}
function RanksModal({ onClose }: { onClose: () => void }) {
  const s = getStats(), l = lvlOf(s.xp), un = unlocked(), board = weeklyBoard();
  return (
    <div class="modal" onClick={onClose}><div class="card" onClick={(e) => e.stopPropagation()}><h2>Your record</h2>
      <div class="row"><span>Level</span><b>{l.level} · {l.into}/{l.need} XP</b></div><div class="row"><span>Matches · wins</span><b>{s.matches} · {s.wins}</b></div><div class="row"><span>Eliminations · deaths (K/D)</span><b>{s.kills} · {s.deaths} ({(s.kills / Math.max(1, s.deaths)).toFixed(2)})</b></div><div class="row"><span>Headshots · damage</span><b>{s.headshots} · {Math.round(s.damage)}</b></div><div class="row"><span>Best placement</span><b>{s.best < 99 ? '#' + s.best : '-'}</b></div><div class="row"><span>Time survived</span><b>{Math.floor(s.seconds / 60)} min</b></div>
      <h2 style="margin-top:12px">Achievements ({ACHIEVEMENTS.filter((a) => un[a.id]).length}/{ACHIEVEMENTS.length})</h2>
      {ACHIEVEMENTS.map((a) => <div class="row" key={a.id} style={{ opacity: un[a.id] ? 1 : 0.5 }}><span><b>{un[a.id] ? '★ ' : '☆ '}{a.name}</b> · {a.text}</span></div>)}
      <h2 style="margin-top:12px">Best runs this week (this device)</h2>
      {board.length === 0 ? <p class="note">Play a match to set your first score.</p> : board.map((r, i) => <div class="row" key={i}><span>#{i + 1} · placed #{r.placement} · {r.kills} elims{r.win ? ' · WIN' : ''}</span><b>{r.score}</b></div>)}
      <p class="note">A shared online leaderboard will come with online play.</p><button class="btn primary" onClick={onClose}>Back</button></div></div>
  );
}
