import { useEffect, useState, type ReactNode } from 'react';
import { LockScreenStatusBar } from '../../components/mobile/LockScreenStatusBar';
import { LiveValue } from '../../components/dashboard/LiveValue';
import { useAppSales } from '../../hooks/useAppSales';
import {
  computeAdMetrics,
  formatBRL,
  PAYMENT_METHOD_LABELS,
  type PaymentMethod,
} from '../../engines/apps';
import styles from './UtmifyTemplate.module.css';

const FILTERS: { label: string; value: string; info?: boolean; wide?: boolean }[] = [
  { label: 'Período de visualização', value: 'Hoje', info: true },
  { label: 'Conta de anúncio', value: 'Todas' },
  { label: 'Plataformas', value: 'Qualquer' },
  { label: 'Produto', value: 'Qualquer' },
  { label: 'Fonte de Tráfego', value: 'Qualquer', wide: true },
];

function formatRatio(value: number): string {
  return value.toFixed(2);
}

function formatUpdatedAgo(since: number, now: number): string {
  const minutes = Math.floor((now - since) / 60000);
  if (minutes < 1) return 'agora mesmo';
  if (minutes === 1) return 'há 1 minuto';
  if (minutes < 60) return `há ${minutes} minutos`;
  const hours = Math.floor(minutes / 60);
  return hours === 1 ? 'há 1 hora' : `há ${hours} horas`;
}

function InfoIcon() {
  return (
    <svg className={styles.info} width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden>
      <circle cx="8" cy="8" r="6.6" stroke="currentColor" strokeWidth="1.4" />
      <path d="M8 7.2V11.2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="8" cy="4.9" r="0.95" fill="currentColor" />
    </svg>
  );
}

function Chevron() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden>
      <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function MetricCard({
  label,
  value,
  positive,
  children,
}: {
  label: string;
  value?: string;
  positive?: boolean;
  children?: ReactNode;
}) {
  return (
    <section className={styles.metric}>
      <div className={styles.metricHead}>
        <span className={styles.metricLabel}>{label}</span>
        <InfoIcon />
      </div>
      {value != null && (
        <div className={`${styles.metricValue} ${positive ? styles.positive : ''}`}>
          <LiveValue value={value} />
        </div>
      )}
      {children}
    </section>
  );
}

function TabIcon({ children, active }: { children: ReactNode; active?: boolean }) {
  return (
    <span className={`${styles.tab} ${active ? styles.tabActive : ''}`}>
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        {children}
      </svg>
    </span>
  );
}

