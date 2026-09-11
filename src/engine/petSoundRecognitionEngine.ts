import {
  PetSoundEvent,
  PetSoundLabel,
  PetSoundRecognition,
  PetSoundScore,
  PetType,
} from '../types';

export const YAMNET_SAMPLE_RATE = 16000;
export const YAMNET_INPUT_SAMPLES = 15600;
export const YAMNET_OUTPUT_CLASSES = 521;
export const YAMNET_WINDOW_HOP_SAMPLES = 7800;
export const MAX_YAMNET_WINDOWS = 24;

interface SoundDefinition {
  label: PetSoundLabel;
  sourceLabel: string;
  species: PetType;
  indices: number[];
  threshold: number;
  parentClass?: boolean;
}

const SOUND_DEFINITIONS: SoundDefinition[] = [
  { label: 'dog_voice', sourceLabel: 'Dog', species: 'dog', indices: [69], threshold: 0.3, parentClass: true },
  { label: 'dog_bark', sourceLabel: 'Bark', species: 'dog', indices: [70, 73], threshold: 0.25 },
  { label: 'dog_yip', sourceLabel: 'Yip', species: 'dog', indices: [71], threshold: 0.25 },
  { label: 'dog_howl', sourceLabel: 'Howl', species: 'dog', indices: [72], threshold: 0.25 },
  { label: 'dog_growl', sourceLabel: 'Growling', species: 'dog', indices: [74], threshold: 0.25 },
  { label: 'dog_whine', sourceLabel: 'Whimper (dog)', species: 'dog', indices: [75], threshold: 0.25 },
  { label: 'cat_voice', sourceLabel: 'Cat', species: 'cat', indices: [76], threshold: 0.3, parentClass: true },
  { label: 'cat_purr', sourceLabel: 'Purr', species: 'cat', indices: [77], threshold: 0.25 },
  { label: 'cat_meow', sourceLabel: 'Meow', species: 'cat', indices: [78], threshold: 0.25 },
  { label: 'cat_hiss', sourceLabel: 'Hiss', species: 'cat', indices: [79], threshold: 0.25 },
  { label: 'cat_yowl', sourceLabel: 'Caterwaul', species: 'cat', indices: [80], threshold: 0.25 },
];

export interface PetSoundModelTensor {
  dataType: string;
  shape: number[];
}

export interface PetSoundModelRunner {
  inputs?: PetSoundModelTensor[];
  outputs?: PetSoundModelTensor[];
  run(inputs: ArrayBuffer[]): Promise<ArrayBuffer[]>;
}

interface PcmWindow {
  startSample: number;
  samples: Float32Array;
}

function clamp(value: number, min = 0, max = 1): number {
  return Math.max(min, Math.min(max, value));
}

function round(value: number, digits = 4): number {
  const factor = Math.pow(10, digits);
  return Math.round(value * factor) / factor;
}

function definitionScore(scores: Float32Array, definition: SoundDefinition): number {
  return Math.max(...definition.indices.map((index) => clamp(scores[index] || 0)));
}

function aggregateWindowScores(values: number[]): number {
  if (values.length === 0) return 0;
  const strongest = [...values].sort((a, b) => b - a).slice(0, 3);
  const mean = strongest.reduce((sum, value) => sum + value, 0) / strongest.length;
  return round(strongest[0] * 0.7 + mean * 0.3);
}

function topScoreForSpecies(scores: PetSoundScore[], species: PetType): number {
  return Math.max(0, ...scores.filter((score) => score.species === species).map((score) => score.score));
}

function definitionForLabel(label: PetSoundLabel): SoundDefinition {
  const definition = SOUND_DEFINITIONS.find((candidate) => candidate.label === label);
  if (!definition) throw new Error(`Unsupported pet sound label: ${label}`);
  return definition;
}

