import { type ReactNode } from 'react';
import styles from './MobileCanvas.module.css';

export interface MobileCanvasProps {
  children: ReactNode;
  width?: number;
  height?: number;
  className?: string;
  showFrame?: boolean;
}

export function MobileCanvas({
  children,
  width = 393,
  height = 852,
  className,
  showFrame = true,
}: MobileCanvasProps) {
  return (
    <div
      className={`${styles.wrapper} ${className ?? ''}`}
      style={{ '--canvas-width': `${width}px`, '--canvas-height': `${height}px` } as React.CSSProperties}
    >
      <div className={`${styles.device} ${showFrame ? styles.framed : ''}`}>
        <div className={styles.screen}>{children}</div>
      </div>
    </div>
  );
}
