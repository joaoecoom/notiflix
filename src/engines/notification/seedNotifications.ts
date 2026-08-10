import type { NotificationRecord } from '../simulation/types';
import { formatNotificationAmount } from '../currency/notificationFormat';

export function createSeedNotifications(): NotificationRecord[] {
  const now = Date.now();
  const day = 86400000;

  return [
    {
      id: 'seed-1',
      app: 'Stripe',
      title: 'Stripe',
      message: `Você recebeu um pagamento de ${formatNotificationAmount(24, 'EUR')}`,
      amount: 24,
      currency: 'EUR',
      timestamp: now - 3600000,
      displayTime: 'há 1 h',
      status: 'active',
      eventId: 'seed-1',
      isSeed: true,
    },
    {
      id: 'seed-2',
      app: 'Stripe',
      title: 'Stripe',
      message: `Você recebeu um pagamento de ${formatNotificationAmount(9, 'EUR')}`,
      amount: 9,
      currency: 'EUR',
      timestamp: now - day - 3600000,
      displayTime: 'Ontem, 22:59',
      status: 'active',
      eventId: 'seed-2',
      isSeed: true,
    },
    {
      id: 'seed-3',
      app: 'Stripe',
      title: 'Stripe',
      message: `Você recebeu um pagamento de ${formatNotificationAmount(9, 'EUR')}`,
      amount: 9,
      currency: 'EUR',
      timestamp: now - day - 6 * 3600000,
      displayTime: 'Ontem, 17:14',
      status: 'active',
      eventId: 'seed-3',
      isSeed: true,
    },
    {
      id: 'seed-4',
      app: 'Stripe',
      title: 'Stripe',
      message: `Você recebeu um pagamento de ${formatNotificationAmount(9, 'EUR')}`,
      amount: 9,
      currency: 'EUR',
      timestamp: now - day - 14 * 3600000,
      displayTime: 'Ontem, 09:08',
      status: 'active',
      eventId: 'seed-4',
      isSeed: true,
    },
    {
      id: 'seed-5',
      app: 'Stripe',
      title: 'Stripe',
      message: `Você recebeu um pagamento de ${formatNotificationAmount(19, 'EUR')}`,
      amount: 19,
      currency: 'EUR',
      timestamp: now - day - 16 * 3600000,
      displayTime: 'Ontem, 07:54',
      status: 'active',
      eventId: 'seed-5',
      isSeed: true,
    },
  ];
}

export function getLockScreenNotifications(
  live: NotificationRecord[],
  seed: NotificationRecord[],
  maxVisible = 8
): NotificationRecord[] {
  const activeLive = live.filter((n) => n.status === 'active');
  const activeSeed = seed.filter((n) => n.status === 'active');
  return [...activeLive, ...activeSeed].slice(0, maxVisible);
}
