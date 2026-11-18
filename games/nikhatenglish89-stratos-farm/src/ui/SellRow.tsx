import { useState } from 'react';
import { farm } from '../game/controller';
import type { ItemDef } from '../services/data';
import { Icon } from './Icon';

/** One item you own, with a quantity picker: - / number / + / Max, then Sell for exactly that many. */
export function SellRow({ item, have, testId }: { item: ItemDef; have: number; testId: string }) {
  const [typed, setTyped] = useState('1');
  const parsed = parseInt(typed, 10);
  // always a whole number between 1 and what the player has (the stock can shrink after a sale)
  const qty = Math.min(have, Math.max(1, Number.isFinite(parsed) ? parsed : 1));
  const set = (n: number) => setTyped(String(Math.min(have, Math.max(1, n))));
  const id = item.id;
  return (
    <div className="row sell-row" data-testid={testId}>
      <Icon name={`item_${id}`} size={36} />
      <span className="grow"><b>{item.name} × {have}</b><small>{item.sellPrice} coins each</small></span>
      <div className="qty" role="group" aria-label={`How many ${item.name} to sell`}>
        <button className="qty-btn" onClick={() => set(qty - 1)} disabled={qty <= 1} aria-label="One less" data-testid={`minus-${id}`}>−</button>
        <input
          className="qty-input" inputMode="numeric" pattern="[0-9]*" aria-label={`Quantity of ${item.name}`} data-testid={`qty-${id}`}
          value={typed}
          onChange={(e) => setTyped(e.target.value.replace(/[^0-9]/g, '').slice(0, 5))}
          onBlur={() => set(qty)}
          onFocus={(e) => e.target.select()}
        />
        <button className="qty-btn" onClick={() => set(qty + 1)} disabled={qty >= have} aria-label="One more" data-testid={`plus-${id}`}>+</button>
        <button className="qty-btn max" onClick={() => set(have)} disabled={qty >= have} data-testid={`max-${id}`}>Max</button>
      </div>
      <button className="btn small" onClick={() => { farm.sell(id, qty); setTyped('1'); }} data-testid={`sell-${id}`}>
        Sell {qty} · {qty * item.sellPrice}
      </button>
    </div>
  );
}
