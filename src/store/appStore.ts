import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  AppState,
  Achievement,
  PetMemory,
  PetRoutine,
  PetStateCategory,
  TranslationFeedback,
  VideoMemeProject,
} from '../types';
import { DEFAULT_ACHIEVEMENTS, checkAchievements } from '../engine/achievementsEngine';
import { createDefaultPetMemory } from '../engine/petMemoryEngine';

const STORAGE_KEY = 'pet_translator_state';
const PET_STATES: PetStateCategory[] = ['hunger', 'walk', 'attention', 'play', 'rest', 'stress', 'curiosity'];

function getTodayString() {
  return new Date().toDateString();
}

function daysBetween(prev: string, next: string): number {
  if (!prev) return 999;
  const a = new Date(prev);
  const b = new Date(next);
  a.setHours(0, 0, 0, 0);
  b.setHours(0, 0, 0, 0);
  return Math.round((b.getTime() - a.getTime()) / 86400000);
}

function unlockByIds(achievements: Achievement[], ids: string[]): Achievement[] {
  if (ids.length === 0) return achievements;
  const now = Date.now();
  return achievements.map((a) =>
    ids.includes(a.id) && !a.isUnlocked ? { ...a, isUnlocked: true, unlockedAt: now } : a
  );
}

function reportStorageError(action: string, error: unknown) {
  const message = error instanceof Error ? error.message : String(error);
  console.warn(`[AppStore] Failed to ${action}: ${message}`);
}

async function loadFromStorage(): Promise<Partial<AppState> | null> {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEY);
    if (data) return JSON.parse(data);
  } catch (error) {
    reportStorageError('load saved state', error);
  }
  return null;
}

async function saveToStorage(state: Partial<AppState>) {
  try {
    const toSave = {
      pets: state.pets,
      translations: state.translations,
      petMemories: state.petMemories,
      memeProjects: state.memeProjects,
      achievements: state.achievements,
      selectedCharacter: state.selectedCharacter,
      selectedPetId: state.selectedPetId,
      theme: state.theme,
      language: state.language,
      stats: state.stats,
    };
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
  } catch (error) {
    reportStorageError('save state', error);
  }
}

let storageSaveQueue: Promise<void> = Promise.resolve();

function queueSaveToStorage(state: Partial<AppState>) {
  const snapshot = {
    pets: state.pets,
    translations: state.translations,
    petMemories: state.petMemories,
    memeProjects: state.memeProjects,
    achievements: state.achievements,
    selectedCharacter: state.selectedCharacter,
    selectedPetId: state.selectedPetId,
    theme: state.theme,
    language: state.language,
    stats: state.stats,
  };

  storageSaveQueue = storageSaveQueue.then(
    () => saveToStorage(snapshot),
    () => saveToStorage(snapshot)
  );
  storageSaveQueue.catch(() => {});
}

function isLegacyGeneratedRoutine(routine?: PetRoutine): boolean {
  return (
    routine?.feedingTimes?.length === 2
    && routine.feedingTimes[0] === '08:00'
    && routine.feedingTimes[1] === '18:00'
    && routine?.walkTimes?.length === 2
    && routine.walkTimes[0] === '09:00'
    && routine.walkTimes[1] === '20:00'
  );
}

function savedRoutineOrEmpty(petId: string, routine?: PetRoutine): PetRoutine {
  if (!routine || isLegacyGeneratedRoutine(routine)) {
    return createDefaultPetMemory(petId).routine;
  }
  return routine;
}

