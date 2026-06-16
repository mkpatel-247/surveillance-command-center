import type { Severity, DetectionEvent } from '../types';

const DETECTION_TYPES = ['bird', 'animal', 'human', 'clear', 'clear', 'clear'];

export const CAMERAS = [
  { id: 1, name: 'CAM-01', location: 'Warehouse Entrance', zone: 'ZONE-A', resolution: '1080p', online: true },
  { id: 2, name: 'CAM-02', location: 'Parking Lot North', zone: 'ZONE-B', resolution: '1080p', online: true },
  { id: 3, name: 'CAM-03', location: 'Server Room', zone: 'ZONE-C', resolution: '1080p', online: true },
  { id: 4, name: 'CAM-04', location: 'Rooftop', zone: 'ZONE-D', resolution: '1080p', online: true },
];

export function getSeverity(type: string): Severity {
  if (type === 'human') return 'critical';
  if (type === 'bird' || type === 'animal') return 'warning';
  return 'clear';
}

export function getSeverityLabel(severity: Severity): string {
  if (severity === 'critical') return 'CRITICAL';
  if (severity === 'warning') return 'WARNING';
  return 'CLEAR';
}

export function getAlertMessage(type: string): string {
  if (type === 'human') return '⚠ HUMAN DETECTED';
  if (type === 'bird' || type === 'animal') return '⚡ MOTION DETECTED';
  return 'Zone Clear';
}

export function generateEvent(): DetectionEvent {
  const type = DETECTION_TYPES[Math.floor(Math.random() * DETECTION_TYPES.length)];
  const camera = CAMERAS[Math.floor(Math.random() * CAMERAS.length)];
  const confidence = (88 + Math.random() * 11).toFixed(1) + '%';

  return {
    id: `evt-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    cameraId: camera.id,
    cameraName: camera.location,
    type,
    severity: getSeverity(type),
    confidence,
    timestamp: new Date(),
    zone: camera.zone,
  };
}

export function randomInterval(minMs: number, maxMs: number): number {
  return Math.floor(Math.random() * (maxMs - minMs + 1)) + minMs;
}

export function formatTimestamp(date: Date): string {
  return date.toLocaleTimeString('en-US', { hour12: false });
}

export function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
}
