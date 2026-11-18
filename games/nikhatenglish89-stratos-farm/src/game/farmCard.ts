import type { FarmSnapshot } from '../services/types';

export const SHARE_URL = 'https://stratos.games/play/stratos-farm-my-dream-village/';

export interface CardData { level: number; buildings: number; animals: number; harvests: number; orders: number }

export function cardData(s: Pick<FarmSnapshot, 'level' | 'buildings' | 'animals' | 'stats'>): CardData {
  return { level: s.level, buildings: s.buildings.length, animals: s.animals.length, harvests: s.stats.harvest ?? 0, orders: s.stats.order ?? 0 };
}

export function shareText(d: CardData): string {
  return `My Stratos Farm village is level ${d.level}: ${d.buildings} buildings, ${d.animals} animals and ${d.orders} orders delivered. Come and grow yours!`;
}

function loadImage(src: string): Promise<HTMLImageElement | null> {
  return new Promise((res) => { const i = new Image(); i.onload = () => res(i); i.onerror = () => res(null); i.src = src; });
}

/** A little picture of the village stats, drawn on a canvas (800 x 420 PNG). */
export async function drawCard(d: CardData): Promise<Blob | null> {
  const c = document.createElement('canvas');
  c.width = 800; c.height = 420;
  const x = c.getContext('2d');
  if (!x) return null;
  const g = x.createLinearGradient(0, 0, 0, 420);
  g.addColorStop(0, '#7ec8ee'); g.addColorStop(0.62, '#cdeeb0'); g.addColorStop(1, '#78c24a');
  x.fillStyle = g; x.fillRect(0, 0, 800, 420);
  const logo = await loadImage('assets/farm/ui/logo.png');
  if (logo) x.drawImage(logo, 250, 12, 300, 125);
  x.fillStyle = '#fff6df'; x.strokeStyle = '#3b2a1e'; x.lineWidth = 6;
  x.beginPath(); x.roundRect(60, 150, 680, 190, 24); x.fill(); x.stroke();
  x.fillStyle = '#3b2a1e'; x.textAlign = 'center';
  x.font = 'bold 40px Trebuchet MS, Segoe UI, sans-serif';
  x.fillText(`My village is level ${d.level}`, 400, 205);
  x.font = 'bold 28px Trebuchet MS, Segoe UI, sans-serif';
  const cols: [string, number][] = [['Buildings', d.buildings], ['Animals', d.animals], ['Harvests', d.harvests], ['Orders', d.orders]];
  cols.forEach(([label, n], i) => {
    const cx = 140 + i * 173;
    x.fillStyle = '#3b2a1e'; x.fillText(String(n), cx, 270);
    x.font = '20px Trebuchet MS, Segoe UI, sans-serif'; x.fillStyle = '#7a5a3a'; x.fillText(label, cx, 300);
    x.font = 'bold 28px Trebuchet MS, Segoe UI, sans-serif';
  });
  x.fillStyle = '#3b2a1e'; x.font = 'bold 24px Trebuchet MS, Segoe UI, sans-serif';
  x.fillText('Play free at stratos.games', 400, 390);
  return new Promise((res) => c.toBlob((b) => res(b), 'image/png'));
}

/** Share the card (and text) with the device share sheet; otherwise download the picture. Returns what happened. */
export async function shareVillage(d: CardData): Promise<'shared' | 'downloaded' | 'copied' | 'failed'> {
  const text = shareText(d);
  try {
    const blob = await drawCard(d);
    const nav = navigator as Navigator & { canShare?: (x: unknown) => boolean };
    if (blob) {
      const file = new File([blob], 'my-stratos-farm.png', { type: 'image/png' });
      if (nav.canShare?.({ files: [file] }) && nav.share) { await nav.share({ files: [file], text, url: SHARE_URL }); return 'shared'; }
    }
    if (nav.share) { await nav.share({ text, url: SHARE_URL }); return 'shared'; }
    if (blob) {
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob); a.download = 'my-stratos-farm.png';
      document.body.appendChild(a); a.click(); a.remove();
      setTimeout(() => URL.revokeObjectURL(a.href), 2000);
      try { await navigator.clipboard?.writeText(`${text} ${SHARE_URL}`); return 'copied'; } catch { return 'downloaded'; }
    }
    await navigator.clipboard?.writeText(`${text} ${SHARE_URL}`);
    return 'copied';
  } catch (e) {
    if ((e as Error)?.name === 'AbortError') return 'failed'; // the player closed the share sheet
    return 'failed';
  }
}