function createMemoriesForPets(pets: Array<{ id: string; routine?: PetRoutine }>, saved?: Record<string, PetMemory>) {
  const quickMemories = Object.entries(saved || {}).reduce((acc, [petId, existing]) => {
    if (petId !== 'quick-cat' && petId !== 'quick-dog') return acc;
    acc[petId] = {
      ...createDefaultPetMemory(petId),
      ...existing,
      routine: savedRoutineOrEmpty(petId, existing.routine),
      feedbackByTranslationId: existing.feedbackByTranslationId || {},
      likedTranslationIds: existing.likedTranslationIds || [],
      confirmedEmotionCounts: existing.confirmedEmotionCounts || {},
      categoryFeedback: existing.categoryFeedback || {},
    };
    return acc;
  }, {} as Record<string, PetMemory>);

  return pets.reduce((acc, pet) => {
    const existing = saved?.[pet.id];
    acc[pet.id] = {
      ...createDefaultPetMemory(pet.id),
      ...existing,
      routine: pet.routine || savedRoutineOrEmpty(pet.id, existing?.routine),
      feedbackByTranslationId: existing?.feedbackByTranslationId || {},
      likedTranslationIds: existing?.likedTranslationIds || [],
      confirmedEmotionCounts: existing?.confirmedEmotionCounts || {},
      categoryFeedback: existing?.categoryFeedback || {},
      updatedAt: existing?.updatedAt || Date.now(),
    };
    return acc;
  }, quickMemories);
}

function getFeedbackCategory(feedback: TranslationFeedback, translationCategory?: string): PetStateCategory | null {
  if (feedback.confirmedEmotion && PET_STATES.includes(feedback.confirmedEmotion)) return feedback.confirmedEmotion;
  if (translationCategory && PET_STATES.includes(translationCategory as PetStateCategory)) {
    return translationCategory as PetStateCategory;
  }
  return null;
}

const MAX_STORED_FEEDBACK_PER_PET = 150;

function pruneFeedbackMap(
  map: Record<string, TranslationFeedback>
): Record<string, TranslationFeedback> {
  const entries = Object.entries(map);
  if (entries.length <= MAX_STORED_FEEDBACK_PER_PET) return map;
  entries.sort((a, b) => b[1].createdAt - a[1].createdAt);
  return Object.fromEntries(entries.slice(0, MAX_STORED_FEEDBACK_PER_PET));
}

