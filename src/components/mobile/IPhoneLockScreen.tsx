import { useCallback, useEffect, useRef, useState } from 'react';
import type { NotificationRecord } from '../../engines/simulation/types';
import { useSimulationStore } from '../../store/simulationStore';
import {
  countLockScreenNotifications,
  getLockScreenNotifications,
  groupNotificationsByPlatform,
} from '../../engines/notification';
import { getPlatform } from '../../engines/platform';
import { IOSNotification } from '../notifications/IOSNotification';
import {
  LockScreenCameraIcon,
  LockScreenFlashlightIcon,
} from './LockScreenShortcutIcons';
import { LockScreenStatusBar } from './LockScreenStatusBar';
import styles from './IPhoneLockScreen.module.css';

const BANNER_HOLD_MS = 4500;
const BANNER_DESCEND_MS = 550;

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
  const [expanded, setExpanded] = useState(false);
  const [openGroupId, setOpenGroupId] = useState<string | null>(null);
  const [topBanner, setTopBanner] = useState<NotificationRecord | null>(null);
  const [bannerExiting, setBannerExiting] = useState(false);
  const prevLiveCount = useRef(liveNotifications.length);
  const notifListRef = useRef<HTMLDivElement>(null);
  const bannerHoldTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const bannerExitTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearBannerTimers = useCallback(() => {
    if (bannerHoldTimer.current) clearTimeout(bannerHoldTimer.current);
    if (bannerExitTimer.current) clearTimeout(bannerExitTimer.current);
    bannerHoldTimer.current = null;
    bannerExitTimer.current = null;
  }, []);

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (liveNotifications.length > prevLiveCount.current) {
      const newest = liveNotifications.find((n) => !n.isSeed && n.status === 'active');
      if (newest) {
        clearBannerTimers();
        setTopBanner(newest);
        setBannerExiting(false);
        setExpanded(false);
        setOpenGroupId(null);

        bannerHoldTimer.current = setTimeout(() => {
          setBannerExiting(true);
        }, BANNER_HOLD_MS);

        bannerExitTimer.current = setTimeout(() => {
          setTopBanner(null);
          setBannerExiting(false);
        }, BANNER_HOLD_MS + BANNER_DESCEND_MS);
      }
    }
    prevLiveCount.current = liveNotifications.length;
    return clearBannerTimers;
  }, [liveNotifications, clearBannerTimers]);

  const notificationRetentionDays = useSimulationStore(
    (s) => s.settings.notificationRetentionDays
  );
  const lastUnlockMinutesAgo = useSimulationStore((s) => s.settings.lastUnlockMinutesAgo);
  const maxLockScreenNotifications = useSimulationStore(
    (s) => s.settings.maxLockScreenNotifications
  );
  const ambientNotifications = useSimulationStore((s) => s.ambientNotifications);
  const enabledPlatformIds = useSimulationStore((s) => s.enabledPlatformIds);
  const customPlatforms = useSimulationStore((s) => s.customPlatforms);
  const allVisible = getLockScreenNotifications(
    liveNotifications,
    seedNotifications,
    ambientNotifications,
    {
      retentionDays: notificationRetentionDays,
      lastUnlockMinutesAgo,
      maxNotifications: maxLockScreenNotifications,
      enabledPlatformIds,
      now: now.getTime(),
    }
  );
  const totalCount = countLockScreenNotifications(allVisible);
  const stackVisible =
    topBanner && !bannerExiting
      ? allVisible.filter((n) => n.id !== topBanner.id)
      : allVisible;
  const platformGroups = groupNotificationsByPlatform(stackVisible);
  const timeStr = formatLockTime(now);

  const handleDismiss = (id: string, isSeed?: boolean) => {
    if (topBanner?.id === id) {
      clearBannerTimers();
      setTopBanner(null);
      setBannerExiting(false);
    }
    if (isSeed) dismissSeedNotification(id);
    else dismissNotification(id);
  };

  return (
    <div className={`${styles.lockscreen} ${expanded ? styles.expanded : ''}`}>
      <div className={styles.wallpaper} />
      <div className={styles.depthSubject} aria-hidden />
      <LockScreenStatusBar />

      {topBanner && (
        <div
          className={`${styles.topBanner} ${bannerExiting ? styles.topBannerExit : styles.topBannerEnter}`}
        >
          <IOSNotification
            notification={topBanner}
            variant="lockscreen"
            animating={!bannerExiting}
            onDismiss={() => handleDismiss(topBanner.id, topBanner.isSeed)}
          />
        </div>
      )}

      <div
        className={styles.topRegion}
        onClick={() => {
          setExpanded(false);
          setOpenGroupId(null);
        }}
      >
        <div className={styles.clock}>
          <span className={styles.date}>{formatLockDate(now)}</span>
          <div className={styles.timeWrap} aria-label={timeStr}>
            <span className={styles.timeFill}>{timeStr}</span>
            <span className={styles.timeStroke} aria-hidden>{timeStr}</span>
          </div>
        </div>
      </div>

      <div className={styles.subject} aria-hidden />

      <div className={styles.contentRegion}>
        {stackVisible.length > 0 && (
          <div className={styles.notifCenter}>
          <div className={styles.centerHeader}>
            <span className={styles.centerTitle}>Central de notificações</span>
            <button
              className={styles.clearBtn}
              aria-label="Limpar"
              onClick={dismissAllNotifications}
            >
              <svg width="11" height="11" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.6">
                <path d="M1 1l8 8M9 1L1 9" strokeLinecap="round" />
              </svg>
            </button>
          </div>

          <div
            className={`${styles.notifList} ${expanded ? styles.notifListExpanded : ''}`}
            ref={notifListRef}
          >
            {!expanded && stackVisible.length > 0 ? (
              <div
                className={styles.collapsedStack}
                onClick={() => setExpanded(true)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && setExpanded(true)}
              >
                <div className={styles.stackLayer3} />
                <div className={styles.stackLayer2} />
                <div className={styles.stackLayer1} />
                <IOSNotification
                  notification={stackVisible[0]}
                  variant="lockscreen"
                  badge={totalCount > 1 ? totalCount : undefined}
                  animating={false}
                  onDismiss={() => handleDismiss(stackVisible[0].id, stackVisible[0].isSeed)}
                />
              </div>
            ) : (
              platformGroups.map((group, groupIndex) => {
                const count = group.items.length;
                const isOpen = openGroupId === group.platformId;
                const summary = group.items[0].summaryCount;

                if (summary != null) {
                  return (
                    <div key={group.platformId} className={styles.collapsedStack}>
                      {summary > 2 && <div className={styles.stackLayer2} />}
                      {summary > 1 && <div className={styles.stackLayer1} />}
                      <IOSNotification notification={group.items[0]} variant="lockscreen" animating={false} />
                    </div>
                  );
                }

                if (!isOpen && count > 1) {
                  return (
                    <div
                      key={group.platformId}
                      className={styles.collapsedStack}
                      onClick={() => setOpenGroupId(group.platformId)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => e.key === 'Enter' && setOpenGroupId(group.platformId)}
                    >
                      {count > 2 && <div className={styles.stackLayer2} />}
                      <div className={styles.stackLayer1} />
                      <IOSNotification
                        notification={group.items[0]}
                        variant="lockscreen"
                        badge={count}
                        animating={
                          !group.items[0].isSeed && groupIndex === 0 && bannerExiting
                        }
                      />
                    </div>
                  );
                }

                return (
                  <div key={group.platformId} className={styles.platformGroup}>
                    {isOpen && (
                      <div className={styles.groupHeader}>
                        <span className={styles.groupName}>
                          {getPlatform(group.platformId, customPlatforms).name}
                        </span>
                        <button
                          type="button"
                          className={styles.collapseBtn}
                          onClick={() => setOpenGroupId(null)}
                        >
                          Mostrar menos
                          <svg width="9" height="9" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.6">
                            <path d="M2 4l3 3 3-3" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </button>
                      </div>
                    )}
                    {group.items.map((notification, index) => (
                      <div
                        key={notification.id}
                        className={`${styles.notifItem} ${
                          !notification.isSeed && groupIndex === 0 && index === 0 && bannerExiting
                            ? styles.notifNew
                            : ''
                        }`}
                      >
                        <IOSNotification
                          notification={notification}
                          variant="lockscreen"
                          animating={
                            !notification.isSeed && groupIndex === 0 && index === 0 && bannerExiting
                          }
                          onDismiss={() => handleDismiss(notification.id, notification.isSeed)}
                        />
                      </div>
                    ))}
                  </div>
                );
              })
            )}
          </div>
          </div>
        )}
      </div>

      <div className={styles.bottomControls}>
        <button type="button" className={styles.shortcutBtn} aria-label="Lanterna" tabIndex={-1}>
          <LockScreenFlashlightIcon />
        </button>
        <button type="button" className={styles.shortcutBtn} aria-label="Câmara" tabIndex={-1}>
          <LockScreenCameraIcon />
        </button>
      </div>

      <div className={styles.homeBar}>
        <div className={styles.homeIndicator} />
      </div>
    </div>
  );
}
