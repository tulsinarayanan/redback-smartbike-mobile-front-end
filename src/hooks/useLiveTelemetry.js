import { useCallback, useEffect, useRef, useState } from "react";

// Modular telemetry generator — can be replaced with MQTT/Bluetooth listeners later
// Exposes: state + controls + raw telemetry stream via onTick callback

const clamp = (v, min, max) => Math.min(max, Math.max(min, v));
const jitter = (prev, delta, min, max) => clamp(prev + (Math.random() - 0.5) * delta * 2, min, max);

// Smooth walk — small variance per second for realistic fluctuations
const TELEMETRY_RANGES = {
  speed: { min: 8, max: 35, delta: 1.2, initial: 18 },
  cadence: { min: 60, max: 115, delta: 3, initial: 82 },
  heartRate: { min: 88, max: 178, delta: 2.5, initial: 122 },
  power: { min: 60, max: 380, delta: 14, initial: 165 },
};

export const calculateXpForRide = (distanceKm, calories) => {
  const d = Number(distanceKm) || 0;
  const c = Number(calories) || 0;
  const xp = Math.round(d * 10 + c * 1);
  return Math.max(20, xp);
};

export const formatTimer = (totalSeconds) => {
  const m = String(Math.floor(totalSeconds / 60)).padStart(2, "0");
  const s = String(totalSeconds % 60).padStart(2, "0");
  return `${m}:${s}`;
};

export function useLiveTelemetry({ onTick } = {}) {
  const [elapsed, setElapsed] = useState(0);
  const [distance, setDistance] = useState(0);
  const [calories, setCalories] = useState(0);
  const [metrics, setMetrics] = useState({
    speed: 0,
    cadence: 0,
    heartRate: 0,
    power: 0,
  });
  const [isTracking, setIsTracking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [startTime, setStartTime] = useState(null);

  const intervalRef = useRef(null);
  const metricsRef = useRef({ speed: TELEMETRY_RANGES.speed.initial, cadence: TELEMETRY_RANGES.cadence.initial, heartRate: TELEMETRY_RANGES.heartRate.initial, power: TELEMETRY_RANGES.power.initial });

  const clearTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const tick = useCallback(() => {
    // generate next telemetry point — random walk for smoothness
    const next = {
      speed: jitter(metricsRef.current.speed, TELEMETRY_RANGES.speed.delta, TELEMETRY_RANGES.speed.min, TELEMETRY_RANGES.speed.max),
      cadence: jitter(metricsRef.current.cadence, TELEMETRY_RANGES.cadence.delta, TELEMETRY_RANGES.cadence.min, TELEMETRY_RANGES.cadence.max),
      heartRate: jitter(metricsRef.current.heartRate, TELEMETRY_RANGES.heartRate.delta, TELEMETRY_RANGES.heartRate.min, TELEMETRY_RANGES.heartRate.max),
      power: jitter(metricsRef.current.power, TELEMETRY_RANGES.power.delta, TELEMETRY_RANGES.power.min, TELEMETRY_RANGES.power.max),
    };
    // round for display
    next.speed = Number(next.speed.toFixed(1));
    next.cadence = Math.round(next.cadence);
    next.heartRate = Math.round(next.heartRate);
    next.power = Math.round(next.power);

    metricsRef.current = next;

    // distance: km per second = speed / 3600
    const distInc = next.speed / 3600;
    // calories: ~10-12 kcal/min at moderate effort
    const calInc = next.power * 0.0007 + next.speed * 0.003 + 0.02;

    setElapsed((prev) => prev + 1);
    setDistance((prev) => Number((prev + distInc).toFixed(3)));
    setCalories((prev) => Number((prev + calInc).toFixed(1)));
    setMetrics(next);

    if (onTick) {
      onTick({ ...next, distInc, calInc });
    }
  }, [onTick]);

  const start = useCallback(() => {
    if (isTracking) return;
    // seed first point
    metricsRef.current = {
      speed: TELEMETRY_RANGES.speed.initial + (Math.random() - 0.5) * 4,
      cadence: TELEMETRY_RANGES.cadence.initial + (Math.random() - 0.5) * 6,
      heartRate: TELEMETRY_RANGES.heartRate.initial + (Math.random() - 0.5) * 8,
      power: TELEMETRY_RANGES.power.initial + (Math.random() - 0.5) * 20,
    };
    const first = {
      speed: Number(clamp(metricsRef.current.speed, TELEMETRY_RANGES.speed.min, TELEMETRY_RANGES.speed.max).toFixed(1)),
      cadence: Math.round(clamp(metricsRef.current.cadence, TELEMETRY_RANGES.cadence.min, TELEMETRY_RANGES.cadence.max)),
      heartRate: Math.round(clamp(metricsRef.current.heartRate, TELEMETRY_RANGES.heartRate.min, TELEMETRY_RANGES.heartRate.max)),
      power: Math.round(clamp(metricsRef.current.power, TELEMETRY_RANGES.power.min, TELEMETRY_RANGES.power.max)),
    };
    metricsRef.current = first;
    setMetrics(first);
    setIsTracking(true);
    setIsPaused(false);
    setStartTime(new Date());
    clearTimer();
    intervalRef.current = setInterval(tick, 1000);
  }, [isTracking, clearTimer, tick]);

  const pause = useCallback(() => {
    if (!isTracking || isPaused) return;
    clearTimer();
    setIsPaused(true);
  }, [isTracking, isPaused, clearTimer]);

  const resume = useCallback(() => {
    if (!isTracking || !isPaused) return;
    setIsPaused(false);
    clearTimer();
    intervalRef.current = setInterval(tick, 1000);
  }, [isTracking, isPaused, clearTimer, tick]);

  const stop = useCallback(() => {
    clearTimer();
    setIsTracking(false);
    setIsPaused(false);
  }, [clearTimer]);

  const reset = useCallback(() => {
    clearTimer();
    setElapsed(0);
    setDistance(0);
    setCalories(0);
    setMetrics({ speed: 0, cadence: 0, heartRate: 0, power: 0 });
    setIsTracking(false);
    setIsPaused(false);
    setStartTime(null);
    metricsRef.current = {
      speed: TELEMETRY_RANGES.speed.initial,
      cadence: TELEMETRY_RANGES.cadence.initial,
      heartRate: TELEMETRY_RANGES.heartRate.initial,
      power: TELEMETRY_RANGES.power.initial,
    };
  }, [clearTimer]);

  useEffect(() => {
    return () => clearTimer();
  }, [clearTimer]);

  return {
    elapsed,
    distance,
    calories,
    metrics,
    isTracking,
    isPaused,
    startTime,
    start,
    pause,
    resume,
    stop,
    reset,
    clearTimer,
    formatTimer: () => formatTimer(elapsed),
  };
}
