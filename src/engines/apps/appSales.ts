import type { AppBaseline, NotificationRecord } from '../simulation/types';

export const EMPTY_BASELINE: AppBaseline = {
  revenue: 0,
  sales: 0,
  adSpend: 0,
  pendingSales: 0,
  refunds: 0,
};

export const DEFAULT_APP_BASELINES: Record<string, AppBaseline> = {
  utmify: { revenue: 6480, sales: 44, adSpend: 405.2, pendingSales: 7, refunds: 131.35 },
  hotmart: { revenue: 3120, sales: 27, adSpend: 0, pendingSales: 3, refunds: 0 },
};

export type PaymentMethod = 'pix' | 'card' | 'boleto';

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  pix: 'Pix',
  card: 'Cartão',
  boleto: 'Boleto',
};

/** Share of the baseline sales per method, before notified sales are added */
const BASELINE_METHOD_SHARE: Record<PaymentMethod, number> = { pix: 0.62, card: 0.3, boleto: 0.08 };

export interface AppSales {
  revenue: number;
  sales: number;
  lastSaleAt: number | null;
  byMethod: Record<PaymentMethod, { sales: number; revenue: number }>;
}

function hashIndex(key: string, buckets: number[]): number {
  let hash = 0;
  for (let i = 0; i < key.length; i += 1) hash = (hash * 31 + key.charCodeAt(i)) >>> 0;
  const total = buckets.reduce((a, b) => a + b, 0);
  let point = hash % total;
  for (let i = 0; i < buckets.length; i += 1) {
    point -= buckets[i];
    if (point < 0) return i;
  }
  return buckets.length - 1;
}

function methodFor(notification: NotificationRecord): PaymentMethod {
  const title = notification.title.toLowerCase();
  if (title.includes('pix')) return 'pix';
  if (title.includes('cartão')) return 'card';
  if (title.includes('boleto')) return 'boleto';
  return (['pix', 'card', 'boleto'] as const)[hashIndex(notification.id, [62, 30, 8])];
}

function startOfDay(now: number): number {
  const d = new Date(now);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

/** Today's totals for one app: baseline + every sale it notified today (dismissed ones still count) */
export function computeAppSales(
  platformId: string,
  baseline: AppBaseline,
  live: NotificationRecord[],
  seed: NotificationRecord[],
  now = Date.now()
): AppSales {
  const dayStart = startOfDay(now);
  const byMethod = {
    pix: { sales: 0, revenue: 0 },
    card: { sales: 0, revenue: 0 },
    boleto: { sales: 0, revenue: 0 },
  };

  for (const method of Object.keys(byMethod) as PaymentMethod[]) {
    byMethod[method].sales = Math.round(baseline.sales * BASELINE_METHOD_SHARE[method]);
    byMethod[method].revenue = baseline.revenue * BASELINE_METHOD_SHARE[method];
  }

  let revenue = baseline.revenue;
  let sales = baseline.sales;
  let lastSaleAt: number | null = null;

  for (const n of [...live, ...seed]) {
    if (n.platformId !== platformId || n.amount <= 0 || n.summaryCount != null) continue;
    if (n.timestamp < dayStart || n.timestamp > now) continue;
    revenue += n.amount;
    sales += 1;
    const method = methodFor(n);
    byMethod[method].sales += 1;
    byMethod[method].revenue += n.amount;
    if (lastSaleAt == null || n.timestamp > lastSaleAt) lastSaleAt = n.timestamp;
  }

  return { revenue, sales, lastSaleAt, byMethod };
}

export interface AdMetrics {
  revenue: number;
  adSpend: number;
  profit: number;
  roi: number;
  roas: number;
  cpa: number;
  margin: number;
}

export function computeAdMetrics(sales: AppSales, baseline: AppBaseline): AdMetrics {
  const revenue = sales.revenue - baseline.refunds;
  const adSpend = baseline.adSpend;
  const profit = revenue - adSpend;
  return {
    revenue,
    adSpend,
    profit,
    roi: adSpend > 0 ? profit / adSpend : 0,
    roas: adSpend > 0 ? revenue / adSpend : 0,
    cpa: sales.sales > 0 ? adSpend / sales.sales : 0,
    margin: revenue > 0 ? profit / revenue : 0,
  };
}

export function formatBRL(value: number): string {
  return `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}
