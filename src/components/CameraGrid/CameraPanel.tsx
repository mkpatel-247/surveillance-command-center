import { useRef, useEffect } from 'react';
import type { Camera, CameraAlertState } from '../../types';
import { useCamera } from '../../hooks/useCamera';
import { formatTimestamp } from '../../utils/alertHelpers';
import styles from './CameraGrid.module.css';

interface CameraPanelProps {
  camera: Camera;
  alertState: CameraAlertState | null;
}

export function CameraPanel({ camera, alertState }: CameraPanelProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const timeRef = useRef<HTMLSpanElement>(null);

  useCamera(canvasRef, camera.id);

  // Update timestamp every second directly on DOM to avoid re-renders
  useEffect(() => {
    const update = () => {
      if (timeRef.current) {
        timeRef.current.textContent = formatTimestamp(new Date());
      }
    };
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, []);

  const severity = alertState?.severity ?? 'clear';
  const isCritical = severity === 'critical';
  const isWarning = severity === 'warning';

  return (
    <div className={`${styles.panel} ${styles[`panel_${severity}`]}`}>
      <canvas
        ref={canvasRef}
        className={styles.canvas}
        width={640}
        height={360}
      />

      {/* Alert overlay */}
      {alertState && severity !== 'clear' && (
        <div className={`${styles.alertOverlay} ${isCritical ? styles.overlayRed : styles.overlayYellow}`}>
          <span className={isCritical ? styles.alertTextRed : styles.alertTextYellow}>
            {alertState.message}
          </span>
        </div>
      )}

      {/* Top HUD bar */}
      <div className={styles.hudTop}>
        <div className={styles.hudLeft}>
          <span className={styles.camId}>{camera.name}</span>
          <span className={styles.camLocation}>{camera.location}</span>
        </div>
        <div className={styles.hudRight}>
          <span className={styles.resBadge}>{camera.resolution}</span>
          <span className={styles.liveDot}>● REC</span>
        </div>
      </div>

      {/* Bottom HUD bar */}
      <div className={styles.hudBottom}>
        <span className={styles.zoneLabel}>{camera.zone}</span>
        <span className={styles.timestamp} ref={timeRef} />
        <span className={`${styles.statusChip} ${styles[`chip_${severity}`]}`}>
          {isCritical ? 'CRITICAL' : isWarning ? 'WARNING' : 'CLEAR'}
        </span>
      </div>

      {/* Corner brackets */}
      <span className={`${styles.corner} ${styles.cornerTL}`} />
      <span className={`${styles.corner} ${styles.cornerTR}`} />
      <span className={`${styles.corner} ${styles.cornerBL}`} />
      <span className={`${styles.corner} ${styles.cornerBR}`} />
    </div>
  );
}
