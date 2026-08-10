import { useSimulationStore } from '../../store/simulationStore';
import { formatTimelineOffset } from '../../engines/simulation';
import { formatCurrency } from '../../engines/currency';
import type { CurrencyCode } from '../../engines/currency';
import styles from './TimelineEditor.module.css';

export function TimelineEditor() {
  const timeline = useSimulationStore((s) => s.timeline);
  const updateTimelineEntry = useSimulationStore((s) => s.updateTimelineEntry);
  const removeTimelineEntry = useSimulationStore((s) => s.removeTimelineEntry);
  const duplicateTimelineEntry = useSimulationStore((s) => s.duplicateTimelineEntry);
  const addTimelineEntry = useSimulationStore((s) => s.addTimelineEntry);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3 className={styles.title}>Timeline</h3>
        <button
          className={styles.addBtn}
          onClick={() =>
            addTimelineEntry({
              offsetSeconds: timeline.length > 0
                ? timeline[timeline.length - 1].offsetSeconds + 30
                : 0,
              type: 'sale',
              currency: 'EUR',
              amount: 24,
              app: 'Stripe',
            })
          }
        >
          + Evento
        </button>
      </div>

      <div className={styles.list}>
        {timeline.map((entry) => (
          <div key={entry.id} className={styles.entry}>
            <div className={styles.entryTime}>
              <input
                type="number"
                className={styles.timeInput}
                value={entry.offsetSeconds}
                min={0}
                onChange={(e) =>
                  updateTimelineEntry(entry.id, {
                    offsetSeconds: parseInt(e.target.value) || 0,
                  })
                }
              />
              <span className={styles.timeLabel}>
                {formatTimelineOffset(entry.offsetSeconds)}
              </span>
            </div>

            <select
              className={styles.select}
              value={entry.type}
              onChange={(e) =>
                updateTimelineEntry(entry.id, {
                  type: e.target.value as 'sale' | 'refund' | 'payout' | 'customer',
                })
              }
            >
              <option value="sale">Sale</option>
              <option value="refund">Refund</option>
              <option value="payout">Payout</option>
              <option value="customer">Customer</option>
            </select>

            <select
              className={styles.select}
              value={entry.currency}
              onChange={(e) =>
                updateTimelineEntry(entry.id, {
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
                updateTimelineEntry(entry.id, {
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
                onClick={() => duplicateTimelineEntry(entry.id)}
                title="Duplicar"
              >
                ⧉
              </button>
              <button
                className={styles.actionBtn}
                onClick={() => removeTimelineEntry(entry.id)}
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
