import { useState } from 'react';
import styles from './TimeFilter.module.css';

const FILTERS = ['1S', '4S', '1A', 'MÊS', 'TRI', 'ANO', 'TUDO'];

export function TimeFilter() {
  const [active, setActive] = useState('1A');

  return (
    <div className={styles.container}>
      {FILTERS.map((f) => (
        <button
          key={f}
          className={`${styles.item} ${active === f ? styles.active : ''}`}
          onClick={() => setActive(f)}
        >
          {f}
        </button>
      ))}
    </div>
  );
}
