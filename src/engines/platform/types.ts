import type { CurrencyCode } from '../currency';

export type PlatformKind = 'builtin' | 'custom';

/** lockscreen = título forte + subtítulo (Hotmart/Utmify); classic = app + mensagem (Stripe) */
export type NotificationLayout = 'classic' | 'lockscreen';

export interface PlatformDefinition {
  id: string;
  name: string;
  kind: PlatformKind;
  iconSrc: string;
  messageTemplate: string;
  notificationLayout: NotificationLayout;
  defaultCurrency: CurrencyCode;
  hasMobileDashboard: boolean;
}

export type PreviewScreen = 'hub' | 'app' | 'iphone';
