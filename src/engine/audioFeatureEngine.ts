import { LocalAudioSignal } from '../types';

export interface MeteringSample {
  timeMs: number;
  metering: number;
}

function clamp(value: number, min = 0, max = 1): number {
  return Math.max(min, Math.min(max, value));
}

function round(value: number, digits = 2): number {
  const factor = Math.pow(10, digits);
  return Math.round(value * factor) / factor;
}

function mean(values: number[]): number {
  return values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : 0;
}

function standardDeviation(values: number[]): number {
  if (values.length < 2) return 0;
  const average = mean(values);
  return Math.sqrt(mean(values.map((value) => Math.pow(value - average, 2))));
}

function percentile(values: number[], ratio: number): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const index = Math.min(sorted.length - 1, Math.max(0, Math.floor((sorted.length - 1) * ratio)));
  return sorted[index];
}

export function meteringToVolume(metering: number): number {
  if (!Number.isFinite(metering)) return 0;
  return clamp((metering + 60) / 60);
}

export function buildWaveformLevels(samples: MeteringSample[], barCount: number): number[] {
  const safeBarCount = Math.max(1, Math.floor(barCount));
  const ordered = samples
    .filter((sample) => Number.isFinite(sample.timeMs) && Number.isFinite(sample.metering))
    .sort((a, b) => a.timeMs - b.timeMs);

  if (ordered.length === 0) return [];

  const volumes = ordered.map((sample) => meteringToVolume(sample.metering));

  if (volumes.length <= safeBarCount) {
    return volumes.map((volume) => round(volume, 3));
  }

  const bucketSize = volumes.length / safeBarCount;
  return Array.from({ length: safeBarCount }, (_, index) => {
    const start = Math.floor(index * bucketSize);
    const end = Math.max(start + 1, Math.ceil((index + 1) * bucketSize));
    const bucket = volumes.slice(start, end);
    return round(Math.max(...bucket), 3);
  });
}

export function analyzeMeteringSamples(samples: MeteringSample[]): LocalAudioSignal {
  const ordered = samples
    .filter((sample) => Number.isFinite(sample.timeMs) && Number.isFinite(sample.metering))
    .sort((a, b) => a.timeMs - b.timeMs);

  if (ordered.length === 0) {
    return {
      durationSec: 0,
      averageVolume: 0,
      peakVolume: 0,
      noiseFloor: 0,
      volumeVariation: 0,
      sharpness: 0,
      repetition: 0,
      activeRatio: 0,
      burstCount: 0,
      rhythmRegularity: 0,
      signalQuality: 0,
    };
  }

  const volumes = ordered.map((sample) => meteringToVolume(sample.metering));
  const durationSec = round((ordered[ordered.length - 1].timeMs - ordered[0].timeMs) / 1000, 2);
  const averageVolume = round(mean(volumes), 3);
  const peakVolume = round(Math.max(...volumes), 3);
  const noiseFloor = round(percentile(volumes, 0.2), 3);
  const activeThreshold = Math.min(0.78, Math.max(0.12, noiseFloor + 0.12));
  const activeFlags = volumes.map((volume) => volume >= activeThreshold);
  const activeRatio = round(activeFlags.filter(Boolean).length / activeFlags.length, 3);
  const volumeVariation = round(standardDeviation(volumes), 3);

  const deltas = volumes.slice(1).map((value, index) => Math.abs(value - volumes[index]));
  const sharpness = round(clamp(mean(deltas) * 2), 3);

  // Metering gives us a loudness envelope, not raw PCM. Detect separate
  // vocal bursts by merging active samples that are less than 240 ms apart.
  const burstStarts: number[] = [];
  let lastActiveTime: number | undefined;
  activeFlags.forEach((isActive, index) => {
    if (!isActive) return;
    const timeMs = ordered[index].timeMs;
    if (lastActiveTime === undefined || timeMs - lastActiveTime >= 240) {
      burstStarts.push(timeMs);
    }
    lastActiveTime = timeMs;
  });

  const intervals = burstStarts.slice(1).map((time, index) => time - burstStarts[index]);
  const averageIntervalMs = intervals.length
    ? Math.round(mean(intervals))
    : undefined;
  const rhythmRegularity = intervals.length >= 2 && averageIntervalMs
    ? round(clamp(1 - standardDeviation(intervals) / averageIntervalMs), 3)
    : 0;
  const burstCount = burstStarts.length;
  const repetition = round(clamp(Math.min(1, Math.max(0, burstCount - 1) / 5) * 0.7 + rhythmRegularity * 0.3), 3);

  const sampleScore = clamp(ordered.length / 16);
  const durationScore = clamp(durationSec / 1.2);
  const contrastScore = clamp((peakVolume - noiseFloor) / 0.42);
  const activityScore = clamp(activeRatio / 0.24);
  const signalQuality = round(
    clamp(sampleScore * 0.2 + durationScore * 0.2 + contrastScore * 0.4 + activityScore * 0.2),
    3
  );

  return {
    durationSec,
    averageVolume,
    peakVolume,
    noiseFloor,
    volumeVariation,
    sharpness,
    repetition,
    activeRatio,
    burstCount,
    rhythmRegularity,
    signalQuality,
    averageIntervalMs,
  };
}

export function hasUsableAudioSignal(signal: LocalAudioSignal): boolean {
  return (
    signal.durationSec >= 0.45 &&
    signal.burstCount >= 1 &&
    signal.activeRatio >= 0.04 &&
    signal.peakVolume - signal.noiseFloor >= 0.1 &&
    signal.signalQuality >= 0.32
  );
}
