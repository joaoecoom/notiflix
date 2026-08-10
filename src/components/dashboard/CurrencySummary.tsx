import { formatCurrency } from '../../engines/currency';
import type { CurrencyCode } from '../../engines/currency';
import { useSimulationStore } from '../../store/simulationStore';
import styles from './CurrencySummary.module.css';

export function CurrencySummary() {
  const metrics = useSimulationStore((s) => s.metrics);
  const currencies: CurrencyCode[] = ['EUR', 'USD', 'BRL'];

  const activeCurrencies = currencies.filter(
    (c) => metrics.byCurrency[c].revenue > 0 || metrics.byCurrency[c].payments > 0
  );

  if (activeCurrencies.length === 0) {
    return (
      <div className={styles.container}>
        <div className={styles.empty}>Nenhum evento processado</div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {activeCurrencies.map((currency) => {
        const data = metrics.byCurrency[currency];
        return (
          <div key={currency} className={styles.row}>
            <span className={styles.code}>{currency}</span>
            <span className={styles.amount}>{formatCurrency(data.revenue, currency)}</span>
            <span className={styles.count}>{data.payments} vendas</span>
          </div>
        );
      })}
      <div className={styles.total}>
        <span>Total de eventos:</span>
        <span className={styles.totalCount}>{metrics.totalEvents}</span>
      </div>
    </div>
  );
}
