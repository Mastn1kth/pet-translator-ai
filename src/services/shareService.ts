/**
 * СЕРВИС ШЕРИНГА
 * Создание красивых карточек для соцсетей
 */

import * as Sharing from 'expo-sharing';
import { File, Paths } from 'expo-file-system';
import * as Clipboard from 'expo-clipboard';
import { Linking } from 'react-native';
import { TranslationResult } from '../types';
import { trackEvent } from './analyticsService';

export interface ShareOptions {
  platform: 'tiktok' | 'instagram' | 'telegram' | 'whatsapp' | 'generic';
  includeAppLink: boolean;
  language?: 'ru' | 'en';
}

export interface ShareResult {
  success: boolean;
  /** True when the text was copied to the clipboard because the target platform
   * has no public "share with pre-filled text" intent (TikTok, Instagram) — the
   * app is opened directly and the user pastes the caption themselves. */
  copiedToClipboard: boolean;
}

/**
 * Генерация текста для шеринга
 */
export function generateShareText(
  result: TranslationResult,
  includeAppLink: boolean = true,
  language: 'ru' | 'en' = 'ru'
): string {
  const { petName, petType, mood, translation, character } = result;
  
  const petEmoji = petType === 'cat' ? '🐱' : '🐕';
  const characterName = getCharacterName(character, language);

  if (language === 'en') {
    let text = `${petEmoji} My ${petType === 'cat' ? 'cat' : 'dog'} ${petName} gave me this playful clue:\n\n`;
    text += `"${translation}"\n\n`;
    text += `Mood guess: ${mood}\n`;
    text += `Funny voice: ${characterName}\n`;
    if (includeAppLink) {
      text += '\n🎭 Made with Furry Translator\n';
      text += '📱 Listen to your pet and make a playful guess!';
    }
    return text;
  }
  
  let text = `${petEmoji} Мой ${petType === 'cat' ? 'кот' : 'пёс'} ${petName} дал весёлую подсказку:\n\n`;
  text += `"${translation}"\n\n`;
  text += `Догадка о настроении: ${mood}\n`;
  text += `Смешной голос: ${characterName}\n`;
  
  if (includeAppLink) {
    text += `\n🎭 Сделано в «Пушистом переводчике»\n`;
    text += `📱 Послушай питомца и попробуй угадать его настроение!`;
  }
  
  return text;
}

/**
 * Генерация хэштегов
 */
export function generateHashtags(result: TranslationResult): string {
  const { petType } = result;
  
  const baseTags = [
    '#PetTranslator',
    '#ПереводчикПитомцев',
    petType === 'cat' ? '#Кот' : '#Собака',
    petType === 'cat' ? '#Cat' : '#Dog',
    '#Pets',
    '#Питомцы',
  ];
  
  return baseTags.join(' ');
}

/**
 * Поделиться результатом
 */
export async function shareTranslation(
  result: TranslationResult,
  options: ShareOptions = { platform: 'generic', includeAppLink: true }
): Promise<ShareResult> {
  try {
    const language = options.language || 'ru';
    const text = generateShareText(result, options.includeAppLink, language);
    const hashtags = generateHashtags(result);
    const fullText = `${text}\n\n${hashtags}`;

    // TikTok and Instagram have no public "share with pre-filled caption" intent
    // for third-party apps, so we copy the text and open the app directly instead
    // of silently falling back to the generic OS share sheet.
    if (options.platform === 'tiktok') {
      const copiedToClipboard = await openAppWithClipboard(fullText, 'tiktok://', language);
      return { success: true, copiedToClipboard };
    }
    if (options.platform === 'instagram') {
      const copiedToClipboard = await openAppWithClipboard(fullText, 'instagram://app', language);
      return { success: true, copiedToClipboard };
    }

    const isAvailable = await Sharing.isAvailableAsync();
    if (!isAvailable) {
      console.log('Sharing is not available on this device');
      return { success: false, copiedToClipboard: false };
    }

    switch (options.platform) {
      case 'telegram':
        await shareToTelegram(fullText, language);
        break;
      case 'whatsapp':
        await shareToWhatsApp(fullText, language);
        break;
      default:
        await shareGeneric(fullText, language);
    }

    return { success: true, copiedToClipboard: false };
  } catch (error) {
    console.error('Share error:', error);
    return { success: false, copiedToClipboard: false };
  }
}

/**
 * Copies text to the clipboard and opens the target app directly if installed;
 * falls back to the generic OS share sheet otherwise. Returns whether the
 * clipboard copy path was used (i.e. the app was opened without a pre-filled caption).
 */
