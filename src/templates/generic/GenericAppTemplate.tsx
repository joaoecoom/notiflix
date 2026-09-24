import { LockScreenStatusBar } from '../../components/mobile/LockScreenStatusBar';
import { LiveValue } from '../../components/dashboard/LiveValue';
import { useAppSales } from '../../hooks/useAppSales';
import { getPlatform } from '../../engines/platform/registry';
import { formatBRL } from '../../engines/apps';
import styles from './GenericAppTemplate.module.css';

export function GenericAppTemplate({ platformId }: { platformId: string }) {
  const platform = getPlatform(platformId);
  const { sales } = useAppSales(platformId);

  return (
    <div className={styles.template}>
      <LockScreenStatusBar showTime />

      <header className={styles.header}>
        {platform?.iconSrc && <img src={platform.iconSrc} alt="" className={styles.icon} />}
        <span className={styles.name}>{platform?.name ?? platformId}</span>
      </header>

      <main className={styles.content}>
        <section className={styles.card}>
          <span className={styles.label}>Vendas hoje</span>
          <span className={styles.value}>
            <LiveValue value={formatBRL(sales.revenue)} />
          </span>
          <span className={styles.sub}>
            <LiveValue value={`${sales.sales} vendas aprovadas`} />
          </span>
        </section>
        <p className={styles.note}>Ecrã completo desta app ainda não criado.</p>
      </main>
    </div>
  );
}
