import type { CurrencyCode } from '../currency';
import { formatNotificationAmount } from '../currency/notificationFormat';
import { PLATFORM_IDS } from './registry';

export interface PlatformNotificationCopy {
  app: string;
  title: string;
  message: string;
}

function randomHotmartTxId(): string {
  return `HP${Math.floor(10_000_000_000 + Math.random() * 89_999_999_999)}`;
}

function formatBrl(amount: number): string {
  return `R$ ${amount.toFixed(2).replace('.', ',')}`;
}

function stableIndex(key: string, length: number): number {
  let hash = 0;
  for (let i = 0; i < key.length; i += 1) {
    hash = (hash * 31 + key.charCodeAt(i)) >>> 0;
  }
  return length > 0 ? hash % length : 0;
}

function stableHotmartTxId(key: string): string {
  const hash = stableIndex(key, 89_999_999);
  return `HP${28_015_000_00 + hash}`;
}

export function buildPlatformNotificationCopy(
  platformId: string,
  amount: number,
  currency: CurrencyCode,
  options?: { stableKey?: string }
): PlatformNotificationCopy {
  const stableKey = options?.stableKey;
  const formatted = formatNotificationAmount(amount, currency);

  if (platformId === PLATFORM_IDS.hotmart) {
    const paymentMethods = [
      'Venda realizada com o Pix Hotmart',
      'Venda realizada com Cartão de Crédito',
      'Venda realizada com Boleto Bancário',
    ];
    const headline = stableKey
      ? paymentMethods[stableIndex(stableKey, paymentMethods.length)]
      : paymentMethods[Math.floor(Math.random() * paymentMethods.length)];
    const brlAmount = formatBrl(amount);
    const txId = stableKey ? stableHotmartTxId(stableKey) : randomHotmartTxId();
    return {
      app: 'Hotmart',
      title: headline,
      message: `Sua comissão: ${brlAmount} - ${txId}`,
    };
  }

  if (platformId === PLATFORM_IDS.utmify) {
    const statuses = ['Venda aprovada!', 'Venda pendente!'];
    const status = stableKey
      ? statuses[stableIndex(stableKey, statuses.length)]
      : statuses[Math.floor(Math.random() * statuses.length)];
    const brl = formatBrl(amount);
    return {
      app: 'Utmify',
      title: `${status} | Utmify`,
      message: `Valor: ${brl}`,
    };
  }

  return {
    app: 'Stripe',
    title: 'Stripe',
    message: `Você recebeu um pagamento de ${formatted}`,
  };
}
