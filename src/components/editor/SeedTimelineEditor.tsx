import { useSimulationStore } from '../../store/simulationStore';
import { formatCurrency } from '../../engines/currency';
import { formatSeedOffsetLabel } from '../../engines/notification';
import type { CurrencyCode } from '../../engines/currency';
import type { SeedTimeUnit } from '../../engines/simulation/types';
import styles from './TimelineEditor.module.css';

export function SeedTimelineEditor() {
  const seedTimeline = useSimulationStore((s) => s.seedTimeline);
  const addSeedEntry = useSimulationStore((s) => s.addSeedEntry);
  const updateSeedEntry = useSimulationStore((s) => s.updateSeedEntry);
  const removeSeedEntry = useSimulationStore((s) => s.removeSeedEntry);
  const duplicateSeedEntry = useSimulationStore((s) => s.duplicateSeedEntry);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3 className={styles.title}>Notificações existentes</h3>
        <button
          className={styles.addBtn}
          onClick={() =>
            addSeedEntry({
              offsetValue: 1,
              offsetUnit: 'hours',
              clockHour: 12,
              clockMinute: 0,
              currency: 'EUR',
              amount: 24,
              app: 'Stripe',
            })
          }
        >
          + Notificação
        </button>
      </div>

      <p className={styles.hint}>
        O que já aparece no lock screen antes da simulação. Só ficam visíveis dentro da retenção iOS (7 ou 3 dias).
      </p>

      <div className={styles.list}>
        {seedTimeline.length === 0 && (
          <p className={styles.empty}>Sem notificações — adiciona ou gera em bulk.</p>
        )}
        {seedTimeline.map((entry) => (
          <div key={entry.id} className={`${styles.entry} ${styles.seedEntry}`}>
            <div className={styles.entryTime}>
              <input
                type="number"
                className={styles.timeInput}
                value={entry.offsetValue}
                min={0}
                onChange={(e) =>
                  updateSeedEntry(entry.id, {
                    offsetValue: parseInt(e.target.value) || 0,
                  })
                }
              />
              <select
                className={styles.select}
                value={entry.offsetUnit}
                onChange={(e) =>
                  updateSeedEntry(entry.id, {
                    offsetUnit: e.target.value as SeedTimeUnit,
                  })
                }
              >
                <option value="minutes">min atrás</option>
                <option value="hours">h atrás</option>
                <option value="days">dias atrás</option>
              </select>
              <span className={styles.timeLabel}>{formatSeedOffsetLabel(entry)}</span>
            </div>

            {entry.offsetUnit === 'days' && (
              <div className={styles.clockFields}>
                <input
                  type="number"
                  className={styles.timeInput}
                  value={entry.clockHour}
                  min={0}
                  max={23}
                  title="Hora"
                  onChange={(e) =>
                    updateSeedEntry(entry.id, {
                      clockHour: parseInt(e.target.value) || 0,
                    })
                  }
                />
                <span>:</span>
                <input
                  type="number"
                  className={styles.timeInput}
                  value={entry.clockMinute}
                  min={0}
                  max={59}
                  title="Minuto"
                  onChange={(e) =>
                    updateSeedEntry(entry.id, {
                      clockMinute: parseInt(e.target.value) || 0,
                    })
                  }
                />
              </div>
            )}

            <select
              className={styles.select}
              value={entry.currency}
              onChange={(e) =>
                updateSeedEntry(entry.id, {
                  currency: e.target.value as CurrencyCode,
                })
              }
            >
              <option value="EUR">EUR</option>
              <option value="USD">USD</option>
              <option value="BRL">BRL</option>
            </select>

            <input
              type="number"
              className={styles.amountInput}
              value={entry.amount}
              min={0}
              step={0.01}
              onChange={(e) =>
                updateSeedEntry(entry.id, {
                  amount: parseFloat(e.target.value) || 0,
                })
              }
            />

            <span className={styles.formatted}>
              {formatCurrency(entry.amount, entry.currency)}
            </span>

            <div className={styles.actions}>
              <button
                className={styles.actionBtn}
                onClick={() => duplicateSeedEntry(entry.id)}
                title="Duplicar"
              >
                ⧉
              </button>
              <button
                className={styles.actionBtn}
                onClick={() => removeSeedEntry(entry.id)}
                title="Remover"
              >
                ✕
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
