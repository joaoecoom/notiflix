import styles from './StatusBar.module.css';

interface StatusBarProps {
  time?: string;
}

export function StatusBar({ time }: StatusBarProps) {
  const displayTime =
    time ??
    new Date().toLocaleTimeString('pt-PT', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });

  return (
    <div className={styles.statusBar}>
      <span className={styles.time}>{displayTime}</span>
      <div className={styles.indicators}>
        <svg className={styles.signal} viewBox="0 0 18 12" fill="currentColor">
          <rect x="0" y="8" width="3" height="4" rx="0.5" />
          <rect x="4" y="5" width="3" height="7" rx="0.5" />
          <rect x="8" y="2" width="3" height="10" rx="0.5" />
          <rect x="12" y="0" width="3" height="12" rx="0.5" />
        </svg>
        <span className={styles.network}>5G</span>
        <svg className={styles.battery} viewBox="0 0 28 13" fill="none">
          <rect x="0.5" y="0.5" width="23" height="12" rx="3" stroke="currentColor" strokeOpacity="0.35" />
          <rect x="2" y="2" width="16" height="9" rx="1.5" fill="#ff3b30" />
          <path d="M25 4.5V8.5C26.1 8.1 27 7.1 27 6C27 4.9 26.1 3.9 25 4.5Z" fill="currentColor" fillOpacity="0.4" />
        </svg>
      </div>
    </div>
  );
}
