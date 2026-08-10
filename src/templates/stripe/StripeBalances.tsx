import { useSimulationStore } from '../../store/simulationStore';
import { StripeBalancesHeader } from '../../components/dashboard/StripeHeader';
import { formatCurrency } from '../../engines/currency';
import type { CurrencyCode } from '../../engines/currency';
import styles from './StripeBalances.module.css';

export function StripeBalances() {
  const metrics = useSimulationStore((s) => s.metrics);
  const filter = useSimulationStore((s) => s.selectedCurrencyFilter);
  const transactions = metrics.transactions;

  const currencies: CurrencyCode[] =
    filter === 'all' ? ['EUR', 'USD', 'BRL'] : [filter];

  return (
    <div className={styles.container}>
      <StripeBalancesHeader />

      <div className={styles.scroll}>
        {currencies.map((currency) => {
          const data = metrics.byCurrency[currency];
          if (filter === 'all' && data.balance === 0 && data.payments === 0) return null;

          return (
            <div key={currency} className={styles.currencyBlock}>
              <div className={styles.currencyLabel}>
                <span className={styles.flag}>{getFlag(currency)}</span>
                <span className={styles.currencyCode}>{currency}</span>
              </div>
              <div className={styles.balanceAmount}>
                {formatCurrency(data.balance, currency)}
              </div>
              <button className={styles.transferBtn}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <rect x="3" y="3" width="18" height="18" rx="2" />
                  <path d="M9 12h6M12 9l3 3-3 3" />
                </svg>
                Realizar repasse
              </button>

              <section className={styles.paymentBalance}>
                <h3 className={styles.sectionTitle}>Saldo de pagamentos</h3>
                <div className={styles.balanceCard}>
                  <div className={styles.balanceRow}>
                    <span className={styles.flag}>{getFlag(currency)}</span>
                    <span>{currency}</span>
                  </div>
                  <span className={styles.balanceValue}>
                    {formatCurrency(data.balance, currency)}
                  </span>
                </div>
              </section>
            </div>
          );
        })}

        {transactions.length > 0 && (
          <section className={styles.recentActivity}>
            <h3 className={styles.sectionTitle}>
              Atividade recente
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 18l6-6-6-6" />
              </svg>
            </h3>
            {transactions.slice(0, 4).map((tx) => (
              <div key={tx.id} className={styles.txRow}>
                <div className={styles.txInfo}>
                  <span className={styles.txAmount}>
                    {formatCurrency(tx.amount, tx.currency)}
                  </span>
                  <span className={styles.txDate}>
                    Chegar até • {formatDate(tx.timestamp)}
                  </span>
                  <span className={styles.txDesc}>{tx.description ?? 'Pagamento'}</span>
                </div>
                <span className={styles.txBadge}>Pago</span>
              </div>
            ))}
          </section>
        )}

        <div className={styles.spacer} />
      </div>
    </div>
  );
}

function getFlag(currency: CurrencyCode): string {
  const flags: Record<CurrencyCode, string> = { EUR: '🇪🇺', USD: '🇺🇸', BRL: '🇧🇷' };
  return flags[currency];
}

function formatDate(timestamp: number): string {
  const d = new Date(timestamp);
  const months = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
  return `${d.getDate()} de ${months[d.getMonth()]}.`;
}
