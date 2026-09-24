import type { ReactNode } from 'react';
import { StripeTemplate } from './stripe/StripeTemplate';
import { UtmifyTemplate } from './utmify/UtmifyTemplate';
import { GenericAppTemplate } from './generic/GenericAppTemplate';
import { BottomNav } from '../components/mobile/BottomNav';
import { HomeIndicator } from '../components/mobile/HomeIndicator';

interface AppTemplate {
  render: () => ReactNode;
  /** Draw the rounded device frame around the preview on desktop */
  framed?: boolean;
}

/** One entry per platform with a dedicated app screen; the rest fall back to the generic dashboard */
const APP_TEMPLATES: Record<string, AppTemplate> = {
  stripe: {
    framed: true,
    render: () => (
      <>
        <StripeTemplate />
        <BottomNav />
        <HomeIndicator />
      </>
    ),
  },
  utmify: {
    render: () => <UtmifyTemplate />,
  },
};

export function hasAppTemplate(platformId: string): boolean {
  return platformId in APP_TEMPLATES;
}

export function getAppTemplate(platformId: string): AppTemplate {
  return (
    APP_TEMPLATES[platformId] ?? {
      render: () => <GenericAppTemplate platformId={platformId} />,
    }
  );
}
