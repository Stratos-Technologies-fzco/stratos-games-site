import { useState } from 'react';

/** A long list shown a few at a time with Previous / Next, so a pop-up never needs a scroll bar. */
export function Paged<T>({ items, perPage, children, testId = 'pager' }: { items: T[]; perPage: number; children: (page: T[]) => React.ReactNode; testId?: string }) {
  const [page, setPage] = useState(0);
  const pages = Math.max(1, Math.ceil(items.length / perPage));
  const p = Math.min(page, pages - 1);
  return (
    <>
      {children(items.slice(p * perPage, p * perPage + perPage))}
      {pages > 1 && (
        <div className="pager" data-testid={testId}>
          <button className="qty-btn" disabled={p === 0} onClick={() => setPage(p - 1)} aria-label="Previous page" data-testid={`${testId}-prev`}>‹</button>
          <span data-testid={`${testId}-count`}>{p + 1} / {pages}</span>
          <button className="qty-btn" disabled={p >= pages - 1} onClick={() => setPage(p + 1)} aria-label="Next page" data-testid={`${testId}-next`}>›</button>
        </div>
      )}
    </>
  );
}
