import { useEffect, useState } from 'react';
import game from '../../game.json';
import { useFarm } from '../state/store';
import { farm } from '../game/controller';
import { setPref } from '../game/audio';
import { SC, coinBalance, onCoinsChange } from '../game/stratos';
import { QUESTS } from '../services/quests';
import { PanelShell } from './Panels';
import { Icon } from './Icon';

const LOGO = 'assets/farm/ui/logo.png';

/** Live Stratos Coins balance, or null when the game runs outside the Stratos site. */
export function useStratosBalance(): number | null {
  const [bal, setBal] = useState<number | null>(() => coinBalance());
  useEffect(() => {
    setBal(coinBalance());
    return onCoinsChange((b) => setBal(b));
  }, []);
  return SC() ? bal : null;
}

export function Logo({ className = '' }: { className?: string }) {
  return <img className={`logo ${className}`} src={LOGO} alt="Stratos Farm: My Dream Village" draggable={false} />;
}

/** The title screen: logo, Play or Continue, How to play, Tips, About, sound switches. */
export function HomeScreen() {
  const screen = useFarm((s) => s.screen);
  const player = useFarm((s) => s.player);
  const stats = useFarm((s) => s.stats);
  const buildings = useFarm((s) => s.buildings);
  const prefs = useFarm((s) => s.prefs);
  const setInfo = useFarm((s) => s.setInfoPanel);
  const stratos = useStratosBalance();
  const [tipIdx, setTipIdx] = useState(0);
  const [sure, setSure] = useState(false);
  useEffect(() => {
    const t = setInterval(() => setTipIdx((i) => (i + 1) % game.tips.length), 6000);
    return () => clearInterval(t);
  }, []);
  if (screen !== 'home') return null;
  const hasProgress = (stats.plant ?? 0) > 0 || buildings.length > 0 || player.level > 1 || player.xp > 0;
  return (
    <div className="home" data-testid="home">
      <Logo />
      <p className="tagline">{game.one_line}</p>
      <button className="btn big" onClick={() => farm.startGame()} data-testid="play">
        {hasProgress ? 'Continue' : 'Play'}
      </button>
      {hasProgress && <p className="resume-note" data-testid="resume-note">Level {player.level} · {player.coins} coins · your farm kept growing while you were away</p>}
      <div className="home-row">
        <button className="btn small" onClick={() => setInfo('how')} data-testid="home-how">How to play</button>
        <button className="btn small" onClick={() => setInfo('tips')} data-testid="home-tips">Tips</button>
        <button className="btn small" onClick={() => setInfo('about')} data-testid="home-about">About</button>
      </div>
      <div className="home-row slim">
        <button className={`round-btn ${prefs.music ? '' : 'off'}`} aria-pressed={prefs.music} aria-label={`Music ${prefs.music ? 'on' : 'off'}`} onClick={() => setPref('music', !prefs.music)} data-testid="home-music">
          <Icon name={prefs.music ? 'music_on' : 'music_off'} size={26} />
        </button>
        <button className={`round-btn ${prefs.sfx ? '' : 'off'}`} aria-pressed={prefs.sfx} aria-label={`Sound effects ${prefs.sfx ? 'on' : 'off'}`} onClick={() => setPref('sfx', !prefs.sfx)} data-testid="home-sfx">
          <Icon name={prefs.sfx ? 'sound_on' : 'sound_off'} size={26} />
        </button>
        {stratos !== null && <span className="chip" data-testid="home-stratos"><Icon atlas="atlas_ui_fx" name="logo_small" size={22} /> {stratos} Stratos Coins</span>}
      </div>
      <p className="tip" data-testid="home-tip">Tip: {game.tips[tipIdx]}</p>
      {hasProgress && (
        <button className="link" onClick={() => (sure ? farm.startNewFarm() : setSure(true))} data-testid="new-farm">
          {sure ? 'Really delete this farm and start over? Tap again' : 'Start a new farm'}
        </button>
      )}
    </div>
  );
}

const section = (title: string, children: React.ReactNode) => (
  <section className="doc"><h4>{title}</h4>{children}</section>
);

