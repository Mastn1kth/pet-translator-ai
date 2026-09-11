import { Achievement } from '../types';

export const DEFAULT_ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first_translation',
    title: 'Первый перевод',
    description: 'Ты сделал первый перевод!',
    emoji: '🎯',
    isUnlocked: false,
    requirement: 1,
    type: 'translations',
  },
  {
    id: 'ten_translations',
    title: '10 переводов',
    description: 'Настоящий переводчик!',
    emoji: '🔟',
    isUnlocked: false,
    requirement: 10,
    type: 'translations',
  },
  {
    id: 'fifty_translations',
    title: '50 переводов',
    description: 'Эксперт по питомцам',
    emoji: '🏆',
    isUnlocked: false,
    requirement: 50,
    type: 'translations',
  },
  {
    id: 'hundred_translations',
    title: '100 переводов',
    description: 'Легенда!',
    emoji: '💯',
    isUnlocked: false,
    requirement: 100,
    type: 'translations',
  },
  {
    id: 'first_meme',
    title: 'Первый мем',
    description: 'Мемный повелитель!',
    emoji: '😂',
    isUnlocked: false,
    requirement: 1,
    type: 'memes',
  },
  {
    id: 'week_streak',
    title: 'Неделя подряд',
    description: '7 дней без пропусков!',
    emoji: '🔥',
    isUnlocked: false,
    requirement: 7,
    type: 'streak',
  },
  {
    id: 'month_streak',
    title: 'Месяц подряд',
    description: '30 дней! Ты невероятен!',
    emoji: '🌟',
    isUnlocked: false,
    requirement: 30,
    type: 'streak',
  },
];

export function checkAchievements(
  achievements: Achievement[],
  totalTranslations: number,
  totalMemes: number,
  streak: number
): string[] {
  const newlyUnlocked: string[] = [];

  achievements.forEach((a) => {
    if (a.isUnlocked) return;
    if (a.type === 'translations' && totalTranslations >= a.requirement) {
      newlyUnlocked.push(a.id);
    }
    if (a.type === 'memes' && totalMemes >= a.requirement) {
      newlyUnlocked.push(a.id);
    }
    if (a.type === 'streak' && streak >= a.requirement) {
      newlyUnlocked.push(a.id);
    }
  });

  return newlyUnlocked;
}