import { useRef, useEffect } from 'react';
import type { Camera, CameraAlertState } from '../../types';
import { useCamera } from '../../hooks/useCamera';
import { formatTimestamp } from '../../utils/alertHelpers';
import styles from './CameraGrid.module.css';

interface CameraPanelProps {
  camera: Camera;
  alertState: CameraAlertState | null;
}

// Detection box positions per camera (in %, relative to 16:9 viewBox "0 0 100 56.25")
const DETECTION_BOXES = [
  { x: 30, y: 8,  w: 38, h: 44 },   // CAM-01 Warehouse — doorway center
  { x: 54, y: 24, w: 26, h: 30 },   // CAM-02 Parking — vehicle right
  { x: 14, y: 7,  w: 36, h: 46 },   // CAM-03 Server Room — rack left
  { x: 36, y: 10, w: 32, h: 40 },   // CAM-04 Rooftop — center
];

const CAM_META = [
  '37.7749°N  122.4194°W',
  '37.7751°N  122.4188°W',
  'SECURE AREA · NO GPS',
  'ALT 42.3M · RESTRICTED',
];

function DetectionReticle({
  box, severity, type, confidence
}: {
  box: { x: number; y: number; w: number; h: number };
  severity: 'critical' | 'warning';
  type: string;
  confidence: string;
}) {
  const { x, y, w, h } = box;
  const x2 = x + w;
  const y2 = y + h;
  const notch = 7;
  const color = severity === 'critical' ? '#ff3b3b' : '#ffb300';
  const label = type === 'human' ? 'PERSON' : type === 'bird' ? 'AVIAN' : 'OBJECT';

  return (
    <svg
      className={`${styles.reticleSvg} ${severity === 'critical' ? styles.reticleCrit : styles.reticleWarn}`}
      viewBox="0 0 100 56.25"
      preserveAspectRatio="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Corner brackets */}
      <path d={`M${x + notch},${y} L${x},${y} L${x},${y + notch}`} stroke={color} strokeWidth="0.6" fill="none" />
      <path d={`M${x2 - notch},${y} L${x2},${y} L${x2},${y + notch}`} stroke={color} strokeWidth="0.6" fill="none" />
      <path d={`M${x + notch},${y2} L${x},${y2} L${x},${y2 - notch}`} stroke={color} strokeWidth="0.6" fill="none" />
      <path d={`M${x2 - notch},${y2} L${x2},${y2} L${x2},${y2 - notch}`} stroke={color} strokeWidth="0.6" fill="none" />

      {/* Center cross-tick on top edge */}
      <line x1={x + w / 2 - 2} y1={y} x2={x + w / 2 + 2} y2={y} stroke={color} strokeWidth="0.5" />
      {/* Center cross-tick on bottom edge */}
      <line x1={x + w / 2 - 2} y1={y2} x2={x + w / 2 + 2} y2={y2} stroke={color} strokeWidth="0.5" />
      {/* Side ticks */}
      <line x1={x} y1={y + h / 2 - 1.5} x2={x} y2={y + h / 2 + 1.5} stroke={color} strokeWidth="0.5" />
      <line x1={x2} y1={y + h / 2 - 1.5} x2={x2} y2={y + h / 2 + 1.5} stroke={color} strokeWidth="0.5" />

      {/* Classification label background */}
      <rect x={x} y={y - 5.5} width={w} height={4.8} fill="rgba(0,0,0,0.65)" />

      {/* Label text */}
      <text
        x={x + 1.2}
        y={y - 1.8}
        fontSize="2.8"
        fill={color}
        fontFamily="'IBM Plex Mono', monospace"
        fontWeight="600"
        letterSpacing="0.08em"
      >
        {label}
      </text>
      <text
        x={x2 - 1.2}
        y={y - 1.8}
        fontSize="2.8"
        fill={color}
        fontFamily="'IBM Plex Mono', monospace"
        fontWeight="400"
        letterSpacing="0.05em"
        textAnchor="end"
        opacity="0.8"
      >
        {confidence}
      </text>

      {/* ID tag bottom-right of box */}
      <text
        x={x2 - 1}
        y={y2 + 4}
        fontSize="2.2"
        fill={color}
        fontFamily="'IBM Plex Mono', monospace"
        fontWeight="400"
        letterSpacing="0.06em"
        textAnchor="end"
        opacity="0.55"
      >
        TGT-001
      </text>
    </svg>
  );
}

export function CameraPanel({ camera, alertState }: CameraPanelProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const timeRef = useRef<HTMLSpanElement>(null);

  useCamera(canvasRef, camera.id);

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
  const box = DETECTION_BOXES[camera.id - 1];
  const meta = CAM_META[camera.id - 1];

  return (
    <div className={`${styles.panel} ${styles[`panel_${severity}`]}`}>
      <canvas ref={canvasRef} className={styles.canvas} width={640} height={360} />

      {/* Channel number watermark */}
      <span className={styles.chanNum}>{camera.id}</span>

      {/* AI detection reticle */}
      {alertState && severity !== 'clear' && (
        <DetectionReticle
          box={box}
          severity={severity === 'critical' ? 'critical' : 'warning'}
          type={alertState.message.includes('HUMAN') ? 'human' : 'animal'}
          confidence="94.2%"
        />
      )}

      {/* Alert text overlay (bottom strip) */}
      {alertState && severity !== 'clear' && (
        <div className={`${styles.alertBanner} ${isCritical ? styles.bannerCrit : styles.bannerWarn}`}>
          <span className={isCritical ? styles.bannerTextCrit : styles.bannerTextWarn}>
            {alertState.message}
          </span>
        </div>
      )}

      {/* Top HUD */}
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

      {/* Bottom HUD */}
      <div className={styles.hudBottom}>
        <span className={styles.zoneLabel}>{camera.zone}</span>
        <span className={styles.metaCoord}>{meta}</span>
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
