/** Glyphs aligned with iOS lock screen shortcut controls (filled silhouettes). */

export function LockScreenFlashlightIcon() {
  return (
    <svg
      width="21"
      height="24"
      viewBox="0 0 21 24"
      fill="currentColor"
      aria-hidden
    >
      <path d="M10.5 0C8.57 0 7 1.57 7 3.5V6H5.06C3.64 6 2.5 7.14 2.5 8.56v1.38C2.5 11.36 3.64 12.5 5.06 12.5H7v8.44C7 23.16 8.34 24.5 10.5 24.5s3.5-1.34 3.5-3.56V12.5h1.94c1.42 0 2.56-1.14 2.56-2.56V8.56C18.5 7.14 17.36 6 15.94 6H14V3.5C14 1.57 12.43 0 10.5 0zm0 19.25c-.97 0-1.75-.78-1.75-1.75s.78-1.75 1.75-1.75 1.75.78 1.75 1.75-.78 1.75-1.75 1.75z" />
    </svg>
  );
}

const LOCK_CAMERA_MASK = '/ios-lock-camera.png';

export function LockScreenCameraIcon() {
  return (
    <span
      aria-hidden
      style={{
        display: 'block',
        width: 28,
        height: 22,
        backgroundColor: 'currentColor',
        WebkitMaskImage: `url(${LOCK_CAMERA_MASK})`,
        maskImage: `url(${LOCK_CAMERA_MASK})`,
        WebkitMaskSize: 'contain',
        maskSize: 'contain',
        WebkitMaskRepeat: 'no-repeat',
        maskRepeat: 'no-repeat',
        WebkitMaskPosition: 'center',
        maskPosition: 'center',
      }}
    />
  );
}