export function pcmBufferToMonoFloat32(data: ArrayBuffer, channels = 1): Float32Array {
  const input = new Float32Array(data);
  if (channels <= 1) return Float32Array.from(input);

  const frameCount = Math.floor(input.length / channels);
  const mono = new Float32Array(frameCount);
  for (let frame = 0; frame < frameCount; frame += 1) {
    let sum = 0;
    for (let channel = 0; channel < channels; channel += 1) {
      sum += input[frame * channels + channel] || 0;
    }
    mono[frame] = clamp(sum / channels, -1, 1);
  }
  return mono;
}

export function pcmToMeteringDb(samples: Float32Array): number {
  if (samples.length === 0) return -100;
  let energy = 0;
  for (let index = 0; index < samples.length; index += 1) {
    const sample = clamp(samples[index] || 0, -1, 1);
    energy += sample * sample;
  }
  const rms = Math.sqrt(energy / samples.length);
  return Math.max(-100, 20 * Math.log10(Math.max(rms, 0.00001)));
}

export function mergePcmChunks(chunks: Float32Array[]): Float32Array {
  const total = chunks.reduce((sum, chunk) => sum + chunk.length, 0);
  const merged = new Float32Array(total);
  let offset = 0;
  chunks.forEach((chunk) => {
    merged.set(chunk, offset);
    offset += chunk.length;
  });
  return merged;
}

export function resampleMonoPcm(
  samples: Float32Array,
  sourceSampleRate: number,
  targetSampleRate = YAMNET_SAMPLE_RATE
): Float32Array {
  if (samples.length === 0) return new Float32Array();
  if (!Number.isFinite(sourceSampleRate) || sourceSampleRate <= 0) {
    throw new Error('Audio sample rate must be a positive number.');
  }
  if (sourceSampleRate === targetSampleRate) return Float32Array.from(samples);

  const targetLength = Math.max(1, Math.round(samples.length * targetSampleRate / sourceSampleRate));
  const output = new Float32Array(targetLength);
  const ratio = sourceSampleRate / targetSampleRate;

  for (let index = 0; index < targetLength; index += 1) {
    if (sourceSampleRate > targetSampleRate) {
      // Average the source interval that contributes to this output sample.
      // This inexpensive box low-pass prevents the worst aliasing when Android
      // falls back to 44.1/48 kHz instead of the requested 16 kHz.
      const intervalStart = index * ratio;
      const intervalEnd = Math.min(samples.length, (index + 1) * ratio);
      const firstSource = Math.floor(intervalStart);
      const lastSource = Math.min(samples.length - 1, Math.ceil(intervalEnd) - 1);
      let weightedSum = 0;
      let totalWeight = 0;

      for (let sourceIndex = firstSource; sourceIndex <= lastSource; sourceIndex += 1) {
        const overlapStart = Math.max(intervalStart, sourceIndex);
        const overlapEnd = Math.min(intervalEnd, sourceIndex + 1);
        const weight = Math.max(0, overlapEnd - overlapStart);
        weightedSum += (samples[sourceIndex] || 0) * weight;
        totalWeight += weight;
      }

      output[index] = clamp(totalWeight > 0 ? weightedSum / totalWeight : 0, -1, 1);
      continue;
    }

    const sourcePosition = Math.min(samples.length - 1, index * ratio);
    const leftIndex = Math.floor(sourcePosition);
    const rightIndex = Math.min(samples.length - 1, leftIndex + 1);
    const fraction = sourcePosition - leftIndex;
    const value = (samples[leftIndex] || 0) * (1 - fraction) + (samples[rightIndex] || 0) * fraction;
    output[index] = clamp(Number.isFinite(value) ? value : 0, -1, 1);
  }

  return output;
}

