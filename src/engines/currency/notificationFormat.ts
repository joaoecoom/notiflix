import type { CurrencyCode } from './types';
import { getCurrencySymbol } from './currencyEngine';

export function formatNotificationAmount(amount: number, currency: CurrencyCode): string {
  const symbol = getCurrencySymbol(currency);
  const formatted = amount.toFixed(2);
  return `${symbol}${formatted}`;
}
