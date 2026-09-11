import {
  CharacterStyle,
  LocalAnalysisReport,
  LocalAudioSignal,
  Pet,
  PetMemory,
  PetSoundRecognition,
  PetStateCategory,
  TranslationResult,
} from '../types';
import { applyCharacterStyle } from './characterEngine';
import { analyzePhotoPose, PhotoPoseInput } from './photoPoseEngine';
import { buildVideoTimeline, VideoTimelineInput } from './videoTimelineEngine';
import { scorePetStateFromMemory } from './petMemoryEngine';

const STATE_EMOJI: Record<PetStateCategory, string> = {
  hunger: '🍽️',
  walk: '🦮',
  attention: '🥺',
  play: '🎾',
  rest: '😴',
  stress: '😟',
  curiosity: '🔎',
};

const STATE_MOOD: Record<PetStateCategory, string> = {
  hunger: 'Голод / ожидание еды',
  walk: 'Хочет гулять',
  attention: 'Просит внимания',
  play: 'Игривое настроение',
  rest: 'Расслабленность',
  stress: 'Настороженность',
  curiosity: 'Любопытство',
};

const STATE_MOOD_EN: Record<PetStateCategory, string> = {
  hunger: 'Waiting for food',
  walk: 'Wants a walk',
  attention: 'Wants attention',
  play: 'Playful mood',
  rest: 'Calm and relaxed',
  stress: 'Feeling unsure',
  curiosity: 'Curious',
};

const PHRASES: Record<PetStateCategory, string[]> = {
  hunger: [
    'Похоже, сейчас особенно интересна миска.',
    'Кажется, питомец ждёт вкусняшку.',
    'Возможно, пора вместе со взрослым проверить миску.',
  ],
  walk: [
    'Кажется, пора собираться на прогулку.',
    'Питомец поглядывает на дверь и ждёт улицу.',
    'Возможно, питомец напоминает про поводок.',
  ],
  attention: [
    'Кажется, питомец хочет побыть рядом.',
    'Возможно, сейчас нужны ласка и внимание.',
    'Питомец будто говорит: «Заметь меня!»',
  ],
  play: [
    'Энергии много — можно предложить игру.',
    'Кажется, питомец готов побегать за игрушкой.',
    'Похоже, начинается весёлая игра.',
  ],
  rest: [
    'Кажется, питомцу хочется спокойно отдохнуть.',
    'Сейчас тишина и уют важнее шумной игры.',
    'Похоже, наступило время отдыха.',
  ],
  stress: [
    'Питомец может волноваться. Говори спокойно и позови взрослого.',
    'Кажется, питомцу сейчас нужны тишина и безопасное место.',
    'Что-то могло насторожить питомца. Не делай резких движений.',
  ],
  curiosity: [
    'Питомец внимательно изучает всё вокруг.',
    'Это больше похоже на интерес, чем на просьбу.',
    'Любопытный нос решил всё проверить.',
  ],
};

const PHRASES_EN: Record<PetStateCategory, string[]> = {
  hunger: [
    'The bowl seems especially interesting right now.',
    'Your pet may be waiting for a treat.',
    'Perhaps it is time to check the bowl with a grown-up.',
  ],
  walk: [
    'It may be time to get ready for a walk.',
    'Your pet is looking at the door and waiting to go outside.',
    'Perhaps your pet is reminding you about the leash.',
  ],
  attention: [
    'Your pet may want to stay close to you.',
    'A little care and attention may be needed.',
    'Your pet seems to be saying, “Look at me!”',
  ],
  play: [
    'There is lots of energy — you could offer a toy.',
    'Your pet may be ready to chase a toy.',
    'A fun game may be about to begin.',
  ],
  rest: [
    'Your pet may want a quiet rest.',
    'Quiet and comfort seem better than a noisy game right now.',
    'It may be nap time.',
  ],
  stress: [
    'Your pet may be worried. Speak softly and tell a grown-up.',
    'Your pet may need a quiet and safe place.',
    'Something may have startled your pet. Avoid sudden movements.',
  ],
  curiosity: [
    'Your pet is carefully exploring everything nearby.',
    'This looks more like curiosity than a request.',
    'A curious nose wants to check everything.',
  ],
};

function pickByConfidence<T>(items: T[], confidence: number): T {
  const index = Math.min(items.length - 1, Math.max(0, Math.floor((confidence / 100) * items.length)));
  return items[index] || items[0];
}

function buildStory(pet: Pet, analysis: LocalAnalysisReport, language: 'ru' | 'en'): string {
  const reasons = analysis.reasons.slice(0, 2).join(', ');
  if (language === 'en') {
    return `${pet.name} helps the app remember familiar habits. Our playful guess is ${analysis.emotion}. We noticed: ${reasons}.`;
  }
  return `${pet.name} помогает приложению запоминать свои привычки. Сейчас кажется, что это ${analysis.emotion}. Мы заметили: ${reasons}.`;
}

