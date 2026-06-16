export type Severity = 'critical' | 'warning' | 'clear';

export interface Camera {
  id: number;
  name: string;
  location: string;
  zone: string;
  resolution: string;
  online: boolean;
}

export interface Alert {
  id: string;
  cameraId: number;
  cameraName: string;
  type: string;
  severity: Severity;
  confidence: string;
  timestamp: Date;
  zone: string;
  acknowledged: boolean;
}

export interface DetectionEvent {
  id: string;
  cameraId: number;
  cameraName: string;
  type: string;
  severity: Severity;
  confidence: string;
  timestamp: Date;
  zone: string;
}

export interface CameraAlertState {
  severity: Severity;
  message: string;
  expiresAt: number;
}
