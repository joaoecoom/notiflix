import type { CurrencyCode } from '../currency';
import type { PlatformDefinition, PreviewScreen } from '../platform/types';

export type EventType = 'sale' | 'refund' | 'payout' | 'customer';

export type DistributionMode = 'random' | 'fixed' | 'weighted';

export type IntensityLevel = 'LOW' | 'NORMAL' | 'HIGH' | 'VIRAL';

export interface SimulationEvent {
  id: string;
  type: EventType;
  amount: number;
  currency: CurrencyCode;
  timestamp: number;
  offsetSeconds: number;
  platformId: string;
  app: string;
  appIcon?: string;
  title?: string;
  message?: string;
  processed: boolean;
  customerId?: string;
}

export interface TimelineEntry {
  id: string;
  offsetSeconds: number;
  type: EventType;
  currency: CurrencyCode;
  amount: number;
  platformId: string;
  /** @deprecated use platformId */
  app?: string;
  message?: string;
}

export interface CurrencyMetrics {
  currency: CurrencyCode;
  revenue: number;
  payments: number;
  customers: number;
  balance: number;
  refunds: number;
}

export interface SimulationMetrics {
  byCurrency: Record<CurrencyCode, CurrencyMetrics>;
  totalEvents: number;
  chartData: ChartDataPoint[];
  transactions: TransactionRecord[];
}

export interface ChartDataPoint {
  timestamp: number;
  values: Partial<Record<CurrencyCode, number>>;
  cumulative: Partial<Record<CurrencyCode, number>>;
}

export interface TransactionRecord {
  id: string;
  amount: number;
  currency: CurrencyCode;
  type: EventType;
  timestamp: number;
  status: 'paid' | 'pending' | 'refunded';
  description?: string;
}

export interface CurrencyDistribution {
  EUR: number;
  USD: number;
  BRL: number;
}

export interface BulkGeneratorConfig {
  quantity: number;
  platformId: string;
  platformIds?: string[];
  currencies: CurrencyCode[];
  minAmount: number;
  maxAmount: number;
  minInterval: number;
  maxInterval: number;
  distribution: CurrencyDistribution;
  autoDistribution: boolean;
  intensity: IntensityLevel;
}

export const IOS_NOTIFICATION_RETENTION_DAYS_CLASSIC = 7;
export const IOS_NOTIFICATION_RETENTION_DAYS_IOS18 = 3;

export interface SimulationSettings {
  enabledCurrencies: CurrencyCode[];
  distribution: CurrencyDistribution;
  distributionMode: DistributionMode;
  autoDistribution: boolean;
  intensity: IntensityLevel;
  playbackSpeed: number;
  /** iOS auto-clears Notification Center after this many days (7 classic, 3 on iOS 18.1+) */
  notificationRetentionDays: number;
  /** Lock screen only shows what arrived since the phone was last unlocked */
  lastUnlockMinutesAgo: number;
  maxLockScreenNotifications: number;
}

export interface SimulationScenario {
  id: string;
  name: string;
  description?: string;
}

export type SeedTimeUnit = 'minutes' | 'hours' | 'days';

export interface SeedEntry {
  id: string;
  offsetValue: number;
  offsetUnit: SeedTimeUnit;
  clockHour: number;
  clockMinute: number;
  currency: CurrencyCode;
  amount: number;
  platformId: string;
  app?: string;
}

export interface SeedBulkGeneratorConfig {
  quantity: number;
  platformId: string;
  platformIds?: string[];
  currencies: CurrencyCode[];
  minAmount: number;
  maxAmount: number;
  minOffsetValue: number;
  maxOffsetValue: number;
  offsetUnit: 'minutes' | 'hours' | 'days';
  distribution: CurrencyDistribution;
}

export interface CountRange {
  min: number;
  max: number;
}

export interface SimulationState {
  scenario: SimulationScenario;
  settings: SimulationSettings;
  events: SimulationEvent[];
  timeline: TimelineEntry[];
  seedTimeline: SeedEntry[];
  metrics: SimulationMetrics;
  notifications: NotificationRecord[];
  isRunning: boolean;
  elapsedTime: number;
  startTime: number | null;
  activeTab: 'home' | 'payments' | 'balances' | 'customers' | 'search';
  previewScreen: PreviewScreen;
  enabledPlatformIds: string[];
  customPlatforms: PlatformDefinition[];
  seedNotifications: NotificationRecord[];
  ambientEnabledIds: string[];
  ambientCountRange: CountRange;
  ambientNotifications: NotificationRecord[];
  selectedCurrencyFilter: CurrencyCode | 'all';
}

export interface NotificationRecord {
  id: string;
  platformId: string;
  app: string;
  appIcon?: string;
  title: string;
  message: string;
  amount: number;
  currency: CurrencyCode;
  timestamp: number;
  displayTime?: string;
  status: 'active' | 'dismissed';
  eventId: string;
  isSeed?: boolean;
  /** Collapsed "N Notificações" card for non-sales apps */
  summaryCount?: number;
}

export const DEFAULT_DISTRIBUTION: CurrencyDistribution = {
  EUR: 40,
  USD: 30,
  BRL: 30,
};

export const DEFAULT_SETTINGS: SimulationSettings = {
  enabledCurrencies: ['EUR', 'USD', 'BRL'],
  distribution: DEFAULT_DISTRIBUTION,
  distributionMode: 'weighted',
  autoDistribution: true,
  intensity: 'NORMAL',
  playbackSpeed: 1,
  notificationRetentionDays: IOS_NOTIFICATION_RETENTION_DAYS_CLASSIC,
  lastUnlockMinutesAgo: 120,
  maxLockScreenNotifications: 30,
};

export function createEmptyMetrics(): SimulationMetrics {
  return {
    byCurrency: {
      EUR: { currency: 'EUR', revenue: 0, payments: 0, customers: 0, balance: 0, refunds: 0 },
      USD: { currency: 'USD', revenue: 0, payments: 0, customers: 0, balance: 0, refunds: 0 },
      BRL: { currency: 'BRL', revenue: 0, payments: 0, customers: 0, balance: 0, refunds: 0 },
    },
    totalEvents: 0,
    chartData: [],
    transactions: [],
  };
}
