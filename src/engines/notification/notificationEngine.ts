import type { NotificationRecord } from '../simulation/types';
import { formatNotificationTimestamp } from '../simulation/simulationEngine';

export type NotificationDisplayMode =
  | 'stack'
  | 'banner'
  | 'lockscreen'
  | 'dynamic-island';

export interface NotificationStackConfig {
  maxVisible: number;
  gap: number;
  animationDuration: number;
}

export const DEFAULT_STACK_CONFIG: NotificationStackConfig = {
  maxVisible: 5,
  gap: 8,
  animationDuration: 350,
};

export function isNotificationWithinRetention(
  notification: NotificationRecord,
  retentionDays: number,
  now = Date.now()
): boolean {
  const retentionMs = retentionDays * 86_400_000;
  return now - notification.timestamp <= retentionMs;
}

export function filterNotificationsByRetention(
  notifications: NotificationRecord[],
  retentionDays: number,
  now = Date.now()
): NotificationRecord[] {
  return notifications.filter(
    (n) => n.status === 'active' && isNotificationWithinRetention(n, retentionDays, now)
  );
}

export function sortNotificationsByTimestamp(
  notifications: NotificationRecord[]
): NotificationRecord[] {
  return [...notifications]
    .filter((n) => n.status === 'active')
    .sort((a, b) => b.timestamp - a.timestamp);
}

export function getVisibleNotifications(
  notifications: NotificationRecord[],
  maxVisible: number
): NotificationRecord[] {
  return sortNotificationsByTimestamp(notifications).slice(0, maxVisible);
}

export function formatTimestampForDisplay(
  notification: NotificationRecord,
  now: number = Date.now()
): string {
  if (notification.displayTime) return notification.displayTime;
  return formatNotificationTimestamp(notification.timestamp, now);
}

export function dismissNotification(
  notifications: NotificationRecord[],
  id: string
): NotificationRecord[] {
  return notifications.map((n) =>
    n.id === id ? { ...n, status: 'dismissed' as const } : n
  );
}

export function dismissAllNotifications(
  notifications: NotificationRecord[]
): NotificationRecord[] {
  return notifications.map((n) => ({ ...n, status: 'dismissed' as const }));
}
