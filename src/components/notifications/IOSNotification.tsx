import type { NotificationRecord } from '../../engines/simulation/types';
import { formatTimestampForDisplay } from '../../engines/notification';
import { formatNotificationAmount } from '../../engines/currency/notificationFormat';
import { StripeAppIcon } from './StripeAppIcon';
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
        <StripeAppIcon size={variant === 'lockscreen' ? 40 : 38} />
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
