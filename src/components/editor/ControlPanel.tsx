import { useSimulationStore } from '../../store/simulationStore';
import type { CurrencyCode } from '../../engines/currency';
import { CurrencySummary } from '../dashboard/CurrencySummary';
import styles from './ControlPanel.module.css';

const SCREENS = [
  { id: 'stripe' as const, label: 'App Stripe', desc: 'Dashboard com valores ao vivo' },
  { id: 'iphone' as const, label: 'iPhone Lock Screen', desc: 'Ecrã bloqueado + notificações' },
];

interface ControlPanelProps {
  onSimulationStart?: () => void;
}

export function ControlPanel({ onSimulationStart }: ControlPanelProps) {
  const isRunning = useSimulationStore((s) => s.isRunning);
  const elapsedTime = useSimulationStore((s) => s.elapsedTime);
  const viewMode = useSimulationStore((s) => s.viewMode);
  const selectedCurrencyFilter = useSimulationStore((s) => s.selectedCurrencyFilter);
  const timeline = useSimulationStore((s) => s.timeline);
  const startSimulation = useSimulationStore((s) => s.startSimulation);
  const stopSimulation = useSimulationStore((s) => s.stopSimulation);
  const resetSimulation = useSimulationStore((s) => s.resetSimulation);
  const setViewMode = useSimulationStore((s) => s.setViewMode);
  const setCurrencyFilter = useSimulationStore((s) => s.setCurrencyFilter);

  const formatElapsed = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  return (
    <div className={styles.panel}>
      <div className={styles.section}>
        <h2 className={styles.heading}>Simulação</h2>
        <p className={styles.hint}>
          Configura a timeline, escolhe o ecrã e clica iniciar. Os valores atualizam em tempo real nos dois ecrãs.
        </p>
        <div className={styles.controls}>
          {!isRunning ? (
            <button
              className={styles.startBtn}
              onClick={() => {
                startSimulation();
                onSimulationStart?.();
              }}
            >
              INICIAR SIMULAÇÃO
            </button>
          ) : (
            <button className={styles.stopBtn} onClick={stopSimulation}>
              PARAR
            </button>
          )}
          <button className={styles.resetBtn} onClick={resetSimulation}>
            Reset
          </button>
        </div>
        {isRunning && (
          <div className={styles.elapsed}>
            <span className={styles.elapsedDot} />
            {formatElapsed(elapsedTime)} • {timeline.length} eventos
          </div>
        )}
      </div>

      <div className={styles.section}>
        <h3 className={styles.subheading}>Ecrã a gravar</h3>
        <div className={styles.viewModes}>
          {SCREENS.map(({ id, label, desc }) => (
            <button
              key={id}
              className={`${styles.screenBtn} ${viewMode === id ? styles.active : ''}`}
              onClick={() => setViewMode(id)}
            >
              <span className={styles.screenLabel}>{label}</span>
              <span className={styles.screenDesc}>{desc}</span>
            </button>
          ))}
        </div>
      </div>

      <div className={styles.section}>
        <h3 className={styles.subheading}>Moeda no Stripe</h3>
        <div className={styles.currencyFilters}>
          <button
            className={`${styles.filterBtn} ${selectedCurrencyFilter === 'all' ? styles.active : ''}`}
            onClick={() => setCurrencyFilter('all')}
          >
            Todas
          </button>
          {(['EUR', 'USD', 'BRL'] as CurrencyCode[]).map((c) => (
            <button
              key={c}
              className={`${styles.filterBtn} ${selectedCurrencyFilter === c ? styles.active : ''}`}
              onClick={() => setCurrencyFilter(c)}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.section}>
        <h3 className={styles.subheading}>Resumo ao vivo</h3>
        <CurrencySummary />
      </div>
    </div>
  );
}
