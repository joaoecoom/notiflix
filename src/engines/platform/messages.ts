import type { CurrencyCode } from '../currency';
import { formatNotificationAmount } from '../currency/notificationFormat';

export function formatPlatformMessage(
  template: string,
  amount: number,
  currency: CurrencyCode
): string {
  const formatted = formatNotificationAmount(amount, currency);
  return template.replace(/\{amount\}/g, formatted);
}
