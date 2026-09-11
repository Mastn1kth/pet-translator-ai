import {
  LocalAnalysisReport,
  LocalAudioSignal,
  Pet,
  PetMemory,
  PetRoutine,
  PetSoundLabel,
  PetSoundRecognition,
  PetStateCategory,
  TranslationMode,
} from '../types';

const STATES: PetStateCategory[] = ['hunger', 'walk', 'attention', 'play', 'rest', 'stress', 'curiosity'];

const STATE_LABELS: Record<PetStateCategory, string> = {
  hunger: 'ожидание еды',
  walk: 'ожидание прогулки',
  attention: 'просит внимания',
  play: 'игровое возбуждение',
  rest: 'расслабленность',
  stress: 'напряжение',
  curiosity: 'любопытство',
};

const STATE_LABELS_EN: Record<PetStateCategory, string> = {
  hunger: 'waiting for food',
  walk: 'waiting for a walk',
  attention: 'asking for attention',
  play: 'ready to play',
  rest: 'calm and relaxed',
  stress: 'feeling unsure',
  curiosity: 'curious',
};

const REASONS_EN: Record<string, string> = {
  'сейчас близко к обычному времени кормления': 'it is close to the usual feeding time',
  'сейчас близко к обычному времени прогулки': 'it is close to the usual walk time',
  'звуковых подсказок мало, поэтому это очень осторожная догадка': 'there are only a few sound clues, so this is a very careful guess',
  'долгий ровный звук без резких скачков': 'a long, steady sound without sudden jumps',
  'несколько близких звуков подряд': 'several separate sounds close together',
  'громкость быстро менялась': 'the loudness changed quickly',
  'слышна серия отдельных повторяющихся звуков': 'a series of separate repeating sounds',
  'есть очень громкий всплеск': 'there is one very loud burst',
  'звук длился несколько секунд': 'the sound lasted several seconds',
  'звук был тихим и ровным': 'the sound was quiet and steady',
  'звуки повторялись очень быстро': 'the sounds repeated very quickly',
  'звуки повторялись в похожем ритме': 'the sounds repeated in a similar rhythm',
  'между отдельными звуками были длинные паузы': 'there were long pauses between separate sounds',
  'почти вся запись заполнена активным звуком': 'active sound fills most of the recording',
  'слышен один короткий звук': 'one short sound can be heard',
  'ранее пользователь отмечал похожие переводы как удачные': 'you marked similar guesses as helpful before',
  'фото оценивается по позе и общему контексту': 'the photo guess uses pose and the overall scene',
  'видео учитывает движение и тайминг реплик': 'the video guess uses movement and timing',
  'использованы характер питомца и время суток': 'the guess uses your pet’s personality and the time of day',
};

function localizeReason(text: string, language: 'ru' | 'en'): string {
  if (language === 'ru') return text;
  if (text.startsWith('пользователь раньше подтверждал состояние')) {
    return 'you previously confirmed a similar mood';
  }
  return REASONS_EN[text] || text;
}

const DEFAULT_ROUTINE: PetRoutine = {
  feedingTimes: [],
  walkTimes: [],
};

function trait(value: number | undefined): number {
  if (!Number.isFinite(value)) return 0.5;
  return value! > 1 ? value! / 100 : value!;
}

function minutesFromClock(value: string): number | null {
  const match = /^(\d{1,2}):(\d{2})$/.exec(value.trim());
  if (!match) return null;
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) return null;
  return hours * 60 + minutes;
}

function minutesUntilNearest(times: string[], now: Date): number | null {
  const current = now.getHours() * 60 + now.getMinutes();
  const distances = times
    .map(minutesFromClock)
    .filter((value): value is number => value !== null)
    .map((target) => {
      const direct = Math.abs(target - current);
      return Math.min(direct, 1440 - direct);
    });
  return distances.length ? Math.min(...distances) : null;
}

function addReason(reasons: string[], text: string) {
  if (!reasons.includes(text)) reasons.push(text);
}