async function openAppWithClipboard(text: string, appUrl: string, language: 'ru' | 'en'): Promise<boolean> {
  const canOpenApp = await Linking.canOpenURL(appUrl);
  if (canOpenApp) {
    await Clipboard.setStringAsync(text);
    await Linking.openURL(appUrl);
    return true;
  }

  const isAvailable = await Sharing.isAvailableAsync();
  if (isAvailable) {
    await shareGeneric(text, language);
  }
  return false;
}

/**
 * Generic sharing
 */
async function shareGeneric(text: string, language: 'ru' | 'en' = 'ru'): Promise<void> {
  // Создаём временный файл с текстом
  const file = new File(Paths.cache, 'share.txt');
  if (!file.exists) {
    file.create({ intermediates: true, overwrite: true });
  }
  file.write(text);
  
  await Sharing.shareAsync(file.uri, {
    mimeType: 'text/plain',
    dialogTitle: language === 'en' ? 'Share pet clue' : 'Поделиться подсказкой',
  });
}

async function openUrlOrShare(
  url: string,
  fallbackText: string,
  language: 'ru' | 'en'
): Promise<void> {
  const canOpen = await Linking.canOpenURL(url);
  if (canOpen) {
    await Linking.openURL(url);
    return;
  }

  await shareGeneric(fallbackText, language);
}

/**
 * Поделиться в Telegram
 */
async function shareToTelegram(text: string, language: 'ru' | 'en'): Promise<void> {
  // Telegram deep link
  const encodedText = encodeURIComponent(text);
  const telegramUrl = `https://t.me/share/url?url=&text=${encodedText}`;
  await openUrlOrShare(telegramUrl, text, language);
}

/**
 * Поделиться в WhatsApp
 */
async function shareToWhatsApp(text: string, language: 'ru' | 'en'): Promise<void> {
  // WhatsApp deep link
  const encodedText = encodeURIComponent(text);
  const whatsappUrl = `whatsapp://send?text=${encodedText}`;
  const whatsappWebUrl = `https://wa.me/?text=${encodedText}`;
  
  const canOpenApp = await Linking.canOpenURL(whatsappUrl);
  await openUrlOrShare(canOpenApp ? whatsappUrl : whatsappWebUrl, text, language);
}

/**
 * Копировать текст в буфер обмена
 */
export async function copyToClipboard(
  result: TranslationResult,
  language: 'ru' | 'en' = 'ru'
): Promise<boolean> {
  try {
    const text = generateShareText(result, true, language);
    const hashtags = generateHashtags(result);
    const fullText = `${text}\n\n${hashtags}`;
    
    await Clipboard.setStringAsync(fullText);
    return true;
  } catch (error) {
    console.error('Copy error:', error);
    return false;
  }
}

/**
 * Получить имя персонажа
 */
function getCharacterName(character: string, language: 'ru' | 'en'): string {
  const namesRu: Record<string, string> = {
    default: 'Обычный',
    gigachad: 'Силач',
    sigma: 'Спокойный герой',
    alphacat: 'Король котов',
    billionaire: 'Хозяин сокровищ',
    streamer: 'Весёлый ведущий',
    grandpa: 'Дедушка',
    toxic: 'Ворчун',
    professor: 'Профессор',
    hood: 'Дворовый герой',
    mafia: 'Важный босс',
    anime: 'Звёздочка',
    shrek: 'Болотный великан',
    elon: 'Космический изобретатель',
    emperor: 'Король',
    philosopher: 'Философ',
    pirate: 'Пират',
  };
  const namesEn: Record<string, string> = {
    default: 'Friendly',
    gigachad: 'Strong hero',
    sigma: 'Calm hero',
    alphacat: 'Cat king',
    billionaire: 'Treasure keeper',
    streamer: 'Fun host',
    grandpa: 'Grandpa',
    toxic: 'Grumbler',
    professor: 'Professor',
    hood: 'Yard hero',
    mafia: 'Important boss',
    anime: 'Little star',
    shrek: 'Swamp giant',
    elon: 'Space inventor',
    emperor: 'Royal',
    philosopher: 'Thinker',
    pirate: 'Pirate',
  };
  const names = language === 'en' ? namesEn : namesRu;
  return names[character] || (language === 'en' ? 'Funny voice' : 'Смешной голос');
}

/**
 * Трекинг шеринга
 */
export function trackShare(
  result: TranslationResult,
  platform: string
): void {
  trackEvent('share_translation', {
    platform,
    character: result.character,
    mood: result.mood,
    petType: result.petType,
  });
}
