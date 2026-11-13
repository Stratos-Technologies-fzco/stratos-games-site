import { useEffect, useRef, useState } from 'preact/hooks';
import B from '../balance.json';
import type { Game } from '../game/game';
import type { Hud } from '../game/types';
import { OUTLINE, RIVER, POIS, MAP, HALF } from '../core/world';
import { input, isTouch, press, settings, touch } from '../input';
import { iconFor } from '../render/icons';
import { audio } from '../audio';
import { itemLabel } from '../game/loot';

const RC = B.rarity.colors;

function Icon({ name, size }: { name: string; size?: number }) {
  const [src, setSrc] = useState('');
  useEffect(() => { let on = true; if (name) iconFor(name).then((s) => on && setSrc(s)); return () => { on = false; }; }, [name]);
  return src ? <img src={src} alt="" style={size ? { width: size, height: size } : undefined} /> : <div style={{ height: 30 }} />;
}

function drawMap(c: HTMLCanvasElement, hud: Hud, big: boolean) {
  const ctx = c.getContext('2d')!; const S = c.width; const k = S / MAP; const tx = (x: number) => (x + HALF) * k, tz = (z: number) => (z + HALF) * k;
  ctx.clearRect(0, 0, S, S); ctx.fillStyle = '#1e7fa8'; ctx.fillRect(0, 0, S, S);
  ctx.beginPath(); OUTLINE.forEach(([x, z], i) => (i ? ctx.lineTo(tx(x), tz(z)) : ctx.moveTo(tx(x), tz(z)))); ctx.closePath(); ctx.fillStyle = '#e8c98b'; ctx.fill(); ctx.save(); ctx.clip();
  ctx.fillStyle = '#3e9b5f'; ctx.globalAlpha = 0.9; ctx.beginPath(); OUTLINE.forEach(([x, z], i) => { const cx = tx(x) * 0.92 + S * 0.04, cz = tz(z) * 0.92 + S * 0.04; i ? ctx.lineTo(cx, cz) : ctx.moveTo(cx, cz); }); ctx.closePath(); ctx.fill(); ctx.globalAlpha = 1;
  ctx.strokeStyle = '#2c8fbb'; ctx.lineWidth = Math.max(2, 8 * k); ctx.beginPath(); RIVER.forEach(([x, z], i) => (i ? ctx.lineTo(tx(x), tz(z)) : ctx.moveTo(tx(x), tz(z)))); ctx.stroke(); ctx.restore();
  ctx.strokeStyle = '#5b4a2a'; ctx.lineWidth = 1; ctx.beginPath(); OUTLINE.forEach(([x, z], i) => (i ? ctx.lineTo(tx(x), tz(z)) : ctx.moveTo(tx(x), tz(z)))); ctx.closePath(); ctx.stroke();
  if (big) { ctx.fillStyle = '#fff'; ctx.font = `${Math.round(S / 46)}px sans-serif`; ctx.textAlign = 'center'; for (const p of POIS) { ctx.fillStyle = p.tier === 'top' ? '#FFB020' : p.tier === 'high' ? '#A78BFA' : '#fff'; ctx.fillText(p.name, tx(p.x), tz(p.z) - 4); ctx.beginPath(); ctx.arc(tx(p.x), tz(p.z), 3, 0, 7); ctx.fill(); } }
  if (hud.zone) {
    ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(tx(hud.zone.cx), tz(hud.zone.cz), hud.zone.r * k, 0, 7); ctx.stroke();
    ctx.setLineDash([5, 4]); ctx.strokeStyle = '#A78BFA'; ctx.beginPath(); ctx.arc(tx(hud.zone.nx), tz(hud.zone.nz), hud.zone.nr * k, 0, 7); ctx.stroke(); ctx.setLineDash([]);
  }
  ctx.fillStyle = '#FF4D5E'; for (const s of hud.shots) { ctx.globalAlpha = Math.min(1, s.t); ctx.beginPath(); ctx.arc(tx(s.x), tz(s.z), 3, 0, 7); ctx.fill(); } ctx.globalAlpha = 1;
  if (hud.marker) { ctx.fillStyle = '#4ADE80'; ctx.beginPath(); ctx.arc(tx(hud.marker.x), tz(hud.marker.z), 5, 0, 7); ctx.fill(); }
  if (hud.phase === 'flight') { ctx.strokeStyle = 'rgba(255,255,255,.7)'; ctx.setLineDash([6, 5]); ctx.beginPath(); ctx.moveTo(tx(hud.planeX - hud.planeDir[0] * 500), tz(hud.planeZ - hud.planeDir[1] * 500)); ctx.lineTo(tx(hud.planeX + hud.planeDir[0] * 500), tz(hud.planeZ + hud.planeDir[1] * 500)); ctx.stroke(); ctx.setLineDash([]); ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(tx(hud.planeX), tz(hud.planeZ), 5, 0, 7); ctx.fill(); }
  ctx.save(); ctx.translate(tx(hud.px), tz(hud.pz)); ctx.rotate(-hud.yaw + Math.PI); ctx.fillStyle = '#FFB020'; ctx.strokeStyle = '#000'; ctx.beginPath(); ctx.moveTo(0, -7); ctx.lineTo(5, 6); ctx.lineTo(0, 3); ctx.lineTo(-5, 6); ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.restore();
}
function MapCanvas({ hud, big, size, onClick }: { hud: Hud; big?: boolean; size: number; onClick?: () => void }) {
  const ref = useRef<HTMLCanvasElement>(null); useEffect(() => { if (ref.current) drawMap(ref.current, hud, !!big); });
  return <canvas ref={ref} class={big ? '' : 'mini'} width={size} height={size} onClick={onClick} style={big ? undefined : { width: '100%', height: 'auto' }} />;
}
const fmt = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
const heading = (y: number) => { const d = ((-y * 180) / Math.PI + 180 + 360 * 10) % 360; return d; };

