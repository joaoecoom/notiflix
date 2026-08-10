import { useEffect } from 'react';
import { useSimulationStore } from '../store/simulationStore';

const TICK_MS = 100;

export function useSimulationLoop() {
  const tick = useSimulationStore((s) => s.tick);
  const isRunning = useSimulationStore((s) => s.isRunning);

  useEffect(() => {
    if (!isRunning) return;

    const intervalId = window.setInterval(() => {
      tick(TICK_MS);
    }, TICK_MS);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [isRunning, tick]);
}
