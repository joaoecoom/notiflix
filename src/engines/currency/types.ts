export type CurrencyCode = 'EUR' | 'USD' | 'BRL';

export interface CurrencyConfig {
  code: CurrencyCode;
  symbol: string;
  locale: string;
  decimalSeparator: string;
  thousandsSeparator: string;
}

export const CURRENCY_CONFIGS: Record<CurrencyCode, CurrencyConfig> = {
  EUR: {
    code: 'EUR',
    symbol: '€',
    locale: 'pt-PT',
    decimalSeparator: ',',
    thousandsSeparator: '.',
  },
  USD: {
    code: 'USD',
    symbol: '$',
    locale: 'en-US',
    decimalSeparator: '.',
    thousandsSeparator: ',',
  },
  BRL: {
    code: 'BRL',
    symbol: 'R$',
    locale: 'pt-BR',
    decimalSeparator: ',',
    thousandsSeparator: '.',
  },
};

export const SUPPORTED_CURRENCIES: CurrencyCode[] = ['EUR', 'USD', 'BRL'];
