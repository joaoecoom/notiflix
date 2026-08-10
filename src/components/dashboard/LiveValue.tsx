import { type ReactNode } from 'react';
import styles from './LiveValue.module.css';

interface LiveValueProps {
  value: string | number;
  className?: string;
}

export function LiveValue({ value, className }: LiveValueProps) {
  return (
    <span key={String(value)} className={`${styles.live} ${className ?? ''}`}>
      {value}
    </span>
  );
}

interface LiveCurrencyProps {
  children: ReactNode;
}

export function LiveCurrency({ children }: LiveCurrencyProps) {
  return <span className={styles.live}>{children}</span>;
}
