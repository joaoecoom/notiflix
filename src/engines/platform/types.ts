import type { CurrencyCode } from '../currency';

export type PlatformKind = 'builtin' | 'custom';

export interface PlatformDefinition {
  id: string;
  name: string;
  kind: PlatformKind;
  iconSrc: string;
  messageTemplate: string;
  defaultCurrency: CurrencyCode;
  hasMobileDashboard: boolean;
}

export type PreviewScreen = 'hub' | 'stripe' | 'iphone';
