import type { NotificationRecord } from '../simulation/types';
import { isPlatformEnabled } from '../platform';
import { filterNotificationsByRetention } from './notificationEngine';

export interface LockScreenFilterOptions {
  retentionDays: number;
  lastUnlockMinutesAgo: number;
  maxNotifications: number;
  enabledPlatformIds: string[];
  now?: number;
}

/**
 * Merge live + seed + ambient notifications, newest first. Existing ones only show if they
 * arrived after the last unlock; the total (summary cards count as N) is capped.
 */
export function getLockScreenNotifications(
  live: NotificationRecord[],
  seed: NotificationRecord[],
  ambient: NotificationRecord[],
  {
    retentionDays,
    lastUnlockMinutesAgo,
    maxNotifications,
    enabledPlatformIds,
    now = Date.now(),
  }: LockScreenFilterOptions
): NotificationRecord[] {
  const unlockedAt = now - lastUnlockMinutesAgo * 60_000;
  const activeLive = filterNotificationsByRetention(live, retentionDays, now).filter((n) =>
    isPlatformEnabled(n.platformId, enabledPlatformIds)
  );
  const activeSeed = filterNotificationsByRetention(seed, retentionDays, now).filter(
    (n) => n.timestamp >= unlockedAt && isPlatformEnabled(n.platformId, enabledPlatformIds)
  );
  const activeAmbient = ambient.filter(
    (n) => n.status === 'active' && n.timestamp >= unlockedAt
  );

  const sorted = [...activeLive, ...activeSeed, ...activeAmbient].sort(
    (a, b) => b.timestamp - a.timestamp
  );

  const capped: NotificationRecord[] = [];
  let total = 0;
  for (const n of sorted) {
    const weight = n.summaryCount ?? 1;
    if (total + weight > maxNotifications && capped.length > 0) break;
    capped.push(n);
    total += weight;
  }
  return capped;
}

export function countLockScreenNotifications(notifications: NotificationRecord[]): number {
  return notifications.reduce((sum, n) => sum + (n.summaryCount ?? 1), 0);
}

export function groupNotificationsByPlatform(
  notifications: NotificationRecord[]
): { platformId: string; items: NotificationRecord[] }[] {
  const map = new Map<string, NotificationRecord[]>();
  for (const n of notifications) {
    const list = map.get(n.platformId) ?? [];
    list.push(n);
    map.set(n.platformId, list);
  }
  return [...map.entries()]
    .map(([platformId, items]) => ({
      platformId,
      items: items.sort((a, b) => b.timestamp - a.timestamp),
    }))
    .sort((a, b) => b.items[0].timestamp - a.items[0].timestamp);
}
