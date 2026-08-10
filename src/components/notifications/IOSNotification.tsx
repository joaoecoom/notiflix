import type { NotificationRecord } from '../../engines/simulation/types';
import { formatTimestampForDisplay } from '../../engines/notification';
import { formatNotificationAmount } from '../../engines/currency/notificationFormat';
import styles from './IOSNotification.module.css';

interface IOSNotificationProps {
  notification: NotificationRecord;
  onDismiss?: () => void;
  variant?: 'stack' | 'banner' | 'lockscreen';
  animating?: boolean;
  exiting?: boolean;
  badge?: number;
  showAppName?: boolean;
}

export function IOSNotification({
  notification,
  onDismiss,
  variant = 'stack',
  animating = true,
  exiting = false,
  badge,
  showAppName = true,
}: IOSNotificationProps) {
  const timestamp = formatTimestampForDisplay(notification);
  const message =
    notification.message.includes('pagamento')
      ? `Você recebeu um pagamento de ${formatNotificationAmount(notification.amount, notification.currency)}`
      : notification.message;

  return (
    <div
      className={`${styles.notification} ${styles[variant]} ${animating ? styles.enter : ''} ${exiting ? styles.exit : ''}`}
      onClick={onDismiss}
      role="alert"
    >
      <div className={styles.iconWrapper}>
        <StripeDashboardIcon />
        {badge != null && badge > 1 && (
          <span className={styles.badge}>{badge}</span>
        )}
      </div>
      <div className={styles.content}>
        {showAppName && (
          <div className={styles.header}>
            <span className={styles.appName}>{notification.app}</span>
            <span className={styles.timestamp}>{timestamp}</span>
          </div>
        )}
        {!showAppName && (
          <div className={styles.header}>
            <span className={styles.messageOnly}>{message}</span>
            <span className={styles.timestamp}>{timestamp}</span>
          </div>
        )}
        {showAppName && <p className={styles.message}>{message}</p>}
      </div>
    </div>
  );
}

function StripeDashboardIcon() {
  return (
    <div className={styles.stripeDashboardIcon}>
      <svg viewBox="0 0 24 24" fill="white" width="22" height="22">
        <path d="M13.976 9.15c-2.172-.806-3.356-1.426-3.356-2.409 0-.831.683-1.305 1.901-1.305 2.227 0 4.515.858 6.09 1.631l.89-5.494C18.252.975 15.697 0 12.165 0 9.667 0 7.589.654 6.104 1.872 4.56 3.147 3.757 4.992 3.757 7.218c0 4.039 2.467 5.76 6.476 7.219 2.585.92 3.445 1.574 3.445 2.583 0 .98-.84 1.545-2.354 1.545-1.875 0-4.965-.921-6.99-2.109l-.9 5.555C5.175 22.99 8.385 24 11.714 24c2.641 0 4.843-.624 6.328-1.813 1.664-1.305 2.525-3.236 2.525-5.732 0-4.128-2.524-5.851-6.591-7.305z" />
      </svg>
    </div>
  );
}

export { StripeDashboardIcon };
