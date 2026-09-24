import type { NotificationRecord } from '../simulation/types';
import { isPlatformEnabled } from '../platform';
import { filterNotificationsByRetention } from './notificationEngine';

/** Merge live + seed notifications, sorted newest first, within iOS retention window */
export function getLockScreenNotifications(
  live: NotificationRecord[],
  seed: NotificationRecord[],
  retentionDays: number,
  enabledPlatformIds: string[],
  now = Date.now()
): NotificationRecord[] {
  const activeLive = filterNotificationsByRetention(live, retentionDays, now).filter((n) =>
    isPlatformEnabled(n.platformId, enabledPlatformIds)
  );
  const activeSeed = filterNotificationsByRetention(seed, retentionDays, now).filter((n) =>
    isPlatformEnabled(n.platformId, enabledPlatformIds)
  );

  return [...activeLive, ...activeSeed].sort((a, b) => b.timestamp - a.timestamp);
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
