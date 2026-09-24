import { v4 as uuidv4 } from 'uuid';
import { getAmbientApps } from '../platform';
import type { CountRange, NotificationRecord } from '../simulation/types';

export const DEFAULT_AMBIENT_COUNT_RANGE: CountRange = { min: 2, max: 6 };

export const MIN_EXISTING_AGE_MINUTES = 3;

/** Random minutes-ago inside the unlock window, denser near the present */
export function randomRecentMinutesAgo(maxMinutesAgo: number): number {
  const max = Math.max(MIN_EXISTING_AGE_MINUTES, maxMinutesAgo);
  const span = max - MIN_EXISTING_AGE_MINUTES;
  return MIN_EXISTING_AGE_MINUTES + Math.round(span * Math.random() ** 1.6);
}

export function formatSummaryCount(count: number): string {
  return count === 1 ? 'Notificação' : `${count} Notificações`;
}

export function buildAmbientNotifications(
  enabledIds: string[],
  range: CountRange,
  lastUnlockMinutesAgo: number,
  now = Date.now()
): NotificationRecord[] {
  const min = Math.max(1, Math.min(range.min, range.max));
  const max = Math.max(min, range.max);

  return getAmbientApps()
    .filter((app) => enabledIds.includes(app.id))
    .map((app) => {
      const count = min + Math.floor(Math.random() * (max - min + 1));
      const id = uuidv4();
      return {
        id,
        platformId: app.id,
        app: app.name,
        title: app.name,
        message: formatSummaryCount(count),
        amount: 0,
        currency: 'EUR' as const,
        timestamp: now - randomRecentMinutesAgo(lastUnlockMinutesAgo) * 60_000,
        status: 'active' as const,
        eventId: id,
        isSeed: true,
        summaryCount: count,
      };
    })
    .sort((a, b) => b.timestamp - a.timestamp);
}
