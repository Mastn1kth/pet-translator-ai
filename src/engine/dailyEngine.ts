/**
 * Ежедневный контент для главного экрана (настроение/мысль/гороскоп дня)
 */
export function getDailyContent(petType: 'cat' | 'dog' = 'cat', language: 'ru' | 'en' = 'ru') {
  const today = new Date();
  const day = today.getDate();
  
  const catContents = [
    {
      mood: 'Подозрительное спокойствие',
      thought: 'Я молчу не просто так. Я думаю, как открыть холодильник.',
      horoscope: 'Сегодня хороший день для сна, еды и лёгкого шантажа хозяина.',
    },
    {
      mood: 'Императорское недовольство',
      thought: 'Миска была наполнена недостаточно торжественно.',
      horoscope: 'Вечером возможен внезапный забег по квартире.',
    },
  ];
  
  const dogContents = [
    {
      mood: 'Максимальная преданность',
      thought: 'Хозяин рядом — значит день уже идеальный.',
      horoscope: 'Сегодня отличный день для прогулки, игры и выпрашивания вкусняшек.',
    },
    {
      mood: 'Голодный энтузиазм',
      thought: 'Я готов защищать дом, но сначала дайте поесть.',
      horoscope: 'Вероятность радостного виляния хвостом — 99%.',
    },
  ];

  const catContentsEn = [
    {
      mood: 'Suspiciously calm',
      thought: 'I am quiet because I am planning how to open the fridge.',
      horoscope: 'A fine day for naps, treats, and a little mischief.',
    },
    {
      mood: 'Royal grumble',
      thought: 'The bowl was not filled with enough ceremony.',
      horoscope: 'A surprise sprint around the room may happen tonight.',
    },
  ];

  const dogContentsEn = [
    {
      mood: 'Maximum friendship',
      thought: 'My person is here, so the day is already great.',
      horoscope: 'A fine day for a walk, a game, and a tasty treat.',
    },
    {
      mood: 'Hungry excitement',
      thought: 'I can guard the home, but first let us check the bowl.',
      horoscope: 'The chance of a happily wagging tail is very high.',
    },
  ];
  
  const contents = language === 'en'
    ? (petType === 'dog' ? dogContentsEn : catContentsEn)
    : (petType === 'dog' ? dogContents : catContents);
  
  return contents[day % contents.length];
}
