import { useSimulationStore } from '../../store/simulationStore';
import { getVisibleNotifications } from '../../engines/notification';
import { IOSNotification } from './IOSNotification';
import styles from './NotificationStack.module.css';

interface NotificationStackProps {
  maxVisible?: number;
  variant?: 'stack' | 'banner' | 'lockscreen';
}

export function NotificationStack({
  maxVisible = 5,
  variant = 'stack',
}: NotificationStackProps) {
  const notifications = useSimulationStore((s) => s.notifications);
  const dismissNotification = useSimulationStore((s) => s.dismissNotification);

  const visible = getVisibleNotifications(notifications, maxVisible);

  if (visible.length === 0) return null;

  return (
    <div className={`${styles.stack} ${styles[variant]}`}>
      {visible.map((notification, index) => (
        <div
          key={notification.id}
          className={styles.item}
          style={{ zIndex: visible.length - index }}
        >
          <IOSNotification
            notification={notification}
            variant={variant}
            onDismiss={() => dismissNotification(notification.id)}
            animating={index === 0}
          />
        </div>
      ))}
    </div>
  );
}
