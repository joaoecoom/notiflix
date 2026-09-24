import styles from './IPhoneLockScreen.module.css';

interface LockScreenStatusBarProps {
  carrier?: string;
  batteryLevel?: number;
  /** Inside apps iOS shows the time on the left instead of the carrier */
  showTime?: boolean;
}

function currentTime(): string {
  const d = new Date();
  return `${d.getHours()}:${String(d.getMinutes()).padStart(2, '0')}`;
}

export function LockScreenStatusBar({
  carrier = 'MEO',
  batteryLevel = 0.54,
  showTime = false,
}: LockScreenStatusBarProps) {
  return (
    <div className={styles.statusBar} aria-hidden>
      {showTime ? (
        <span className={`${styles.carrier} ${styles.timeLabel}`}>{currentTime()}</span>
      ) : (
        <span className={styles.carrier}>{carrier}</span>
      )}

      <svg className={styles.signal} width="20" height="11" viewBox="0 0 24 13" fill="#fff">
        <rect x="0" y="1" width="4" height="5" rx="1" />
        <rect x="7" y="0" width="4" height="6" rx="1" />
        <rect x="0" y="8" width="4" height="5" rx="1" />
        <rect x="7" y="8" width="4" height="5" rx="1" />
        <rect x="13" y="8" width="5" height="5" rx="1" />
        <rect x="20" y="8" width="4" height="5" rx="1" />
      </svg>

      <svg
        className={styles.wifi}
        width="17.5"
        height="12.5"
        viewBox="0 0 17 12"
        fill="#fff"
        stroke="#fff"
        strokeWidth="0.6"
        strokeLinejoin="round"
      >
        <path d="M0.37 3.37A11.5 11.5 0 0 1 16.63 3.37L14.58 5.42A8.6 8.6 0 0 0 2.42 5.42Z" />
        <path d="M3.55 6.55A7 7 0 0 1 13.45 6.55L11.75 8.25A4.6 4.6 0 0 0 5.25 8.25Z" />
        <path d="M8.5 11.5L6.24 9.24A3.2 3.2 0 0 1 10.76 9.24Z" />
      </svg>

      <span className={styles.battery}>
        <span
          className={styles.batteryFill}
          style={{ width: `calc((100% - 4px) * ${batteryLevel})` }}
        />
      </span>
    </div>
  );
}
