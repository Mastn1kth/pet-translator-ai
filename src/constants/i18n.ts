import type { PetSoundLabel } from '../types';

export type Language = 'ru' | 'en';

interface Dictionary {
  common: {
    back: string;
    save: string;
    cancel: string;
    delete: string;
    edit: string;
    add: string;
    close: string;
    pageNotFound: string;
    goHome: string;
    articleNotFound: string;
    articleUnavailableTitle: string;
    articleUnavailableText: string;
  };
  soundLabels: Record<PetSoundLabel, string>;
  tabs: {
    analyzer: string;
    home: string;
    pets: string;
    memes: string;
    faq: string;
    profile: string;
  };
  onboarding: {
    disclaimer: string;
    next: string;
    start: string;
    skip: string;
    slides: Array<{ title: string; subtitle: string; desc: string }>;
  };
  home: {
    brand: string;
    greeting: string;
    chooseFriend: string;
    chooseAction: string;
    mainActionLabel: string;
    exploreKicker: string;
    exploreTitle: string;
    analyzerTitle: string;
    analyzerSub: string;
    memeTitle: string;
    memeSub: string;
    catSpeech: string;
    dogSpeech: string;
    statTranslations: string;
    statStreak: string;
    statMemes: string;
    noPetTitle: string;
    aiSlogans: string[];
    startTranslation: string;
    quickTranslate: string;
    translateName: (name: string) => string;
    recordNow: string;
    noProfileSaveLater: string;
    entertainmentNotice: string;
    petSection: string;
    add: string;
    noPetSub: string;
    quickTranslateBtn: string;
    formatSection: string;
    quickModeHint: string;
    voiceTitle: string;
    voiceSub: string;
    photoTitle: string;
    photoSub: string;
    videoTitle: string;
    videoSub: string;
    dailyThoughtTitle: string;
    faqTitle: string;
    faqSub: string;
  };
  analyzer: {
    kicker: string;
    title: string;
    subtitle: string;
    petCardTitle: string;
    petCardSub: string;
    emptyTitle: string;
    emptyText: string;
    modeCardTitle: string;
    unlimited: string;
    profileCardTitle: string;
    verdictLabel: string;
    ctaAddPet: string;
    ctaAddPetSub: string;
    ctaRun: (name: string) => string;
    noPetVerdict: string;
    noPetHint: string;
    verdictNormal: string;
    verdictDrama: string;
    verdictEnergy: string;
    verdictLazy: string;
    verdictCuriosity: string;
    petHint: (name: string, type: 'cat' | 'dog') => string;
    energyLabel: string;
    moodLabel: string;
    focusLabel: string;
    translatorWord: string;
    modeSoundSub: string;
    modePhotoSub: string;
    modeVideoSub: string;
  };
  addPet: {
    titleNew: string;
    titleEdit: string;
    whoIsYourPet: string;
    cat: string;
    dog: string;
    photoLabel: string;
    photoAdded: string;
    photoAdd: string;
    nameLabel: string;
    namePlaceholder: string;
    ageLabel: string;
    agePlaceholder: string;
    genderLabel: string;
    male: string;
    female: string;
    breedLabel: string;
    personalityLabel: string;
    personalityHint: string;
    saveNew: string;
    saveEdit: string;
    needName: string;
    needPhotoAccess: string;
    traits: {
      arrogance: string;
      curiosity: string;
      laziness: string;
      friendliness: string;
      intelligence: string;
      drama: string;
      gluttony: string;
      energy: string;
    };
  };
  pets: {
    title: string;
    addBtn: string;
    emptyTitle: string;
    emptyText: string;
    emptyBtn: string;
    translate: string;
    charTitle: string;
    editBtn: string;
    deleteBtn: string;
    deleteConfirmTitle: string;
    deleteConfirmText: (name: string) => string;
    ageYears: (age: number) => string;
  };
  profile: {
    title: string;
    statsTitle: string;
    statTranslations: string;
    statPhotos: string;
    statVideos: string;
    statMemes: string;
    statStreak: string;
    statBest: string;
    charactersTitle: string;
    charactersSub: string;
    achievementsTitle: string;
    settingsTitle: string;
    darkTheme: string;
    dailyReminder: string;
    language: string;
    remindersOffTitle: string;
    remindersOffText: string;
    disclaimer: string;
  };
  faq: {
    title: string;
    subtitle: string;
    articlesTitle: string;
    moreTitle: string;
    adText: string;
    adCta: string;
  };
  memes: {
    kicker: string;
    title: string;
    subtitle: string;
    pickVideo: string;
    recordVideo: string;
    petCardTitle: string;
    templatesTitle: string;
    filterTitle: string;
    captionTitle: string;
    captionPlaceholder: string;
    createMeme: string;
    exporting: string;
    exportShare: string;
    recentProjects: string;
    trackingTitle: string;
    trackingSub: string;
    trackingOptionalTitle: string;
    trackingOptionalSub: string;
    calibrateStart: string;
    calibrateDone: (n: number) => string;
    calibrateFinish: string;
    capturedPoints: (n: number) => string;
    loadingModel: string;
    modelUnavailable: string;
    cameraUnavailable: string;
    needCamera: string;
    needCameraText: string;
    needMedia: string;
    needMediaCamera: string;
    needMediaLibrary: string;
    needVideoFirst: string;
    needVideoFirstText: string;
    memeCreated: string;
    memeCreatedText: string;
    exportError: string;
    exportErrorText: string;
    emptyPreviewText: string;
    templates: Array<{ id: string; title: string; top: string; caption: string }>;
    filters: Array<{ id: string; label: string }>;
    mp4ReadyTitle: string;
    mp4ReadyText: string;
    exportedFallbackTitle: string;
    exportedFallbackText: string;
    reelsHint: string;
  };
  translate: {
    petNotFound: string;
    soundTitle: string;
    photoTitle: string;
    videoTitle: string;
    soundInstruction: string;
    photoInstruction: string;
    videoInstruction: string;
    recordingTipTitle: string;
    recordingTipText: string;
    startRecording: string;
    pickPhoto: string;
    pickVideo: string;
    recording: string;
    stopRecording: string;
    stopHint: string;
    analyzing: string;
    analyzingDisclaimer: string;
    needMic: string;
    needPhotoAccess: string;
    needMediaAccess: string;
    recordError: string;
    noSoundTitle: string;
    noSoundText: string;
    soundTooShort: string;
    soundTooShortText: string;
    noPetSoundTitle: string;
    noPetSoundText: string;
    soundUncertainTitle: string;
    soundUncertainText: string;
    wrongSpeciesTitle: string;
    wrongSpeciesCat: string;
    wrongSpeciesDog: string;
    soundModelReady: string;
    soundModelLoading: string;
    soundModelLoadingText: string;
    soundModelFailed: string;
    soundModelFailedText: string;
    quickCatName: string;
    quickDogName: string;
    analysisSteps: string[];
    modelReady: string;
    modelLoading: string;
    modelFailed: string;
    noDetectionYet: string;
    needCamera: string;
    needCameraText: string;
    noPetInFrame: string;
    noPetInFrameText: string;
    detectedCat: string;
    detectedDog: string;
    stopLive: string;
    liveAnalysis: string;
    useLiveResult: string;
  };
  result: {
    title: string;
    home: string;
    translationLabel: string;
    analysisLabel: string;
    feedbackLabel: string;
    feedbackHint: string;
    likeActive: string;
    like: string;
    similar: string;
    notSimilar: string;
    thoughtsLabel: string;
    storyLabel: string;
    disclaimer: string;
    quickSaveLabel: string;
    quickSaveTitle: string;
    quickSaveText: string;
    quickSaveBtn: string;
    shareTitle: string;
    copyText: string;
    otherWays: string;
    tryAgain: string;
    shareViral: string;
    shareStories: string;
    shareTelegramSub: string;
    shareWhatsappSub: string;
    copyOnlyNotice: (platform: string) => string;
    feedbackSaved: string;
    feedbackSavedText: string;
    shareSuccess: string;
    shareSuccessText: string;
    copySuccess: string;
    copySuccessText: string;
    notFound: string;
    intensityLabel: string;
    clueStrength: (strength: number) => string;
    mainGuess: string;
    otherGuess: string;
    emotionLine: (emotion: string, confidence: number) => string;
    recognizedSoundLabel: string;
    recognitionClear: string;
    recognitionTentative: string;
    recognitionDisclaimer: string;
  };
  stateLabels: {
    hunger: string;
    walk: string;
    attention: string;
    play: string;
    rest: string;
    stress: string;
    curiosity: string;
  };
}

