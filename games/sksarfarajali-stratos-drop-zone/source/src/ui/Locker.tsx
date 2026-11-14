import { useEffect, useRef, useState } from 'preact/hooks';
import { OUTFITS, isUnlocked, type Outfit } from './outfits';
import { Pic, preloadUi } from './art';

type LTab = 'outfits' | 'weapons' | 'gliders';

/** One outfit card. Cards with several images (Chrome Vanguard) rotate them on hover, or on each press on a touch screen. */
function OutfitCard({ o, level, selected, equipped, onSelect }: { o: Outfit; level: number; selected: boolean; equipped: boolean; onSelect: () => void }) {
  const [frame, setFrame] = useState(0); const timer = useRef<number | null>(null); const locked = !isUnlocked(o, level);
  const stop = () => { if (timer.current) clearInterval(timer.current); timer.current = null; setFrame(0); };
  useEffect(() => () => { if (timer.current) clearInterval(timer.current); }, []);
  const f = o.frames[frame % o.frames.length];
  return (
    <button class={`lk-card ${locked ? 'locked' : ''} ${selected ? 'sel' : ''}`} style={`--rc:${o.color}`} aria-label={`${o.name}, ${o.rarityName.toLowerCase()} outfit${locked ? `, unlocks at level ${o.unlockLevel}` : ''}`} aria-pressed={selected}
      onClick={onSelect} onPointerEnter={(e) => { if (o.frames.length > 1 && e.pointerType === 'mouse' && !timer.current) timer.current = window.setInterval(() => setFrame((x) => x + 1), 900); }} onPointerLeave={stop}
      onPointerDown={(e) => { if (o.frames.length > 1 && e.pointerType !== 'mouse') setFrame((x) => x + 1); }}>
      <picture key={frame}>{f.webp && <source srcset={f.webp} type="image/webp" />}<img src={f.src} alt="" aria-hidden="true" loading="lazy" decoding="async" draggable={false} style={`object-position:${o.kind === 'survivor' ? 'center 20%' : 'center'}`} /></picture>
      <span class="lk-label"><small>{o.rarityName}</small><b>{o.name}</b></span>
      {equipped && <span class="lk-eq">EQUIPPED</span>}
      {locked && <span class="lk-lock"><span>Unlocks at Level {o.unlockLevel}</span></span>}
    </button>
  );
}

export function Locker({ level, equipped, onEquip, onClose }: { level: number; equipped: string; onEquip: (o: Outfit) => void; onClose: () => void }) {
  const [tab, setTab] = useState<LTab>('outfits'); const [selId, setSelId] = useState(equipped);
  useEffect(() => { preloadUi(['cards/skins/chrome_vanguard_kneel_600x800', 'cards/skins/chrome_vanguard_sprint_600x800']); }, []);
  const sel = OUTFITS.find((o) => o.id === selId) ?? OUTFITS[0]; const locked = !isUnlocked(sel, level); const isEq = equipped === sel.id;
  return (
    <div class="locker">
      <div class="lk-top">
        <div class="lk-left"><button class="pill" onClick={onClose} aria-label="Back to the lobby"><span>‹ Back</span></button><div class="lk-title t">LOCKER</div></div>
        <div class="lk-tabs" role="tablist">{([['outfits', 'Outfits'], ['weapons', 'Weapon skins'], ['gliders', 'Gliders']] as const).map(([k, l]) => <button role="tab" aria-selected={tab === k} class={`pill ${tab === k ? 'on' : ''}`} onClick={() => setTab(k)}><span>{l}</span></button>)}</div>
      </div>
      <div class="store-banner" aria-label="Vanguard collection">
        <Pic name="banners/store_banner_vanguard_1920x640" cls="sb-img" pos="center 30%" />
        <div class="sb-txt"><small>NEW OUTFITS</small><b class="t">VANGUARD COLLECTION</b><span>Chrome Vanguard at Level 10 · Ember Vanguard at Level 5</span></div>
      </div>
      {tab === 'outfits' ? (
        <div class="lk-body">
          <div class="lk-grid">{OUTFITS.map((o) => <OutfitCard key={o.id} o={o} level={level} selected={sel.id === o.id} equipped={equipped === o.id} onSelect={() => setSelId(o.id)} />)}</div>
          <div class="glass lk-detail" style={`--rc:${sel.color}`}>
            <div class="lk-rar">{sel.rarityName} OUTFIT</div>
            <div class="lk-name t">{sel.name.toUpperCase()}</div>
            <p>{sel.description}</p>
            <div class="lk-unlock">{locked ? `Unlock: reach Level ${sel.unlockLevel} (you are Level ${level})` : sel.unlockLevel > 1 ? `Unlocked at Level ${sel.unlockLevel}` : 'Unlocked'}</div>
            <button class="play sm" disabled={locked || isEq} onClick={() => onEquip(sel)}>{locked ? 'LOCKED' : isEq ? 'EQUIPPED' : 'EQUIP'}</button>
          </div>
        </div>
      ) : (
        <div class="lk-body"><div class="glass lk-soon"><b class="t">{tab === 'weapons' ? 'WEAPON SKINS' : 'GLIDERS'}</b><span>Coming soon</span></div></div>
      )}
    </div>
  );
}
