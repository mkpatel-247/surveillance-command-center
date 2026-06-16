import { useState, useEffect } from 'react';
import { Shield, Wifi, Volume2, VolumeX, AlertTriangle, CheckCircle } from '../Icons';
import type { Alert } from '../../types';
import { formatDate, formatTimestamp } from '../../utils/alertHelpers';
import styles from './TopBar.module.css';

interface TopBarProps {
  alerts: Alert[];
  soundEnabled: boolean;
  onToggleSound: () => void;
  camerasOnline: number;
}

export function TopBar({ alerts, soundEnabled, onToggleSound, camerasOnline }: TopBarProps) {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const criticalCount = alerts.filter(a => a.severity === 'critical' && !a.acknowledged).length;
  const warningCount = alerts.filter(a => a.severity === 'warning' && !a.acknowledged).length;
  const clearCount = alerts.filter(a => a.severity === 'clear').length;
  const hasActiveCritical = criticalCount > 0;

  return (
    <header className={styles.topbar}>
      <div className={styles.brand}>
        <Shield size={20} className={styles.brandIcon} />
        <span className={styles.brandName}>SENTINEL</span>
        <span className={styles.brandSub}>COMMAND</span>
        <span className={styles.version}>v4.2.1</span>
      </div>

      <div className={styles.statusRow}>
        <div className={styles.statusItem}>
          <Wifi size={13} className={styles.onlineIcon} />
          <span className={styles.statusLabel}>CAMERAS</span>
          <span className={styles.statusVal}>{camerasOnline}/4 ONLINE</span>
        </div>

        <div className={styles.divider} />

        <div className={styles.counters}>
          <div className={`${styles.counter} ${styles.critical}`}>
            {hasActiveCritical && <span className={styles.blinkDot} />}
            <AlertTriangle size={12} />
            <span>{criticalCount} CRITICAL</span>
          </div>
          <div className={`${styles.counter} ${styles.warning}`}>
            <span>{warningCount} WARNING</span>
          </div>
          <div className={`${styles.counter} ${styles.clear}`}>
            <CheckCircle size={12} />
            <span>{clearCount} CLEAR</span>
          </div>
        </div>

        <div className={styles.divider} />

        <div className={styles.clock}>
          <span className={styles.date}>{formatDate(now)}</span>
          <span className={styles.time}>{formatTimestamp(now)}</span>
        </div>
      </div>

      <div className={styles.controls}>
        <button
          className={`${styles.soundBtn} ${soundEnabled ? styles.soundOn : styles.soundOff}`}
          onClick={onToggleSound}
          title={soundEnabled ? 'Mute alerts' : 'Enable alert sound'}
        >
          {soundEnabled ? <Volume2 size={14} /> : <VolumeX size={14} />}
          <span>{soundEnabled ? 'AUDIO ON' : 'AUDIO OFF'}</span>
        </button>

        <div className={styles.systemStatus}>
          <span className={styles.systemDot} />
          <span>SYS NOMINAL</span>
        </div>
      </div>
    </header>
  );
}
