import { v4 as uuidv4 } from 'uuid';
import type { CurrencyCode } from '../currency';
import { formatCurrency } from '../currency';
import type {
  SimulationEvent,
  SimulationMetrics,
  CurrencyMetrics,
  ChartDataPoint,
  TransactionRecord,
  NotificationRecord,
  TimelineEntry,
  BulkGeneratorConfig,
  IntensityLevel,
  CurrencyDistribution,
} from './types';
import { createEmptyMetrics } from './types';
import {
  PLATFORM_IDS,
  getPlatform,
  pickRandomPlatformId,
  resolvePlatformId,
} from '../platform';
import { formatPlatformMessage } from '../platform/messages';

const INTENSITY_MULTIPLIERS: Record<IntensityLevel, { min: number; max: number }> = {
  LOW: { min: 30, max: 180 },
  NORMAL: { min: 10, max: 120 },
  HIGH: { min: 5, max: 60 },
  VIRAL: { min: 2, max: 30 },
};

export function createDefaultTimeline(): TimelineEntry[] {
  return [
    { id: uuidv4(), offsetSeconds: 0, type: 'sale', currency: 'EUR', amount: 24, platformId: PLATFORM_IDS.stripe },
    { id: uuidv4(), offsetSeconds: 18, type: 'sale', currency: 'BRL', amount: 216.15, platformId: PLATFORM_IDS.stripe },
    { id: uuidv4(), offsetSeconds: 43, type: 'sale', currency: 'USD', amount: 97, platformId: PLATFORM_IDS.stripe },
    { id: uuidv4(), offsetSeconds: 72, type: 'sale', currency: 'EUR', amount: 9, platformId: PLATFORM_IDS.utmify },
    { id: uuidv4(), offsetSeconds: 95, type: 'sale', currency: 'BRL', amount: 47, platformId: PLATFORM_IDS.hotmart },
    { id: uuidv4(), offsetSeconds: 108, type: 'sale', currency: 'BRL', amount: 84.78, platformId: PLATFORM_IDS.stripe },
  ];
}

export function timelineToEvents(timeline: TimelineEntry[]): SimulationEvent[] {
  return timeline.map((entry) => {
    const platformId = resolvePlatformId(entry.platformId, entry.app);
    const platform = getPlatform(platformId);
    const message =
      entry.message ??
      formatPlatformMessage(platform.messageTemplate, entry.amount, entry.currency);
    return {
      id: entry.id,
      type: entry.type,
      amount: entry.amount,
      currency: entry.currency,
      timestamp: 0,
      offsetSeconds: entry.offsetSeconds,
      platformId,
      app: platform.name,
      title: platform.name,
      message,
      processed: false,
    };
  });
}

export function buildSaleMessage(amount: number, currency: CurrencyCode): string {
  return `Você recebeu um pagamento de ${formatCurrency(amount, currency)}`;
}

export function processEvent(
  event: SimulationEvent,
  metrics: SimulationMetrics,
  timestamp: number
): { metrics: SimulationMetrics; notification: NotificationRecord } {
  const newMetrics = { ...metrics, byCurrency: { ...metrics.byCurrency } };
  const currencyMetrics = { ...newMetrics.byCurrency[event.currency] };

  const affectsStripeMetrics = event.platformId === PLATFORM_IDS.stripe;

  if (event.type === 'sale' && affectsStripeMetrics) {
    currencyMetrics.revenue += event.amount;
    currencyMetrics.payments += 1;
    currencyMetrics.balance += event.amount;
    currencyMetrics.customers += 1;
  } else if (event.type === 'refund' && affectsStripeMetrics) {
    currencyMetrics.refunds += event.amount;
    currencyMetrics.balance -= event.amount;
  }

  newMetrics.byCurrency[event.currency] = currencyMetrics;
  if (affectsStripeMetrics) {
    newMetrics.totalEvents += 1;
  }

  const transaction: TransactionRecord = {
    id: uuidv4(),
    amount: event.amount,
    currency: event.currency,
    type: event.type,
    timestamp,
    status: event.type === 'refund' ? 'refunded' : 'paid',
    description: event.app,
  };

  newMetrics.transactions = [transaction, ...newMetrics.transactions].slice(0, 50);

  const lastPoint = newMetrics.chartData[newMetrics.chartData.length - 1];
  const cumulative: Partial<Record<CurrencyCode, number>> = {
    ...(lastPoint?.cumulative ?? {}),
  };
  cumulative[event.currency] = (cumulative[event.currency] ?? 0) + event.amount;

  const chartPoint: ChartDataPoint = {
    timestamp,
    values: { [event.currency]: event.amount },
    cumulative: { ...cumulative },
  };

  if (affectsStripeMetrics) {
    newMetrics.chartData = [...newMetrics.chartData, chartPoint].slice(-100);
  }

  const notification: NotificationRecord = {
    id: uuidv4(),
    platformId: event.platformId,
    app: event.app,
    title: event.app,
    message: event.message ?? buildSaleMessage(event.amount, event.currency),
    amount: event.amount,
    currency: event.currency,
    timestamp,
    status: 'active',
    eventId: event.id,
  };

  return { metrics: newMetrics, notification };
}

