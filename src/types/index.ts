export type PetType = 'cat' | 'dog';
export type PetGender = 'male' | 'female';
export type PetStateCategory =
  | 'hunger'
  | 'walk'
  | 'attention'
  | 'play'
  | 'rest'
  | 'stress'
  | 'curiosity';

export interface PetPersonality {
  arrogance: number;
  curiosity: number;
  laziness: number;
  friendliness: number;
  intelligence: number;
  drama: number;
  gluttony: number;
  energy: number;
}

export interface Pet {
  id: string;
  name: string;
  type: PetType;
  breed?: string;
  age?: number;
  gender: PetGender;
  photo?: string;
  personality: PetPersonality;
  routine?: PetRoutine;
  createdAt: number;
}

export interface PetRoutine {
  feedingTimes: string[];
  walkTimes: string[];
}

export type TranslationMode = 'sound' | 'photo' | 'video';

export interface AudioFeatures {
  duration: number;
  volume: number;
  peaks: number;
  avgFrequency: number;
  energy: number;
}

export interface LocalAudioSignal {
  durationSec: number;
  averageVolume: number;
  peakVolume: number;
  noiseFloor: number;
  volumeVariation: number;
  sharpness: number;
  repetition: number;
  activeRatio: number;
  burstCount: number;
  rhythmRegularity: number;
  signalQuality: number;
  averageIntervalMs?: number;
}

export type PetSoundLabel =
  | 'cat_voice'
  | 'cat_purr'
  | 'cat_meow'
  | 'cat_hiss'
  | 'cat_yowl'
  | 'dog_voice'
  | 'dog_bark'
  | 'dog_yip'
  | 'dog_howl'
  | 'dog_growl'
  | 'dog_whine';

export type PetSoundRecognitionStatus =
  | 'recognized'
  | 'low_confidence'
  | 'no_pet_sound'
  | 'wrong_species'
  | 'too_short';

export interface PetSoundScore {
  label: PetSoundLabel;
  sourceLabel: string;
  species: PetType;
  score: number;
}

export interface PetSoundEvent extends PetSoundScore {
  startMs: number;
  endMs: number;
}

export interface PetSoundRecognition {
  status: PetSoundRecognitionStatus;
  expectedSpecies: PetType;
  detectedSpecies?: PetType;
  top?: PetSoundScore;
  scores: PetSoundScore[];
  events: PetSoundEvent[];
  strength: 'tentative' | 'clear';
  model: {
    id: 'yamnet';
    version: '1';
    inputSampleRateHz: 16000;
    inputSampleCount: 15600;
  };
  audio: {
    durationMs: number;
    analyzedWindowCount: number;
    signalQuality: number;
  };
}

export interface LocalAnalysisReport {
  mode: TranslationMode;
  primaryState: PetStateCategory;
  emotion: string;
  confidence: number;
  probabilities: Record<PetStateCategory, number>;
  features: Record<string, number | string | undefined>;
  reasons: string[];
  timeContext: string;
  recognition?: PetSoundRecognition;
}

export interface TranslationFeedback {
  translationId: string;
  petId: string;
  liked: boolean;
  accuracy: 'similar' | 'not_similar' | null;
  confirmedEmotion?: PetStateCategory;
  createdAt: number;
}

export interface CategoryFeedbackStats {
  liked: number;
  similar: number;
  notSimilar: number;
}

export interface PetMemory {
  petId: string;
  routine: PetRoutine;
  feedbackByTranslationId: Record<string, TranslationFeedback>;
  likedTranslationIds: string[];
  confirmedEmotionCounts: Partial<Record<PetStateCategory, number>>;
  categoryFeedback: Partial<Record<PetStateCategory, CategoryFeedbackStats>>;
  updatedAt: number;
}

export type ARFilterId =
  | 'none'
  | 'glasses'
  | 'crown'
  | 'pirate'
  | 'detective'
  | 'billionaire'
  | 'cowboy'
  | 'astronaut'
  | 'emperor'
  | 'king'
  | 'gigachad'
  | 'villain'
  | 'clown';

