import { LocalAnalysisReport, Pet, PetMemory, PetStateCategory } from '../types';
import { scorePetStateFromMemory } from './petMemoryEngine';

export interface PhotoPoseInput {
  width?: number;
  height?: number;
  fileSize?: number;
}

export interface PhotoPoseReport {
  headTilt: number;
  gazeFocus: number;
  bodyRelaxation: number;
  excitement: number;
  mood: string;
  interpretation: string;
  reasons: string[];
  analysis: LocalAnalysisReport;
}

function clampPercent(value: number): number {
  return Math.max(5, Math.min(95, Math.round(value)));
}

function ratio(width?: number, height?: number): number {
  if (!width || !height) return 1;
  return width / height;
}

export function analyzePhotoPose(
  pet: Pet,
  input: PhotoPoseInput = {},
  memory?: PetMemory,
  language: 'ru' | 'en' = 'ru'
): PhotoPoseReport {
  const imageRatio = ratio(input.width, input.height);
  const portraitBias = imageRatio < 0.9 ? 16 : imageRatio > 1.25 ? -8 : 4;
  const detailBias = input.fileSize ? Math.min(18, input.fileSize / 180000) : 6;
  const p = pet.personality;

  const headTilt = clampPercent(35 + p.curiosity * 0.28 + portraitBias);
  const gazeFocus = clampPercent(28 + p.intelligence * 0.25 + p.curiosity * 0.2 + detailBias);
  const bodyRelaxation = clampPercent(30 + p.laziness * 0.32 + (100 - p.drama) * 0.18);
  const excitement = clampPercent(22 + p.energy * 0.35 + p.friendliness * 0.14 - p.laziness * 0.08);

  const analysis = scorePetStateFromMemory({
    pet,
    memory,
    mode: 'photo',
    language,
  });

  let visualState: PetStateCategory = analysis.primaryState;
  if (bodyRelaxation > 70) visualState = 'rest';
  if (excitement > 72) visualState = 'play';
  if (gazeFocus > 74) visualState = 'curiosity';

  const moodMap: Record<PetStateCategory, string> = {
    hunger: 'ожидает еду',
    walk: 'ждёт прогулку',
    attention: 'просит внимания',
    play: 'готов играть',
    rest: 'расслаблен',
    stress: 'насторожен',
    curiosity: 'изучает обстановку',
  };
  const moodMapEn: Record<PetStateCategory, string> = {
    hunger: 'waiting for food',
    walk: 'waiting for a walk',
    attention: 'wants attention',
    play: 'ready to play',
    rest: 'calm and relaxed',
    stress: 'feeling unsure',
    curiosity: 'exploring the scene',
  };
  const moods = language === 'en' ? moodMapEn : moodMap;

  const reasons = language === 'en'
    ? [
        `head position clue: ${headTilt}%`,
        `where the pet is looking: ${gazeFocus}%`,
        `calm body pose: ${bodyRelaxation}%`,
      ]
    : [
        `положение головы: ${headTilt}%`,
        `куда смотрит питомец: ${gazeFocus}%`,
        `спокойная поза: ${bodyRelaxation}%`,
      ];

  const interpretation = language === 'en'
    ? visualState === 'rest'
      ? 'Your pet looks calm and the pose seems relaxed.'
      : visualState === 'play'
        ? 'The pose looks active. Your pet may be ready to play.'
        : visualState === 'curiosity'
          ? 'Your pet seems focused and interested in what is happening.'
          : `The photo looks most like this mood: ${moods[visualState]}.`
    : visualState === 'rest'
      ? 'Питомец выглядит спокойным: поза мягкая, признаков резкого напряжения мало.'
      : visualState === 'play'
        ? 'В кадре читается активность: вероятно, питомец готов к игре или реакции на хозяина.'
        : visualState === 'curiosity'
          ? 'Питомец сфокусирован на происходящем и внимательно изучает ситуацию.'
          : `Фото больше всего похоже на состояние: ${moods[visualState]}.`;

  return {
    headTilt,
    gazeFocus,
    bodyRelaxation,
    excitement,
    mood: moods[visualState],
    interpretation,
    reasons,
    analysis: {
      ...analysis,
      primaryState: visualState,
      emotion: moods[visualState],
      confidence: Math.max(analysis.confidence, clampPercent((headTilt + gazeFocus + bodyRelaxation) / 3)),
      reasons: [...analysis.reasons, ...reasons].slice(0, 6),
      features: {
        ...analysis.features,
        headTilt,
        gazeFocus,
        bodyRelaxation,
        excitement,
        imageRatio: Math.round(imageRatio * 100) / 100,
      },
    },
  };
}