function buildThoughts(pet: Pet, analysis: LocalAnalysisReport, language: 'ru' | 'en'): string {
  if (language === 'en') {
    if (analysis.primaryState === 'hunger') return `${pet.name} thinks, “If you can hear the bowl too, we understand each other.”`;
    if (analysis.primaryState === 'walk') return `${pet.name} thinks, “Is my person ready for our route?”`;
    if (analysis.primaryState === 'play') return `${pet.name} thinks, “Time to move — let us make it fun!”`;
    if (analysis.primaryState === 'rest') return `${pet.name} thinks, “The world can wait while I recharge.”`;
    if (analysis.primaryState === 'stress') return `${pet.name} thinks, “Stay close and move gently.”`;
    return `${pet.name} thinks, “I see everything and I am checking every clue.”`;
  }
  if (analysis.primaryState === 'hunger') return `${pet.name} думает: «Если ты тоже слышишь миску, мы понимаем друг друга».`;
  if (analysis.primaryState === 'walk') return `${pet.name} думает: «Проверяю, готов ли человек к маршруту».`;
  if (analysis.primaryState === 'play') return `${pet.name} думает: «Сейчас будет движение. Желательно весёлое».`;
  if (analysis.primaryState === 'rest') return `${pet.name} думает: «Мир подождёт, я заряжаюсь».`;
  if (analysis.primaryState === 'stress') return `${pet.name} думает: «Будь рядом и без резких движений».`;
  return `${pet.name} думает: «Я всё вижу, всё запоминаю и делаю выводы».`;
}

function buildResult(
  pet: Pet,
  character: CharacterStyle,
  analysis: LocalAnalysisReport,
  mode: 'sound' | 'photo' | 'video',
  extraTranslation?: string,
  language: 'ru' | 'en' = 'ru'
): Omit<TranslationResult, 'id' | 'createdAt'> {
  const phrases = language === 'en' ? PHRASES_EN : PHRASES;
  const moods = language === 'en' ? STATE_MOOD_EN : STATE_MOOD;
  const basePhrase = extraTranslation || pickByConfidence(phrases[analysis.primaryState], analysis.confidence);
  return {
    petId: pet.id,
    petName: pet.name,
    petType: pet.type,
    mode,
    mood: moods[analysis.primaryState],
    moodEmoji: STATE_EMOJI[analysis.primaryState],
    category: analysis.primaryState,
    translation: applyCharacterStyle(basePhrase, character, language),
    thoughts: buildThoughts(pet, analysis, language),
    story: buildStory(pet, analysis, language),
    character,
    intensity: Math.max(0.08, Math.min(1, analysis.confidence / 100)),
    analysis,
  };
}

export function translatePet(
  pet: Pet,
  character: CharacterStyle = 'default',
  memory?: PetMemory,
  signal?: LocalAudioSignal,
  recognition?: PetSoundRecognition,
  language: 'ru' | 'en' = 'ru'
): Omit<TranslationResult, 'id' | 'createdAt'> {
  if (
    !signal
    || recognition?.status !== 'recognized'
    || recognition.audio.analyzedWindowCount < 1
  ) {
    throw new Error('Sound translation requires a captured signal and a recognized pet sound.');
  }
  const analysis = scorePetStateFromMemory({
    pet,
    memory,
    mode: 'sound',
    signal,
    recognition,
    language,
  });

  return buildResult(pet, character, analysis, 'sound', undefined, language);
}

export function analyzePhoto(
  pet: Pet,
  character: CharacterStyle = 'default',
  memory?: PetMemory,
  input?: PhotoPoseInput,
  language: 'ru' | 'en' = 'ru'
): Omit<TranslationResult, 'id' | 'createdAt'> {
  const photo = analyzePhotoPose(pet, input, memory, language);
  return buildResult(
    pet,
    character,
    photo.analysis,
    'photo',
    language === 'en'
      ? `${photo.interpretation} Mood: ${photo.mood}.`
      : `${photo.interpretation} Настроение: ${photo.mood}.`,
    language
  );
}

export function analyzeVideo(
  pet: Pet,
  character: CharacterStyle = 'default',
  memory?: PetMemory,
  input?: VideoTimelineInput,
  language: 'ru' | 'en' = 'ru'
): Omit<TranslationResult, 'id' | 'createdAt'> & { memeProject: ReturnType<typeof buildVideoTimeline>['project'] } {
  const sourceUri = input?.sourceUri || '';
  const timeline = buildVideoTimeline(pet, { sourceUri, ...input }, memory, language);
  const firstCaption = timeline.captions[0]?.text || (language === 'en' ? 'Are you filming me again?' : 'Ты опять снимаешь меня?');
  return {
    ...buildResult(pet, character, timeline.analysis, 'video', firstCaption, language),
    memeProjectId: timeline.project.id,
    memeProject: timeline.project,
  };
}
