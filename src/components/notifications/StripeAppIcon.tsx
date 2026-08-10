import styles from './StripeAppIcon.module.css';

interface StripeAppIconProps {
  size?: number;
}

/** Stripe app icon as seen in iOS notifications — purple gradient + white S mark */
export function StripeAppIcon({ size = 40 }: StripeAppIconProps) {
  return (
    <div className={styles.icon} style={{ width: size, height: size }}>
      <svg
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={styles.mark}
        aria-hidden
      >
        <path
          d="M14.2 9.8c0-1.15-.95-1.75-2.65-1.75-2.35 0-4.85.95-6.55 2.25L3.8 6.2C6 4.25 9.55 2.85 12.75 2.85c3.55 0 5.85 1.65 5.85 4.35 0 3.25-4.55 4.15-4.55 6.35 0 .85.75 1.3 2.05 1.3 1.75 0 3.85-.75 5.25-1.65l1.3 3.05c-1.5.95-4.1 1.6-6.65 1.6-3.65 0-6-1.75-6-4.55 0-3.45 4.65-4.45 4.65-6.6z"
          fill="white"
        />
      </svg>
    </div>
  );
}
