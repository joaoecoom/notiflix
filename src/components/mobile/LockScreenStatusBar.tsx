import styles from './LockScreenStatusBar.module.css';

/** iOS lock screen status bar — MEO + signal + wifi + charging battery */
export function LockScreenStatusBar() {
  return (
    <div className={styles.bar}>
      <span className={styles.carrier}>MEO</span>
      <div className={styles.right}>
        {/* Cellular — 4 bars, all active */}
        <svg className={styles.cellular} viewBox="0 0 18 12" aria-hidden>
          <rect x="0.5" y="7.5" width="2.8" height="4" rx="0.55" fill="#fff" />
          <rect x="4.8" y="5" width="2.8" height="6.5" rx="0.55" fill="#fff" />
          <rect x="9.1" y="2.5" width="2.8" height="9" rx="0.55" fill="#fff" />
          <rect x="13.4" y="0" width="2.8" height="11.5" rx="0.55" fill="#fff" />
        </svg>

        {/* Wi-Fi */}
        <svg className={styles.wifi} viewBox="0 0 16 12" aria-hidden>
          <path d="M8 11a1.15 1.15 0 100-2.3 1.15 1.15 0 000 2.3z" fill="#fff" />
          <path
            d="M4.6 7.9a4.4 4.4 0 016.8 0"
            stroke="#fff"
            strokeWidth="1.4"
            fill="none"
            strokeLinecap="round"
          />
          <path
            d="M1.5 4.8a8.5 8.5 0 0113 0"
            stroke="#fff"
            strokeWidth="1.4"
            fill="none"
            strokeLinecap="round"
          />
        </svg>

        {/* Battery — green, charging */}
        <svg className={styles.battery} viewBox="0 0 28 13" aria-hidden>
          <rect
            x="0.5"
            y="0.5"
            width="23"
            height="12"
            rx="3.5"
            stroke="rgba(255,255,255,0.35)"
            strokeWidth="1"
            fill="none"
          />
          <rect x="2" y="2" width="19" height="9" rx="2.2" fill="#34C759" />
          <path
            d="M11.5 3.8 9.2 8.6h1.9l-1.3 3.2 3.8-4.8h-2l1.2-3.2z"
            fill="#fff"
          />
          <path
            d="M24.5 4.5v4c.9-.35 1.5-1.15 1.5-2s-.6-1.65-1.5-2z"
            fill="rgba(255,255,255,0.45)"
          />
        </svg>
      </div>
    </div>
  );
}
