import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

const DAILY_NOTIF_ID = 'pet-daily-reminder';
const DAILY_NOTIF_ENABLED_KEY = 'pet_daily_reminder_enabled_v1';

const MESSAGES_BY_LANG = {
  ru: [
    { title: '🐾 Пора проведать питомца', body: 'Послушаем его и попробуем угадать настроение?' },
    { title: '🐱 Время поиграть!', body: 'Запиши мяу или гав и получи весёлую подсказку' },
    { title: '🎤 Послушаем питомца?', body: 'Большая кнопка уже ждёт мяу или гав' },
    { title: '🐶 Пушистый друг ждёт', body: 'Загляни к питомцу и поиграй вместе с ним' },
    { title: '✨ Ещё один день вместе', body: 'Попробуй новую весёлую догадку сегодня' },
  ],
  en: [
    { title: '🐾 Time to visit your pet', body: 'Shall we listen and make a playful mood guess?' },
    { title: '🐱 Time to play!', body: 'Record a meow or woof and get a fun clue' },
    { title: '🎤 Shall we listen?', body: 'The big button is waiting for a meow or woof' },
    { title: '🐶 Your furry friend is waiting', body: 'Visit your pet and play together' },
    { title: '✨ Another day together', body: 'Try a new playful guess today' },
  ],
} as const;

export async function requestNotificationPermission(): Promise<boolean> {
  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

export async function getDailyReminderEnabled(): Promise<boolean> {
  if (Platform.OS === 'web') return false;
  return (await AsyncStorage.getItem(DAILY_NOTIF_ENABLED_KEY)) === 'true';
}

export async function scheduleDailyReminder(hourLocal: number = 18, language: 'ru' | 'en' = 'ru'): Promise<void> {
  try {
    await Notifications.cancelScheduledNotificationAsync(DAILY_NOTIF_ID).catch(() => {});

    const messages = MESSAGES_BY_LANG[language];
    const msg = messages[Math.floor(Math.random() * messages.length)];

    await Notifications.scheduleNotificationAsync({
      identifier: DAILY_NOTIF_ID,
      content: {
        title: msg.title,
        body: msg.body,
        sound: false,
        data: { screen: '/(tabs)' },
      },
      trigger: {
        // DAILY trigger fires at this hour in the device's local timezone.
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour: hourLocal,
        minute: 0,
      } as Notifications.DailyTriggerInput,
    });
  } catch {}
}

export async function cancelDailyReminder(): Promise<void> {
  try {
    await Notifications.cancelScheduledNotificationAsync(DAILY_NOTIF_ID);
  } catch {}
}

export async function setDailyReminderEnabled(enabled: boolean, language: 'ru' | 'en' = 'ru'): Promise<boolean> {
  if (Platform.OS === 'web') return false;

  if (!enabled) {
    await cancelDailyReminder();
    await AsyncStorage.setItem(DAILY_NOTIF_ENABLED_KEY, 'false');
    return false;
  }

  const granted = await requestNotificationPermission();
  if (!granted) {
    await cancelDailyReminder();
    await AsyncStorage.setItem(DAILY_NOTIF_ENABLED_KEY, 'false');
    return false;
  }

  await scheduleDailyReminder(18, language);
  await AsyncStorage.setItem(DAILY_NOTIF_ENABLED_KEY, 'true');
  return true;
}

export async function initNotifications(language: 'ru' | 'en' = 'ru'): Promise<void> {
  if (Platform.OS === 'web') return;
  const enabled = await getDailyReminderEnabled();
  if (!enabled) return;

  const { status } = await Notifications.getPermissionsAsync();
  if (status === 'granted') {
    await scheduleDailyReminder(18, language);
  } else {
    await cancelDailyReminder();
    await AsyncStorage.setItem(DAILY_NOTIF_ENABLED_KEY, 'false');
  }
}
