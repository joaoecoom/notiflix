import { v4 as uuidv4 } from 'uuid';
import { formatNotificationAmount } from '../currency/notificationFormat';
import {
  pickCurrencyByDistribution,
  generateRandomAmount,
} from '../simulation/simulationEngine';
import type {
  NotificationRecord,
  SeedBulkGeneratorConfig,
  SeedEntry,
  SeedTimeUnit,
} from '../simulation/types';

export function createDefaultSeedTimeline(): SeedEntry[] {
  return [
    {
      id: uuidv4(),
      offsetValue: 1,
      offsetUnit: 'hours',
      clockHour: 0,
      clockMinute: 0,
      currency: 'EUR',
      amount: 24,
      app: 'Stripe',
    },
  ];
}

export function seedEntryToTimestamp(entry: SeedEntry, now = Date.now()): number {
  const date = new Date(now);

  if (entry.offsetUnit === 'minutes') {
    return now - entry.offsetValue * 60_000;
  }

  if (entry.offsetUnit === 'hours') {
    return now - entry.offsetValue * 3_600_000;
  }

  date.setDate(date.getDate() - entry.offsetValue);
  date.setHours(entry.clockHour, entry.clockMinute, 0, 0);
  return date.getTime();
}

export function formatSeedOffsetLabel(entry: SeedEntry): string {
  const { offsetValue, offsetUnit, clockHour, clockMinute } = entry;

  if (offsetUnit === 'minutes') {
    return offsetValue === 1 ? 'há 1 min' : `há ${offsetValue} min`;
  }

  if (offsetUnit === 'hours') {
    return offsetValue === 1 ? 'há 1 h' : `há ${offsetValue} h`;
  }

  const time =
    clockHour || clockMinute
      ? `, ${String(clockHour).padStart(2, '0')}:${String(clockMinute).padStart(2, '0')}`
      : '';

  if (offsetValue === 0) return `Hoje${time}`;
  if (offsetValue === 1) return `Ontem${time}`;
  return `${offsetValue} dias atrás${time}`;
}

export function seedEntryToNotification(
  entry: SeedEntry,
  now = Date.now()
): NotificationRecord {
  const timestamp = seedEntryToTimestamp(entry, now);
  const message = `Você recebeu um pagamento de ${formatNotificationAmount(entry.amount, entry.currency)}`;

  return {
    id: entry.id,
    app: entry.app,
    title: entry.app,
    message,
    amount: entry.amount,
    currency: entry.currency,
    timestamp,
    status: 'active',
    eventId: entry.id,
    isSeed: true,
  };
}

export function buildSeedNotifications(
  entries: SeedEntry[],
  now = Date.now()
): NotificationRecord[] {
  return entries
    .map((entry) => seedEntryToNotification(entry, now))
    .sort((a, b) => b.timestamp - a.timestamp);
}

export function generateBulkSeedTimeline(config: SeedBulkGeneratorConfig): SeedEntry[] {
  const entries: SeedEntry[] = [];
  const now = Date.now();

  for (let i = 0; i < config.quantity; i++) {
    const currency = pickCurrencyByDistribution(config.distribution, config.currencies);
    const amount = generateRandomAmount(config.minAmount, config.maxAmount);
    const offsetValue =
      config.minOffsetValue +
      Math.floor(Math.random() * (config.maxOffsetValue - config.minOffsetValue + 1));

    const timestamp = resolveBulkSeedTimestamp(offsetValue, config.offsetUnit, now);
    const date = new Date(timestamp);

    entries.push({
      id: uuidv4(),
      offsetValue,
      offsetUnit: config.offsetUnit === 'days' ? 'days' : 'hours',
      clockHour: config.offsetUnit === 'days' ? date.getHours() : 0,
      clockMinute: config.offsetUnit === 'days' ? date.getMinutes() : 0,
      currency,
      amount,
      app: config.app,
    });
  }

  return entries
    .map((entry) => ({ entry, ts: seedEntryToTimestamp(entry, now) }))
    .sort((a, b) => b.ts - a.ts)
    .map(({ entry }) => entry);
}

function resolveBulkSeedTimestamp(
  offsetValue: number,
  unit: 'hours' | 'days',
  now: number
): number {
  if (unit === 'hours') {
    return now - offsetValue * 3_600_000;
  }

  const date = new Date(now);
  date.setDate(date.getDate() - offsetValue);
  date.setHours(
    8 + Math.floor(Math.random() * 14),
    Math.floor(Math.random() * 60),
    0,
    0
  );
  return date.getTime();
}

export function createEmptySeedEntry(app = 'Stripe'): SeedEntry {
  return {
    id: uuidv4(),
    offsetValue: 1,
    offsetUnit: 'hours' as SeedTimeUnit,
    clockHour: 0,
    clockMinute: 0,
    currency: 'EUR',
    amount: 24,
    app,
  };
}