export const useAppStore = create<AppState>((set, get) => ({
  pets: [],
  translations: [],
  petMemories: {},
  memeProjects: [],
  achievements: DEFAULT_ACHIEVEMENTS,
  selectedCharacter: 'default',
  selectedPetId: null,
  theme: 'light',
  language: 'ru',
  stats: {
    totalTranslations: 0,
    totalMemes: 0,
    totalPhotos: 0,
    totalVideos: 0,
    currentStreak: 0,
    longestStreak: 0,
    lastActiveDate: '',
    totalXP: 0,
    petLevel: 1,
  },

  addPet: (pet) => {
    set((s) => ({
      pets: [...s.pets, pet],
      selectedPetId: pet.id,
      petMemories: {
        ...s.petMemories,
        [pet.id]: {
          ...createDefaultPetMemory(pet.id),
          routine: pet.routine || createDefaultPetMemory(pet.id).routine,
        },
      },
    }));
    queueSaveToStorage(get());
  },

  updatePet: (petId, updates) => {
    set((s) => ({
      pets: s.pets.map((pet) => (pet.id === petId ? { ...pet, ...updates } : pet)),
    }));
    queueSaveToStorage(get());
  },

  removePet: (id) => {
    set((s) => {
      const { [id]: _removed, ...nextMemories } = s.petMemories;
      return {
        pets: s.pets.filter((p) => p.id !== id),
        selectedPetId: s.selectedPetId === id ? s.pets.find((p) => p.id !== id)?.id || null : s.selectedPetId,
        petMemories: nextMemories,
        translations: s.translations.filter((t) => t.petId !== id),
      };
    });
    queueSaveToStorage(get());
  },

  addTranslation: (result) => {
    set((s) => {
      const today = getTodayString();
      const diff = daysBetween(s.stats.lastActiveDate, today);
      const currentStreak = diff === 0 ? s.stats.currentStreak : diff === 1 ? s.stats.currentStreak + 1 : 1;
      const nextStats = {
        ...s.stats,
        totalTranslations: s.stats.totalTranslations + 1,
        totalPhotos: result.mode === 'photo' ? s.stats.totalPhotos + 1 : s.stats.totalPhotos,
        totalVideos: result.mode === 'video' ? s.stats.totalVideos + 1 : s.stats.totalVideos,
        currentStreak,
        longestStreak: Math.max(s.stats.longestStreak, currentStreak),
        lastActiveDate: today,
      };
      const newlyUnlocked = checkAchievements(
        s.achievements,
        nextStats.totalTranslations,
        nextStats.totalMemes,
        nextStats.currentStreak
      );
      return {
        translations: [result, ...s.translations].slice(0, 100),
        petMemories: s.petMemories[result.petId]
          ? s.petMemories
          : { ...s.petMemories, [result.petId]: createDefaultPetMemory(result.petId) },
        stats: nextStats,
        achievements: unlockByIds(s.achievements, newlyUnlocked),
      };
    });
    queueSaveToStorage(get());
  },

  updatePetRoutine: (petId, routine) => {
    set((s) => {
      const current = s.petMemories[petId] || createDefaultPetMemory(petId);
      return {
        pets: s.pets.map((pet) => (pet.id === petId ? { ...pet, routine } : pet)),
        petMemories: {
          ...s.petMemories,
          [petId]: {
            ...current,
            routine,
            updatedAt: Date.now(),
          },
        },
      };
    });
    queueSaveToStorage(get());
  },

  saveTranslationFeedback: (feedback) => {
    set((s) => {
      const translation = s.translations.find((item) => item.id === feedback.translationId);
      const current = s.petMemories[feedback.petId] || createDefaultPetMemory(feedback.petId);
      const previousFeedback =
        current.feedbackByTranslationId[feedback.translationId] || translation?.feedback;
      const category = getFeedbackCategory(feedback, translation?.category);
      const previousCategory = previousFeedback
        ? getFeedbackCategory(previousFeedback, translation?.category)
        : null;
      const categoryFeedback = { ...current.categoryFeedback };
      const confirmedEmotionCounts = { ...current.confirmedEmotionCounts };

      if (previousFeedback && previousCategory) {
        const stats = categoryFeedback[previousCategory] || { liked: 0, similar: 0, notSimilar: 0 };
        categoryFeedback[previousCategory] = {
          liked: Math.max(0, stats.liked - (previousFeedback.liked ? 1 : 0)),
          similar: Math.max(0, stats.similar - (previousFeedback.accuracy === 'similar' ? 1 : 0)),
          notSimilar: Math.max(0, stats.notSimilar - (previousFeedback.accuracy === 'not_similar' ? 1 : 0)),
        };
      }

      if (category) {
        const stats = categoryFeedback[category] || { liked: 0, similar: 0, notSimilar: 0 };
        categoryFeedback[category] = {
          liked: stats.liked + (feedback.liked ? 1 : 0),
          similar: stats.similar + (feedback.accuracy === 'similar' ? 1 : 0),
          notSimilar: stats.notSimilar + (feedback.accuracy === 'not_similar' ? 1 : 0),
        };
      }

      if (previousFeedback?.confirmedEmotion) {
        confirmedEmotionCounts[previousFeedback.confirmedEmotion] = Math.max(
          0,
          (confirmedEmotionCounts[previousFeedback.confirmedEmotion] || 0) - 1
        );
      }

      if (feedback.confirmedEmotion) {
        confirmedEmotionCounts[feedback.confirmedEmotion] =
          (confirmedEmotionCounts[feedback.confirmedEmotion] || 0) + 1;
      }

      const likedSet = new Set(current.likedTranslationIds);
      if (feedback.liked) likedSet.add(feedback.translationId);
      else likedSet.delete(feedback.translationId);

      return {
        translations: s.translations.map((item) =>
          item.id === feedback.translationId ? { ...item, feedback } : item
        ),
        petMemories: {
          ...s.petMemories,
          [feedback.petId]: {
            ...current,
            feedbackByTranslationId: pruneFeedbackMap({
              ...current.feedbackByTranslationId,
              [feedback.translationId]: feedback,
            }),
            likedTranslationIds: Array.from(likedSet),
            confirmedEmotionCounts,
            categoryFeedback,
            updatedAt: Date.now(),
          },
        },
      };
    });
    queueSaveToStorage(get());
  },

  getPetMemory: (petId) => {
    const existing = get().petMemories[petId];
    if (existing) return existing;
    const created = createDefaultPetMemory(petId);
    set((s) => ({ petMemories: { ...s.petMemories, [petId]: created } }));
    queueSaveToStorage(get());
    return created;
  },

  addMemeProject: (project) => {
    set((s) => ({
      memeProjects: [project, ...s.memeProjects].slice(0, 40),
    }));
    queueSaveToStorage(get());
  },

  markMemeProjectExported: (projectId, outputUri) => {
    set((s) => ({
      memeProjects: s.memeProjects.map((project) =>
        project.id === projectId ? { ...project, outputUri, exportedAt: Date.now() } : project
      ),
    }));
    queueSaveToStorage(get());
  },

  setCharacter: (character) => {
    set({ selectedCharacter: character });
    queueSaveToStorage(get());
  },

  setSelectedPetId: (petId) => {
    set({ selectedPetId: petId });
    queueSaveToStorage(get());
  },

  toggleTheme: () => {
    set((s) => ({ theme: s.theme === 'dark' ? 'light' : 'dark' }));
    queueSaveToStorage(get());
  },

  setLanguage: (language) => {
    set({ language });
    queueSaveToStorage(get());
  },

  incrementMemeCount: () => {
    set((s) => {
      const today = getTodayString();
      const diff = daysBetween(s.stats.lastActiveDate, today);
      const currentStreak = diff === 0 ? s.stats.currentStreak : diff === 1 ? s.stats.currentStreak + 1 : 1;
      const nextStats = {
        ...s.stats,
        totalMemes: s.stats.totalMemes + 1,
        currentStreak,
        longestStreak: Math.max(s.stats.longestStreak, currentStreak),
        lastActiveDate: today,
      };
      const newlyUnlocked = checkAchievements(
        s.achievements,
        nextStats.totalTranslations,
        nextStats.totalMemes,
        nextStats.currentStreak
      );
      return {
        stats: nextStats,
        achievements: unlockByIds(s.achievements, newlyUnlocked),
      };
    });
    queueSaveToStorage(get());
  },

  awardXP: (amount: number) => {
    set((s) => {
      const newTotalXP = s.stats.totalXP + amount;
      // Простой расчёт уровня: каждые 100 XP = 1 уровень
      const newLevel = Math.floor(newTotalXP / 100) + 1;
      return {
        stats: {
          ...s.stats,
          totalXP: newTotalXP,
          petLevel: newLevel,
        },
      };
    });
    queueSaveToStorage(get());
  },

}));

export async function initStore() {
  const saved = await loadFromStorage();
  if (saved) {
    useAppStore.setState((s) => ({
      ...s,
      pets: saved.pets || [],
      translations: saved.translations || [],
      petMemories: createMemoriesForPets(saved.pets || [], saved.petMemories as Record<string, PetMemory> | undefined),
      memeProjects: (saved.memeProjects || []) as VideoMemeProject[],
      achievements: saved.achievements || DEFAULT_ACHIEVEMENTS,
      selectedCharacter: saved.selectedCharacter || 'default',
      selectedPetId: saved.selectedPetId || null,
      theme: saved.theme || s.theme,
      language: saved.language || s.language,
      stats: { ...s.stats, ...saved.stats },
    }));
  }
}