const ru: Dictionary = {
  common: {
    back: '← Назад',
    save: 'Сохранить',
    cancel: 'Отмена',
    delete: 'Удалить',
    edit: 'Редактировать',
    add: 'Добавить',
    close: 'Закрыть',
    pageNotFound: 'Ой, такой страницы нет',
    goHome: 'Вернуться домой',
    articleNotFound: 'Статья не найдена',
    articleUnavailableTitle: 'Эта статья пока только на русском',
    articleUnavailableText: 'Переключи язык на русский или вернись к коротким ответам.',
  },
  soundLabels: {
    cat_voice: 'голос кошки',
    cat_purr: 'мурчание',
    cat_meow: 'мяуканье',
    cat_hiss: 'шипение',
    cat_yowl: 'протяжный кошачий крик',
    dog_voice: 'голос собаки',
    dog_bark: 'лай',
    dog_yip: 'тявканье',
    dog_howl: 'вой',
    dog_growl: 'рычание',
    dog_whine: 'скуление',
  },
  tabs: {
    analyzer: 'Детектив',
    home: 'Главная',
    pets: 'Друзья',
    memes: 'Играть',
    faq: 'Ответы',
    profile: 'Призы',
  },
  onboarding: {
    disclaimer: 'Это весёлая догадка. Если питомцу плохо — позови взрослого.',
    next: 'Дальше',
    start: 'Начать игру',
    skip: 'Пропустить',
    slides: [
      {
        title: 'Привет! Я помогу понять питомца',
        subtitle: 'Слушай, смотри и играй',
        desc: 'Выбери кота или собаку — дальше всё покажем по шагам.',
      },
      {
        title: 'Услышь «мяу» и «гав»',
        subtitle: 'Нужна всего одна кнопка',
        desc: 'Нажми на микрофон, подожди звук питомца и останови запись.',
      },
      {
        title: 'Покажи фото или видео',
        subtitle: 'Ищи настроение по позе',
        desc: 'Выбери картинку или ролик — приложение само сделает остальное.',
      },
      {
        title: 'Собирай смешные истории',
        subtitle: 'Мемы, призы и новые открытия',
        desc: 'Играй вместе с питомцем и показывай результат взрослым и друзьям.',
      },
    ],
  },
  home: {
    brand: 'Пушистый переводчик',
    greeting: 'играем и узнаём новое',
    chooseFriend: 'Кого послушаем?',
    chooseAction: 'Что будем делать?',
    mainActionLabel: 'Самое простое',
    exploreKicker: 'Ещё приключения',
    exploreTitle: 'Исследуй и играй',
    analyzerTitle: 'Детектив настроения',
    analyzerSub: 'Узнай, какое у питомца настроение',
    memeTitle: 'Смешное видео',
    memeSub: 'Добавь реплику, корону или очки',
    catSpeech: 'Мяу!',
    dogSpeech: 'Гав!',
    statTranslations: 'Переводов',
    statStreak: 'Дней подряд',
    statMemes: 'Мемов',
    noPetTitle: 'Добавим твоего друга?',
    aiSlogans: [
      'Послушай звук или покажи фотографию',
      'Нажимай на большие карточки — ошибиться нельзя',
      'Каждый перевод приносит новое открытие',
      'Питомца можно добавить в любой момент',
    ],
    startTranslation: 'Что говорит твой питомец?',
    quickTranslate: 'Послушать питомца',
    translateName: (name: string) => `Послушать голос: ${name}`,
    recordNow: 'Нажми и запиши мяу или гав',
    noProfileSaveLater: 'Можно начать без анкеты',
    entertainmentNotice: 'Это весёлая догадка по звуку и поведению. Если питомцу плохо — позови взрослого.',
    petSection: 'Твой друг',
    add: 'Добавить',
    noPetSub: 'Нажми сюда или сразу попробуй перевод.',
    quickTranslateBtn: 'Попробовать сейчас',
    formatSection: 'Выбери способ',
    quickModeHint: 'новый друг',
    voiceTitle: 'Послушать',
    voiceSub: 'Запиши 3–10 секунд звука',
    photoTitle: 'Показать фото',
    photoSub: 'Узнаем настроение по позе',
    videoTitle: 'Показать видео',
    videoSub: 'Посмотрим на движения',
    dailyThoughtTitle: 'Секрет дня',
    faqTitle: 'Почему он так делает?',
    faqSub: 'Простые ответы про лай, царапины и привычки',
  },
  analyzer: {
    kicker: 'Детектив настроения',
    title: 'Соберём улики?',
    subtitle: 'Выбери друга и способ. Потом мы всё сделаем вместе по шагам.',
    petCardTitle: 'Кого исследуем?',
    petCardSub: 'Выбери своего друга',
    emptyTitle: 'Сначала добавим друга',
    emptyText: 'Нажми сюда и расскажи, как зовут кота или собаку.',
    modeCardTitle: 'Какую улику берём?',
    unlimited: 'можно всегда',
    profileCardTitle: 'Что мы уже знаем',
    verdictLabel: 'Подсказка',
    ctaAddPet: 'Добавить друга',
    ctaAddPetSub: 'Это займёт совсем немного времени',
    ctaRun: (name: string) => `Начать с ${name}`,
    noPetVerdict: 'Добавь питомца, и детектив соберёт первые подсказки.',
    noPetHint: 'Нам нужно знать, кого исследуем.',
    verdictNormal: 'Всё спокойно — можно начинать.',
    verdictDrama: 'Сегодня много эмоций — будет интересно!',
    verdictEnergy: 'Энергии много — попробуй видео.',
    verdictLazy: 'Питомец отдыхает — начни с фото.',
    verdictCuriosity: 'Питомцу всё интересно — попробуй звук.',
    petHint: (name: string, type: 'cat' | 'dog') => `${name}: ${type === 'cat' ? 'кот' : 'пёс'}, всё готово`,
    energyLabel: 'Энергия',
    moodLabel: 'Настроение',
    focusLabel: 'Внимание',
    translatorWord: 'слушаем',
    modeSoundSub: 'послушать голос',
    modePhotoSub: 'посмотреть на позу',
    modeVideoSub: 'увидеть движения',
  },
  addPet: {
    titleNew: 'Новый друг',
    titleEdit: 'Изменить друга',
    whoIsYourPet: 'Кого добавляем?',
    cat: 'Кошка',
    dog: 'Собака',
    photoLabel: 'Добавим фотографию?',
    photoAdded: 'Фото добавлено',
    photoAdd: 'Добавить фото',
    nameLabel: 'Как его зовут? *',
    namePlaceholder: 'Например: Мурзик',
    ageLabel: 'Сколько ему лет? Можно пропустить',
    agePlaceholder: 'Например: 3',
    genderLabel: 'Кто это?',
    male: 'Мальчик',
    female: 'Девочка',
    breedLabel: 'Знаешь породу? Можно пропустить',
    personalityLabel: 'Настроить характер',
    personalityHint: 'Необязательно — мы уже выбрали добрые настройки',
    saveNew: '🐾 Добавить друга',
    saveEdit: '💾 Сохранить изменения',
    needName: 'Введи имя питомца',
    needPhotoAccess: 'Нужен доступ к фото',
    traits: {
      arrogance: 'Смелость 😏',
      curiosity: 'Любопытство 🔍',
      laziness: 'Лень 😴',
      friendliness: 'Дружелюбие 🤗',
      intelligence: 'Сообразительность 🧠',
      drama: 'Любит удивлять 🎭',
      gluttony: 'Любит вкусняшки 🍽️',
      energy: 'Энергичность ⚡',
    },
  },
  pets: {
    title: '🐾 Мои друзья',
    addBtn: '+ Новый друг',
    emptyTitle: 'Здесь появятся твои друзья',
    emptyText: 'Добавь кота или собаку — имя поможет сделать игру личной.',
    emptyBtn: '🐱 Добавить друга',
    translate: '🎤 Послушать',
    charTitle: 'Какой у него характер?',
    editBtn: '✏️ Редактировать',
    deleteBtn: '🗑️ Удалить',
    deleteConfirmTitle: 'Удалить питомца',
    deleteConfirmText: (name: string) => `Удалить ${name}?`,
    ageYears: (age: number) => {
      const mod10 = age % 10;
      const mod100 = age % 100;
      const word = mod10 === 1 && mod100 !== 11
        ? 'год'
        : mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)
          ? 'года'
          : 'лет';
      return `${age} ${word}`;
    },
  },
  profile: {
    title: '🏆 Мои призы',
    statsTitle: '✨ Мои открытия',
    statTranslations: 'Переводов',
    statPhotos: 'Фото',
    statVideos: 'Видео',
    statMemes: 'Мемов',
    statStreak: 'Дней подряд',
    statBest: 'Рекорд',
    charactersTitle: '🎭 Голос питомца',
    charactersSub: 'Выбери, как будут звучать смешные ответы',
    achievementsTitle: '🏆 Собранные призы',
    settingsTitle: '⚙️ Для взрослых',
    darkTheme: '🌙 Тёмная тема',
    dailyReminder: '🔔 Ежедневное напоминание',
    language: '🌐 Язык интерфейса',
    remindersOffTitle: 'Уведомления выключены',
    remindersOffText: 'Разреши уведомления в настройках телефона, чтобы включить ежедневное напоминание.',
    disclaimer: '🎭 Это игра. Она угадывает настроение питомца и может ошибаться.',
  },
  faq: {
    title: '❓ Почему он так делает?',
    subtitle: 'Простые ответы про кошек и собак',
    articlesTitle: '📚 Выбери вопрос',
    moreTitle: '💡 Ещё секреты',
    adText: '🐾 Послушаем питомца и попробуем угадать его настроение?',
    adCta: 'Попробовать →',
  },
  memes: {
    kicker: 'Смешная мастерская',
    title: 'Сними историю с питомцем',
    subtitle: 'Выбери видео, добавь смешную реплику и наряди питомца.',
    pickVideo: '📁 Выбрать видео',
    recordVideo: '📹 Снять видео',
    petCardTitle: 'Питомец',
    templatesTitle: '1. Выбери шутку',
    filterTitle: '2. Наряди питомца',
    captionTitle: '3. Напиши реплику',
    captionPlaceholder: 'Миска выглядит подозрительно пустой.',
    createMeme: 'Сохранить историю',
    exporting: 'Сохраняю...',
    exportShare: 'Сохранить и поделиться',
    recentProjects: 'Последние истории',
    trackingTitle: '🎯 Маска следует за питомцем',
    trackingSub: 'Покажи питомца камере несколько секунд — маска запомнит, как он двигался.',
    trackingOptionalTitle: 'Волшебная маска',
    trackingOptionalSub: 'Необязательно: маска сможет двигаться вместе с питомцем',
    calibrateStart: '📷 Показать питомца камере',
    calibrateDone: (n: number) => `✅ Подсказок найдено: ${n} — обновить`,
    calibrateFinish: 'Готово',
    capturedPoints: (n: number) => `Подсказок найдено: ${n}`,
    loadingModel: 'Готовлю камеру...',
    modelUnavailable: 'Камера не смогла найти питомца',
    cameraUnavailable: 'Камера недоступна',
    needCamera: 'Нужен доступ к камере',
    needCameraText: 'Разреши камеру, чтобы маска двигалась вместе с питомцем.',
    needMedia: 'Нужен доступ',
    needMediaCamera: 'Разреши камеру для съёмки ролика.',
    needMediaLibrary: 'Разреши доступ к видео.',
    needVideoFirst: 'Сначала выбери видео',
    needVideoFirstText: 'Для мастерской нужен ролик с питомцем.',
    memeCreated: 'Мем создан',
    memeCreatedText: 'История сохранена в мастерской.',
    exportError: 'Не получилось сохранить',
    exportErrorText: 'Не удалось подготовить ролик для отправки.',
    emptyPreviewText: 'Выбери или сними видео питомца',
    templates: [
      { id: 'food', title: 'Кормовая тревога', top: 'Когда услышал пакетик с кормом', caption: 'Миска выглядит подозрительно пустой.' },
      { id: 'fridge', title: 'Холодильник', top: 'Проверяю стратегические запасы', caption: 'Я не толстый. Я пушистый.' },
      { id: 'director', title: 'Камера', top: 'Ты опять снимаешь меня?', caption: 'Требую компенсацию кормом.' },
      { id: 'walk', title: 'Прогулка', top: 'Когда сказали «гулять»', caption: 'Поводок сам себя не наденет.' },
    ],
    filters: [
      { id: 'none', label: 'Без фильтра' },
      { id: 'glasses', label: 'Очки' },
      { id: 'crown', label: 'Корона' },
      { id: 'pirate', label: 'Пират' },
      { id: 'detective', label: 'Детектив' },
      { id: 'billionaire', label: 'Миллиардер' },
      { id: 'cowboy', label: 'Ковбой' },
      { id: 'astronaut', label: 'Космонавт' },
      { id: 'gigachad', label: 'Силач' },
      { id: 'clown', label: 'Клоун' },
    ],
    mp4ReadyTitle: 'Видео готово',
    mp4ReadyText: 'Теперь роликом можно поделиться.',
    exportedFallbackTitle: 'Отправим исходное видео',
    exportedFallbackText: 'Не получилось добавить маску в готовый ролик, поэтому откроется исходное видео.',
    reelsHint: 'Можно показать друзьям.',
  },
  translate: {
    petNotFound: 'Питомец не найден',
    soundTitle: 'Слушаем питомца',
    photoTitle: 'Смотрим фото',
    videoTitle: 'Смотрим видео',
    soundInstruction: 'Нажми большую кнопку и дождись «мяу» или «гав».',
    photoInstruction: 'Нажми большую кнопку и выбери хорошее фото питомца.',
    videoInstruction: 'Нажми большую кнопку и выбери видео с питомцем.',
    recordingTipTitle: 'Маленький секрет',
    recordingTipText: 'Поднеси телефон поближе и запиши 2–5 секунд. Лучше всего слышно, когда рядом тихо.',
    startRecording: 'Нажми, чтобы слушать',
    pickPhoto: 'Выбрать фото',
    pickVideo: 'Выбрать видео',
    recording: 'Я слушаю...',
    stopRecording: 'Готово! Остановить',
    stopHint: 'Когда звук записан, нажми большую кнопку.',
    analyzing: 'Разгадываю секрет...',
    analyzingDisclaimer: 'Модель узнаёт тип звука. Его точный смысл и настроение всё равно остаются игровой догадкой.',
    needMic: 'Нужен доступ к микрофону',
    needPhotoAccess: 'Нужен доступ к фото',
    needMediaAccess: 'Нужен доступ к видео',
    recordError: 'Ошибка записи',
    noSoundTitle: 'Я не услышал питомца',
    noSoundText: 'Попробуй ещё раз: поднеси телефон ближе и запиши мяу или гав.',
    soundTooShort: 'Нужно послушать подольше',
    soundTooShortText: 'Запиши хотя бы одну секунду голоса питомца. Лучше всего — 2–5 секунд.',
    noPetSoundTitle: 'Не получилось узнать голос питомца',
    noPetSoundText: 'Звук есть, но модель не узнала мяуканье, мурчание, лай или другой голос питомца.',
    soundUncertainTitle: 'Модель пока сомневается',
    soundUncertainText: 'Запиши ещё раз поближе к питомцу, когда вокруг тихо.',
    wrongSpeciesTitle: 'Кажется, выбран другой питомец',
    wrongSpeciesCat: 'В записи больше похоже на голос собаки, а выбран котик.',
    wrongSpeciesDog: 'В записи больше похоже на голос кошки, а выбрана собачка.',
    soundModelReady: 'Распознавание звуков готово',
    soundModelLoading: 'Загружаю распознавание звуков...',
    soundModelLoadingText: 'Подожди немного и попробуй снова.',
    soundModelFailed: 'Распознавание не запустилось',
    soundModelFailedText: 'На этом телефоне не получилось запустить звуковую модель.',
    quickCatName: 'Котик без анкеты',
    quickDogName: 'Собачка без анкеты',
    analysisSteps: [
      '👂 Сравниваю голос со звуковой моделью...',
      '👀 Ищу важные подсказки...',
      '🧠 Собираю настроение...',
      '🐾 Проверяю догадку...',
      '✨ Готовлю перевод...',
    ],
    modelReady: 'Камера готова',
    modelLoading: 'Готовлю камеру...',
    modelFailed: 'Камера не смогла найти питомца',
    noDetectionYet: 'Кот/собака пока не обнаружены',
    needCamera: 'Нужен доступ к камере',
    needCameraText: 'Разреши камеру, чтобы попробовать увидеть питомца.',
    noPetInFrame: 'Питомца пока не видно',
    noPetInFrameText: 'Держи котика или собачку в кадре ещё немного.',
    detectedCat: 'Вижу котика',
    detectedDog: 'Вижу собачку',
    stopLive: 'Остановить',
    liveAnalysis: 'Смотреть через камеру',
    useLiveResult: 'Взять эту подсказку',
  },
  result: {
    title: 'Наша догадка',
    home: '← На главную',
    translationLabel: '💬 Что это могло значить',
    analysisLabel: '🔎 Какие подсказки мы заметили',
    feedbackLabel: '🐾 Похоже на правду?',
    feedbackHint: 'Твой ответ поможет приложению лучше запомнить питомца.',
    likeActive: '❤️ Лайк есть',
    like: '🤍 Лайк',
    similar: '✅ Похоже',
    notSimilar: '❌ Не похоже',
    thoughtsLabel: '🧠 Мысли питомца',
    storyLabel: '📖 История',
    disclaimer: '🎭 Это игровая догадка по громкости, паузам, поведению и привычкам. Она не переводит звуки дословно и может ошибаться.',
    quickSaveLabel: 'Быстрый режим',
    quickSaveTitle: 'Сохранить питомца?',
    quickSaveText: 'Добавь анкету, чтобы следующие переводы учитывали имя, тип, характер и твою обратную связь.',
    quickSaveBtn: 'Добавить питомца',
    shareTitle: '📤 Поделиться результатом',
    copyText: '📋 Скопировать текст',
    otherWays: '📱 Другие способы',
    tryAgain: '🔄 Повторить перевод',
    shareViral: 'Показать друзьям',
    shareStories: 'Добавить в историю',
    shareTelegramSub: 'Отправить друзьям',
    shareWhatsappSub: 'Поделиться в чате',
    copyOnlyNotice: (platform: string) => `Текст скопирован — открываем ${platform}, просто вставь его в подпись.`,
    feedbackSaved: 'Запомнил',
    feedbackSavedText: 'Следующие переводы для этого питомца будут учитывать твою оценку.',
    shareSuccess: '🎉 Отлично!',
    shareSuccessText: 'Спасибо за то, что делишься!',
    copySuccess: '✅ Скопировано',
    copySuccessText: 'Текст скопирован',
    notFound: 'Результат не найден',
    intensityLabel: 'Сила подсказок:',
    clueStrength: (strength: number) => strength >= 70
      ? 'много подсказок'
      : strength >= 45
        ? 'несколько подсказок'
        : 'мало подсказок',
    mainGuess: 'главная догадка',
    otherGuess: 'другая догадка',
    emotionLine: (emotion: string) => `Похоже на: ${emotion}`,
    recognizedSoundLabel: '👂 Какой звук узнала модель',
    recognitionClear: 'Модель хорошо узнала этот тип звука.',
    recognitionTentative: 'Модель нашла этот звук, но запись была не очень ясной.',
    recognitionDisclaimer: 'Распознан тип звука, а не его точный смысл. Настроение ниже — игровая догадка.',
  },
  stateLabels: {
    hunger: 'Голод',
    walk: 'Прогулка',
    attention: 'Внимание',
    play: 'Игра',
    rest: 'Отдых',
    stress: 'Стресс',
    curiosity: 'Интерес',
  },
} as const;

