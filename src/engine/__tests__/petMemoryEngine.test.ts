import assert from 'node:assert/strict';
import { createDefaultPetMemory, scorePetStateFromMemory } from '../petMemoryEngine';
import { Pet } from '../../types';

const pet: Pet = {
  id: 'pet-1',
  name: 'Барсик',
  type: 'cat',
  age: 3,
  gender: 'male',
  personality: {
    arrogance: 55,
    curiosity: 65,
    laziness: 30,
    friendliness: 70,
    intelligence: 60,
    drama: 35,
    gluttony: 82,
    energy: 64,
  },
  createdAt: 1,
};

const memory = {
  ...createDefaultPetMemory('pet-1'),
  routine: {
    feedingTimes: ['08:00', '18:00'],
    walkTimes: [],
  },
  confirmedEmotionCounts: {
    hunger: 3,
  },
  categoryFeedback: {
    hunger: { liked: 2, similar: 3, notSimilar: 0 },
  },
};

const report = scorePetStateFromMemory({
  pet,
  memory,
  mode: 'sound',
  now: new Date('2026-06-02T18:10:00+03:00'),
  signal: {
    durationSec: 1.6,
    averageVolume: 0.72,
    peakVolume: 0.91,
    noiseFloor: 0.12,
    volumeVariation: 0.31,
    sharpness: 0.78,
    repetition: 0.74,
    activeRatio: 0.62,
    burstCount: 4,
    rhythmRegularity: 0.72,
    signalQuality: 0.9,
    averageIntervalMs: 420,
  },
});

assert.equal(report.mode, 'sound');
assert.ok(report.probabilities.hunger > report.probabilities.play, 'expected hunger to outrank play');
assert.ok(report.reasons.some((reason) => reason.includes('кормления')), 'expected feeding-time reason');
assert.ok(report.reasons.some((reason) => reason.includes('подтверждал')), 'expected memory feedback reason');
assert.equal(report.primaryState, 'hunger');
const probabilityTotal = Object.values(report.probabilities).reduce((sum, value) => sum + value, 0);
assert.ok(probabilityTotal >= 97 && probabilityTotal <= 103, `probabilities should total about 100, got ${probabilityTotal}`);

const dog: Pet = {
  ...pet,
  id: 'dog-1',
  name: 'Рекс',
  type: 'dog',
};

const dogRepeatedSoundReport = scorePetStateFromMemory({
  pet: dog,
  mode: 'sound',
  now: new Date('2026-06-02T12:00:00+03:00'),
  signal: {
    durationSec: 2,
    averageVolume: 0.5,
    peakVolume: 0.82,
    noiseFloor: 0.11,
    volumeVariation: 0.27,
    sharpness: 0.3,
    repetition: 0.64,
    activeRatio: 0.44,
    burstCount: 4,
    rhythmRegularity: 0.7,
    signalQuality: 0.86,
    averageIntervalMs: 400,
  },
});
assert.ok(
  dogRepeatedSoundReport.reasons.some((reason) => reason.includes('несколько близких')),
  'expected repeated dog sounds to be described using cadence'
);

const catSteadySoundReport = scorePetStateFromMemory({
  pet,
  mode: 'sound',
  now: new Date('2026-06-02T12:00:00+03:00'),
  signal: {
    durationSec: 3,
    averageVolume: 0.24,
    peakVolume: 0.43,
    noiseFloor: 0.08,
    volumeVariation: 0.06,
    sharpness: 0.08,
    repetition: 0,
    activeRatio: 0.7,
    burstCount: 1,
    rhythmRegularity: 0,
    signalQuality: 0.76,
  },
});
assert.ok(
  catSteadySoundReport.reasons.some((reason) => reason.includes('долгий ровный')),
  'expected a steady cat sound to be described without pretending to know pitch'
);

const photoReport = scorePetStateFromMemory({
  pet,
  mode: 'photo',
  now: new Date('2026-06-02T12:00:00+03:00'),
});
assert.ok(
  photoReport.reasons.every((reason) => !reason.includes('звук')),
  'photo analysis must not invent audio reasons'
);

console.log('petMemoryEngine tests passed');
