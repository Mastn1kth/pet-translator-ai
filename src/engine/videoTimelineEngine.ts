import {
  ARFilterId,
  LocalAnalysisReport,
  Pet,
  PetMemory,
  PetVisionObservation,
  VideoCaptionCue,
  VideoMemeProject,
} from '../types';
import { scorePetStateFromMemory } from './petMemoryEngine';

export interface VideoTimelineInput {
  sourceUri: string;
  projectId?: string;
  durationMs?: number | null;
  width?: number;
  height?: number;
  fileSize?: number;
  filterId?: ARFilterId;
  modelObservations?: PetVisionObservation[];
}

export interface VideoTimelineResult {
  project: VideoMemeProject;
  analysis: LocalAnalysisReport;
  captions: VideoCaptionCue[];
  behaviorTags: string[];
}

const CAPTION_BANK: Record<string, string[]> = {
  hunger: [
    'Миска выглядит подозрительно пустой.',
    'Шуршит пакетик с кормом. Я всё слышу.',
    'Проверяю стратегические запасы еды.',
  ],
  walk: [
    'Поводок сам себя не наденет.',
    'Я уже мысленно на прогулке.',
    'Дверь зовёт. Я отвечаю.',
  ],
  attention: [
    'Ты опять снимаешь меня?',
    'Камера включена — всё внимание сюда.',
    'После съёмки полагаются поглаживания.',
  ],
  play: [
    'Кто-то сказал «играть»!',
    'Запускаю режим ракеты.',
    'Сейчас будет лучший кадр дня.',
  ],
  rest: [
    'Снимаешь мой важный отдых.',
    'Я не ленюсь. Я заряжаюсь.',
    'Тишина. И уважение к артисту.',
  ],
  stress: [
    'Что-то тут подозрительно.',
    'Я всё контролирую.',
    'Ситуация требует внимательного взгляда.',
  ],
  curiosity: [
    'Расследование начато.',
    'Интересно, что происходит.',
    'Проверяю мир на странности.',
  ],
};

const CAPTION_BANK_EN: Record<string, string[]> = {
  hunger: [
    'The bowl looks suspiciously empty.',
    'I heard the treat bag. No debate.',
    'Checking the snack supply.',
  ],
  walk: [
    'The leash will not put itself on.',
    'I am already dreaming about our walk.',
    'The door is calling me.',
  ],
  attention: [
    'Are you filming me again?',
    'The camera is on, so all eyes are on me.',
    'Please pet the star after filming.',
  ],
  play: [
    'When someone says, “Let us play!”',
    'Rocket mode starts now.',
    'This will be the best clip today.',
  ],
  rest: [
    'You are filming my important nap.',
    'I am not lazy. I am recharging.',
    'Quiet, please. The star is resting.',
  ],
  stress: [
    'Something feels unusual here.',
    'I am watching carefully.',
    'Let us look at this gently.',
  ],
  curiosity: [
    'The investigation begins.',
    'I wonder what is happening.',
    'Checking the world for surprises.',
  ],
};

function pickCaptions(category: string, petName: string, language: 'ru' | 'en'): string[] {
  const bank = language === 'en' ? CAPTION_BANK_EN : CAPTION_BANK;
  const pool = bank[category] || bank.attention;
  return pool.map((text) => text.replace('Я', petName));
}

function bestModelObservation(observations?: PetVisionObservation[]): PetVisionObservation | undefined {
  return observations
    ?.filter((item) => item.label === 'cat' || item.label === 'dog')
    .sort((a, b) => b.confidence - a.confidence)[0];
}

export function buildVideoTimeline(
  pet: Pet,
  input: VideoTimelineInput,
  memory?: PetMemory,
  language: 'ru' | 'en' = 'ru'
): VideoTimelineResult {
  const durationMs = Math.max(3000, input.durationMs || 9000);
  const modelObservation = bestModelObservation(input.modelObservations);
  const modelConfidence = modelObservation ? Math.round(modelObservation.confidence * 100) : 0;

  const analysis = scorePetStateFromMemory({
    pet,
    memory,
    mode: 'video',
    language,
  });

  const texts = pickCaptions(analysis.primaryState, pet.name, language);
  const cueLength = Math.min(2600, Math.max(1500, Math.floor(durationMs / 4)));
  const captions = texts.slice(0, 3).map((text, index) => {
    const startMs = Math.min(durationMs - 900, 700 + index * cueLength);
    return {
      id: `${Date.now()}-${index}`,
      startMs,
      endMs: Math.min(durationMs, startMs + cueLength),
      text,
    };
  });

  const project: VideoMemeProject = {
    id: input.projectId || Date.now().toString(),
    petId: pet.id,
    sourceUri: input.sourceUri,
    templateId: analysis.primaryState,
    filterId: input.filterId || 'none',
    captions,
    modelObservations: input.modelObservations,
    createdAt: Date.now(),
  };

  const modelReasons = modelObservation
    ? [language === 'en' ? 'the camera spotted a pet in the video' : 'камера увидела питомца в видео']
    : [language === 'en' ? 'the pet was difficult to see clearly' : 'питомца было трудно хорошо рассмотреть'];
  const adjustedConfidence = modelObservation
    ? Math.max(analysis.confidence, Math.min(98, 62 + Math.round(modelObservation.confidence * 32)))
    : analysis.confidence;

  return {
    project,
    analysis: {
      ...analysis,
      confidence: adjustedConfidence,
      reasons: [
        ...modelReasons,
        ...analysis.reasons,
        language === 'en'
          ? `video length: ${Math.round(durationMs / 1000)} seconds`
          : `длина видео: ${Math.round(durationMs / 1000)} секунд`,
      ].slice(0, 6),
      features: {
        ...analysis.features,
        durationMs,
        width: input.width,
        height: input.height,
        fileSize: input.fileSize,
        modelLabel: modelObservation?.label,
        modelConfidence,
        modelCenterX: modelObservation?.center?.x,
        modelCenterY: modelObservation?.center?.y,
      },
    },
    captions,
    behaviorTags: [
      analysis.primaryState,
      durationMs > 12000 ? 'длинный ролик' : 'короткий ролик',
      modelObservation ? `model:${modelObservation.label}` : 'model:none',
      modelObservation?.label === pet.type ? 'model:pet-type-match' : 'model:pet-type-unconfirmed',
    ],
  };
}
