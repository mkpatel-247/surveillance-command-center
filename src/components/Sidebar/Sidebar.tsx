import { Tv2, Circle } from '../Icons';
import type { Camera, Alert, CameraAlertState } from '../../types';
import styles from './Sidebar.module.css';

interface SidebarProps {
  cameras: Camera[];
  alerts: Alert[];
  cameraStates: Record<number, CameraAlertState | null>;
  selectedCamera: number | null;
  onSelectCamera: (id: number) => void;
}

export function Sidebar({ cameras, alerts, cameraStates, selectedCamera, onSelectCamera }: SidebarProps) {
  const criticalToday = alerts.filter(a => a.severity === 'critical').length;
  const warningToday = alerts.filter(a => a.severity === 'warning').length;

  return (
    <aside className={styles.sidebar}>
      <div className={styles.header}>
        <span className={styles.headerLabel}>CAMERA FEEDS</span>
        <span className={styles.headerCount}>{cameras.filter(c => c.online).length}/{cameras.length}</span>
      </div>

      <div className={styles.cameraList}>
        {cameras.map(cam => {
          const state = cameraStates[cam.id];
          const severity = state?.severity ?? 'clear';
          const camAlerts = alerts.filter(a => a.cameraId === cam.id && !a.acknowledged);
          const redAlerts = camAlerts.filter(a => a.severity === 'critical').length;
          const yellowAlerts = camAlerts.filter(a => a.severity === 'warning').length;

          return (
            <button
              key={cam.id}
              className={`${styles.cameraItem} ${selectedCamera === cam.id ? styles.selected : ''} ${styles[severity]}`}
              onClick={() => onSelectCamera(cam.id)}
            >
              <div className={styles.cameraTop}>
                <div className={styles.cameraIcon}>
                  <Tv2 size={14} />
                </div>
                <div className={styles.cameraInfo}>
                  <span className={styles.cameraName}>{cam.name}</span>
                  <span className={styles.cameraLocation}>{cam.location}</span>
                </div>
                <div className={styles.badges}>
                  {redAlerts > 0 && (
                    <span className={`${styles.badge} ${styles.badgeRed}`}>{redAlerts}</span>
                  )}
                  {yellowAlerts > 0 && (
                    <span className={`${styles.badge} ${styles.badgeYellow}`}>{yellowAlerts}</span>
                  )}
                </div>
              </div>
              <div className={styles.cameraBottom}>
                <div className={styles.statusRow}>
                  <Circle
                    size={6}
                    className={cam.online ? styles.dotOnline : styles.dotOffline}
                  />
                  <span className={styles.statusText}>{cam.online ? 'LIVE' : 'OFFLINE'}</span>
                </div>
                <span className={styles.zoneTag}>{cam.zone}</span>
                <span className={`${styles.alertState} ${styles[`alertState_${severity}`]}`}>
                  {severity === 'critical' ? '● CRITICAL' : severity === 'warning' ? '● WARNING' : '● CLEAR'}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      <div className={styles.summary}>
        <div className={styles.summaryRow}>
          <span className={styles.summaryLabel}>INCIDENTS TODAY</span>
        </div>
        <div className={styles.summaryStats}>
          <div className={styles.stat}>
            <span className={styles.statNum} style={{ color: '#ff3b3b' }}>{criticalToday}</span>
            <span className={styles.statLabel}>CRITICAL</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statNum} style={{ color: '#ffb800' }}>{warningToday}</span>
            <span className={styles.statLabel}>WARNING</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statNum} style={{ color: '#00d4ff' }}>{alerts.length}</span>
            <span className={styles.statLabel}>TOTAL</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