export function resetMetrics(): SimulationMetrics {
  return createEmptyMetrics();
}

export function getCurrencyTotals(metrics: SimulationMetrics): Record<CurrencyCode, CurrencyMetrics> {
  return metrics.byCurrency;
}

export function pickCurrencyByDistribution(
  distribution: CurrencyDistribution,
  enabled: CurrencyCode[]
): CurrencyCode {
  const weights = enabled.map((c) => distribution[c]);
  const total = weights.reduce((a, b) => a + b, 0);
  let random = Math.random() * total;

  for (let i = 0; i < enabled.length; i++) {
    random -= weights[i];
    if (random <= 0) return enabled[i];
  }

  return enabled[enabled.length - 1];
}

export function generateRandomInterval(
  min: number,
  max: number,
  autoDistribution: boolean,
  intensity: IntensityLevel
): number {
  if (autoDistribution) {
    const mult = INTENSITY_MULTIPLIERS[intensity];
    const effectiveMin = Math.max(min, mult.min);
    const effectiveMax = Math.min(max, mult.max);
    const base = effectiveMin + Math.random() * (effectiveMax - effectiveMin);
    const jitter = (Math.random() - 0.5) * base * 0.4;
    return Math.max(1, Math.round(base + jitter));
  }

  return min + Math.random() * (max - min);
}

export function generateRandomAmount(min: number, max: number): number {
  const amount = min + Math.random() * (max - min);
  return Math.round(amount * 100) / 100;
}

export function generateBulkTimeline(config: BulkGeneratorConfig): TimelineEntry[] {
  const entries: TimelineEntry[] = [];
  let currentOffset = 0;

  for (let i = 0; i < config.quantity; i++) {
    const currency = pickCurrencyByDistribution(config.distribution, config.currencies);
    const amount = generateRandomAmount(config.minAmount, config.maxAmount);
    const interval = generateRandomInterval(
      config.minInterval,
      config.maxInterval,
      config.autoDistribution,
      config.intensity
    );

    if (i > 0) currentOffset += interval;

    const platformIds = config.platformIds?.length
      ? config.platformIds
      : [config.platformId];
    const platformId = pickRandomPlatformId(platformIds);

    entries.push({
      id: uuidv4(),
      offsetSeconds: currentOffset,
      type: 'sale',
      currency,
      amount,
      platformId,
    });
  }

  return entries;
}

export function formatTimelineOffset(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

export function formatNotificationTimestamp(timestamp: number, now: number): string {
  const diffMs = now - timestamp;
  const diffMin = Math.floor(diffMs / 60000);

  if (diffMin < 1) return 'agora';
  if (diffMin < 60) return `há ${diffMin} min`;

  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) {
    const date = new Date(timestamp);
    return `Hoje, ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
  }

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) {
    const date = new Date(timestamp);
    return `Ontem, ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
  }

  const date = new Date(timestamp);
  return `${date.getDate()}/${date.getMonth() + 1}`;
}
