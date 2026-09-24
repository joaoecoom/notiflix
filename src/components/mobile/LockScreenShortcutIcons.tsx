import styles from './LockScreenShortcutIcons.module.css';

export function LockScreenFlashlightIcon() {
  return (
    <img
      src="/ios-lock-flashlight.png"
      alt=""
      aria-hidden
      className={styles.glyph}
      draggable={false}
      width={50}
      height={50}
    />
  );
}

export function LockScreenCameraIcon() {
  return (
    <img
      src="/ios-lock-camera.png"
      alt=""
      aria-hidden
      className={styles.glyph}
      draggable={false}
      width={50}
      height={50}
    />
  );
}
