import styles from './StripeHeader.module.css';

interface StripeHeaderProps {
  title?: string;
}

export function StripeHeader({ title = 'SalesDigital' }: StripeHeaderProps) {
  return (
    <header className={styles.header}>
      <button className={styles.shopBtn} aria-label="Loja">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M3 9l9-6 9 6v11a1 1 0 01-1 1H4a1 1 0 01-1-1V9z" />
          <path d="M9 21V12h6v9" />
        </svg>
      </button>
      <h1 className={styles.title}>{title}</h1>
      <button className={styles.addBtn} aria-label="Adicionar">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 5v14M5 12h14" strokeLinecap="round" />
        </svg>
      </button>
    </header>
  );
}

export function StripeBalancesHeader() {
  return <StripeHeader title="Saldos" />;
}
