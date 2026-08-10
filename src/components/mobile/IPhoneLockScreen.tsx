import { useEffect, useRef, useState } from 'react';
import { useSimulationStore } from '../../store/simulationStore';
import { getLockScreenNotifications } from '../../engines/notification';
import { IOSNotification } from '../notifications/IOSNotification';
import styles from './IPhoneLockScreen.module.css';

function formatLockDate(date: Date): string {
  const weekdays = ['dom.', 'seg.', 'ter.', 'qua.', 'qui.', 'sex.', 'sáb.'];
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `${weekdays[date.getDay()]} ${day}/${month}`;
}

function formatLockTime(date: Date): string {
  return date.toLocaleTimeString('pt-PT', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
}

export function IPhoneLockScreen() {
  const liveNotifications = useSimulationStore((s) => s.notifications);
  const seedNotifications = useSimulationStore((s) => s.seedNotifications);
  const dismissNotification = useSimulationStore((s) => s.dismissNotification);
  const dismissSeedNotification = useSimulationStore((s) => s.dismissSeedNotification);
  const dismissAllNotifications = useSimulationStore((s) => s.dismissAllNotifications);

  const [now, setNow] = useState(new Date());
  const [expanded, setExpanded] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const visible = getLockScreenNotifications(liveNotifications, seedNotifications, 8);

  const handleDismiss = (id: string, isSeed?: boolean) => {
    if (isSeed) dismissSeedNotification(id);
    else dismissNotification(id);
  };

  return (
    <div className={styles.lockscreen}>
      <div className={styles.wallpaper} />
      <div className={styles.depthSubject} aria-hidden />

      {/* Status bar */}
      <div className={styles.statusBar}>
        <span className={styles.carrier}>MEO</span>
        <div className={styles.indicators}>
          <svg className={styles.signal} viewBox="0 0 18 12" fill="currentColor">
            <rect x="0" y="8" width="3" height="4" rx="0.5" />
            <rect x="4" y="5" width="3" height="7" rx="0.5" />
            <rect x="8" y="2" width="3" height="10" rx="0.5" />
            <rect x="12" y="0" width="3" height="12" rx="0.5" />
          </svg>
          <svg className={styles.wifi} viewBox="0 0 16 12" fill="currentColor">
            <path d="M8 11.5a1.25 1.25 0 100-2.5 1.25 1.25 0 000 2.5z" />
            <path d="M4.5 8.2a5 5 0 017 0" stroke="currentColor" strokeWidth="1.4" fill="none" strokeLinecap="round" />
            <path d="M1.5 5.2a9 9 0 0113 0" stroke="currentColor" strokeWidth="1.4" fill="none" strokeLinecap="round" />
          </svg>
          <svg className={styles.battery} viewBox="0 0 28 13" fill="none">
            <rect x="0.5" y="0.5" width="23" height="12" rx="3" stroke="#4ade80" strokeOpacity="0.6" />
            <rect x="2" y="2" width="19" height="9" rx="1.5" fill="#4ade80" />
            <path d="M8 6.5h2v2H8z" fill="#166534" />
            <path d="M25 4.5V8.5C26.1 8.1 27 7.1 27 6C27 4.9 26.1 3.9 25 4.5Z" fill="#4ade80" fillOpacity="0.7" />
          </svg>
        </div>
      </div>

      {/* Clock */}
      <div className={styles.clock}>
        <span className={styles.date}>{formatLockDate(now)}</span>
        <span className={styles.time} aria-label={formatLockTime(now)}>
          {formatLockTime(now)}
        </span>
      </div>

      <div className={styles.spacer} />

      {/* Notification Center — bottom */}
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

          <div className={styles.notifList}>
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
                <div key={notification.id} className={styles.notifItem}>
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

      {/* Bottom shortcuts */}
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

export function useSimulationLoop() {
  const tick = useSimulationStore((s) => s.tick);
  const isRunning = useSimulationStore((s) => s.isRunning);
  const rafRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);

  useEffect(() => {
    if (!isRunning) {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      lastTimeRef.current = 0;
      return;
    }

    const loop = (timestamp: number) => {
      if (lastTimeRef.current > 0) {
        tick(timestamp - lastTimeRef.current);
      }
      lastTimeRef.current = timestamp;
      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [isRunning, tick]);
}
