import { useEffect, useRef, useState } from 'react';
import { useSimulationStore } from '../../store/simulationStore';
import { getLockScreenNotifications } from '../../engines/notification';
import { IOSNotification } from '../notifications/IOSNotification';
import { LockScreenStatusBar } from './LockScreenStatusBar';
import styles from './IPhoneLockScreen.module.css';

function formatLockDate(date: Date): string {
  const weekdays = ['dom.', 'seg.', 'ter.', 'qua.', 'qui.', 'sex.', 'sáb.'];
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `${weekdays[date.getDay()]} ${day}/${month}`;
}

function formatLockTime(date: Date): string {
  const h = String(date.getHours()).padStart(2, '0');
  const m = String(date.getMinutes()).padStart(2, '0');
  return `${h}:${m}`;
}

export function IPhoneLockScreen() {
  const liveNotifications = useSimulationStore((s) => s.notifications);
  const seedNotifications = useSimulationStore((s) => s.seedNotifications);
  const dismissNotification = useSimulationStore((s) => s.dismissNotification);
  const dismissSeedNotification = useSimulationStore((s) => s.dismissSeedNotification);
  const dismissAllNotifications = useSimulationStore((s) => s.dismissAllNotifications);

  const [now, setNow] = useState(new Date());
  const [expanded, setExpanded] = useState(true);
  const prevLiveCount = useRef(liveNotifications.length);
  const notifListRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (liveNotifications.length > prevLiveCount.current) {
      const newest = liveNotifications[0];
      if (newest && !newest.isSeed) {
        setExpanded(true);
        notifListRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
    prevLiveCount.current = liveNotifications.length;
  }, [liveNotifications]);

  const visible = getLockScreenNotifications(liveNotifications, seedNotifications, 8);

  const handleDismiss = (id: string, isSeed?: boolean) => {
    if (isSeed) dismissSeedNotification(id);
    else dismissNotification(id);
  };

  return (
    <div className={styles.lockscreen}>
      <div className={styles.wallpaper} />
      <div className={styles.depthSubject} aria-hidden />

      <LockScreenStatusBar />

      <div className={styles.clock}>
        <span className={styles.date}>{formatLockDate(now)}</span>
        <span className={styles.time} aria-label={formatLockTime(now)}>
          {formatLockTime(now)}
        </span>
      </div>

      <div className={styles.spacer} />

      {visible.length > 0 && (
        <div className={styles.notifCenter}>
          <div className={styles.centerHeader}>
            <span className={styles.centerTitle}>Central de notificações</span>
            <button
              className={styles.clearBtn}
              aria-label="Limpar"
              onClick={dismissAllNotifications}
            >
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M1 1l8 8M9 1L1 9" strokeLinecap="round" />
              </svg>
            </button>
          </div>

          <div className={styles.groupHeader}>
            <span className={styles.groupName}>Stripe</span>
            {visible.length > 1 && (
              <button
                className={styles.collapseBtn}
                onClick={() => setExpanded(!expanded)}
              >
                {expanded ? 'Mostrar menos' : 'Mostrar tudo'}
                <svg
                  width="10"
                  height="10"
                  viewBox="0 0 10 10"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  style={{ transform: expanded ? 'rotate(180deg)' : 'none' }}
                >
                  <path d="M2 4l3 3 3-3" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            )}
            <button className={styles.clearBtn} aria-label="Limpar Stripe">
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M1 1l8 8M9 1L1 9" strokeLinecap="round" />
              </svg>
            </button>
          </div>

          <div className={styles.notifList} ref={notifListRef}>
            {!expanded && visible.length > 1 ? (
              <div className={styles.collapsedStack}>
                <div className={styles.stackLayer3} />
                <div className={styles.stackLayer2} />
                <IOSNotification
                  notification={visible[0]}
                  variant="lockscreen"
                  badge={visible.length}
                  animating={!visible[0].isSeed}
                  onDismiss={() => handleDismiss(visible[0].id, visible[0].isSeed)}
                />
              </div>
            ) : (
              visible.map((notification, index) => (
                <div
                  key={notification.id}
                  className={`${styles.notifItem} ${!notification.isSeed && index === 0 ? styles.notifNew : ''}`}
                >
                  <IOSNotification
                    notification={notification}
                    variant="lockscreen"
                    animating={!notification.isSeed && index === 0}
                    onDismiss={() => handleDismiss(notification.id, notification.isSeed)}
                  />
                </div>
              ))
            )}
          </div>
        </div>
      )}

      <div className={styles.bottomControls}>
        <button className={styles.shortcutBtn} aria-label="Lanterna">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M9 18l3-3V6a3 3 0 016 0v9l3 3" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M12 21v-3" strokeLinecap="round" />
          </svg>
        </button>
        <button className={styles.shortcutBtn} aria-label="Câmara">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <rect x="3" y="6" width="18" height="13" rx="2" />
            <circle cx="12" cy="12.5" r="3.5" />
          </svg>
        </button>
      </div>

      <div className={styles.homeBar}>
        <div className={styles.homeIndicator} />
      </div>
    </div>
  );
}
