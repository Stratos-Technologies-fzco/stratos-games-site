import { LobbyBg, Pic } from './art';
import type { Outfit } from './outfits';

export type Diff = 'easy' | 'normal' | 'hard';
export type Tab = 'play' | 'survivors' | 'locker' | 'ranks' | 'missions';
export interface LobbyProps {
  outfit: Outfit; level: number; pct: number; shards: number; mode: 'solo' | 'training'; demo: boolean; diff: Diff; bots: boolean; musicOn: boolean; tab: Tab;
  onMode: (m: 'solo' | 'training') => void; onDemo: () => void; onPlay: () => void; onDiff: (d: Diff) => void; onBots: (b: boolean) => void; onTab: (t: Tab) => void;
  onMusic: () => void; onInfo: (k: 'how' | 'about') => void; onSettings: () => void; onTeaser: () => void;
}

/** Face crop of the equipped outfit, used as the player avatar. */
export function Avatar({ outfit, cls }: { outfit: Outfit; cls?: string }) {
  const f = outfit.frames[0];
  return (
    <picture class={cls}>
      {f.webp && <source srcset={f.webp} type="image/webp" />}
      <img src={f.src} alt="" aria-hidden="true" decoding="async" draggable={false} style={`object-position:${outfit.avatarPos}`} />
    </picture>
  );
}

export function Lobby(p: LobbyProps) {
  const sel = (m: 'solo' | 'training') => p.mode === m && !p.demo;
  return (
    <div class="lobby2">
      <LobbyBg />
      <div class="lobby-shade" />
      <div class="lb-top">
        <div class="glass lb-chip"><Avatar outfit={p.outfit} cls="lb-av" /><div><div class="lb-name">You · Lv {p.level}</div><div class="lb-xp"><i style={{ width: `${Math.round(p.pct * 100)}%` }} /></div></div></div>
        <div class="lb-title t">STRATOS <span>DROP</span> ZONE</div>
        <div class="lb-tools">
          <div class="glass lb-shards">◆ {p.shards} Shards</div>
          <button class="glass ib" aria-label={p.musicOn ? 'Music on' : 'Music off'} title="Music" onClick={p.onMusic}>{p.musicOn ? '♪' : '♪̸'}</button>
          <button class="glass ib" aria-label="How to play" title="How to play" onClick={() => p.onInfo('how')}>?</button>
          <button class="glass ib" aria-label="About" title="About" onClick={() => p.onInfo('about')}>i</button>
          <button class="glass ib" aria-label="Settings" title="Settings" onClick={p.onSettings}>⚙</button>
        </div>
      </div>

      <div class="lb-left">
        <span class="lbl">MODE</span>
        <div class="modes">
          <button class={`mode ${sel('solo') ? 'sel' : ''}`} onClick={() => p.onMode('solo')} aria-label="Solo, 24 players"><Pic name="cards/modes/mode_solo_600x800" cls="mode-img" /><span class="mode-name">SOLO</span></button>
          <button class={`mode ${sel('training') ? 'sel' : ''}`} onClick={() => p.onMode('training')} aria-label="Training"><Pic name="cards/modes/mode_training_600x800" cls="mode-img" /><span class="mode-name">TRAINING</span></button>
          <button class="mode locked" disabled aria-label="Squad, coming soon"><Pic name="cards/modes/mode_squad_locked_600x800" cls="mode-img" /><span class="mode-name two">SQUAD<small>Coming soon</small></span></button>
        </div>
        <span class="lbl">EVENT</span>
        <button class="event" onClick={p.onTeaser} aria-label="Season 2 teaser: Ember Isle"><Pic name="loading/teaser_season2_ember_isle" cls="event-img" /><span class="event-txt"><small>SEASON 2 TEASER</small><b class="t">EMBER ISLE</b></span></button>
        <button class={`pill ${p.demo ? 'on' : ''}`} onClick={p.onDemo}><span>▶ Demo · learn in 1 minute</span></button>
      </div>

      <div class="lb-right">
        <span class="lbl">OFFLINE MATCH · BOT DIFFICULTY</span>
        <div class="diffs">{(['easy', 'normal', 'hard'] as const).map((d) => <button class={`pill ${p.diff === d ? 'on' : ''}`} onClick={() => p.onDiff(d)}><span>{d[0].toUpperCase() + d.slice(1)}</span></button>)}</div>
        <label class="lb-check"><input type="checkbox" checked={p.bots} onChange={(e) => p.onBots((e.target as HTMLInputElement).checked)} /> Training: add 3 easy bots</label>
        <div class="lb-info">Vayu Island · 24 players · bots fill the empty slots</div>
        <button class="play" onClick={p.onPlay}>PLAY</button>
      </div>

      <nav class="lb-nav" aria-label="Menu">
        {(['play', 'survivors', 'locker', 'ranks', 'missions'] as const).map((t) => <button class={p.tab === t ? 'on' : ''} onClick={() => p.onTab(t)}>{p.tab === t && t === 'play' ? '▶ ' : ''}{t[0].toUpperCase() + t.slice(1)}</button>)}
      </nav>
    </div>
  );
}
