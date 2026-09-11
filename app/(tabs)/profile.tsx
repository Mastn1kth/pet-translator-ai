import React from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, Alert
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppStore } from '../../src/store/appStore';
import { getCharacters } from '../../src/engine/characterEngine';
import { COLORS, FONTS, RADIUS, SHADOWS } from '../../src/constants/theme';
import { PetPatternLayer } from '../../src/components/ui/TexturedBackground';
import { useTheme } from '../../src/hooks/useTheme';
import { useTranslation } from '../../src/hooks/useTranslation';
import {
  getDailyReminderEnabled,
  scheduleDailyReminder,
  setDailyReminderEnabled,
} from '../../src/services/notificationService';

function charGradient(hex: string): [string, string] {
  return [hex, hex + 'CC'];
}

const ACHIEVEMENT_COPY: Record<'ru' | 'en', Record<string, { title: string; description: string }>> = {
  ru: {
    first_translation: { title: 'Первая догадка', description: 'Ты впервые послушал питомца!' },
    ten_translations: { title: '10 догадок', description: 'Ты отлично замечаешь подсказки!' },
    fifty_translations: { title: '50 догадок', description: 'Настоящий друг питомцев!' },
    hundred_translations: { title: '100 догадок', description: 'Пушистая легенда!' },
    first_meme: { title: 'Первая история', description: 'Получилось очень смешно!' },
    week_streak: { title: 'Неделя вместе', description: '7 дней без пропусков!' },
    month_streak: { title: 'Месяц вместе', description: '30 дней приключений!' },
  },
  en: {
    first_translation: { title: 'First guess', description: 'You listened to your pet for the first time!' },
    ten_translations: { title: '10 guesses', description: 'You are great at spotting clues!' },
    fifty_translations: { title: '50 guesses', description: 'A true friend to pets!' },
    hundred_translations: { title: '100 guesses', description: 'A furry legend!' },
    first_meme: { title: 'First story', description: 'That was very funny!' },
    week_streak: { title: 'A week together', description: '7 days without a break!' },
    month_streak: { title: 'A month together', description: '30 days of adventures!' },
  },
};