function HoldBtn({ cls, label, down, set }: { cls: string; label: string; down: boolean; set: (v: boolean) => void }) {
  return <button class={cls + (down ? ' down on' : '')} onPointerDown={(e) => { e.preventDefault(); (e.target as HTMLElement).setPointerCapture?.(e.pointerId); set(true); }} onPointerUp={() => set(false)} onPointerCancel={() => set(false)} onContextMenu={(e) => e.preventDefault()}>{label}</button>;
}

export function Hud({ g, hud, onPause, onLobby, onAgain }: { g: Game; hud: Hud; onPause: () => void; onLobby: () => void; onAgain: () => void }) {
  const touchUI = isTouch(); const p = g.player; const [, force] = useState(0);
  const dirs = [['N', 0], ['E', 90], ['S', 180], ['W', 270]] as const; const hd = heading(hud.yaw);
  const res = hud.result;
  if (hud.phase === 'menu') return null;
  return (
    <div class="layer hud">
      {hud.scope > 0 && <div class="scope" />}
      <div class={`vig ${hud.hp < 35 || hud.dmgArc.length ? 'on' : ''}`} /><div class={`vig storm ${hud.inZoneDanger ? 'on' : ''}`} />
      {hud.phase === 'flight' ? (
        <div class="flight">
          <div class="info panel"><span>ALT {hud.alt || '—'} m</span><span>{hud.alive} aboard</span>{hud.canJump && <span class="pill">AUTO-JUMP {Math.ceil(hud.autoJumpIn)}s</span>}</div>
          <div class="tl" style="left:10px;top:10px;pointer-events:auto"><MapCanvas hud={hud} size={140} /></div>
          {hud.canJump && <button class="jumpbtn" style="pointer-events:auto" onClick={() => { press('jump'); }}>JUMP</button>}
        </div>
      ) : (
        <>
          <div class="tl"><MapCanvas hud={hud} size={280} onClick={() => press('map')} />
            <div class="mini-sub panel t">{hud.zone ? `Phase ${hud.zone.phase} · ${hud.zone.stage === 'shrink' ? 'closing ' : ''}${fmt(hud.zone.timeLeft)}` : hud.mode === 'training' ? 'Training' : 'Landing…'}</div></div>
          <div class="tc">
            <div class="counters"><div class="panel"><small>ALIVE</small>{hud.alive}</div><div class="panel"><small>KILLS</small>{hud.kills}</div><div class="panel"><small>TOKENS</small>{hud.tokens}</div></div>
            <div class="compass panel"><div class="mid-tick" />{[0, 45, 90, 135, 180, 225, 270, 315].map((a) => { let d = ((a - hd + 540) % 360) - 180; const lab = dirs.find(([, v]) => v === a)?.[0] ?? String(a); return Math.abs(d) < 70 ? <span class="tick" style={{ left: `${50 + (d / 70) * 50}%` }}>{lab}</span> : null; })}</div>
          </div>
          <div class="tr">{hud.feed.map((f) => <div key={f.id} class={`feed panel ${f.mine ? 'mine' : ''}`}>{f.text}</div>)}</div>
          {hud.prompt && <div class="prompt panel" style={{ color: hud.prompt.color, borderColor: hud.prompt.color }} onClick={() => press('interact')}>{touchUI ? 'Tap: ' : '[F] '}{hud.prompt.text}</div>}
          {hud.chat && <div class="chat panel">{hud.chat}</div>}
          {hud.banner && <div class="banner panel">{hud.banner.text}</div>}
          {hud.hitT > 0 && <div class={`hitm ${hud.hitHead ? 'head' : ''}`} />}
          {!hud.scope && hud.hp > 0 && <div class="xhair">{[-1, 1].map((s) => <><i class="a" style={{ top: s * (6 + hud.spread * 600) - 4 }} /><i class="b" style={{ left: s * (6 + hud.spread * 600) - 4 }} /></>)}</div>}
          {hud.numbers.map((n) => <div key={n.id} class={`num ${n.head ? 'head' : ''}`} style={{ left: n.x, top: n.y }}>{n.v}</div>)}
          <div class="arc">{hud.dmgArc.map((d) => <i style={{ transform: `rotate(${(d.a * 180) / Math.PI + 180}deg)`, opacity: Math.min(1, d.t) }} />)}</div>
          {hud.reloading > 0 && <div class="chat panel" style="bottom:210px">Reloading {Math.round(hud.reloading * 100)}%</div>}
          {hud.healing > 0 && <div class="chat panel" style="bottom:210px;color:var(--green)">Healing {Math.round(hud.healing * 100)}%</div>}
          {hud.spectating && <div class="banner panel" style="top:12%;color:var(--text);border-color:var(--line);pointer-events:auto">Spectating {hud.spectating}<br /><button class="btn" onClick={() => { g.spectateNext(); force((n) => n + 1); }}>Next player</button></div>}
          <div class="bc">
            <div class="weap">
              {hud.slots.map((s, i) => <button key={i} class={`wcard panel ${s.active ? 'on' : ''}`} style={{ borderBottom: s.id ? `3px solid ${RC[s.rarity]}` : undefined }} onPointerDown={() => { input.slot = i; }}><span class="k">{i + 1}</span>{s.id ? <Icon name={s.id} /> : <div style="height:30px" />}<div>{s.label}</div>{s.id && s.id !== 'tide_machete' && <div class="am">{s.mag}{s.active ? ` / ${hud.ammoReserve}` : ''}</div>}</button>)}
              <button class="sbtn panel" onClick={() => press('heal')}>Heal<b>{hud.heals.bandage + hud.heals.medkit}</b></button>
              <button class="sbtn panel" onClick={() => press('barrier')}>Barrier<b>{hud.heals.barriers}</b></button>
              <button class="sbtn panel" onClick={() => press('grenade')}>Grenade<b>{hud.heals.frag + hud.heals.smoke}</b></button>
            </div>
            <div class="bars" style="position:relative">
              <div class="bar2 ar" title="Armour"><i style={{ width: `${(hud.vest / hud.vestMax) * 100}%` }} /></div>
              <div class={`bar2 hp ${hud.hp < 35 ? 'low' : ''}`}><i style={{ width: `${hud.hp}%` }} /></div>
              <span class="hpnum" style="right:4px;top:8px">{hud.hp}{hud.helmet ? ` · helmet ${hud.helmet}` : ''}</span>
            </div>
          </div>
          <div style="position:fixed;right:12px;bottom:10px;display:flex;gap:6px;flex-direction:column;align-items:flex-end">{!touchUI && <div class="note">Tab pack · M map · Esc pause</div>}</div>
          {touchUI && (
            <div class="tbtns">
              <HoldBtn cls="fire" label="FIRE" down={touch.fire} set={(v) => { touch.fire = v; force((n) => n + 1); }} />
              <button class={`tb ${touch.aim ? 'on' : ''}`} style="right:132px;bottom:34px" onPointerDown={() => { touch.aim = !touch.aim; force((n) => n + 1); }}>AIM</button>
              <button class="tb" style="right:26px;bottom:138px" onPointerDown={() => press('jump')}>JUMP</button>
              <button class={`tb ${touch.crouch ? 'on' : ''}`} style="right:92px;bottom:100px" onPointerDown={() => { touch.crouch = !touch.crouch; force((n) => n + 1); }}>CROUCH</button>
              <button class="tb" style="right:150px;bottom:100px" onPointerDown={() => press('reload')}>RELOAD</button>
              <button class="tb" style="left:12px;bottom:60px" onPointerDown={() => press('inventory')}>PACK</button>
              <button class="tb" style="right:12px;top:150px" onPointerDown={onPause}>II</button>
            </div>
          )}
        </>
      )}
      {settings.fps && <div class="fps">{hud.fps} FPS · {hud.quality}</div>}
      {hud.mapOpen && <div class="bigmap" onClick={() => press('map')}><MapCanvas hud={hud} big size={720} /></div>}
      {hud.inventoryOpen && <InventoryPanel g={g} hud={hud} />}
      {hud.kioskOpen && <KioskPanel g={g} hud={hud} />}
      {res && (
        <div class="full center results">
          <h1 class={res.win ? 'win' : 'lose'}>{res.win ? 'STORM CLEARED' : 'ELIMINATED'}</h1>
          <div class="t" style="font-size:28px">#{res.placement}<span style="color:var(--muted);font-size:18px"> / {res.total}</span></div>
          <div class="tiles"><div class="tile"><b>{res.kills}</b><span>Eliminations</span></div><div class="tile"><b>{res.damage}</b><span>Damage</span></div><div class="tile"><b>{fmt(res.time)}</b><span>Survived</span></div><div class="tile"><b>{res.headshots}</b><span>Headshots</span></div><div class="tile"><b>{res.tokens}</b><span>Tokens earned</span></div><div class="tile"><b style="color:var(--violet)">+{res.xp}</b><span>XP</span></div></div>
          {!res.win && res.killer && <div class="note">Eliminated by {res.killer}</div>}
          <div style="display:flex;gap:10px"><button class="btn primary" onClick={onAgain}>Play again</button><button class="btn" onClick={onLobby}>Lobby</button><button class="btn" onClick={() => { const t = `I placed #${res.placement} in Stratos Drop Zone with ${res.kills} eliminations! https://stratos.games`; (navigator.share ? navigator.share({ text: t }) : navigator.clipboard?.writeText(t))?.catch?.(() => {}); }}>Share</button></div>
        </div>
      )}
    </div>
  );
}

