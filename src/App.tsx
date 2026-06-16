import { useState, useCallback, useRef, useEffect } from 'react';
import type { Alert, CameraAlertState, DetectionEvent } from './types';
import { CAMERAS, getAlertMessage } from './utils/alertHelpers';
import { useAlertSimulator } from './hooks/useAlertSimulator';
import { TopBar } from './components/TopBar/TopBar';
import { Sidebar } from './components/Sidebar/Sidebar';
import { CameraGrid } from './components/CameraGrid/CameraGrid';
import { AlertPanel } from './components/AlertPanel/AlertPanel';
import styles from './App.module.css';

const MAX_ALERTS = 50;

function playBeep(audioCtx: AudioContext) {
  const oscillator = audioCtx.createOscillator();
  const gainNode = audioCtx.createGain();

  oscillator.connect(gainNode);
  gainNode.connect(audioCtx.destination);

  oscillator.type = 'square';
  oscillator.frequency.setValueAtTime(880, audioCtx.currentTime);
  oscillator.frequency.exponentialRampToValueAtTime(440, audioCtx.currentTime + 0.12);

  gainNode.gain.setValueAtTime(0.18, audioCtx.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.2);

  oscillator.start(audioCtx.currentTime);
  oscillator.stop(audioCtx.currentTime + 0.22);
}

export default function App() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [cameraStates, setCameraStates] = useState<Record<number, CameraAlertState | null>>({
    1: null, 2: null, 3: null, 4: null,
  });
  const [selectedCamera, setSelectedCamera] = useState<number | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(false);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const timeoutRefs = useRef<Record<number, number>>({});

  const getAudioCtx = useCallback(() => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new AudioContext();
    }
    return audioCtxRef.current;
  }, []);

  const handleEvent = useCallback((event: DetectionEvent) => {
    const alert: Alert = { ...event, acknowledged: false };

    setAlerts(prev => {
      const next = [alert, ...prev];
      return next.slice(0, MAX_ALERTS);
    });

    if (event.severity !== 'clear') {
      const overlayDuration = event.severity === 'critical' ? 5000 : 3000;
      const message = getAlertMessage(event.type);

      setCameraStates(prev => ({
        ...prev,
        [event.cameraId]: {
          severity: event.severity,
          message,
          expiresAt: Date.now() + overlayDuration,
        },
      }));

      if (timeoutRefs.current[event.cameraId]) {
        clearTimeout(timeoutRefs.current[event.cameraId]);
      }

      timeoutRefs.current[event.cameraId] = window.setTimeout(() => {
        setCameraStates(prev => ({
          ...prev,
          [event.cameraId]: null,
        }));
      }, overlayDuration);

      if (soundEnabled && event.severity === 'critical') {
        try {
          const ctx = getAudioCtx();
          if (ctx.state === 'suspended') {
            ctx.resume().then(() => playBeep(ctx));
          } else {
            playBeep(ctx);
          }
        } catch {
          // Web Audio not supported
        }
      }
    }
  }, [soundEnabled, getAudioCtx]);

  useAlertSimulator({ onEvent: handleEvent });

  const handleAcknowledge = useCallback((id: string) => {
    setAlerts(prev =>
      prev.map(a => a.id === id ? { ...a, acknowledged: true } : a)
    );
  }, []);

  const handleToggleSound = useCallback(() => {
    setSoundEnabled(prev => {
      if (!prev) {
        try {
          const ctx = getAudioCtx();
          ctx.resume();
        } catch {
          // ignore
        }
      }
      return !prev;
    });
  }, [getAudioCtx]);

  useEffect(() => {
    return () => {
      Object.values(timeoutRefs.current).forEach(clearTimeout);
    };
  }, []);

  const camerasOnline = CAMERAS.filter(c => c.online).length;

  return (
    <div className={styles.app}>
      <TopBar
        alerts={alerts}
        soundEnabled={soundEnabled}
        onToggleSound={handleToggleSound}
        camerasOnline={camerasOnline}
      />
      <div className={styles.body}>
        <Sidebar
          cameras={CAMERAS}
          alerts={alerts}
          cameraStates={cameraStates}
          selectedCamera={selectedCamera}
          onSelectCamera={setSelectedCamera}
        />
        <main className={styles.main}>
          <CameraGrid cameras={CAMERAS} cameraStates={cameraStates} />
        </main>
        <AlertPanel alerts={alerts} onAcknowledge={handleAcknowledge} />
      </div>
    </div>
  );
}
