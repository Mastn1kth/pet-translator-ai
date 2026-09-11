import assert from 'node:assert/strict';
import { analyzeMeteringSamples, hasUsableAudioSignal } from '../audioFeatureEngine';
import { createDefaultPetMemory } from '../petMemoryEngine';
import { translatePet } from '../petEngine';
import { Pet, PetSoundLabel, PetSoundRecognition } from '../../types';

const pet: Pet = {
  id: 'sound-flow-pet',
  name: 'Whiskers',
  type: 'cat',
  gender: 'male',
  personality: {
    arrogance: 50,
    curiosity: 50,
    laziness: 50,
    friendliness: 50,
    intelligence: 50,
    drama: 50,
    gluttony: 20,
    energy: 50,
  },
  createdAt: 1,
};

const memory = {
  ...createDefaultPetMemory(pet.id),
  routine: { feedingTimes: [], walkTimes: [] },
};

const steadySamples = Array.from({ length: 30 }, (_, index) => ({
  timeMs: index * 80,
  metering: index < 4 || index > 24 ? -52 : -38 + (index % 2),
}));
const repeatedSamples = Array.from({ length: 40 }, (_, index) => ({
  timeMs: index * 80,
  metering: [5, 6, 12, 13, 19, 20, 26, 27, 33, 34].includes(index) ? -5 : -52,
}));

const steadySignal = analyzeMeteringSamples(steadySamples);
const repeatedSignal = analyzeMeteringSamples(repeatedSamples);
const quietContinuousSignal = analyzeMeteringSamples(
  Array.from({ length: 30 }, (_, index) => ({
    timeMs: index * 80,
    metering: -52,
  }))
);

assert.equal(hasUsableAudioSignal(steadySignal), true);
assert.equal(hasUsableAudioSignal(repeatedSignal), true);
assert.equal(
  hasUsableAudioSignal(quietContinuousSignal),
  false,
  'a quiet continuous purr may not form loudness-envelope bursts'
);
assert.equal(steadySignal.burstCount, 1);
assert.equal(repeatedSignal.burstCount, 5);

function recognition(label: PetSoundLabel, score: number): PetSoundRecognition {
  return {
    status: 'recognized',
    expectedSpecies: 'cat',
    detectedSpecies: 'cat',
    top: {
      label,
      sourceLabel: label === 'cat_purr' ? 'Purr' : 'Meow',
      species: 'cat',
      score,
    },
    scores: [],
    events: [],
    strength: score >= 0.5 ? 'clear' : 'tentative',
    model: {
      id: 'yamnet',
      version: '1',
      inputSampleRateHz: 16000,
      inputSampleCount: 15600,
    },
    audio: {
      durationMs: 2000,
      analyzedWindowCount: 3,
      signalQuality: 0.9,
    },
  };
}

const purrRecognition = recognition('cat_purr', 0.76);
const meowRecognition = recognition('cat_meow', 0.82);
const hissRecognition = recognition('cat_hiss', 0.74);
const steadyResult = translatePet(pet, 'default', memory, steadySignal, purrRecognition);
const repeatedResult = translatePet(pet, 'default', memory, repeatedSignal, meowRecognition);
const hissResult = translatePet(pet, 'default', memory, repeatedSignal, hissRecognition);
const quietPurrResult = translatePet(
  pet,
  'default',
  memory,
  quietContinuousSignal,
  purrRecognition
);

assert.equal(steadyResult.analysis?.primaryState, 'rest');
assert.equal(repeatedResult.analysis?.primaryState, 'attention');
assert.equal(hissResult.analysis?.primaryState, 'stress');
assert.equal(
  quietPurrResult.analysis?.primaryState,
  'rest',
  'recognized quiet purrs must not be rejected by a loudness-envelope gate'
);
assert.equal(steadyResult.analysis?.recognition?.top?.label, 'cat_purr');
assert.equal(repeatedResult.analysis?.recognition?.top?.label, 'cat_meow');
assert.notEqual(
  steadyResult.translation,
  repeatedResult.translation,
  'different loudness envelopes should produce different guesses'
);
assert.ok(
  repeatedResult.analysis?.reasons.some((reason) => reason.includes('ритм')),
  'repeated sound should expose a rhythm-based reason'
);

const englishResult = translatePet(pet, 'default', memory, repeatedSignal, meowRecognition, 'en');
assert.equal(englishResult.analysis?.emotion, 'asking for attention');
assert.doesNotMatch(englishResult.translation, /[А-Яа-яЁё]/);
assert.ok(englishResult.analysis?.reasons.every((reason) => !/[А-Яа-яЁё]/.test(reason)));

assert.throws(
  () => translatePet(pet, 'default', memory, repeatedSignal),
  /requires a captured signal and a recognized pet sound/,
  'sound translation must never silently fall back when recognition is missing'
);

console.log('sound translation flow tests passed');
