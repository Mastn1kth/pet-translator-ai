import { Character, CharacterStyle } from '../types';

export const CHARACTERS: Character[] = [
  // Базовые персонажи
  {
    id: 'default',
    name: 'Обычный',
    emoji: '🐾',
    description: 'Говорит просто и дружелюбно',
    speechStyle: 'normal',
    color: '#58CC02'
  },
  {
    id: 'emperor',
    name: 'Король',
    emoji: '👑',
    description: 'Говорит важно, как настоящий король',
    speechStyle: 'royal',
    color: '#FFD700'
  },
  {
    id: 'philosopher',
    name: 'Философ',
    emoji: '🧐',
    description: 'Думает о мире и о пустой миске',
    speechStyle: 'deep',
    color: '#8B7355'
  },
  {
    id: 'scientist',
    name: 'Учёный',
    emoji: '🔬',
    description: 'Проверяет каждую догадку',
    speechStyle: 'scientific',
    color: '#3B82F6'
  },
  {
    id: 'detective',
    name: 'Детектив',
    emoji: '🕵️',
    description: 'Ищет улики и раскрывает тайны',
    speechStyle: 'investigative',
    color: '#6B7280'
  },
  {
    id: 'pirate',
    name: 'Пират',
    emoji: '🏴‍☠️',
    description: 'Морские приключения возле миски',
    speechStyle: 'pirate',
    color: '#92400E'
  },

  // ВИРУСНЫЕ ПЕРСОНАЖИ
  {
    id: 'gigachad',
    name: 'Силач',
    emoji: '💪',
    description: 'Говорит смело и уверенно',
    isViral: true,
    speechStyle: 'gigachad',
    color: '#EF4444'
  },
  {
    id: 'sigma',
    name: 'Спокойный герой',
    emoji: '😤',
    description: 'Не спешит и всё делает по-своему',
    isViral: true,
    speechStyle: 'sigma',
    color: '#6366F1'
  },
  {
    id: 'alphacat',
    name: 'Король котов',
    emoji: '🦁',
    description: 'Главный пушистый герой дома',
    isViral: true,
    speechStyle: 'alphacat',
    color: '#F59E0B'
  },
  {
    id: 'billionaire',
    name: 'Хозяин сокровищ',
    emoji: '💰',
    description: 'Считает вкусняшки настоящим богатством',
    isViral: true,
    speechStyle: 'billionaire',
    color: '#10B981'
  },
  {
    id: 'streamer',
    name: 'Весёлый ведущий',
    emoji: '🎮',
    description: 'Объявляет каждое событие как шоу',
    isViral: true,
    speechStyle: 'streamer',
    color: '#8B5CF6'
  },
  {
    id: 'grandpa',
    name: 'Дедушка',
    emoji: '👴',
    description: 'Рассказывает добрые истории из прошлого',
    isViral: true,
    speechStyle: 'grandpa',
    color: '#78716C'
  },
  {
    id: 'toxic',
    name: 'Ворчун',
    emoji: '☠️',
    description: 'Немного бурчит, но никого не обижает',
    isViral: true,
    speechStyle: 'toxic',
    color: '#22C55E'
  },
  {
    id: 'professor',
    name: 'Профессор',
    emoji: '🎓',
    description: 'Объясняет всё как на весёлом уроке',
    isViral: true,
    speechStyle: 'professor',
    color: '#0EA5E9'
  },
  {
    id: 'hood',
    name: 'Дворовый герой',
    emoji: '🧢',
    description: 'Знает все тайные тропинки двора',
    isViral: true,
    speechStyle: 'hood',
    color: '#DC2626'
  },
  {
    id: 'mafia',
    name: 'Важный босс',
    emoji: '🤵',
    description: 'Раздаёт важные домашние поручения',
    isViral: true,
    speechStyle: 'mafia',
    color: '#1F2937'
  },
  {
    id: 'gangster',
    name: 'Крутой друг',
    emoji: '🕶️',
    description: 'Говорит бодро и по-дружески',
    speechStyle: 'street',
    color: '#374151'
  },
  {
    id: 'anime',
    name: 'Звёздочка',
    emoji: '✨',
    description: 'Добавляет блеск и радостные возгласы',
    isViral: true,
    speechStyle: 'anime',
    color: '#EC4899'
  },
  {
    id: 'shrek',
    name: 'Болотный великан',
    emoji: '🧅',
    description: 'Любит своё болото и луковые шутки',
    isViral: true,
    speechStyle: 'shrek',
    color: '#84CC16'
  },
  {
    id: 'elon',
    name: 'Космический изобретатель',
    emoji: '🚀',
    description: 'Мечтает о ракетах и далёких планетах',
    isViral: true,
    speechStyle: 'elon',
    color: '#06B6D4'
  },
];

