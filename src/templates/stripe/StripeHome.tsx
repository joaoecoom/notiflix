import { useSimulationStore } from '../../store/simulationStore';
import { StripeHeader } from '../../components/dashboard/StripeHeader';
import { TodaySummary } from '../../components/dashboard/TodaySummary';
import { TimeFilter } from '../../components/dashboard/TimeFilter';
import { MetricChartCard } from '../../components/dashboard/MetricChartCard';
import type { CurrencyCode } from '../../engines/currency';
import styles from './StripeHome.module.css';

export function StripeHome() {
  const metrics = useSimulationStore((s) => s.metrics);
  const filter = useSimulationStore((s) => s.selectedCurrencyFilter);
  const chartData = metrics.chartData;

  const getVolume = () => {
    if (filter !== 'all') return metrics.byCurrency[filter].revenue;
    const active = (['EUR', 'USD', 'BRL'] as CurrencyCode[]).find(
      (c) => metrics.byCurrency[c].revenue > 0
    );
    return active ? metrics.byCurrency[active].revenue : 0;
  };

  const getPrimaryCurrency = (): CurrencyCode => {
    if (filter !== 'all') return filter;
    const active = (['EUR', 'USD', 'BRL'] as CurrencyCode[]).find(
      (c) => metrics.byCurrency[c].revenue > 0
    );
    return active ?? 'EUR';
  };

  const getPayments = () => {
    if (filter !== 'all') return metrics.byCurrency[filter].payments;
    return Object.values(metrics.byCurrency).reduce((s, m) => s + m.payments, 0);
  };

  const getCustomers = () => {
    if (filter !== 'all') return metrics.byCurrency[filter].customers;
    return Object.values(metrics.byCurrency).reduce((s, m) => s + m.customers, 0);
  };

  const primaryCurrency = getPrimaryCurrency();

  return (
    <div className={styles.container}>
      <StripeHeader />

      <div className={styles.scroll}>
        <TodaySummary currencyFilter={filter} />

        <section className={styles.reports}>
          <div className={styles.reportsHeader}>
            <h2 className={styles.reportsTitle}>Visão geral dos relatórios</h2>
            <button className={styles.editBtn}>Editar</button>
          </div>
          <TimeFilter />
        </section>

        <MetricChartCard
          title="Volume bruto"
          currentValue={getVolume()}
          comparisonValue={getVolume() * 1.5}
          currency={primaryCurrency}
          chartData={chartData}
          currencyFilter={filter}
          growthPercent={getVolume() > 0 ? 77.7 : 0}
        />

        <MetricChartCard
          title="Volume líquido de vendas"
          currentValue={getVolume() * 0.95}
          comparisonValue={getVolume() * 1.4}
          currency={primaryCurrency}
          chartData={chartData}
          currencyFilter={filter}
          growthPercent={getVolume() > 0 ? 73.7 : 0}
        />

        <section className={styles.newCustomers}>
          <h3 className={styles.sectionTitle}>Novos clientes</h3>
          <div className={styles.customerMetrics}>
            <span className={styles.customerValue}>0</span>
            <span className={`${styles.customerValue} ${styles.purple}`}>
              {getCustomers()}
            </span>
          </div>
        </section>

        <MetricChartCard
          title="Pagamentos bem-sucedidos"
          currentValue={getPayments()}
          comparisonValue={Math.max(getPayments() * 2, 0)}
          formatAsPercent={false}
          chartData={chartData}
          currencyFilter={filter}
          growthPercent={getPayments() > 0 ? 833.3 : 0}
        />

        <MetricChartCard
          title="Gasto por cliente"
          currentValue={getCustomers() > 0 ? getVolume() / getCustomers() : 0}
          currency={primaryCurrency}
          chartData={chartData}
          currencyFilter={filter}
        />

        <div className={styles.spacer} />
      </div>
    </div>
  );
}
