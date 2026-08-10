import styles from './LockScreenStatusBar.module.css';

export function LockScreenStatusBar() {
  return (
    <div className={styles.bar}>
      <span className={styles.carrier}>MEO</span>
      <div className={styles.right}>
        <svg className={styles.cellular} viewBox="0 0 19 12" aria-hidden>
          <rect x="0.5" y="8" width="3" height="3.5" rx="0.6" fill="rgba(255,255,255,0.35)" />
          <rect x="5" y="5.5" width="3" height="6" rx="0.6" fill="#fff" />
          <rect x="9.5" y="3" width="3" height="8.5" rx="0.6" fill="#fff" />
          <rect x="14" y="0.5" width="3" height="11" rx="0.6" fill="#fff" />
        </svg>
        <svg className={styles.wifi} viewBox="0 0 16 12" aria-hidden>
          <path
            d="M8 10.8a1.1 1.1 0 100-2.2 1.1 1.1 0 000 2.2z"
            fill="#fff"
          />
          <path
            d="M4.8 7.8a4.2 4.2 0 015.9 0"
            stroke="#fff"
            strokeWidth="1.35"
            fill="none"
            strokeLinecap="round"
          />
          <path
            d="M1.8 4.8a8.2 8.2 0 0112.4 0"
            stroke="#fff"
            strokeWidth="1.35"
            fill="none"
            strokeLinecap="round"
          />
        </svg>
        <svg className={styles.battery} viewBox="0 0 27 13" aria-hidden>
          <rect
            x="0.5"
            y="0.5"
            width="22"
            height="12"
            rx="3.2"
            stroke="rgba(255,255,255,0.35)"
            strokeWidth="1"
            fill="none"
          />
          <rect x="2" y="2" width="18.5" height="9" rx="2" fill="#34C759" />
          <path
            d="M12.2 3.8 9.4 9.2h2.2l-1.5 3.5 4.2-5.4h-2.3l1.4-3.5z"
            fill="#fff"
          />
          <path
            d="M23.5 4.6v3.8c.85-.38 1.45-1.22 1.45-1.9s-.6-1.52-1.45-1.9z"
            fill="rgba(255,255,255,0.4)"
          />
        </svg>
      </div>
    </div>
  );
}
