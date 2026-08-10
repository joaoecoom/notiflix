import type { NotificationRecord } from '../simulation/types';

export function getLockScreenNotifications(
  live: NotificationRecord[],
  seed: NotificationRecord[],
  maxVisible = 8
): NotificationRecord[] {
  const activeLive = live.filter((n) => n.status === 'active');
  const activeSeed = seed.filter((n) => n.status === 'active');

  return [...activeLive, ...activeSeed]
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice(0, maxVisible);
}
