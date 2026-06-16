import type { Camera, CameraAlertState } from '../../types';
import { CameraPanel } from './CameraPanel';
import styles from './CameraGrid.module.css';

interface CameraGridProps {
  cameras: Camera[];
  cameraStates: Record<number, CameraAlertState | null>;
}

export function CameraGrid({ cameras, cameraStates }: CameraGridProps) {
  return (
    <div className={styles.grid}>
      {cameras.map(cam => (
        <CameraPanel
          key={cam.id}
          camera={cam}
          alertState={cameraStates[cam.id] ?? null}
        />
      ))}
    </div>
  );
}