export interface VideoCaptionCue {
  id: string;
  startMs: number;
  endMs: number;
  text: string;
}

export type PetVisionLabel = 'cat' | 'dog' | 'unknown';

export interface PetVisionObservation {
  label: PetVisionLabel;
  confidence: number;
  bbox?: {
    top: number;
    left: number;
    bottom: number;
    right: number;
  };
  center?: {
    x: number;
    y: number;
  };
  frameTimestamp?: number;
  source: 'live-camera' | 'model';
}

export interface VideoMemeProject {
  id: string;
  petId?: string;
  sourceUri: string;
  outputUri?: string;
  templateId: string;
  filterId: ARFilterId;
  captions: VideoCaptionCue[];
  modelObservations?: PetVisionObservation[];
  createdAt: number;
  exportedAt?: number;
}

export interface TranslationResult {
  id: string;
  petId: string;
  petName: string;
  petType: PetType;
  mode: TranslationMode;
  mood: string;
  moodEmoji: string;
  category: string;
  translation: string;
  thoughts: string;
  story: string;
  character: CharacterStyle;
  intensity: number;
  createdAt: number;
  mediaUri?: string;
  analysis?: LocalAnalysisReport;
  feedback?: TranslationFeedback;
  memeProjectId?: string;
}

export type CharacterStyle =
  | 'default'
  | 'emperor'
  | 'philosopher'
  | 'scientist'
  | 'detective'
  | 'pirate'
  | 'gangster'
  | 'superhero'
  | 'billionaire'
  | 'knight'
  | 'wizard'
  | 'gigachad'
  | 'sigma'
  | 'alphacat'
  | 'mafia'
  | 'grandpa'
  | 'toxic'
  | 'professor'
  | 'streamer'
  | 'hood'
  | 'anime'
  | 'general'
  | 'elon'
  | 'shrek'
  | 'royal'
  | 'deep'
  | 'scientific'
  | 'investigative'
  | 'street';

export interface Character {
  id: CharacterStyle;
  name: string;
  emoji: string;
  description: string;
  isViral?: boolean;
  color?: string;
  speechStyle?: string;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  emoji: string;
  isUnlocked: boolean;
  unlockedAt?: number;
  requirement: number;
  type: 'translations' | 'memes' | 'photos' | 'videos' | 'streak' | 'special';
}

export interface AppStats {
  totalTranslations: number;
  totalMemes: number;
  totalPhotos: number;
  totalVideos: number;
  currentStreak: number;
  longestStreak: number;
  lastActiveDate: string;
  totalXP: number;
  petLevel: number;
}

export interface AppState {
  pets: Pet[];
  translations: TranslationResult[];
  petMemories: Record<string, PetMemory>;
  memeProjects: VideoMemeProject[];
  achievements: Achievement[];
  selectedCharacter: CharacterStyle;
  selectedPetId: string | null;
  theme: 'light' | 'dark';
  language: 'ru' | 'en';
  stats: AppStats;

  addPet: (pet: Pet) => void;
  updatePet: (petId: string, updates: Partial<Omit<Pet, 'id' | 'createdAt'>>) => void;
  removePet: (id: string) => void;
  addTranslation: (result: TranslationResult) => void;
  updatePetRoutine: (petId: string, routine: PetRoutine) => void;
  saveTranslationFeedback: (feedback: TranslationFeedback) => void;
  getPetMemory: (petId: string) => PetMemory;
  addMemeProject: (project: VideoMemeProject) => void;
  markMemeProjectExported: (projectId: string, outputUri: string) => void;
  setCharacter: (character: CharacterStyle) => void;
  setSelectedPetId: (petId: string | null) => void;
  toggleTheme: () => void;
  setLanguage: (language: 'ru' | 'en') => void;

  awardXP: (amount: number) => void;
  incrementMemeCount: () => void;
}
