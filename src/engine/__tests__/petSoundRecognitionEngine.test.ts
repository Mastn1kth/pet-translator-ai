import assert from 'node:assert/strict';
import {
  createYamnetWindows,
  pcmBufferToMonoFloat32,
  pcmToMeteringDb,
  recognizePetSoundFromPcm,
  resampleMonoPcm,
  YAMNET_INPUT_SAMPLES,
  YAMNET_OUTPUT_CLASSES,
} from '../petSoundRecognitionEngine';

async function main() {
function outputWith(entries: Array<[number, number]>): ArrayBuffer {
  const scores = new Float32Array(YAMNET_OUTPUT_CLASSES);
  entries.forEach(([index, score]) => {
    scores[index] = score;
  });
  return scores.buffer;
}

function fakeModel(outputs: ArrayBuffer[]) {
  let call = 0;
  return {
    inputs: [{ dataType: 'float32', shape: [1, YAMNET_INPUT_SAMPLES] }],
    outputs: [{ dataType: 'float32', shape: [1, YAMNET_OUTPUT_CLASSES] }],
    async run(inputs: ArrayBuffer[]) {
      assert.equal(new Float32Array(inputs[0]).length, YAMNET_INPUT_SAMPLES);
      const output = outputs[Math.min(call, outputs.length - 1)];
      call += 1;
      return [output];
    },
  };
}

const stereo = new Float32Array([1, -1, 0.5, 0.5]);
assert.deepEqual(
  Array.from(pcmBufferToMonoFloat32(stereo.buffer, 2)),
  [0, 0.5],
  'stereo PCM should be mixed down to mono'
);
assert.ok(pcmToMeteringDb(new Float32Array([0.5, -0.5])) > -7);
assert.equal(pcmToMeteringDb(new Float32Array(10)), -100);

const source8k = new Float32Array(8000).map((_, index) => Math.sin(index / 10));
assert.equal(resampleMonoPcm(source8k, 8000).length, 16000);
const aliased32k = Float32Array.from({ length: 32000 }, (_, index) => index % 2 === 0 ? 1 : -1);
const filtered16k = resampleMonoPcm(aliased32k, 32000);
assert.ok(
  filtered16k.every((sample) => Math.abs(sample) < 0.001),
  'downsampling should low-pass source intervals instead of aliasing alternating samples'
);
assert.equal(createYamnetWindows(new Float32Array(YAMNET_INPUT_SAMPLES), 16000).length, 1);
assert.equal(createYamnetWindows(new Float32Array(YAMNET_INPUT_SAMPLES - 1), 16000).length, 0);

const oneSecond = new Float32Array(16000).fill(0.2);
const meow = await recognizePetSoundFromPcm({
  model: fakeModel([outputWith([[76, 0.55], [78, 0.82]])]),
  samples: oneSecond,
  sourceSampleRate: 16000,
  expectedSpecies: 'cat',
  signalQuality: 0.9,
});
assert.equal(meow.status, 'recognized');
assert.equal(meow.top?.label, 'cat_meow');
assert.equal(meow.detectedSpecies, 'cat');

const wrongSpecies = await recognizePetSoundFromPcm({
  model: fakeModel([outputWith([[69, 0.72], [70, 0.84]])]),
  samples: oneSecond,
  sourceSampleRate: 16000,
  expectedSpecies: 'cat',
  signalQuality: 0.9,
});
assert.equal(wrongSpecies.status, 'wrong_species');
assert.equal(wrongSpecies.detectedSpecies, 'dog');

const expectedParentWins = await recognizePetSoundFromPcm({
  model: fakeModel([outputWith([[76, 0.5], [70, 0.26]])]),
  samples: oneSecond,
  sourceSampleRate: 16000,
  expectedSpecies: 'cat',
  signalQuality: 0.9,
});
assert.equal(expectedParentWins.status, 'recognized');
assert.equal(expectedParentWins.top?.label, 'cat_voice');

const noPet = await recognizePetSoundFromPcm({
  model: fakeModel([outputWith([[0, 0.95], [132, 0.8]])]),
  samples: oneSecond,
  sourceSampleRate: 16000,
  expectedSpecies: 'dog',
  signalQuality: 0.8,
});
assert.equal(noPet.status, 'no_pet_sound');
assert.equal(noPet.top, undefined);

const uncertain = await recognizePetSoundFromPcm({
  model: fakeModel([outputWith([[76, 0.1], [78, 0.09]])]),
  samples: oneSecond,
  sourceSampleRate: 16000,
  expectedSpecies: 'cat',
  signalQuality: 0.8,
});
assert.equal(uncertain.status, 'low_confidence');

const ambiguous = await recognizePetSoundFromPcm({
  model: fakeModel([outputWith([[78, 0.48], [79, 0.46]])]),
  samples: oneSecond,
  sourceSampleRate: 16000,
  expectedSpecies: 'cat',
  signalQuality: 0.8,
});
assert.equal(ambiguous.status, 'low_confidence');

const tooShort = await recognizePetSoundFromPcm({
  model: fakeModel([outputWith([[78, 0.8]])]),
  samples: new Float32Array(8000),
  sourceSampleRate: 16000,
  expectedSpecies: 'cat',
  signalQuality: 0.8,
});
assert.equal(tooShort.status, 'too_short');

await assert.rejects(
  recognizePetSoundFromPcm({
    model: fakeModel([new Float32Array(12).buffer]),
    samples: oneSecond,
    sourceSampleRate: 16000,
    expectedSpecies: 'cat',
    signalQuality: 0.8,
  }),
  /instead of 521/
);

console.log('pet sound recognition engine tests passed');
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
