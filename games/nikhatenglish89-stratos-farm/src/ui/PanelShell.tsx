import { useLayoutEffect, useRef } from 'react';
import { useFarm } from '../state/store';

const MIN_SCALE = 0.45;

/**
 * The frame every pop-up uses. In the game it docks on the LEFT (bottom on a portrait phone) so the farm stays visible, and it
 * never scrolls: whatever is inside is squeezed to fit the window (lists use columns, pages and tabs first, so this is only the safety net).
 * On the home screen it opens in the middle instead.
 */
export function PanelShell({ title, onClose, testId, children, wide = false, center, closeTestId }: {
  title: string; onClose: () => void; testId: string; children: React.ReactNode; wide?: boolean; center?: boolean; closeTestId?: string;
}) {
  const screen = useFarm((s) => s.screen);
  const middle = center ?? screen === 'home';
  const panel = useRef<HTMLElement>(null);
  const inner = useRef<HTMLDivElement>(null);

  const fit = () => {
    const p = panel.current, i = inner.current;
    if (!p || !i) return;
    i.style.transform = ''; i.style.width = ''; i.style.marginBottom = '';
    const avail = p.clientHeight;                 // the panel is capped by its max-height, so this is the room we have
    let h = i.offsetHeight;
    if (h <= avail + 1) return;
    let s = Math.max(MIN_SCALE, avail / h);
    for (let k = 0; k < 4; k++) {                 // a wider, scaled-down copy re-wraps shorter, so settle in a few steps
      i.style.width = `${100 / s}%`;
      i.style.transform = `scale(${s})`;
      h = i.offsetHeight * s;
      if (h <= avail + 1 || s <= MIN_SCALE) break;
      s = Math.max(MIN_SCALE, s * (avail / h));
    }
    i.style.marginBottom = `${-(i.offsetHeight * (1 - s))}px`;   // the box is as tall as what you see, so the frame hugs it
  };
  useLayoutEffect(() => { fit(); const f = requestAnimationFrame(fit); return () => cancelAnimationFrame(f); });   // after every render, and once more a frame later
  useLayoutEffect(() => { window.addEventListener('resize', fit); return () => window.removeEventListener('resize', fit); }, []);

  return (
    <aside ref={panel} className={`info-panel${wide ? ' two' : ''}${middle ? ' center' : ''}`} role="dialog" aria-label={title} data-testid={testId} onLoadCapture={fit}>
      <div ref={inner} className="panel-fit">
        <div className="ribbon">{title}</div>
        <div className="panel-body">{children}</div>
        <div className="panel-actions">
          <button className="btn" onClick={onClose} data-testid={closeTestId ?? `${testId}-close`}>Close</button>
        </div>
      </div>
    </aside>
  );
}
