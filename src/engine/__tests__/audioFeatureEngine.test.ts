import assert from 'node:assert/strict';
import {
  analyzeMeteringSamples,
  buildWaveformLevels,
  hasUsableAudioSignal,
} from '../audioFeatureEngine';

const report = analyzeMeteringSamples([
  { timeMs: 0, metering: -52 },
  { timeMs: 180, metering: -18 },
  { timeMs: 360, metering: -50 },
  { timeMs: 540, metering: -16 },
  { timeMs: 720, metering: -49 },
  { timeMs: 900, metering: -17 },
]);

assert.equal(report.durationSec, 0.9);
assert.ok(report.peakVolume > 0.7, `expected peakVolume > 0.7, got ${report.peakVolume}`);
assert.ok(report.sharpness > 0.6, `expected sharpness > 0.6, got ${report.sharpness}`);
assert.ok(report.repetition > 0.5, `expected repetition > 0.5, got ${report.repetition}`);
assert.equal(report.burstCount, 3);
assert.ok(report.signalQuality > 0.5, `expected usable signal quality, got ${report.signalQuality}`);
assert.equal(hasUsableAudioSignal(report), true);
if (report.averageIntervalMs === undefined) {
  throw new Error('expected averageIntervalMs to be defined');
}
const averageIntervalMs = report.averageIntervalMs;
assert.ok(averageIntervalMs >= 300 && averageIntervalMs <= 400, `unexpected interval ${averageIntervalMs}`);

const waveform = buildWaveformLevels([
  { timeMs: 0, metering: -60 },
  { timeMs: 100, metering: -12 },
  { timeMs: 200, metering: -48 },
  { timeMs: 300, metering: -6 },
], 2);

assert.equal(waveform.length, 2);
assert.ok(waveform[0] > 0.7, `expected first waveform bucket to keep a loud peak, got ${waveform[0]}`);
assert.ok(waveform[1] > 0.85, `expected second waveform bucket to keep a loud peak, got ${waveform[1]}`);

const quiet = analyzeMeteringSamples([
  { timeMs: 0, metering: -55 },
  { timeMs: 500, metering: -54 },
  { timeMs: 1000, metering: -56 },
]);

assert.ok(quiet.averageVolume < 0.15, `expected quiet averageVolume < 0.15, got ${quiet.averageVolume}`);
assert.ok(quiet.sharpness < 0.1, `expected quiet sharpness < 0.1, got ${quiet.sharpness}`);
assert.equal(quiet.burstCount, 0);
assert.equal(hasUsableAudioSignal(quiet), false);

const empty = analyzeMeteringSamples([]);
assert.equal(empty.signalQuality, 0);
assert.equal(hasUsableAudioSignal(empty), false);

const steadyNoise = analyzeMeteringSamples(
  Array.from({ length: 24 }, (_, index) => ({ timeMs: index * 80, metering: -19 + (index % 2) }))
);
assert.equal(
  hasUsableAudioSignal(steadyNoise),
  false,
  'steady background noise must not be treated as a pet vocalization'
);

console.log('audioFeatureEngine tests passed');
