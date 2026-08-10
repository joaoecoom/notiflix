import {
  type CurrencyCode,
  CURRENCY_CONFIGS,
  SUPPORTED_CURRENCIES,
} from './types';

export function getCurrencySymbol(currency: CurrencyCode): string {
  return CURRENCY_CONFIGS[currency].symbol;
}

export function getCurrencyLocale(currency: CurrencyCode): string {
  return CURRENCY_CONFIGS[currency].locale;
}

export function formatAmount(
  amount: number,
  currency: CurrencyCode,
  options?: { minimumFractionDigits?: number; maximumFractionDigits?: number }
): string {
  const config = CURRENCY_CONFIGS[currency];
  const minDigits = options?.minimumFractionDigits ?? 2;
  const maxDigits = options?.maximumFractionDigits ?? 2;

  const fixed = amount.toFixed(maxDigits);
  const [intPart, decPart] = fixed.split('.');
  const formattedInt = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, config.thousandsSeparator);

  if (minDigits === 0 && maxDigits === 0) {
    return formattedInt;
  }

  return `${formattedInt}${config.decimalSeparator}${decPart ?? '00'.slice(0, maxDigits)}`;
}

export function formatCurrency(
  amount: number,
  currency: CurrencyCode,
  options?: { showSymbol?: boolean; compact?: boolean }
): string {
  const symbol = getCurrencySymbol(currency);
  const formatted = formatAmount(amount, currency);

  if (options?.compact) {
    return `${symbol}${formatted.replace(/\s/g, '')}`;
  }

  return `${symbol} ${formatted}`;
}

export function parseCurrencyAmount(value: string, currency: CurrencyCode): number {
  const config = CURRENCY_CONFIGS[currency];
  const cleaned = value
    .replace(new RegExp(`\\${config.thousandsSeparator}`, 'g'), '')
    .replace(config.decimalSeparator, '.')
    .replace(/[^\d.-]/g, '');

  const parsed = parseFloat(cleaned);
  return Number.isNaN(parsed) ? 0 : parsed;
}

export function isValidCurrency(code: string): code is CurrencyCode {
  return SUPPORTED_CURRENCIES.includes(code as CurrencyCode);
}

export function getCurrencyConfig(currency: CurrencyCode) {
  return CURRENCY_CONFIGS[currency];
}