export function HowToPlayPanel() {
  const open = useFarm((s) => s.infoPanel === 'how');
  const setInfo = useFarm((s) => s.setInfoPanel);
  if (!open) return null;
  const steps = QUESTS.filter((q) => q.type === 'tutorial').sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  return (
    <PanelShell title="How to play" testId="how-panel" onClose={() => setInfo(null)} center>
      <p>{game.how_to_play}</p>
      {section('Your first five steps', <ol>{steps.map((s) => <li key={s.id}><b>{s.title}.</b> {s.desc}</li>)}</ol>)}
      {section('Controls', <ul>{game.controls.map((c) => <li key={c}>{c}</li>)}</ul>)}
      {section('Stratos Coins', (
        <ul>
          <li>Earn them by trying the game for the first time and by reaching each new level.</li>
          <li>Spend them on a <b>Speed-up</b> (finish a crop, an animal or a recipe at once) or a <b>Hint</b> (how to make a missing item).</li>
          <li>They are shared with every game on Stratos Games. Your Farm Coins stay in this game only.</li>
        </ul>
      ))}
    </PanelShell>
  );
}

export function TipsPanel() {
  const open = useFarm((s) => s.infoPanel === 'tips');
  const setInfo = useFarm((s) => s.setInfoPanel);
  if (!open) return null;
  return (
    <PanelShell title="Tips" testId="tips-panel" onClose={() => setInfo(null)} center>
      <ul className="tips">{game.tips.map((t) => <li key={t}>{t}</li>)}</ul>
    </PanelShell>
  );
}

export function AboutPanel() {
  const open = useFarm((s) => s.infoPanel === 'about');
  const setInfo = useFarm((s) => s.setInfoPanel);
  if (!open) return null;
  return (
    <PanelShell title="About" testId="about-panel" onClose={() => setInfo(null)} center>
      <Logo className="small" />
      {game.description.split('\n\n').map((p) => <p key={p.slice(0, 24)}>{p}</p>)}
      {section('The story', <p>{game.story}</p>)}
      {section('Questions', <dl>{game.faq.map((f) => <div key={f.q}><dt>{f.q}</dt><dd>{f.a}</dd></div>)}</dl>)}
      {section('Credits', <p>Made by {game.maker} for Stratos Games. Art and sound are original to this game. Your farm is saved on this device only.</p>)}
    </PanelShell>
  );
}

/** Gear button: sound, help links, back to the home screen. */
export function SettingsPanel() {
  const open = useFarm((s) => s.infoPanel === 'settings');
  const setInfo = useFarm((s) => s.setInfoPanel);
  const prefs = useFarm((s) => s.prefs);
  const stratos = useStratosBalance();
  if (!open) return null;
  return (
    <PanelShell title="Settings" testId="settings-panel" onClose={() => setInfo(null)} center>
      <ul className="rows">
        <li><button className="row" onClick={() => setPref('music', !prefs.music)} aria-pressed={prefs.music} data-testid="set-music">
          <Icon name={prefs.music ? 'music_on' : 'music_off'} size={32} /><span className="grow"><b>Music</b><small>{prefs.music ? 'On' : 'Off'}</small></span>
        </button></li>
        <li><button className="row" onClick={() => setPref('sfx', !prefs.sfx)} aria-pressed={prefs.sfx} data-testid="set-sfx">
          <Icon name={prefs.sfx ? 'sound_on' : 'sound_off'} size={32} /><span className="grow"><b>Sound effects</b><small>{prefs.sfx ? 'On' : 'Off'}</small></span>
        </button></li>
        {stratos !== null && (
          <li><div className="row"><Icon atlas="atlas_ui_fx" name="logo_small" size={32} /><span className="grow"><b>Stratos Coins: {stratos}</b><small>Earn them by reaching new levels. Spend them on speed-ups and hints.</small></span></div></li>
        )}
      </ul>
      <div className="actions-grid">
        <button className="btn small" onClick={() => setInfo('how')} data-testid="set-how">How to play</button>
        <button className="btn small" onClick={() => setInfo('tips')}>Tips</button>
        <button className="btn small" onClick={() => setInfo('about')}>About</button>
        <button className="btn small" onClick={() => farm.goHome()} data-testid="set-home">Home screen</button>
      </div>
    </PanelShell>
  );
}