const RECOGNIZED_SOUND_REASONS: Record<PetSoundLabel, { ru: string; en: string }> = {
  cat_voice: { ru: 'звуковая модель услышала голос кошки', en: 'the sound model recognized a cat voice' },
  cat_purr: { ru: 'звуковая модель распознала мурчание', en: 'the sound model recognized purring' },
  cat_meow: { ru: 'звуковая модель распознала мяуканье', en: 'the sound model recognized a meow' },
  cat_hiss: { ru: 'звуковая модель распознала шипение', en: 'the sound model recognized hissing' },
  cat_yowl: { ru: 'звуковая модель распознала протяжный кошачий крик', en: 'the sound model recognized a long cat call' },
  dog_voice: { ru: 'звуковая модель услышала голос собаки', en: 'the sound model recognized a dog voice' },
  dog_bark: { ru: 'звуковая модель распознала лай', en: 'the sound model recognized barking' },
  dog_yip: { ru: 'звуковая модель распознала тявканье', en: 'the sound model recognized yipping' },
  dog_howl: { ru: 'звуковая модель распознала вой', en: 'the sound model recognized howling' },
  dog_growl: { ru: 'звуковая модель распознала рычание', en: 'the sound model recognized growling' },
  dog_whine: { ru: 'звуковая модель распознала скуление', en: 'the sound model recognized whimpering' },
};

function applyRecognizedSound(
  scores: Record<PetStateCategory, number>,
  reasons: string[],
  recognition: PetSoundRecognition | undefined,
  language: 'ru' | 'en'
) {
  if (recognition?.status !== 'recognized' || !recognition.top) return;

  const label = recognition.top.label;
  addReason(reasons, RECOGNIZED_SOUND_REASONS[label][language]);

  switch (label) {
    case 'cat_purr':
      scores.rest += 44;
      scores.attention += 8;
      break;
    case 'cat_meow':
      scores.attention += 36;
      scores.curiosity += 10;
      break;
    case 'cat_hiss':
      scores.stress += 56;
      break;
    case 'cat_yowl':
      scores.stress += 32;
      scores.attention += 28;
      break;
    case 'cat_voice':
      scores.attention += 15;
      scores.curiosity += 18;
      break;
    case 'dog_bark':
      scores.attention += 36;
      scores.play += 10;
      break;
    case 'dog_yip':
      scores.play += 30;
      scores.attention += 20;
      break;
    case 'dog_howl':
      scores.attention += 30;
      scores.curiosity += 10;
      scores.stress += 8;
      break;
    case 'dog_growl':
      scores.stress += 56;
      break;
    case 'dog_whine':
      scores.attention += 30;
      scores.stress += 25;
      break;
    case 'dog_voice':
      scores.attention += 18;
      scores.curiosity += 10;
      break;
  }
}

export function createDefaultPetMemory(petId: string): PetMemory {
  return {
    petId,
    routine: DEFAULT_ROUTINE,
    feedbackByTranslationId: {},
    likedTranslationIds: [],
    confirmedEmotionCounts: {},
    categoryFeedback: {},
    updatedAt: Date.now(),
  };
}

export function mergePetRoutine(pet: Pet, memory?: PetMemory): PetRoutine {
  return {
    feedingTimes: pet.routine?.feedingTimes?.length
      ? pet.routine.feedingTimes
      : memory?.routine.feedingTimes?.length
        ? memory.routine.feedingTimes
        : DEFAULT_ROUTINE.feedingTimes,
    walkTimes: pet.routine?.walkTimes?.length
      ? pet.routine.walkTimes
      : memory?.routine.walkTimes?.length
        ? memory.routine.walkTimes
        : DEFAULT_ROUTINE.walkTimes,
  };
}