export default function ProfileScreen() {
  const { toggleTheme, isDark, colors } = useTheme();
  const { t, language, setLanguage } = useTranslation();
  const [dailyReminderEnabled, setDailyReminderEnabledState] = React.useState(false);
  const [isSavingReminder, setIsSavingReminder] = React.useState(false);
  const selectedCharacter = useAppStore((s) => s.selectedCharacter);
  const setCharacter = useAppStore((s) => s.setCharacter);
  const stats = useAppStore((s) => s.stats);
  const achievements = useAppStore((s) => s.achievements);
  const characters = getCharacters(language);

  const unlockedAchievements = achievements.filter((a) => a.isUnlocked);

  React.useEffect(() => {
    let isMounted = true;
    getDailyReminderEnabled()
      .then((enabled) => {
        if (isMounted) setDailyReminderEnabledState(enabled);
      })
      .catch(() => {
        if (isMounted) setDailyReminderEnabledState(false);
      });
    return () => {
      isMounted = false;
    };
  }, []);

  const isFirstLanguageRender = React.useRef(true);
  React.useEffect(() => {
    if (isFirstLanguageRender.current) {
      isFirstLanguageRender.current = false;
      return;
    }
    if (dailyReminderEnabled) {
      scheduleDailyReminder(18, language);
    }
  }, [language]);

  const handleDailyReminderChange = async (enabled: boolean) => {
    setIsSavingReminder(true);
    try {
      const saved = await setDailyReminderEnabled(enabled, language);
      setDailyReminderEnabledState(saved);
      if (enabled && !saved) {
        Alert.alert(t.profile.remindersOffTitle, t.profile.remindersOffText);
      }
    } finally {
      setIsSavingReminder(false);
    }
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
      <PetPatternLayer />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>{t.profile.title}</Text>
        </View>

        {/* Stats */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>{t.profile.statsTitle}</Text>
          <LinearGradient colors={colors.gradientApple} style={styles.statsGrid}>
            {[
              { label: t.profile.statTranslations, value: stats.totalTranslations, emoji: '🎤' },
              { label: t.profile.statPhotos, value: stats.totalPhotos, emoji: '📸' },
              { label: t.profile.statVideos, value: stats.totalVideos, emoji: '🎥' },
              { label: t.profile.statMemes, value: stats.totalMemes, emoji: '😂' },
              { label: t.profile.statStreak, value: stats.currentStreak, emoji: '🔥' },
              { label: t.profile.statBest, value: stats.longestStreak, emoji: '🏆' },
            ].map((s, i) => (
              <View key={i} style={styles.statItem}>
                <Text style={styles.statEmoji}>{s.emoji}</Text>
                <Text style={[styles.statNum, { color: colors.text }]}>{s.value}</Text>
                <Text style={[styles.statLabel, { color: colors.textMuted }]}>{s.label}</Text>
              </View>
            ))}
          </LinearGradient>
        </View>

        {/* Characters */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>{t.profile.charactersTitle}</Text>
          <Text style={[styles.sectionSub, { color: colors.textSub }]}>{t.profile.charactersSub}</Text>
          <View style={styles.charGrid}>
            {characters.map((char) => {
              const isSelected = selectedCharacter === char.id;
              const activeGrad = charGradient(char.color ?? COLORS.primary);
              return (
                <TouchableOpacity
                  key={char.id}
                  onPress={() => setCharacter(char.id)}
                  style={[styles.charCard, isSelected && styles.charCardSelected]}
                >
                  <LinearGradient
                    colors={isSelected ? activeGrad : colors.gradientApple}
                    style={styles.charGrad}
                  >
                    <Text style={styles.charEmoji}>{char.emoji}</Text>
                    <Text style={[styles.charName, { color: colors.text }]} numberOfLines={1}>{char.name}</Text>
                    {char.isViral && <Text style={styles.viralBadge}>🔥</Text>}
                  </LinearGradient>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Achievements */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>{t.profile.achievementsTitle} ({unlockedAchievements.length}/{achievements.length})</Text>
          {achievements.map((a) => {
            const copy = ACHIEVEMENT_COPY[language][a.id] || {
              title: a.title,
              description: a.description,
            };
            return (
              <View
                key={a.id}
                style={[
                  styles.achievementRow,
                  { backgroundColor: colors.surface, borderColor: colors.border },
                  !a.isUnlocked && styles.achievementLocked,
                ]}
              >
                <Text style={styles.achievementEmoji}>{a.emoji}</Text>
                <View style={styles.achievementInfo}>
                  <Text style={[styles.achievementTitle, { color: a.isUnlocked ? colors.text : colors.textMuted }]}>
                    {copy.title}
                  </Text>
                  <Text style={[styles.achievementDesc, { color: colors.textSub }]}>{copy.description}</Text>
                </View>
                {a.isUnlocked && <Text style={styles.checkmark}>✅</Text>}
              </View>
            );
          })}
        </View>

        {/* Settings */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>{t.profile.settingsTitle}</Text>
          <LinearGradient colors={colors.gradientApple} style={styles.settingsCard}>
            <View style={styles.settingRow}>
              <Text style={[styles.settingLabel, { color: colors.text }]}>{t.profile.darkTheme}</Text>
              <Switch
                value={isDark}
                onValueChange={toggleTheme}
                trackColor={{ false: colors.border, true: COLORS.primary }}
                thumbColor={colors.surface}
              />
            </View>
            <View style={[styles.settingRow, styles.settingDivider, { borderTopColor: colors.border }]}>
              <Text style={[styles.settingLabel, { color: colors.text }]}>{t.profile.dailyReminder}</Text>
              <Switch
                value={dailyReminderEnabled}
                onValueChange={handleDailyReminderChange}
                disabled={isSavingReminder}
                trackColor={{ false: colors.border, true: COLORS.primary }}
                thumbColor={colors.surface}
              />
            </View>
            <View style={[styles.settingRow, styles.settingDivider, { borderTopColor: colors.border }]}>
              <Text style={[styles.settingLabel, { color: colors.text }]}>{t.profile.language}</Text>
              <View style={styles.langSwitch}>
                <TouchableOpacity
                  onPress={() => setLanguage('ru')}
                  style={[styles.langOption, language === 'ru' && { backgroundColor: COLORS.primary }]}
                >
                  <Text style={[styles.langOptionText, { color: language === 'ru' ? '#fff' : colors.textMuted }]}>RU</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setLanguage('en')}
                  style={[styles.langOption, language === 'en' && { backgroundColor: COLORS.primary }]}
                >
                  <Text style={[styles.langOptionText, { color: language === 'en' ? '#fff' : colors.textMuted }]}>EN</Text>
                </TouchableOpacity>
              </View>
            </View>
          </LinearGradient>
        </View>

        <View style={styles.section}>
          <Text style={[styles.disclaimer, { backgroundColor: colors.surface, color: colors.textMuted }]}>
            {t.profile.disclaimer}
          </Text>
        </View>

        <View style={{ height: 30 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bgPrimary },
  content: {
    width: '100%',
    maxWidth: 720,
    alignSelf: 'center',
    paddingBottom: 104,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 16,
  },
  title: {
    color: COLORS.textPrimary,
    fontFamily: FONTS.family.display,
    fontSize: 29,
    fontWeight: FONTS.weights.black,
  },
  section: { paddingHorizontal: 16, marginTop: 20 },
  sectionTitle: {
    color: COLORS.textPrimary,
    fontFamily: FONTS.family.display,
    fontSize: FONTS.sizes.lg,
    fontWeight: FONTS.weights.black,
    marginBottom: 4,
  },
  sectionSub: { color: COLORS.textSecondary, fontSize: FONTS.sizes.sm, marginBottom: 12 },
  statsGrid: { borderRadius: 28, padding: 16, flexDirection: 'row', flexWrap: 'wrap' },
  statItem: { width: '33%', alignItems: 'center', padding: 12 },
  statEmoji: { fontSize: 22, marginBottom: 4 },
  statNum: {
    color: COLORS.textPrimary,
    fontFamily: FONTS.family.display,
    fontSize: FONTS.sizes.xl,
    fontWeight: FONTS.weights.black,
  },
  statLabel: { color: COLORS.textMuted, fontSize: FONTS.sizes.xs, marginTop: 2, textAlign: 'center' },
  charGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  charCard: { width: '30%', borderRadius: 22, overflow: 'hidden' },
  charCardSelected: { ...SHADOWS.md },
  charGrad: { padding: 12, alignItems: 'center', gap: 4, minHeight: 85, justifyContent: 'center', position: 'relative' },
  charEmoji: { fontSize: 28 },
  charName: {
    color: COLORS.textPrimary,
    fontFamily: FONTS.family.display,
    fontSize: FONTS.sizes.xs,
    fontWeight: FONTS.weights.black,
    textAlign: 'center',
  },
  viralBadge: { position: 'absolute', top: 4, right: 4, fontSize: 12 },
  achievementRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    backgroundColor: COLORS.bgCard,
    borderWidth: 1,
    borderRadius: 22,
    marginBottom: 8,
  },
  achievementLocked: { opacity: 0.4 },
  achievementEmoji: { fontSize: 28 },
  achievementInfo: { flex: 1 },
  achievementTitle: {
    color: COLORS.textPrimary,
    fontFamily: FONTS.family.display,
    fontSize: FONTS.sizes.md,
    fontWeight: FONTS.weights.black,
  },
  achievementDesc: { color: COLORS.textSecondary, fontSize: FONTS.sizes.sm, marginTop: 2 },
  checkmark: { fontSize: 20 },
  settingsCard: { borderRadius: 26, overflow: 'hidden' },
  settingRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16 },
  settingDivider: { borderTopWidth: 1 },
  settingLabel: { color: COLORS.textPrimary, fontSize: FONTS.sizes.md },
  langSwitch: { flexDirection: 'row', gap: 6, backgroundColor: 'rgba(148,163,184,0.16)', borderRadius: RADIUS.full, padding: 3 },
  langOption: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: RADIUS.full },
  langOptionText: { fontSize: FONTS.sizes.sm, fontWeight: FONTS.weights.black },
  disclaimer: {
    color: COLORS.textMuted,
    fontSize: FONTS.sizes.sm,
    textAlign: 'center',
    lineHeight: 20,
    backgroundColor: COLORS.bgCard,
    borderRadius: RADIUS.lg,
    padding: 16,
  },
});