const en: Dictionary = {
  common: {
    back: '← Back',
    save: 'Save',
    cancel: 'Cancel',
    delete: 'Delete',
    edit: 'Edit',
    add: 'Add',
    close: 'Close',
    pageNotFound: 'Oops, this page is missing',
    goHome: 'Go home',
    articleNotFound: 'Article not found',
    articleUnavailableTitle: 'This guide is in Russian for now',
    articleUnavailableText: 'Switch to Russian to read it, or go back to the short answers.',
  },
  soundLabels: {
    cat_voice: 'cat voice',
    cat_purr: 'purring',
    cat_meow: 'meowing',
    cat_hiss: 'hissing',
    cat_yowl: 'long cat call',
    dog_voice: 'dog voice',
    dog_bark: 'barking',
    dog_yip: 'yipping',
    dog_howl: 'howling',
    dog_growl: 'growling',
    dog_whine: 'whimpering',
  },
  tabs: {
    analyzer: 'Detective',
    home: 'Home',
    pets: 'Friends',
    memes: 'Play',
    faq: 'Answers',
    profile: 'Prizes',
  },
  onboarding: {
    disclaimer: 'This is a playful guess. If your pet seems unwell, tell a grown-up.',
    next: 'Next',
    start: 'Start playing',
    skip: 'Skip',
    slides: [
      {
        title: 'Hi! I can help you understand your pet',
        subtitle: 'Listen, look, and play',
        desc: 'Pick a cat or dog — we will show every next step.',
      },
      {
        title: 'Hear every meow and woof',
        subtitle: 'You only need one button',
        desc: 'Tap the microphone, wait for your pet, and stop the recording.',
      },
      {
        title: 'Show a photo or video',
        subtitle: 'Look for clues in every pose',
        desc: 'Pick a picture or clip — the app will do the rest.',
      },
      {
        title: 'Make funny pet stories',
        subtitle: 'Memes, prizes, and discoveries',
        desc: 'Play with your pet and show the result to family and friends.',
      },
    ],
  },
  home: {
    brand: 'Furry Translator',
    greeting: 'play and discover',
    chooseFriend: 'Who are we listening to?',
    chooseAction: 'What should we do?',
    mainActionLabel: 'Easiest way',
    exploreKicker: 'More adventures',
    exploreTitle: 'Explore and play',
    analyzerTitle: 'Mood detective',
    analyzerSub: 'Find out how your pet may be feeling',
    memeTitle: 'Funny video',
    memeSub: 'Add a line, a crown, or glasses',
    catSpeech: 'Meow!',
    dogSpeech: 'Woof!',
    statTranslations: 'Translations',
    statStreak: 'Day streak',
    statMemes: 'Memes',
    noPetTitle: 'Add your furry friend?',
    aiSlogans: [
      'Listen to a sound or show us a photo',
      'Tap the big cards — there is no wrong choice',
      'Every translation brings a new discovery',
      'You can add your pet at any time',
    ],
    startTranslation: 'What is your pet saying?',
    quickTranslate: 'Listen to a pet',
    translateName: (name: string) => `Listen to ${name}`,
    recordNow: 'Tap and record a meow or woof',
    noProfileSaveLater: 'Start without a profile',
    entertainmentNotice: 'This is a playful guess based on sound and behavior. If your pet seems unwell, tell a grown-up.',
    petSection: 'Your friend',
    add: 'Add',
    noPetSub: 'Tap here or try a translation right away.',
    quickTranslateBtn: 'Try it now',
    formatSection: 'Pick a way',
    quickModeHint: 'new friend',
    voiceTitle: 'Listen',
    voiceSub: 'Record 3–10 seconds of sound',
    photoTitle: 'Show a photo',
    photoSub: 'Read the mood from a pose',
    videoTitle: 'Show a video',
    videoSub: 'Look at every movement',
    dailyThoughtTitle: 'Secret of the day',
    faqTitle: 'Why does my pet do that?',
    faqSub: 'Simple answers about barks, scratches, and habits',
  },
  analyzer: {
    kicker: 'Mood detective',
    title: 'Let’s collect some clues',
    subtitle: 'Pick a friend and a way. We will do the rest together, step by step.',
    petCardTitle: 'Who are we exploring?',
    petCardSub: 'Pick your furry friend',
    emptyTitle: 'Add a friend first',
    emptyText: 'Tap here and tell us your cat or dog’s name.',
    modeCardTitle: 'Which clue should we use?',
    unlimited: 'always ready',
    profileCardTitle: 'What we already know',
    verdictLabel: 'Hint',
    ctaAddPet: 'Add a friend',
    ctaAddPetSub: 'It only takes a moment',
    ctaRun: (name: string) => `Start with ${name}`,
    noPetVerdict: 'Add a pet and the detective will collect the first clues.',
    noPetHint: 'We need to know who we are exploring.',
    verdictNormal: 'Everything looks calm — ready to begin.',
    verdictDrama: 'Big feelings today — this will be fun!',
    verdictEnergy: 'Lots of energy — try a video.',
    verdictLazy: 'Your pet is resting — start with a photo.',
    verdictCuriosity: 'Your pet is curious — try a sound.',
    petHint: (name: string, type: 'cat' | 'dog') => `${name}: ${type}, all ready`,
    energyLabel: 'Energy',
    moodLabel: 'Mood',
    focusLabel: 'Attention',
    translatorWord: 'listen',
    modeSoundSub: 'listen to the voice',
    modePhotoSub: 'look at the pose',
    modeVideoSub: 'watch the movement',
  },
  addPet: {
    titleNew: 'New friend',
    titleEdit: 'Edit friend',
    whoIsYourPet: 'Who are we adding?',
    cat: 'Cat',
    dog: 'Dog',
    photoLabel: 'Add a photo?',
    photoAdded: 'Photo added',
    photoAdd: 'Add photo',
    nameLabel: 'What is their name? *',
    namePlaceholder: 'e.g. Whiskers',
    ageLabel: 'How old are they? You can skip this',
    agePlaceholder: 'e.g. 3',
    genderLabel: 'Who are they?',
    male: 'Boy',
    female: 'Girl',
    breedLabel: 'Know the breed? You can skip this',
    personalityLabel: 'Tune the personality',
    personalityHint: 'Optional — friendly defaults are already selected',
    saveNew: '🐾 Add friend',
    saveEdit: '💾 Save changes',
    needName: "Enter your pet's name",
    needPhotoAccess: 'Photo access needed',
    traits: {
      arrogance: 'Bravery 😏',
      curiosity: 'Curiosity 🔍',
      laziness: 'Laziness 😴',
      friendliness: 'Friendliness 🤗',
      intelligence: 'Cleverness 🧠',
      drama: 'Loves surprises 🎭',
      gluttony: 'Loves treats 🍽️',
      energy: 'Energy ⚡',
    },
  },
  pets: {
    title: '🐾 My friends',
    addBtn: '+ New friend',
    emptyTitle: 'Your friends will appear here',
    emptyText: 'Add a cat or dog — their name makes the game feel personal.',
    emptyBtn: '🐱 Add a friend',
    translate: '🎤 Listen',
    charTitle: 'What are they like?',
    editBtn: '✏️ Edit',
    deleteBtn: '🗑️ Delete',
    deleteConfirmTitle: 'Delete pet',
    deleteConfirmText: (name: string) => `Delete ${name}?`,
    ageYears: (age: number) => `${age} ${age === 1 ? 'year' : 'years'} old`,
  },
  profile: {
    title: '🏆 My prizes',
    statsTitle: '✨ My discoveries',
    statTranslations: 'Translations',
    statPhotos: 'Photos',
    statVideos: 'Videos',
    statMemes: 'Memes',
    statStreak: 'Day streak',
    statBest: 'Best streak',
    charactersTitle: '🎭 Pet voice',
    charactersSub: 'Choose how the funny answers should sound',
    achievementsTitle: '🏆 Collected prizes',
    settingsTitle: '⚙️ For grown-ups',
    darkTheme: '🌙 Dark theme',
    dailyReminder: '🔔 Daily reminder',
    language: '🌐 Interface language',
    remindersOffTitle: 'Notifications disabled',
    remindersOffText: 'Allow notifications in your phone settings to enable the daily reminder.',
    disclaimer: '🎭 This is a game. It guesses your pet’s mood and can be wrong.',
  },
  faq: {
    title: '❓ Why do they do that?',
    subtitle: 'Simple answers about cats and dogs',
    articlesTitle: '📚 Pick a question',
    moreTitle: '💡 More secrets',
    adText: '🐾 Shall we listen and make a playful guess about your pet’s mood?',
    adCta: 'Try it →',
  },
  memes: {
    kicker: 'Funny workshop',
    title: 'Make a story with your pet',
    subtitle: 'Pick a video, add a funny line, and dress up your pet.',
    pickVideo: '📁 Choose video',
    recordVideo: '📹 Record video',
    petCardTitle: 'Pet',
    templatesTitle: '1. Pick a joke',
    filterTitle: '2. Dress up your pet',
    captionTitle: '3. Write a line',
    captionPlaceholder: 'The bowl looks suspiciously empty.',
    createMeme: 'Save story',
    exporting: 'Saving...',
    exportShare: 'Save and share',
    recentProjects: 'Recent stories',
    trackingTitle: '🎯 Mask follows your pet',
    trackingSub: 'Show your pet to the camera for a few seconds so the mask can remember the movement.',
    trackingOptionalTitle: 'Magic mask',
    trackingOptionalSub: 'Optional: make the mask follow your pet as they move',
    calibrateStart: '📷 Show pet to camera',
    calibrateDone: (n: number) => `✅ Clues found: ${n} — update`,
    calibrateFinish: 'Done',
    capturedPoints: (n: number) => `Clues found: ${n}`,
    loadingModel: 'Getting the camera ready...',
    modelUnavailable: 'The camera could not find a pet',
    cameraUnavailable: 'Camera unavailable',
    needCamera: 'Camera access needed',
    needCameraText: 'Allow the camera so the AR filter can follow your pet\'s head.',
    needMedia: 'Access needed',
    needMediaCamera: 'Allow camera access to record a clip.',
    needMediaLibrary: 'Allow access to your videos.',
    needVideoFirst: 'Choose a video first',
    needVideoFirstText: 'The workshop needs a video of your pet.',
    memeCreated: 'Meme created',
    memeCreatedText: 'Story saved in the workshop.',
    exportError: 'Could not save',
    exportErrorText: 'Could not prepare the clip for sharing.',
    emptyPreviewText: 'Choose or record a video of your pet',
    templates: [
      { id: 'food', title: 'Food alarm', top: 'When you heard the treat bag', caption: 'The bowl looks suspiciously empty.' },
      { id: 'fridge', title: 'Fridge', top: 'Checking strategic reserves', caption: "I'm not fat. I'm fluffy." },
      { id: 'director', title: 'Camera', top: 'Filming me again?', caption: 'I demand payment in treats.' },
      { id: 'walk', title: 'Walk', top: 'When they said "walk"', caption: "The leash won't put itself on." },
    ],
    filters: [
      { id: 'none', label: 'No filter' },
      { id: 'glasses', label: 'Glasses' },
      { id: 'crown', label: 'Crown' },
      { id: 'pirate', label: 'Pirate' },
      { id: 'detective', label: 'Detective' },
      { id: 'billionaire', label: 'Billionaire' },
      { id: 'cowboy', label: 'Cowboy' },
      { id: 'astronaut', label: 'Astronaut' },
      { id: 'gigachad', label: 'Strong hero' },
      { id: 'clown', label: 'Clown' },
    ],
    mp4ReadyTitle: 'Video is ready',
    mp4ReadyText: 'Now you can share the video.',
    exportedFallbackTitle: 'Sharing the original video',
    exportedFallbackText: 'The mask could not be added to the finished clip, so the original video will open.',
    reelsHint: 'Ready to show your friends.',
  },
  translate: {
    petNotFound: 'Pet not found',
    soundTitle: 'Listen to your pet',
    photoTitle: 'Look at a photo',
    videoTitle: 'Look at a video',
    soundInstruction: 'Tap the big button and wait for a meow or woof.',
    photoInstruction: 'Tap the big button and pick a clear pet photo.',
    videoInstruction: 'Tap the big button and pick a pet video.',
    recordingTipTitle: 'Little secret',
    recordingTipText: 'Move the phone closer and record 2–5 seconds. It works best when the room is quiet.',
    startRecording: 'Tap to listen',
    pickPhoto: 'Choose photo',
    pickVideo: 'Choose video',
    recording: 'I am listening...',
    stopRecording: 'Done! Stop',
    stopHint: 'When you have the sound, tap the big button.',
    analyzing: 'Solving the mystery...',
    analyzingDisclaimer: 'The model recognizes the kind of sound. Its exact meaning and mood are still a playful guess.',
    needMic: 'Microphone access needed',
    needPhotoAccess: 'Photo access needed',
    needMediaAccess: 'Media access needed',
    recordError: 'Recording error',
    noSoundTitle: 'I could not hear your pet',
    noSoundText: 'Try again: move the phone closer and record a meow or woof.',
    soundTooShort: 'I need to listen a little longer',
    soundTooShortText: 'Record at least one second of your pet’s voice. Two to five seconds works best.',
    noPetSoundTitle: 'I could not recognize a pet sound',
    noPetSoundText: 'I can hear something, but the model did not recognize a meow, purr, bark, or another pet sound.',
    soundUncertainTitle: 'The model is not sure yet',
    soundUncertainText: 'Try again closer to your pet when the room is quiet.',
    wrongSpeciesTitle: 'A different pet may be selected',
    wrongSpeciesCat: 'This sounds more like a dog, but the selected pet is a cat.',
    wrongSpeciesDog: 'This sounds more like a cat, but the selected pet is a dog.',
    soundModelReady: 'Sound recognition is ready',
    soundModelLoading: 'Loading sound recognition...',
    soundModelLoadingText: 'Wait a moment and try again.',
    soundModelFailed: 'Sound recognition could not start',
    soundModelFailedText: 'The sound model could not start on this phone.',
    quickCatName: 'Cat without a profile',
    quickDogName: 'Dog without a profile',
    analysisSteps: [
      '👂 Comparing the voice with the sound model...',
      '👀 Looking for useful clues...',
      '🧠 Putting the mood together...',
      '🐾 Checking the guess...',
      '✨ Preparing the translation...',
    ],
    modelReady: 'Camera ready',
    modelLoading: 'Getting the camera ready...',
    modelFailed: 'The camera could not find a pet',
    noDetectionYet: 'No cat/dog detected yet',
    needCamera: 'Camera access needed',
    needCameraText: 'Allow camera access so we can try to spot your pet.',
    noPetInFrame: 'I cannot see a pet yet',
    noPetInFrameText: 'Keep the cat or dog in the frame a little longer.',
    detectedCat: 'I can see a cat',
    detectedDog: 'I can see a dog',
    stopLive: 'Stop',
    liveAnalysis: 'Look through the camera',
    useLiveResult: 'Use this clue',
  },
  result: {
    title: 'Our playful guess',
    home: '← Home',
    translationLabel: '💬 What it might mean',
    analysisLabel: '🔎 Clues we noticed',
    feedbackLabel: '🐾 Does this feel right?',
    feedbackHint: 'Your answer helps the app remember your pet.',
    likeActive: '❤️ Liked',
    like: '🤍 Like',
    similar: '✅ Accurate',
    notSimilar: '❌ Not accurate',
    thoughtsLabel: '🧠 Pet thoughts',
    storyLabel: '📖 Story',
    disclaimer: '🎭 This is a playful guess based on loudness, pauses, behavior, and habits. It is not a literal translation and can be wrong.',
    quickSaveLabel: 'Quick mode',
    quickSaveTitle: 'Save this pet?',
    quickSaveText: "Add a profile so future translations account for its name, type, personality, and your feedback.",
    quickSaveBtn: 'Add pet',
    shareTitle: '📤 Share the result',
    copyText: '📋 Copy text',
    otherWays: '📱 Other ways',
    tryAgain: '🔄 Translate again',
    shareViral: 'Show friends',
    shareStories: 'Add to a story',
    shareTelegramSub: 'Send to friends',
    shareWhatsappSub: 'Share in a chat',
    copyOnlyNotice: (platform: string) => `Text copied — opening ${platform}, just paste it into the caption.`,
    feedbackSaved: 'Got it',
    feedbackSavedText: "Future translations for this pet will take your rating into account.",
    shareSuccess: '🎉 Awesome!',
    shareSuccessText: 'Thanks for sharing! +5 XP',
    copySuccess: '✅ Copied',
    copySuccessText: 'Text copied',
    notFound: 'Result not found',
    intensityLabel: 'Clue strength:',
    clueStrength: (strength: number) => strength >= 70
      ? 'many clues'
      : strength >= 45
        ? 'some clues'
        : 'few clues',
    mainGuess: 'main guess',
    otherGuess: 'another guess',
    emotionLine: (emotion: string) => `Looks like: ${emotion}`,
    recognizedSoundLabel: '👂 Sound recognized by the model',
    recognitionClear: 'The model recognized this kind of sound clearly.',
    recognitionTentative: 'The model found this sound, but the recording was not very clear.',
    recognitionDisclaimer: 'The model recognized the kind of sound, not its exact meaning. The mood below is a playful guess.',
  },
  stateLabels: {
    hunger: 'Hunger',
    walk: 'Walk',
    attention: 'Attention',
    play: 'Play',
    rest: 'Rest',
    stress: 'Stress',
    curiosity: 'Curiosity',
  },
};

export const I18N: Record<Language, Dictionary> = { ru, en };
