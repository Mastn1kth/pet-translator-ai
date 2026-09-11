import { useTensorflowModel, type TensorflowModel } from 'react-native-fast-tflite';
import { recognizePetSoundFromPcm } from '../engine/petSoundRecognitionEngine';
import { PetSoundRecognition, PetType } from '../types';

export const PET_SOUND_MODEL = require('../assets/models/yamnet_pet_sound_classifier.tflite');

export function usePetSoundClassifier() {
  return useTensorflowModel(PET_SOUND_MODEL, []);
}

export async function recognizePetSound(
  model: TensorflowModel,
  samples: Float32Array,
  sourceSampleRate: number,
  expectedSpecies: PetType,
  signalQuality: number
): Promise<PetSoundRecognition> {
  return recognizePetSoundFromPcm({
    model,
    samples,
    sourceSampleRate,
    expectedSpecies,
    signalQuality,
  });
}