function InventoryPanel({ g, hud }: { g: Game; hud: Hud }) {
  const p = g.player; const [, f] = useState(0); const W = B.weapons as Record<string, { label: string; damage: number; rpm?: number; mag: number; range: number }>;
  return (
    <div class="inv panel"><div class="t" style="font-size:18px;margin-bottom:6px">Backpack {hud.stack.length}/{hud.capacity}</div>
      {[0, 1, 2].map((s) => { const w = s === 2 ? p.inv.pistol : p.inv.main[s]; return <div class="invrow" key={s}><span style={{ color: w ? RC[w.rarity] : 'var(--muted)' }}>{w ? `${W[w.id].label} · ${Math.round(W[w.id].damage * (1 + B.rarity.damageBonus[w.rarity]))} dmg · ${W[w.id].range} m` : s === 2 ? 'Pistol: empty' : `Weapon ${s + 1}: empty`}</span>{w && <button class="btn" onClick={() => { g.dropSlot(p, s); f((n) => n + 1); }}>Drop</button>}</div>; })}
      {hud.stack.map((s) => <div class="invrow" key={s.id}><span>{({ light: 'Light ammo', heavy: 'Heavy ammo', shells: 'Shells', bandage: 'Bandage', medkit: 'Med kit', armour_repair_kit: 'Repair kit', frag_grenade: 'Frag grenade', smoke_can: 'Smoke can' } as Record<string, string>)[s.id] ?? s.id} × {s.qty}</span>
        {['bandage', 'medkit', 'armour_repair_kit'].includes(s.id) && <button class="btn" onClick={() => press('heal')}>Use</button>}{s.id === 'frag_grenade' && <button class="btn" onClick={() => press('grenade')}>Throw</button>}</div>)}
      <div class="invrow"><span>Barriers × {p.inv.barriers}</span><button class="btn" onClick={() => press('barrier')}>Place</button></div>
      <div class="note">Vest Lv{p.armour.vestLv} · Helmet Lv{p.armour.helmetLv} · Pack Lv{p.inv.backpackLv}</div>
      <button class="btn" onClick={() => press('inventory')} style="margin-top:8px">Close</button></div>
  );
}
function KioskPanel({ g, hud }: { g: Game; hud: Hud }) {
  const [msg, setMsg] = useState('');
  return (
    <div class="kiosk panel" style="background:var(--panel);border:1px solid var(--line)"><div class="t" style="font-size:20px">Supply kiosk <span style="float:right;color:var(--amber)">{hud.tokens} tokens</span></div>
      {B.kiosk.items.map((it) => <div class="invrow" key={it.id}><span>{it.label}</span><button class="btn" disabled={hud.tokens < it.price} onClick={() => { const r = g.buy(it.id); setMsg(r.ok ? 'Bought!' : 'Could not buy'); }}>{it.price}</button></div>)}
      <div class="note">{msg || 'Tokens are earned in the match. They never cost real money.'}</div><button class="btn" style="margin-top:8px" onClick={() => { g.kioskOpen = false; audio.play('tap'); }}>Close</button></div>
  );
}
void itemLabel;
