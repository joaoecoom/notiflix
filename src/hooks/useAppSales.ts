import { useMemo } from 'react';
import { useSimulationStore } from '../store/simulationStore';
import { computeAppSales, EMPTY_BASELINE } from '../engines/apps';

export function useAppSales(platformId: string) {
  const live = useSimulationStore((s) => s.notifications);
  const seed = useSimulationStore((s) => s.seedNotifications);
  const baseline = useSimulationStore((s) => s.appBaselines[platformId] ?? EMPTY_BASELINE);

  const sales = useMemo(
    () => computeAppSales(platformId, baseline, live, seed),
    [platformId, baseline, live, seed]
  );

  return { sales, baseline };
}
