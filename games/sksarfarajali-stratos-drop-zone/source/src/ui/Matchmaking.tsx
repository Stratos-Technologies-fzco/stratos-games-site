import { useEffect, useMemo, useState } from 'preact/hooks';
import tipsData from '../data/tips.json';
import { Pic } from './art';

const IMAGES = Object.keys(tipsData.images) as (keyof typeof tipsData.images)[];
const TOTAL = 24;

/** Picks one of the six loading images at random, never the same one twice in a row, and resolves its location name and loot tier. */
export function pickLoading(rand = Math.random) {
  let last = -1; try { last = Number(localStorage.getItem('sdz-lastload') ?? -1); } catch { /* storage unavailable */ }
  const options = IMAGES.map((_, i) => i).filter((i) => i !== last); const i = options[Math.floor(rand() * options.length)];
  try { localStorage.setItem('sdz-lastload', String(i)); } catch { /* ignore */ }
  const key = IMAGES[i]; const info = tipsData.images[key] as { name?: string; tier?: string; random?: boolean };
  const loc = info.random ? tipsData.randomLocations[Math.floor(rand() * tipsData.randomLocations.length)] : { name: info.name!, tier: info.tier! };
  return { index: i, image: `loading/${key}`, name: loc.name, tier: loc.tier };
}

export function Matchmaking({ onDone, onCancel }: { onDone: () => void; onCancel: () => void }) {
  const pick = useMemo(() => pickLoading(), []);
  const [n, setN] = useState(1); const [left, setLeft] = useState(6); const [tip, setTip] = useState(() => Math.floor(Math.random() * tipsData.tips.length));
  useEffect(() => {
    // Offline: the other slots are filled by bots, so the count climbs quickly. The countdown is the real time until the match starts.
    let count = 1, closed = false;
    const fill = setInterval(() => { count = Math.min(TOTAL, count + 1 + Math.floor(Math.random() * 2)); setN(count); if (count >= TOTAL) { clearInterval(fill); setTimeout(() => { if (!closed) { closed = true; onDone(); } }, 900); } }, 280);
    const sec = setInterval(() => setLeft((s) => Math.max(0, s - 1)), 1000);
    const tips = setInterval(() => setTip((t) => (t + 1) % tipsData.tips.length), 8000);
    return () => { closed = true; clearInterval(fill); clearInterval(sec); clearInterval(tips); };
  }, []);
  const startNow = () => { setN(TOTAL); setTimeout(onDone, 150); };
  return (
    <div class="mm">
      <Pic name={pick.image} cls="bgpic kb" lazy={false} />
      <div class="mm-shade" />
      <div class="mm-title t"><small>STRATOS</small>DROP ZONE</div>
      <div class="glass mm-count"><span>Finding players</span> <b>{n} / {TOTAL}</b> · <i>0:{String(left).padStart(2, '0')}</i></div>
      <div class="mm-note">Bots fill the empty slots</div>
      <div class="mm-bottom">
        <div class="mm-spot">DROP SPOT · {pick.tier.toUpperCase()}</div>
        <div class="mm-name t">{pick.name.toUpperCase()}</div>
        <div class="mm-tip" key={tip} aria-live="polite">Tip: {tipsData.tips[tip]}</div>
        <div class="mm-bar" role="progressbar" aria-valuemin={0} aria-valuemax={TOTAL} aria-valuenow={n}><i style={{ width: `${(n / TOTAL) * 100}%` }} /></div>
        <div class="mm-actions"><button class="pill" onClick={onCancel}><span>Cancel</span></button><button class="pill on" onClick={startNow}><span>Start now</span></button></div>
      </div>
    </div>
  );
}
