import { useSimulationStore } from '../../store/simulationStore';
import type { CurrencyCode } from '../../engines/currency';
import {
  IOS_NOTIFICATION_RETENTION_DAYS_CLASSIC,
  IOS_NOTIFICATION_RETENTION_DAYS_IOS18,
} from '../../engines/simulation/types';
import { getBuiltinPlatforms } from '../../engines/platform';
import type { PreviewScreen } from '../../engines/platform/types';
import { CurrencySummary } from '../dashboard/CurrencySummary';
import styles from './ControlPanel.module.css';

const SCREENS: { id: PreviewScreen; label: string; desc: string }[] = [
  { id: 'hub', label: 'Hub', desc: 'Escolher plataformas' },
  { id: 'stripe', label: 'App Stripe', desc: 'Dashboard com valores ao vivo' },
  { id: 'iphone', label: 'iPhone Lock Screen', desc: 'Ecrã bloqueado + notificações' },
];

interface ControlPanelProps {
  onSimulationStart?: () => void;
}

export function ControlPanel({ onSimulationStart }: ControlPanelProps) {
  const isRunning = useSimulationStore((s) => s.isRunning);
  const elapsedTime = useSimulationStore((s) => s.elapsedTime);
  const previewScreen = useSimulationStore((s) => s.previewScreen);
  const selectedCurrencyFilter = useSimulationStore((s) => s.selectedCurrencyFilter);
  const timeline = useSimulationStore((s) => s.timeline);
  const enabledPlatformIds = useSimulationStore((s) => s.enabledPlatformIds);
  const startSimulation = useSimulationStore((s) => s.startSimulation);
  const stopSimulation = useSimulationStore((s) => s.stopSimulation);
  const resetSimulation = useSimulationStore((s) => s.resetSimulation);
  const setPreviewScreen = useSimulationStore((s) => s.setPreviewScreen);
  const togglePlatform = useSimulationStore((s) => s.togglePlatform);
  const setCurrencyFilter = useSimulationStore((s) => s.setCurrencyFilter);
  const notificationRetentionDays = useSimulationStore(
    (s) => s.settings.notificationRetentionDays
  );
  const updateSettings = useSimulationStore((s) => s.updateSettings);

  const platforms = getBuiltinPlatforms();

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
          Activa plataformas no Hub, configura timeline/seeds e inicia. Várias apps podem notificar ao
          mesmo tempo.
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
        <h3 className={styles.subheading}>Plataformas activas</h3>
        <div className={styles.platformToggles}>
          {platforms.map((p) => (
            <button
              key={p.id}
              type="button"
              className={`${styles.filterBtn} ${enabledPlatformIds.includes(p.id) ? styles.active : ''}`}
              onClick={() => togglePlatform(p.id)}
            >
              {p.name}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.section}>
        <h3 className={styles.subheading}>Ecrã a gravar</h3>
        <div className={styles.viewModes}>
          {SCREENS.map(({ id, label, desc }) => (
            <button
              key={id}
              type="button"
              className={`${styles.screenBtn} ${previewScreen === id ? styles.active : ''}`}
              onClick={() => setPreviewScreen(id)}
            >
              <span className={styles.screenLabel}>{label}</span>
              <span className={styles.screenDesc}>{desc}</span>
            </button>
          ))}
        </div>
      </div>

      <div className={styles.section}>
        <h3 className={styles.subheading}>Retenção no iPhone</h3>
        <p className={styles.hint}>
          O iOS mantém notificações na Central até as limpares ou expirarem — 7 dias (clássico) ou 3
          dias (iOS 18.1+).
        </p>
        <div className={styles.currencyFilters}>
          <button
            type="button"
            className={`${styles.filterBtn} ${notificationRetentionDays === IOS_NOTIFICATION_RETENTION_DAYS_CLASSIC ? styles.active : ''}`}
            onClick={() =>
              updateSettings({ notificationRetentionDays: IOS_NOTIFICATION_RETENTION_DAYS_CLASSIC })
            }
          >
            7 dias
          </button>
          <button
            type="button"
            className={`${styles.filterBtn} ${notificationRetentionDays === IOS_NOTIFICATION_RETENTION_DAYS_IOS18 ? styles.active : ''}`}
            onClick={() =>
              updateSettings({ notificationRetentionDays: IOS_NOTIFICATION_RETENTION_DAYS_IOS18 })
            }
          >
            3 dias
          </button>
        </div>
      </div>

      <div className={styles.section}>
        <h3 className={styles.subheading}>Moeda no Stripe</h3>
        <div className={styles.currencyFilters}>
          <button
            type="button"
            className={`${styles.filterBtn} ${selectedCurrencyFilter === 'all' ? styles.active : ''}`}
            onClick={() => setCurrencyFilter('all')}
          >
            Todas
          </button>
          {(['EUR', 'USD', 'BRL'] as CurrencyCode[]).map((c) => (
            <button
              key={c}
              type="button"
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
