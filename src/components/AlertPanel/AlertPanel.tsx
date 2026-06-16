import { useRef, useEffect } from 'react';
import { AlertTriangle, CheckCircle, Info, Bell, Check } from '../Icons';
import type { Alert } from '../../types';
import { formatTimestamp } from '../../utils/alertHelpers';
import styles from './AlertPanel.module.css';

interface AlertPanelProps {
  alerts: Alert[];
  onAcknowledge: (id: string) => void;
}

const SEVERITY_ICONS = {
  critical: AlertTriangle,
  warning: AlertTriangle,
  clear: CheckCircle,
};

export function AlertPanel({ alerts, onAcknowledge }: AlertPanelProps) {
  const listRef = useRef<HTMLDivElement>(null);
  const prevLengthRef = useRef(alerts.length);

  useEffect(() => {
    if (alerts.length > prevLengthRef.current && listRef.current) {
      listRef.current.scrollTop = 0;
    }
    prevLengthRef.current = alerts.length;
  }, [alerts.length]);

  const totalAlerts = alerts.length;
  const activeRed = alerts.filter(a => a.severity === 'critical' && !a.acknowledged).length;
  const camerasOnline = 4;

  return (
    <aside className={styles.panel}>
      <div className={styles.header}>
        <div className={styles.headerTitle}>
          <Bell size={13} className={styles.headerIcon} />
          <span>ALERT LOG</span>
        </div>
        <span className={styles.liveTag}>● LIVE</span>
      </div>

      <div className={styles.stats}>
        <div className={styles.statBox}>
          <span className={styles.statValue}>{totalAlerts}</span>
          <span className={styles.statLabel}>TOTAL TODAY</span>
        </div>
        <div className={`${styles.statBox} ${activeRed > 0 ? styles.statBoxRed : ''}`}>
          <span className={`${styles.statValue} ${styles.statRed}`}>{activeRed}</span>
          <span className={styles.statLabel}>ACTIVE RED</span>
        </div>
        <div className={styles.statBox}>
          <span className={`${styles.statValue} ${styles.statGreen}`}>{camerasOnline}</span>
          <span className={styles.statLabel}>CAMS ONLINE</span>
        </div>
      </div>

      <div className={styles.listHeader}>
        <span className={styles.listHeaderText}>EVENTS — NEWEST FIRST</span>
        <span className={styles.listCount}>{alerts.length} entries</span>
      </div>

      <div className={styles.list} ref={listRef}>
        {alerts.map(alert => {
          const Icon = SEVERITY_ICONS[alert.severity];
          const isCritical = alert.severity === 'critical';
          const isWarning = alert.severity === 'warning';
          const isClear = alert.severity === 'clear';

          return (
            <div
              key={alert.id}
              className={`
                ${styles.alertCard}
                ${isCritical && !alert.acknowledged ? styles.cardCritical : ''}
                ${isWarning ? styles.cardWarning : ''}
                ${isClear ? styles.cardClear : ''}
                ${alert.acknowledged ? styles.cardAcknowledged : ''}
              `}
            >
              <div className={styles.cardLeft}>
                <Icon
                  size={13}
                  className={
                    isCritical ? styles.iconRed :
                    isWarning ? styles.iconYellow :
                    styles.iconGreen
                  }
                />
              </div>

              <div className={styles.cardBody}>
                <div className={styles.cardTop}>
                  <span className={`
                    ${styles.severityBadge}
                    ${isCritical ? styles.badgeCritical : ''}
                    ${isWarning ? styles.badgeWarning : ''}
                    ${isClear ? styles.badgeClear : ''}
                  `}>
                    {alert.severity.toUpperCase()}
                  </span>
                  <span className={styles.cameraTag}>{alert.cameraName}</span>
                </div>

                <div className={styles.cardMid}>
                  <span className={styles.detectionType}>
                    {alert.type.toUpperCase()} DETECTED
                  </span>
                  <span className={styles.confidence}>{alert.confidence}</span>
                </div>

                <div className={styles.cardBot}>
                  <span className={styles.zone}>{alert.zone}</span>
                  <span className={styles.timestamp}>{formatTimestamp(alert.timestamp)}</span>
                  {alert.acknowledged && (
                    <span className={styles.ackTag}>ACK</span>
                  )}
                </div>
              </div>

              {!alert.acknowledged && (
                <button
                  className={styles.ackBtn}
                  onClick={() => onAcknowledge(alert.id)}
                  title="Acknowledge"
                >
                  <Check size={10} />
                </button>
              )}
            </div>
          );
        })}

        {alerts.length === 0 && (
          <div className={styles.empty}>
            <Info size={18} className={styles.emptyIcon} />
            <span>No events recorded</span>
          </div>
        )}
      </div>
    </aside>
  );
}
