import { useEffect, useRef } from 'react';
import type { DetectionEvent } from '../types';
import { generateEvent, randomInterval } from '../utils/alertHelpers';

interface UseAlertSimulatorOptions {
  onEvent: (event: DetectionEvent) => void;
  enabled?: boolean;
}

export function useAlertSimulator({ onEvent, enabled = true }: UseAlertSimulatorOptions) {
  const onEventRef = useRef(onEvent);
  onEventRef.current = onEvent;

  useEffect(() => {
    if (!enabled) return;

    let timerId: number;
    const schedule = () => {
      timerId = window.setTimeout(() => {
        onEventRef.current(generateEvent());
        schedule();
      }, randomInterval(4000, 8000));
    };

    schedule();
    return () => clearTimeout(timerId);
  }, [enabled]);
}