export function createYamnetWindows(
  samples: Float32Array,
  sourceSampleRate: number
): PcmWindow[] {
  const resampled = resampleMonoPcm(samples, sourceSampleRate);
  if (resampled.length < YAMNET_INPUT_SAMPLES) return [];

  const starts: number[] = [];
  for (
    let start = 0;
    start + YAMNET_INPUT_SAMPLES <= resampled.length;
    start += YAMNET_WINDOW_HOP_SAMPLES
  ) {
    starts.push(start);
  }

  const finalStart = resampled.length - YAMNET_INPUT_SAMPLES;
  if (starts[starts.length - 1] !== finalStart) starts.push(finalStart);

  const selectedStarts = starts.length <= MAX_YAMNET_WINDOWS
    ? starts
    : Array.from({ length: MAX_YAMNET_WINDOWS }, (_, index) => (
      starts[Math.round(index * (starts.length - 1) / (MAX_YAMNET_WINDOWS - 1))]
    ));

  return Array.from(new Set(selectedStarts)).map((startSample) => ({
    startSample,
    samples: resampled.slice(startSample, startSample + YAMNET_INPUT_SAMPLES),
  }));
}

function buildRecognitionFromScores(params: {
  windowScores: Float32Array[];
  windowStarts: number[];
  expectedSpecies: PetType;
  durationMs: number;
  signalQuality: number;
}): PetSoundRecognition {
  const { windowScores, windowStarts, expectedSpecies, durationMs, signalQuality } = params;
  const scores = SOUND_DEFINITIONS.map((definition): PetSoundScore => ({
    label: definition.label,
    sourceLabel: definition.sourceLabel,
    species: definition.species,
    score: aggregateWindowScores(
      windowScores.map((window) => definitionScore(window, definition))
    ),
  })).sort((a, b) => b.score - a.score);

  const specificScores = scores.filter((score) => !definitionForLabel(score.label).parentClass);
  const catEvidence = topScoreForSpecies(scores, 'cat');
  const dogEvidence = topScoreForSpecies(scores, 'dog');
  const detectedSpecies: PetType | undefined = Math.max(catEvidence, dogEvidence) >= 0.1
    ? (catEvidence >= dogEvidence ? 'cat' : 'dog')
    : undefined;
  const expectedEvidence = topScoreForSpecies(scores, expectedSpecies);
  const otherSpecies: PetType = expectedSpecies === 'cat' ? 'dog' : 'cat';
  const otherEvidence = topScoreForSpecies(scores, otherSpecies);
  const selectSpeciesTop = (species: PetType): PetSoundScore | undefined => {
    const speciesSpecific = specificScores.filter((score) => score.species === species);
    const bestSpecific = speciesSpecific[0];
    if (
      bestSpecific
      && bestSpecific.score >= definitionForLabel(bestSpecific.label).threshold
    ) {
      return bestSpecific;
    }
    return scores.find((score) => score.species === species);
  };
  const expectedTop = selectSpeciesTop(expectedSpecies);
  const otherTop = selectSpeciesTop(otherSpecies);
  let top = expectedTop;

  let status: PetSoundRecognition['status'];
  if (Math.max(catEvidence, dogEvidence) < 0.1) {
    status = 'no_pet_sound';
  } else if (
    otherTop
    && otherEvidence >= definitionForLabel(otherTop.label).threshold
    && otherEvidence > expectedEvidence + 0.08
  ) {
    status = 'wrong_species';
    top = otherTop;
  } else if (
    !expectedTop
    || expectedTop.score < definitionForLabel(expectedTop.label).threshold
  ) {
    status = 'low_confidence';
  } else {
    const runnerUp = specificScores.find((candidate) => (
      candidate.species === expectedSpecies
      && candidate.label !== expectedTop.label
    ));
    const ambiguous = (
      runnerUp != null
      && runnerUp.score >= definitionForLabel(runnerUp.label).threshold
      && expectedTop.score - runnerUp.score < 0.08
    );
    status = ambiguous ? 'low_confidence' : 'recognized';
  }

  const events: PetSoundEvent[] = [];
  windowScores.forEach((window, index) => {
    const best = SOUND_DEFINITIONS
      .filter((definition) => !definition.parentClass)
      .map((definition) => ({ definition, score: definitionScore(window, definition) }))
      .sort((a, b) => b.score - a.score)[0];
    if (!best || best.score < best.definition.threshold) return;
    const startMs = Math.round((windowStarts[index] / YAMNET_SAMPLE_RATE) * 1000);
    events.push({
      label: best.definition.label,
      sourceLabel: best.definition.sourceLabel,
      species: best.definition.species,
      score: round(best.score),
      startMs,
      endMs: startMs + Math.round((YAMNET_INPUT_SAMPLES / YAMNET_SAMPLE_RATE) * 1000),
    });
  });

  const runnerUpScore = scores.find((candidate) => candidate.label !== top?.label)?.score || 0;
  const strength = top && top.score >= 0.5 && top.score - runnerUpScore >= 0.12
    ? 'clear'
    : 'tentative';
  const reportedTop = top && top.score >= 0.1 ? top : undefined;

  return {
    status,
    expectedSpecies,
    detectedSpecies,
    top: reportedTop,
    scores: scores.slice(0, 5),
    events: events.slice(0, 12),
    strength,
    model: {
      id: 'yamnet',
      version: '1',
      inputSampleRateHz: YAMNET_SAMPLE_RATE,
      inputSampleCount: YAMNET_INPUT_SAMPLES,
    },
    audio: {
      durationMs: Math.max(0, Math.round(durationMs)),
      analyzedWindowCount: windowScores.length,
      signalQuality: round(clamp(signalQuality), 3),
    },
  };
}