export function UtmifyTemplate() {
  const { sales, baseline } = useAppSales('utmify');
  const metrics = computeAdMetrics(sales, baseline);
  const [refreshedAt, setRefreshedAt] = useState(() => Date.now());
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (sales.lastSaleAt != null) setRefreshedAt(Date.now());
  }, [sales.lastSaleAt]);

  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 15000);
    return () => window.clearInterval(id);
  }, []);

  const methodTotal = Math.max(1, sales.sales);

  return (
    <div className={styles.template}>
      <LockScreenStatusBar showTime />

      <header className={styles.header}>
        <div className={styles.brand}>
          <img src="/platforms/utmify.png" alt="" className={styles.brandIcon} />
          <span className={styles.brandName}>utmify</span>
        </div>
        <span className={styles.headerTitle}>Principal</span>
        <div className={styles.headerActions}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M12 4H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-6" />
            <path d="M17.5 3.5a2.1 2.1 0 0 1 3 3L12 15l-4 1 1-4Z" />
          </svg>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
            <path d="M20.5 14.6A8.5 8.5 0 0 1 9.4 3.5a8.5 8.5 0 1 0 11.1 11.1Z" />
          </svg>
        </div>
      </header>

      <main className={styles.content}>
        <section className={styles.summary}>
          <h2 className={styles.summaryTitle}>Resumo</h2>
          <div className={styles.summaryRow}>
            <span className={styles.updated}>
              Atualizado {formatUpdatedAgo(refreshedAt, Math.max(now, refreshedAt))}
            </span>
            <button
              type="button"
              className={styles.refreshBtn}
              onClick={() => {
                setRefreshedAt(Date.now());
                setNow(Date.now());
              }}
            >
              Atualizar
            </button>
          </div>

          <div className={styles.filters}>
            {FILTERS.map((filter) => (
              <label key={filter.label} className={`${styles.filter} ${filter.wide ? styles.filterWide : ''}`}>
                <span className={styles.filterLabel}>
                  {filter.label}
                  {filter.info && <InfoIcon />}
                </span>
                <span className={styles.select}>
                  <span>{filter.value}</span>
                  <Chevron />
                </span>
              </label>
            ))}
          </div>
        </section>

        <MetricCard label="Lucro" value={formatBRL(metrics.profit)} positive={metrics.profit >= 0} />
        <MetricCard label="ROI" value={formatRatio(metrics.roi)} positive={metrics.roi >= 0} />
        <MetricCard label="Faturamento Líquido" value={formatBRL(metrics.revenue)} />
        <MetricCard label="Gastos com Anúncios" value={formatBRL(metrics.adSpend)} />
        <MetricCard label="ROAS" value={formatRatio(metrics.roas)} positive />
        <MetricCard label="CPA" value={formatBRL(metrics.cpa)} />
        <MetricCard label="Margem" value={`${(metrics.margin * 100).toFixed(1)}%`} />
        <MetricCard label="Vendas Aprovadas" value={String(sales.sales)} />
        <MetricCard label="Vendas Pendentes" value={String(baseline.pendingSales)} />
        <MetricCard label="Reembolsados" value={formatBRL(baseline.refunds)} />

        <MetricCard label="Vendas por Pagamento">
          <ul className={styles.methods}>
            {(Object.keys(PAYMENT_METHOD_LABELS) as PaymentMethod[]).map((method) => {
              const share = sales.byMethod[method].sales / methodTotal;
              return (
                <li key={method} className={styles.method}>
                  <div className={styles.methodRow}>
                    <span>{PAYMENT_METHOD_LABELS[method]}</span>
                    <span className={styles.methodValue}>
                      {sales.byMethod[method].sales} · {(share * 100).toFixed(0)}%
                    </span>
                  </div>
                  <div className={styles.bar}>
                    <span className={styles.barFill} style={{ width: `${share * 100}%` }} />
                  </div>
                </li>
              );
            })}
          </ul>
        </MetricCard>
      </main>

      <button type="button" className={styles.fab} aria-label="Calendário">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3.5" y="5" width="17" height="15.5" rx="2.5" />
          <path d="M3.5 10h17M8 3v4M16 3v4" />
        </svg>
      </button>

      <nav className={styles.tabBar}>
        <TabIcon active>
          <rect x="3.5" y="3.5" width="7" height="7" rx="1.5" />
          <rect x="13.5" y="3.5" width="7" height="7" rx="1.5" />
          <rect x="3.5" y="13.5" width="7" height="7" rx="1.5" />
          <rect x="13.5" y="13.5" width="7" height="7" rx="1.5" />
        </TabIcon>
        <TabIcon>
          <path d="M14.5 21v-7.5h2.6l.4-3h-3V8.6c0-.9.3-1.5 1.5-1.5h1.6V4.4a21 21 0 0 0-2.4-.1c-2.3 0-3.9 1.4-3.9 4v2.2H8.7v3h2.6V21" />
        </TabIcon>
        <TabIcon>
          <rect x="2.5" y="6" width="13" height="12" rx="2.5" />
          <path d="M15.5 10.5l5-3v9l-5-3" />
        </TabIcon>
        <TabIcon>
          <path d="M9 18.5V5.5l11-2v13" />
          <circle cx="6.5" cy="18.5" r="2.5" />
          <circle cx="17.5" cy="16.5" r="2.5" />
        </TabIcon>
        <TabIcon>
          <rect x="2.5" y="5" width="19" height="14" rx="3.5" />
          <path d="M10 9l5 3-5 3Z" fill="currentColor" />
        </TabIcon>
        <TabIcon>
          <path d="M4 7h16M4 12h16M4 17h16" />
        </TabIcon>
      </nav>
    </div>
  );
}
