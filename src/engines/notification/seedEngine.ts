import { v4 as uuidv4 } from 'uuid';
import {
  pickCurrencyByDistribution,
  generateRandomAmount,
} from '../simulation/simulationEngine';
import { buildPlatformNotificationCopy } from '../platform/notificationCopy';
import { getPlatform, pickRandomPlatformId, resolvePlatformId, PLATFORM_IDS } from '../platform';
import { MIN_EXISTING_AGE_MINUTES } from './ambientApps';
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
      offsetValue: 38,
      offsetUnit: 'minutes',
      clockHour: 0,
      clockMinute: 0,
      currency: 'EUR',
      amount: 24,
      platformId: PLATFORM_IDS.stripe,
    },
    {
      id: uuidv4(),
      offsetValue: 80,
      offsetUnit: 'minutes',
      clockHour: 0,
      clockMinute: 0,
      currency: 'BRL',
      amount: 83.91,
      platformId: PLATFORM_IDS.hotmart,
    },
    {
      id: uuidv4(),
      offsetValue: 12,
      offsetUnit: 'minutes',
      clockHour: 0,
      clockMinute: 0,
      currency: 'BRL',
      amount: 500,
      platformId: PLATFORM_IDS.utmify,
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
  const platformId = resolvePlatformId(entry.platformId, entry.app);
  const copy = buildPlatformNotificationCopy(platformId, entry.amount, entry.currency, {
    stableKey: entry.id,
  });

  return {
    id: entry.id,
    platformId,
    app: copy.app,
    title: copy.title,
    message: copy.message,
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
    const minOffset =
      config.offsetUnit === 'minutes'
        ? Math.max(MIN_EXISTING_AGE_MINUTES, config.minOffsetValue)
        : config.minOffsetValue;
    const maxOffset = Math.max(minOffset, config.maxOffsetValue);
    const skew = config.offsetUnit === 'days' ? 1 : 1.6;
    const offsetValue =
      minOffset + Math.round((maxOffset - minOffset) * Math.random() ** skew);

    const timestamp = resolveBulkSeedTimestamp(offsetValue, config.offsetUnit, now);
    const date = new Date(timestamp);

    const platformIds = config.platformIds?.length
      ? config.platformIds
      : [config.platformId];
    const platformId = pickRandomPlatformId(platformIds);

    entries.push({
      id: uuidv4(),
      offsetValue,
      offsetUnit: config.offsetUnit,
      clockHour: config.offsetUnit === 'days' ? date.getHours() : 0,
      clockMinute: config.offsetUnit === 'days' ? date.getMinutes() : 0,
      currency,
      amount,
      platformId,
    });
  }

  return entries
    .map((entry) => ({ entry, ts: seedEntryToTimestamp(entry, now) }))
    .sort((a, b) => b.ts - a.ts)
    .map(({ entry }) => entry);
}

function resolveBulkSeedTimestamp(
  offsetValue: number,
  unit: 'minutes' | 'hours' | 'days',
  now: number
): number {
  if (unit === 'minutes') {
    return now - offsetValue * 60_000;
  }

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

export function createEmptySeedEntry(platformId = PLATFORM_IDS.stripe): SeedEntry {
  const platform = getPlatform(platformId);
  return {
    id: uuidv4(),
    offsetValue: 15,
    offsetUnit: 'minutes' as SeedTimeUnit,
    clockHour: 0,
    clockMinute: 0,
    currency: platform.defaultCurrency,
    amount: 24,
    platformId,
  };
}