function validateModelContract(model: PetSoundModelRunner) {
  const input = model.inputs?.[0];
  if (input) {
    const inputSize = input.shape[input.shape.length - 1];
    if (input.dataType !== 'float32' || inputSize !== YAMNET_INPUT_SAMPLES) {
      throw new Error(`Unexpected YAMNet input tensor: ${input.dataType} [${input.shape.join(', ')}].`);
    }
  }

  const output = model.outputs?.[0];
  if (output) {
    const outputSize = output.shape[output.shape.length - 1];
    if (output.dataType !== 'float32' || outputSize !== YAMNET_OUTPUT_CLASSES) {
      throw new Error(`Unexpected YAMNet output tensor: ${output.dataType} [${output.shape.join(', ')}].`);
    }
  }
}

export async function recognizePetSoundFromPcm(params: {
  model: PetSoundModelRunner;
  samples: Float32Array;
  sourceSampleRate: number;
  expectedSpecies: PetType;
  signalQuality: number;
}): Promise<PetSoundRecognition> {
  const { model, samples, sourceSampleRate, expectedSpecies, signalQuality } = params;
  const durationMs = sourceSampleRate > 0 ? samples.length / sourceSampleRate * 1000 : 0;
  const windows = createYamnetWindows(samples, sourceSampleRate);

  if (windows.length === 0) {
    return {
      status: 'too_short',
      expectedSpecies,
      scores: [],
      events: [],
      strength: 'tentative',
      model: {
        id: 'yamnet',
        version: '1',
        inputSampleRateHz: YAMNET_SAMPLE_RATE,
        inputSampleCount: YAMNET_INPUT_SAMPLES,
      },
      audio: {
        durationMs: Math.max(0, Math.round(durationMs)),
        analyzedWindowCount: 0,
        signalQuality: round(clamp(signalQuality), 3),
      },
    };
  }

  validateModelContract(model);

  const windowScores: Float32Array[] = [];
  for (const window of windows) {
    const outputs = await model.run([window.samples.buffer as ArrayBuffer]);
    if (!outputs[0]) throw new Error('YAMNet did not return an output tensor.');
    const scores = new Float32Array(outputs[0]);
    if (scores.length !== YAMNET_OUTPUT_CLASSES) {
      throw new Error(`YAMNet returned ${scores.length} scores instead of ${YAMNET_OUTPUT_CLASSES}.`);
    }
    windowScores.push(Float32Array.from(scores));
  }

  return buildRecognitionFromScores({
    windowScores,
    windowStarts: windows.map((window) => window.startSample),
    expectedSpecies,
    durationMs,
    signalQuality,
  });
}
