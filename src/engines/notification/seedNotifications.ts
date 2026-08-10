import type { NotificationRecord } from '../simulation/types';
import { filterNotificationsByRetention } from './notificationEngine';

/** Merge live + seed notifications, sorted newest first, within iOS retention window */
export function getLockScreenNotifications(
  live: NotificationRecord[],
  seed: NotificationRecord[],
  retentionDays: number,
  now = Date.now()
): NotificationRecord[] {
  const activeLive = filterNotificationsByRetention(live, retentionDays, now);
  const activeSeed = filterNotificationsByRetention(seed, retentionDays, now);

  return [...activeLive, ...activeSeed].sort((a, b) => b.timestamp - a.timestamp);
}