const CHARACTER_EN_TEXT: Record<string, { name: string; description: string }> = {
  default: { name: 'Friendly', description: 'Speaks simply and kindly' },
  emperor: { name: 'Royal', description: 'Speaks like a very important king' },
  philosopher: { name: 'Thinker', description: 'Thinks about the world and the empty bowl' },
  scientist: { name: 'Scientist', description: 'Checks every playful guess' },
  detective: { name: 'Detective', description: 'Looks for clues and solves mysteries' },
  pirate: { name: 'Pirate', description: 'Finds sea adventures beside the bowl' },
  gigachad: { name: 'Strong hero', description: 'Speaks bravely and confidently' },
  sigma: { name: 'Calm hero', description: 'Never rushes and does things their own way' },
  alphacat: { name: 'Cat king', description: 'The main furry hero of the home' },
  billionaire: { name: 'Treasure keeper', description: 'Believes treats are true treasure' },
  streamer: { name: 'Fun host', description: 'Turns every moment into a show' },
  grandpa: { name: 'Grandpa', description: 'Tells kind stories from long ago' },
  toxic: { name: 'Grumbler', description: 'Grumbles a little but never hurts anyone' },
  professor: { name: 'Professor', description: 'Explains things like a fun lesson' },
  hood: { name: 'Yard hero', description: 'Knows every secret path outside' },
  mafia: { name: 'Important boss', description: 'Hands out important home missions' },
  gangster: { name: 'Cool friend', description: 'Speaks with cheerful confidence' },
  anime: { name: 'Little star', description: 'Adds sparkle and happy cheers' },
  shrek: { name: 'Swamp giant', description: 'Loves the swamp and silly onion jokes' },
  elon: { name: 'Space inventor', description: 'Dreams about rockets and faraway planets' },
};

export function getCharacters(language: 'ru' | 'en' = 'ru'): Character[] {
  if (language === 'ru') return CHARACTERS;
  return CHARACTERS.map((character) => ({
    ...character,
    ...(CHARACTER_EN_TEXT[character.id] || CHARACTER_EN_TEXT.default),
  }));
}

/**
 * Применяет стиль персонажа к тексту перевода
 * Каждый персонаж имеет уникальный стиль речи
 */
