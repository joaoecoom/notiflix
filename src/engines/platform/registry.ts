import type { PlatformDefinition } from './types';

export const PLATFORM_IDS = {
  stripe: 'stripe',
  utmify: 'utmify',
  hotmart: 'hotmart',
} as const;

export type BuiltinPlatformId = (typeof PLATFORM_IDS)[keyof typeof PLATFORM_IDS];

const BUILTIN_PLATFORMS: PlatformDefinition[] = [
  {
    id: PLATFORM_IDS.stripe,
    name: 'Stripe',
    kind: 'builtin',
    iconSrc: '/stripe-icon.png',
    messageTemplate: 'Você recebeu um pagamento de {amount}',
    notificationLayout: 'classic',
    defaultCurrency: 'EUR',
    hasMobileDashboard: true,
  },
  {
    id: PLATFORM_IDS.utmify,
    name: 'Utmify',
    kind: 'builtin',
    iconSrc: '/platforms/utmify.png',
    messageTemplate: 'Valor: {amount}',
    notificationLayout: 'lockscreen',
    defaultCurrency: 'BRL',
    hasMobileDashboard: false,
  },
  {
    id: PLATFORM_IDS.hotmart,
    name: 'Hotmart',
    kind: 'builtin',
    iconSrc: '/platforms/hotmart.png',
    messageTemplate: 'Sua comissão: {amount}',
    notificationLayout: 'lockscreen',
    defaultCurrency: 'BRL',
    hasMobileDashboard: false,
  },
];

export function getBuiltinPlatforms(): PlatformDefinition[] {
  return BUILTIN_PLATFORMS;
}

export function getDefaultEnabledPlatformIds(): string[] {
  return BUILTIN_PLATFORMS.map((p) => p.id);
}

export function resolvePlatformId(value?: string | null, legacyApp?: string): string {
  if (value && value.length > 0) {
    const lower = value.toLowerCase();
    if (lower === 'stripe') return PLATFORM_IDS.stripe;
    if (lower === 'utmify') return PLATFORM_IDS.utmify;
    if (lower === 'hotmart') return PLATFORM_IDS.hotmart;
    return value;
  }
  if (legacyApp?.toLowerCase() === 'stripe') return PLATFORM_IDS.stripe;
  if (legacyApp?.toLowerCase() === 'utmify') return PLATFORM_IDS.utmify;
  if (legacyApp?.toLowerCase() === 'hotmart') return PLATFORM_IDS.hotmart;
  return PLATFORM_IDS.stripe;
}

export function getPlatform(
  platformId: string,
  customPlatforms: PlatformDefinition[] = []
): PlatformDefinition {
  const found =
    BUILTIN_PLATFORMS.find((p) => p.id === platformId) ??
    customPlatforms.find((p) => p.id === platformId);
  if (found) return found;
  return {
    id: platformId,
    name: platformId,
    kind: 'custom',
    iconSrc: '/platforms/custom.svg',
    messageTemplate: 'Nova notificação — {amount}',
    notificationLayout: 'classic',
    defaultCurrency: 'EUR',
    hasMobileDashboard: false,
  };
}

export function isPlatformEnabled(platformId: string, enabledIds: string[]): boolean {
  return enabledIds.includes(platformId);
}

export function pickRandomPlatformId(
  enabledIds: string[],
  distribution?: Record<string, number>
): string {
  if (enabledIds.length === 0) return PLATFORM_IDS.stripe;
  if (!distribution || enabledIds.length === 1) {
    return enabledIds[Math.floor(Math.random() * enabledIds.length)];
  }

  const weights = enabledIds.map((id) => distribution[id] ?? 1);
  const total = weights.reduce((a, b) => a + b, 0);
  let random = Math.random() * total;
  for (let i = 0; i < enabledIds.length; i++) {
    random -= weights[i];
    if (random <= 0) return enabledIds[i];
  }
  return enabledIds[enabledIds.length - 1];
}
