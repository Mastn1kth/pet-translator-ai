# 🐾 Pet Translator AI

> Узнай, что думает твой питомец! Переводчик с кошачьего и собачьего на человеческий.

[![Expo](https://img.shields.io/badge/Expo-56-blue.svg)](https://expo.dev/)
[![React Native](https://img.shields.io/badge/React%20Native-0.85-green.svg)](https://reactnative.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-6.0-blue.svg)](https://www.typescriptlang.org/)

## 📱 О приложении

Pet Translator AI — развлекательное приложение, которое локально распознаёт типичные звуки кошек и собак, а затем создаёт понятную игровую интерпретацию их настроения. Это не буквальный перевод языка животных и не ветеринарная диагностика. Приложение полностью бесплатное и безлимитное — без рекламы и подписок.

### ✨ Основные функции

- 🎤 **Распознавание звука** — локальная TFLite-модель отличает мяуканье, мурчание, шипение, лай, вой, рычание и скуление; при неуверенном результате перевод не создаётся
- 📸 **Фотоанализ** — загрузи фото питомца
- 🎥 **Видеоанализ** — live-детекция кота/собаки через TFLite-модель + анализ видео
- 🎭 **20 персонажей** — от Императора до Гигачада, все открыты сразу
- 🏆 **Достижения и уровни** — XP, streak, редкие эмоции
- 📤 **Шеринг** — делись в TikTok, Instagram, Telegram, WhatsApp
- 📚 **Статьи и FAQ** — почему питомец так делает
- 🔔 **Ежедневные напоминания** — push-уведомления

## 🚀 Быстрый старт

### Требования

- Node.js 18+
- npm
- Expo CLI
- Android Studio или Xcode (для эмуляторов)

### Установка

```bash
npm install
npm run android   # или npm run ios / npm start
```

### Проверка перед сборкой

```bash
npm run typecheck   # tsc --noEmit
npm run verify       # typecheck + engine unit-тесты
```

## 📂 Структура проекта

```
cat_voice_fix/
├── app/                          # Экраны (Expo Router)
│   ├── (tabs)/                   # Табы навигации
│   │   ├── index.tsx            # Главная
│   │   ├── analyzer.tsx         # Быстрый анализатор
│   │   ├── pets.tsx             # Питомцы
│   │   ├── memes.tsx            # Мемы
│   │   ├── faq.tsx              # FAQ + статьи
│   │   └── profile.tsx          # Профиль, персонажи, достижения
│   ├── translate/[petId].tsx    # Экран записи/анализа
│   ├── result/[id].tsx          # Результат перевода + шеринг
│   ├── article/[id].tsx         # Статья
│   └── onboarding.tsx           # Онбординг
├── src/
│   ├── components/               # UI компоненты
│   ├── constants/                 # Тема, строки, SEO-контент
│   ├── engine/                    # Бизнес-логика (переводы, персонажи, память)
│   ├── services/                  # notificationService, shareService, petVisionModel
│   ├── store/appStore.ts          # Zustand store
│   └── types/index.ts
├── assets/                        # Иконки, сплэш
└── android/                       # Нативный Android-проект (prebuild)
```

## 🎭 Персонажи

20 персонажей — все открыты по умолчанию, ограничений нет. Полный список в [`src/engine/characterEngine.ts`](src/engine/characterEngine.ts).

## 🛠️ Технологии

- **Framework:** React Native 0.85 + Expo 56
- **Language:** TypeScript 6
- **Navigation:** Expo Router
- **State:** Zustand + AsyncStorage
- **Vision:** react-native-vision-camera + react-native-fast-tflite (live-детекция питомца)
- **Audio:** expo-audio PCM stream + локальная YAMNet TFLite-классификация
- **Notifications:** expo-notifications

## 📄 Лицензия

MIT License — см. [LICENSE](LICENSE).

---

*Disclaimer: приложение создано в развлекательных целях. Результаты — юмористическая интерпретация поведения питомца, не научное исследование.*