export function applyCharacterStyle(
  text: string,
  style: CharacterStyle,
  language: 'ru' | 'en' = 'ru'
): string {
  if (language === 'en') {
    switch (style) {
      case 'emperor':
      case 'royal':
        return `Hear my royal wish! ${text} Please make it happen!`;
      case 'philosopher':
      case 'deep':
        return `A thoughtful question: ${text} Perhaps the bowl knows the answer.`;
      case 'scientist':
      case 'scientific':
        return `Testing a playful idea: ${text} The guess is ready!`;
      case 'detective':
      case 'investigative':
        return `Clue found: ${text} Mystery solved!`;
      case 'pirate':
        return `Ahoy! ${text} Onward to the bowl!`;
      case 'gangster':
      case 'street':
        return `Hey, friend! ${text} We have got this!`;
      case 'wizard':
        return `🔮 The bowl spell says: ${text} A treat may power the magic.`;
      case 'general':
        return `🎖️ Home mission: ${text} Team, let us begin!`;
      case 'gigachad':
        return `💪 Strong hero says: ${text} We can do it!`;
      case 'sigma':
        return `😌 Calm hero rule: ${text} No rush, no fuss.`;
      case 'alphacat':
        return `🦁 The cat king says: ${text} Meow, decision made!`;
      case 'billionaire':
        return `💰 Treasure keeper reports: ${text} One treat is worth more than every coin!`;
      case 'streamer':
        return `🎮 The show begins! ${text} Applause for our furry star!`;
      case 'grandpa':
        return `👴 Long ago, ${text.toLowerCase()} What a good story.`;
      case 'toxic':
        return `😾 The grumbler says: ${text} You may still pet me.`;
      case 'professor':
        return `🎓 Today’s fun lesson: ${text} Class dismissed!`;
      case 'hood':
        return `🧢 Yard hero says: ${text} I know a shortcut!`;
      case 'mafia':
        return `🤵 The important boss decided: ${text} A mission for the whole family!`;
      case 'anime':
        return `✨ Yay! ${text} Our furry star is shining!`;
      case 'shrek':
        return `🧅 The swamp giant says: ${text} Friends are always welcome in the swamp!`;
      case 'elon':
        return `🚀 The space inventor reports: ${text} Next stop: the stars!`;
      default:
        return text;
    }
  }

  switch (style) {
    // Базовые персонажи
    case 'emperor':
    case 'royal':
      return `Слушай волю мою! ${text.replace(/я /g, 'мы ').replace(/мне/g, 'нам')}. Немедленно!`;
    
    case 'philosopher':
    case 'deep':
      return `В бесконечности вселенной... ${text} Разве это не суета сует?`;
    
    case 'scientist':
    case 'scientific':
      return `Проверяю весёлую гипотезу: ${text} Догадка готова!`;
    
    case 'detective':
    case 'investigative':
      return `Улика №${Math.floor(Math.random() * 100)}: ${text} Дело принимает серьезный оборот.`;
    
    case 'pirate':
      return `Тысяча чертей! ${text} Йо-хо-хо, на абордаж миски!`;
    
    case 'gangster':
    case 'street':
      return `Эй, слышь! ${text} Всё чётко будет?`;

    case 'wizard':
      return `🔮 Заклинание миски гласит: ${text} Магия требует лакомства.`;

    case 'general':
      return `🎖️ Приказ по дому: ${text} Выполнить немедленно.`;

    // ВИРУСНЫЕ ПЕРСОНАЖИ
    case 'gigachad':
      return `💪 Силач говорит: ${text} Всё получится!`;
    
    case 'sigma':
      return `😌 Правило спокойного героя: ${text} Без спешки и суеты.`;
    
    case 'alphacat':
      return `🦁 Король котов объявляет: ${text} Мяу, решение принято!`;
    
    case 'billionaire':
      return `💰 Хозяин сокровищ сообщает: ${text} Одна вкусняшка дороже всех монет!`;
    
    case 'streamer':
      return `🎮 Шоу начинается! ${text} Аплодисменты нашему пушистому герою!`;
    
    case 'grandpa':
      return `👴 В моё время ${text.toLowerCase()} А сейчас что творится... Эх, молодёжь...`;
    
    case 'toxic':
      return `😾 Ворчун бурчит: ${text} Но погладить меня всё равно можно.`;
    
    case 'professor':
      return `🎓 Согласно моей диссертации: ${text} Ссылки на источники в конце лекции.`;
    
    case 'hood':
      return `🧢 Дворовый герой говорит: ${text} Я знаю короткую дорогу!`;
    
    case 'mafia':
      return `🤵 Важный босс решил: ${text} Поручение для всей семьи!`;
    
    case 'anime':
      return `✨ Кя~! ${text} Сенпай заметил меня! (◕‿◕)`;
    
    case 'shrek':
      return `🧅 Болотный великан говорит: ${text} На болоте всем друзьям рады!`;
    
    case 'elon':
      return `🚀 Космический изобретатель сообщает: ${text} Следующая остановка — звёзды!`;

    default:
      return text;
  }
}

/**
 * Получить персонажа по ID
 */
export function getCharacterById(id: CharacterStyle): Character | undefined {
  return CHARACTERS.find(c => c.id === id);
}

/**
 * Получить вирусные персонажи
 */
export function getViralCharacters(): Character[] {
  return CHARACTERS.filter(c => c.isViral);
}
