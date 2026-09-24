import { getBuiltinPlatforms, PLATFORM_IDS } from '../../engines/platform';
import { useSimulationStore } from '../../store/simulationStore';
import { PlatformIcon } from '../notifications/PlatformIcon';
import { hasAppTemplate } from '../../templates/registry';
import styles from './PlatformHub.module.css';

export function PlatformHub() {
  const enabledPlatformIds = useSimulationStore((s) => s.enabledPlatformIds);
  const togglePlatform = useSimulationStore((s) => s.togglePlatform);
  const setEnabledPlatforms = useSimulationStore((s) => s.setEnabledPlatforms);
  const setPreviewScreen = useSimulationStore((s) => s.setPreviewScreen);
  const openApp = useSimulationStore((s) => s.openApp);

  const platforms = getBuiltinPlatforms();
  const activeCount = enabledPlatformIds.length;

  return (
    <div className={styles.hub}>
      <header className={styles.header}>
        <h1 className={styles.title}>NotiFlix</h1>
        <p className={styles.subtitle}>
          Escolhe de quais apps recebes notificações no iPhone ({activeCount} activas)
        </p>
      </header>

      <div className={styles.presets}>
        <button
          type="button"
          className={styles.presetBtn}
          onClick={() => setEnabledPlatforms(Object.values(PLATFORM_IDS))}
        >
          Todas
        </button>
        <button
          type="button"
          className={styles.presetBtn}
          onClick={() => setEnabledPlatforms([PLATFORM_IDS.stripe])}
        >
          Só Stripe
        </button>
        <button
          type="button"
          className={styles.presetBtn}
          onClick={() =>
            setEnabledPlatforms([PLATFORM_IDS.utmify, PLATFORM_IDS.hotmart])
          }
        >
          Utmify + Hotmart
        </button>
      </div>

      <div className={styles.list}>
        {platforms.map((platform) => {
          const on = enabledPlatformIds.includes(platform.id);
          return (
            <div key={platform.id} className={styles.card}>
              <PlatformIcon platformId={platform.id} size={44} />
              <div className={styles.cardInfo}>
                <div className={styles.cardName}>{platform.name}</div>
                <div className={styles.cardMeta}>
                  {hasAppTemplate(platform.id)
                    ? 'App + notificações'
                    : 'Notificações no lock screen'}
                </div>
              </div>
              <button
                type="button"
                className={styles.openBtn}
                onClick={() => openApp(platform.id)}
              >
                Abrir
              </button>
              <button
                type="button"
                className={`${styles.toggle} ${on ? styles.toggleOn : ''}`}
                aria-label={`${on ? 'Desactivar' : 'Activar'} ${platform.name}`}
                onClick={() => togglePlatform(platform.id)}
              >
                <span className={styles.toggleKnob} />
              </button>
            </div>
          );
        })}
      </div>

      <div className={styles.actions}>
        <button
          type="button"
          className={styles.primaryBtn}
          onClick={() => setPreviewScreen('iphone')}
        >
          Ver iPhone Lock Screen
        </button>
      </div>
    </div>
  );
}
