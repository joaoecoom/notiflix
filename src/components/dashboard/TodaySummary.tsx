import { formatCurrency } from '../../engines/currency';
import type { CurrencyCode } from '../../engines/currency';
import { useSimulationStore } from '../../store/simulationStore';
import { LiveValue } from './LiveValue';
import styles from './TodaySummary.module.css';

interface TodaySummaryProps {
  currencyFilter?: CurrencyCode | 'all';
}

export function TodaySummary({ currencyFilter = 'all' }: TodaySummaryProps) {
  const metrics = useSimulationStore((s) => s.metrics);

  const currencies: CurrencyCode[] =
    currencyFilter === 'all' ? ['EUR', 'USD', 'BRL'] : [currencyFilter];

  const primaryCurrency = currencies[0];
  const volume = currencies.reduce((sum, c) => sum + metrics.byCurrency[c].revenue, 0);
  const payments = currencies.reduce((sum, c) => sum + metrics.byCurrency[c].payments, 0);
  const customers = currencies.reduce((sum, c) => sum + metrics.byCurrency[c].customers, 0);

  return (
    <section className={styles.section}>
      <h2 className={styles.title}>Hoje</h2>
      <div className={styles.grid}>
        <div className={styles.metric}>
          <span className={styles.label}>Volume bruto</span>
          <span className={styles.value}>
            <LiveValue
              value={
                currencyFilter === 'all'
                  ? formatMultiCurrency(currencies, metrics)
                  : formatCurrency(volume, primaryCurrency)
              }
            />
          </span>
        </div>
        <div className={styles.metric}>
          <span className={styles.label}>Pagamentos</span>
          <span className={styles.value}>
            <LiveValue value={payments} />
          </span>
        </div>
        <div className={styles.metric}>
          <span className={styles.label}>Clientes</span>
          <span className={styles.value}>
            <LiveValue value={customers} />
          </span>
        </div>
      </div>
    </section>
  );
}

function formatMultiCurrency(
  currencies: CurrencyCode[],
  metrics: ReturnType<typeof useSimulationStore.getState>['metrics']
): string {
  const active = currencies.filter((c) => metrics.byCurrency[c].revenue > 0);
  if (active.length === 0) return formatCurrency(0, currencies[0]);
  if (active.length === 1) return formatCurrency(metrics.byCurrency[active[0]].revenue, active[0]);
  return active.map((c) => formatCurrency(metrics.byCurrency[c].revenue, c)).join(' · ');
}