export function scorePetStateFromMemory(params: {
  pet: Pet;
  memory?: PetMemory;
  mode: TranslationMode;
  now?: Date;
  signal?: Partial<LocalAudioSignal>;
  recognition?: PetSoundRecognition;
  language?: 'ru' | 'en';
}): LocalAnalysisReport {
  const { pet, mode } = params;
  const language = params.language || 'ru';
  const now = params.now || new Date();
  const memory = params.memory || createDefaultPetMemory(pet.id);
  const routine = mergePetRoutine(pet, memory);
  const signal = params.signal || {};
  const p = pet.personality;
  const reasons: string[] = [];

  const scores: Record<PetStateCategory, number> = {
    hunger: 24 + trait(p.gluttony) * 34,
    walk: pet.type === 'dog' ? 26 + trait(p.energy) * 22 : 8 + trait(p.curiosity) * 8,
    attention: 22 + trait(p.friendliness) * 18 + trait(p.drama) * 10,
    play: 18 + trait(p.energy) * 28 + trait(p.curiosity) * 14,
    rest: 18 + trait(p.laziness) * 40,
    stress: 12 + trait(p.drama) * 22,
    curiosity: 16 + trait(p.curiosity) * 32 + trait(p.intelligence) * 10,
  };

  const feedingDistance = minutesUntilNearest(routine.feedingTimes, now);
  if (feedingDistance !== null && feedingDistance <= 75) {
    scores.hunger += 26 - feedingDistance / 4;
    addReason(reasons, 'сейчас близко к обычному времени кормления');
  }

  const walkDistance = minutesUntilNearest(routine.walkTimes, now);
  if (pet.type === 'dog' && walkDistance !== null && walkDistance <= 90) {
    scores.walk += 25 - walkDistance / 5;
    addReason(reasons, 'сейчас близко к обычному времени прогулки');
  }

  const avgVol = signal.averageVolume ?? 0;
  const peakVol = signal.peakVolume ?? 0;
  const noiseFloor = signal.noiseFloor ?? 0;
  const volumeVariation = signal.volumeVariation ?? 0;
  const sharp = signal.sharpness ?? 0;
  const rep = signal.repetition ?? 0;
  const activeRatio = signal.activeRatio ?? 0;
  const burstCount = signal.burstCount ?? 0;
  const rhythmRegularity = signal.rhythmRegularity ?? 0;
  const signalQuality = signal.signalQuality ?? 0;
  const interval = signal.averageIntervalMs ?? 0;
  const dur = signal.durationSec ?? 0;

  if (mode === 'sound') {
    applyRecognizedSound(scores, reasons, params.recognition, language);

    // expo-audio metering exposes only a loudness envelope. The rules below
    // intentionally use volume, pauses and rhythm; they never claim to know
    // pitch, timbre or the literal meaning of a meow/bark.
    if (signalQuality < 0.3) {
      addReason(reasons, 'звуковых подсказок мало, поэтому это очень осторожная догадка');
    }

    if (pet.type === 'cat' && activeRatio > 0.55 && sharp < 0.18 && dur > 1.2) {
      scores.rest += 14;
      scores.attention += 4;
      addReason(reasons, 'долгий ровный звук без резких скачков');
    }

    if (pet.type === 'dog' && burstCount >= 3 && interval > 0 && interval < 750) {
      scores.attention += 12;
      scores.stress += peakVol > 0.72 ? 9 : 3;
      addReason(reasons, 'несколько близких звуков подряд');
    }

    if (sharp > 0.42 || volumeVariation > 0.26) {
      scores.play += 8;
      scores.stress += 7;
      addReason(reasons, 'громкость быстро менялась');
    }

    if (rep > 0.45 && burstCount >= 3) {
      scores.attention += 10;
      scores.play += 7;
      addReason(reasons, 'слышна серия отдельных повторяющихся звуков');
    }

    if (peakVol - noiseFloor > 0.6 || peakVol > 0.82) {
      scores.stress += 10;
      scores.attention += 5;
      addReason(reasons, 'есть очень громкий всплеск');
    }

    if (dur > 4 && activeRatio > 0.35) {
      scores.attention += 8;
      scores.stress += 3;
      addReason(reasons, 'звук длился несколько секунд');
    }

    if (avgVol < 0.28 && sharp < 0.16 && signalQuality >= 0.3) {
      scores.rest += 12;
      addReason(reasons, 'звук был тихим и ровным');
    }

    if (interval > 0 && interval < 350 && burstCount >= 3) {
      scores.play += 10;
      scores.stress += 5;
      addReason(reasons, 'звуки повторялись очень быстро');
    } else if (interval >= 350 && interval < 1100 && rhythmRegularity > 0.35) {
      scores.attention += 11;
      addReason(reasons, 'звуки повторялись в похожем ритме');
    } else if (interval >= 1100 && burstCount >= 2) {
      scores.hunger += 5;
      scores.curiosity += 6;
      addReason(reasons, 'между отдельными звуками были длинные паузы');
    }

    if (activeRatio > 0.65 && sharp > 0.28) {
      scores.play += 7;
      scores.stress += 5;
      addReason(reasons, 'почти вся запись заполнена активным звуком');
    }

    if (activeRatio < 0.25 && burstCount === 1 && signalQuality >= 0.3) {
      scores.curiosity += 8;
      scores.attention += 4;
      addReason(reasons, 'слышен один короткий звук');
    }
  }

  STATES.forEach((state) => {
    const confirmed = memory.confirmedEmotionCounts[state] || 0;
    if (confirmed > 0) {
      scores[state] += Math.min(18, confirmed * 4);
      addReason(reasons, `пользователь раньше подтверждал состояние «${STATE_LABELS[state]}»`);
    }

    const feedback = memory.categoryFeedback[state];
    if (feedback) {
      scores[state] += Math.min(18, feedback.similar * 5 + feedback.liked * 3);
      scores[state] -= Math.min(20, feedback.notSimilar * 7);
      if (feedback.similar > 0 || feedback.liked > 0) {
        addReason(reasons, 'ранее пользователь отмечал похожие переводы как удачные');
      }
    }
  });

  if (mode === 'photo') {
    scores.curiosity += 8;
    scores.rest += 5;
    addReason(reasons, 'фото оценивается по позе и общему контексту');
  }

  if (mode === 'video') {
    scores.play += 8;
    scores.curiosity += 8;
    addReason(reasons, 'видео учитывает движение и тайминг реплик');
  }

  const maxScore = Math.max(...STATES.map((state) => scores[state]));
  const weights = STATES.reduce((acc, state) => {
    acc[state] = Math.exp((scores[state] - maxScore) / 16);
    return acc;
  }, {} as Record<PetStateCategory, number>);
  const weightTotal = STATES.reduce((sum, state) => sum + weights[state], 0);
  const probabilities = STATES.reduce((acc, state) => {
    acc[state] = Math.max(1, Math.round((weights[state] / weightTotal) * 100));
    return acc;
  }, {} as Record<PetStateCategory, number>);

  const primaryState = STATES.reduce((best, state) => (
    scores[state] > scores[best] ? state : best
  ), 'attention' as PetStateCategory);

  if (reasons.length === 0) {
    addReason(reasons, 'использованы характер питомца и время суток');
  }

  const hour = now.getHours();
  const timeContext = language === 'en'
    ? (hour < 6 ? 'night' : hour < 12 ? 'morning' : hour < 18 ? 'day' : 'evening')
    : (hour < 6 ? 'ночь' : hour < 12 ? 'утро' : hour < 18 ? 'день' : 'вечер');

  const sortedScores = STATES.map((state) => scores[state]).sort((a, b) => b - a);
  const scoreGap = sortedScores[0] - sortedScores[1];
  const clueStrength = Math.min(
    88,
    Math.max(
      24,
      Math.round(
        38
        + scoreGap * 0.9
        + Math.min(12, reasons.length * 2)
        + (mode === 'sound' ? signalQuality * 18 : 8)
        + (params.recognition?.status === 'recognized'
          ? Math.min(20, (params.recognition.top?.score || 0) * 28)
          : 0)
      )
    )
  );

  return {
    mode,
    primaryState,
    emotion: (language === 'en' ? STATE_LABELS_EN : STATE_LABELS)[primaryState],
    confidence: clueStrength,
    probabilities,
    features: {
      durationSec: signal.durationSec,
      averageVolume: signal.averageVolume,
      peakVolume: signal.peakVolume,
      noiseFloor: signal.noiseFloor,
      volumeVariation: signal.volumeVariation,
      sharpness: signal.sharpness,
      repetition: signal.repetition,
      activeRatio: signal.activeRatio,
      burstCount: signal.burstCount,
      rhythmRegularity: signal.rhythmRegularity,
      signalQuality: signal.signalQuality,
      averageIntervalMs: signal.averageIntervalMs,
      recognizedSound: params.recognition?.top?.label,
      recognitionScore: params.recognition?.top?.score,
      recognitionWindows: params.recognition?.audio.analyzedWindowCount,
      recognitionModel: params.recognition?.model.id,
      timeContext,
    },
    reasons: reasons.slice(0, 8).map((reason) => localizeReason(reason, language)),
    timeContext,
    recognition: params.recognition,
  };
}
