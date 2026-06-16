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

type ThreatLevel = 'nominal' | 'elevated' | 'critical';

function computeThreatLevel(alerts: Alert[]): ThreatLevel {
  const hasActiveCritical = alerts.some(a => a.severity === 'critical' && !a.acknowledged);
  if (hasActiveCritical) return 'critical';
  const hasActiveWarning = alerts.some(a => a.severity === 'warning' && !a.acknowledged);
  if (hasActiveWarning) return 'elevated';
  return 'nominal';
}

const THREAT_LABELS: Record<ThreatLevel, string> = {
  nominal: 'NOMINAL',
  elevated: 'ELEVATED',
  critical: 'CRITICAL',
};

export function TopBar({ alerts, soundEnabled, onToggleSound, camerasOnline }: TopBarProps) {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const criticalCount = alerts.filter(a => a.severity === 'critical' && !a.acknowledged).length;
  const warningCount = alerts.filter(a => a.severity === 'warning' && !a.acknowledged).length;
  const clearCount = alerts.filter(a => a.severity === 'clear').length;
  const threatLevel = computeThreatLevel(alerts);

  return (
    <div className={styles.topbarWrapper}>
      {/* Threat level strip */}
      <div className={`${styles.threatStrip} ${styles[`threat_${threatLevel}`]}`}>
        <span className={styles.threatFacility}>FAC · ALPHA-7 · SEC-OPS</span>
        <span className={styles.threatSep}>|</span>
        <span className={styles.threatLabel}>
          THREAT LEVEL:
          <strong className={styles.threatValue}> {THREAT_LABELS[threatLevel]}</strong>
        </span>
        <span className={styles.threatSep}>|</span>
        <span className={styles.threatSession}>SESSION {formatDate(now).toUpperCase()} · OPR: SCC-001</span>
        {threatLevel === 'critical' && <span className={styles.threatCritBadge}>● ACTIVE INCIDENT</span>}
      </div>

      <header className={styles.topbar}>
        <div className={styles.brand}>
          <Shield size={18} className={styles.brandIcon} />
          <div className={styles.brandText}>
            <span className={styles.brandName}>SENTINEL</span>
            <span className={styles.brandSub}>COMMAND</span>
          </div>
          <span className={styles.version}>v4.2.1</span>
        </div>

        <div className={styles.statusRow}>
          <div className={styles.statusItem}>
            <Wifi size={12} className={styles.onlineIcon} />
            <span className={styles.statusLabel}>CAMS</span>
            <span className={styles.statusVal}>{camerasOnline}/4</span>
          </div>

          <div className={styles.divider} />

          <div className={styles.counters}>
            <div className={`${styles.counter} ${styles.critical} ${criticalCount > 0 ? styles.counterActive : ''}`}>
              {criticalCount > 0 && <span className={styles.blinkDot} />}
              <AlertTriangle size={11} />
              <span>{criticalCount}</span>
              <span className={styles.counterLabel}>CRIT</span>
            </div>
            <div className={`${styles.counter} ${styles.warning} ${warningCount > 0 ? styles.counterActive : ''}`}>
              <span>{warningCount}</span>
              <span className={styles.counterLabel}>WARN</span>
            </div>
            <div className={`${styles.counter} ${styles.ok}`}>
              <CheckCircle size={11} />
              <span>{clearCount}</span>
              <span className={styles.counterLabel}>CLR</span>
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
            {soundEnabled ? <Volume2 size={13} /> : <VolumeX size={13} />}
            <span>{soundEnabled ? 'AUDIO ON' : 'MUTED'}</span>
          </button>

          <div className={styles.systemStatus}>
            <span className={styles.systemDot} />
            <span>ALL SYSTEMS NOMINAL</span>
          </div>
        </div>
      </header>
    </div>
  );
}
