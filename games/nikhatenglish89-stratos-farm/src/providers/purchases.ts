// Purchase provider contract with MOCK providers only. The game sells nothing today. When real payments exist they must be
// verified by a backend; the browser is never trusted to say "I paid". See docs/SECURITY_REVIEW.md.

export interface Product { id: string; title: string; gems: number; priceCents: number }
export interface Receipt { productId: string; transactionId: string; provider: string; mock: boolean }
export type PurchaseResult = { ok: true; receipt: Receipt } | { ok: false; error: 'cancelled' | 'unavailable' | 'error' };

export interface PurchaseProvider {
  readonly name: string;
  products(): Product[];
  purchase(productId: string): Promise<PurchaseResult>;
}

/** What only a server can answer: is this receipt genuine and unused? */
export interface ReceiptVerifier {
  verify(receipt: Receipt): Promise<{ valid: boolean; alreadyUsed: boolean }>;
}

export const MOCK_PRODUCTS: Product[] = [{ id: 'gems_small', title: 'A handful of gems', gems: 10, priceCents: 99 }];

export class MockPurchaseProvider implements PurchaseProvider {
  readonly name = 'mock';
  private n = 0;
  constructor(private outcome: 'ok' | 'cancel' = 'ok') {}
  products() { return MOCK_PRODUCTS; }
  async purchase(productId: string): Promise<PurchaseResult> {
    if (!MOCK_PRODUCTS.some((p) => p.id === productId)) return { ok: false, error: 'unavailable' };
    if (this.outcome === 'cancel') return { ok: false, error: 'cancelled' };
    return { ok: true, receipt: { productId, transactionId: `mock-${++this.n}`, provider: 'mock', mock: true } };
  }
}

/** Gems are granted only for a receipt the verifier confirms as valid and not used before. Mock receipts never count. */
export async function gemsForReceipt(receipt: Receipt, verifier: ReceiptVerifier | null): Promise<number> {
  if (!verifier || receipt.mock) return 0;
  const v = await verifier.verify(receipt);
  if (!v.valid || v.alreadyUsed) return 0;
  return MOCK_PRODUCTS.find((p) => p.id === receipt.productId)?.gems ?? 0;
}
