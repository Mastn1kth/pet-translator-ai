import React, { useEffect, useMemo, useState } from 'react';
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAppStore } from '../../src/store/appStore';
import { COLORS, FONTS, RADIUS } from '../../src/constants/theme';
import TexturedBackground from '../../src/components/ui/TexturedBackground';
import { TranslationMode } from '../../src/types';
import { useTheme } from '../../src/hooks/useTheme';
import { useTranslation } from '../../src/hooks/useTranslation';

function clampMetric(value: number) {
  return Math.max(8, Math.min(100, Math.round(value)));
}

export default function AnalyzerScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { t } = useTranslation();
  const pets = useAppStore((s) => s.pets);
  const stats = useAppStore((s) => s.stats);
  const selectedPetId = useAppStore((s) => s.selectedPetId);
  const setSelectedPetId = useAppStore((s) => s.setSelectedPetId);

  const [mode, setMode] = useState<TranslationMode>('sound');

  const MODES: Array<{
    id: TranslationMode;
    title: string;
    subtitle: string;
    emoji: string;
    colors: readonly [string, string];
  }> = [
    { id: 'sound', title: t.home.voiceTitle, subtitle: t.analyzer.modeSoundSub, emoji: '🎙️', colors: COLORS.gradientDuo },
    { id: 'photo', title: t.home.photoTitle, subtitle: t.analyzer.modePhotoSub, emoji: '📸', colors: COLORS.gradientSky },
    { id: 'video', title: t.home.videoTitle, subtitle: t.analyzer.modeVideoSub, emoji: '🎬', colors: COLORS.gradientSun },
  ];

  const selectedPet = pets.find((p) => p.id === selectedPetId) || pets[0];
  const selectedMode = MODES.find((m) => m.id === mode) || MODES[0];

  useEffect(() => {
    if (!selectedPetId && pets[0]) {
      setSelectedPetId(pets[0].id);
    } else if (selectedPetId && pets.length > 0 && !pets.some((pet) => pet.id === selectedPetId)) {
      setSelectedPetId(pets[0].id);
    }
  }, [pets, selectedPetId, setSelectedPetId]);

  const profile = useMemo(() => {
    if (!selectedPet) {
      return {
        energy: 35,
        mood: 42,
        focus: 30,
        verdict: t.analyzer.noPetVerdict,
        hint: t.analyzer.noPetHint,
      };
    }

    const p = selectedPet.personality;
    const energy = clampMetric((p.energy + p.curiosity + p.friendliness) / 3);
    const mood = clampMetric((p.drama + p.gluttony + p.friendliness) / 3);
    const focus = clampMetric((p.intelligence + p.curiosity + (100 - p.laziness)) / 3);

    let verdict = t.analyzer.verdictNormal;
    if (p.drama > 72) verdict = t.analyzer.verdictDrama;
    else if (p.energy > 72) verdict = t.analyzer.verdictEnergy;
    else if (p.laziness > 72) verdict = t.analyzer.verdictLazy;
    else if (p.curiosity > 72) verdict = t.analyzer.verdictCuriosity;

    return {
      energy,
      mood,
      focus,
      verdict,
      hint: t.analyzer.petHint(selectedPet.name, selectedPet.type),
    };
  }, [selectedPet, t]);

  const handleAnalyze = () => {
    if (!selectedPet) {
      router.push(`/translate/quick?mode=${mode}&quickType=cat` as any);
      return;
    }

    router.push(`/translate/${selectedPet.id}?mode=${mode}` as any);
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={['top']}>
      <TexturedBackground variant="paws" style={styles.bg}>
        <ScrollView
          contentInsetAdjustmentBehavior="automatic"
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.content}
        >
          <View style={styles.hero}>
            <View style={styles.heroCopy}>
              <Text style={styles.kicker}>{t.analyzer.kicker}</Text>
              <Text style={[styles.title, { color: colors.text }]}>{t.analyzer.title}</Text>
              <Text style={[styles.subtitle, { color: colors.textSub }]}>
                {t.analyzer.subtitle}
              </Text>
            </View>
            <LinearGradient colors={COLORS.gradientDuo} style={styles.heroBadge}>
              <Text style={styles.heroBadgeEmoji}>🐾</Text>
              <Text style={styles.heroBadgeText}>✨</Text>
            </LinearGradient>
          </View>

          <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={styles.cardHeader}>
              <View>
                <Text style={[styles.cardTitle, { color: colors.text }]}>{t.analyzer.petCardTitle}</Text>
                <Text style={[styles.cardSub, { color: colors.textMuted }]}>{t.analyzer.petCardSub}</Text>
              </View>
              <TouchableOpacity onPress={() => router.push('/add-pet')} style={styles.smallButton}>
                <Text style={styles.smallButtonText}>+ {t.common.add.toLowerCase()}</Text>
              </TouchableOpacity>
            </View>

            {pets.length === 0 ? (
              <TouchableOpacity onPress={() => router.push('/add-pet')} style={[styles.emptyPet, { backgroundColor: colors.surfaceAlt }]}>
                <Text style={styles.emptyEmoji}>🐶</Text>
                <Text style={[styles.emptyTitle, { color: colors.text }]}>{t.analyzer.emptyTitle}</Text>
                <Text style={[styles.emptyText, { color: colors.textSub }]}>{t.analyzer.emptyText}</Text>
              </TouchableOpacity>
            ) : (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.petRow}>
                {pets.map((pet) => {
                  const active = pet.id === selectedPet?.id;
                  return (
                    <TouchableOpacity
                      key={pet.id}
                      onPress={() => setSelectedPetId(pet.id)}
                      style={[
                        styles.petChip,
                        { backgroundColor: colors.surfaceAlt },
                        active && styles.petChipActive,
                        active && { backgroundColor: 'rgba(88,204,2,0.16)' },
                      ]}
                    >
                      {pet.photo ? (
                        <Image source={{ uri: pet.photo }} style={styles.petPhoto} />
                      ) : (
                        <Text style={styles.petEmoji}>{pet.type === 'cat' ? '🐱' : '🐶'}</Text>
                      )}
                      <Text style={[styles.petName, { color: active ? colors.text : colors.textSub }]} numberOfLines={1}>
                        {pet.name}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            )}
          </View>

          <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.cardTitle, { color: colors.text }]}>{t.analyzer.modeCardTitle}</Text>
            <View style={styles.modeGrid}>
              {MODES.map((item) => {
                const active = item.id === mode;
                return (
                  <TouchableOpacity
                    key={item.id}
                    onPress={() => setMode(item.id)}
                    style={[styles.modeCard, active && styles.modeCardActive]}
                  >
                    <LinearGradient colors={active ? item.colors : colors.gradientApple} style={styles.modeGrad}>
                      <Text style={styles.modeEmoji}>{item.emoji}</Text>
                      <Text style={[styles.modeTitle, { color: active ? '#FFFFFF' : colors.text }]}>{item.title}</Text>
                      <Text style={[styles.modeSub, { color: active ? 'rgba(255,255,255,0.86)' : colors.textSub }]}>{item.subtitle}</Text>
                      <Text style={[styles.modeSlots, { color: active ? 'rgba(255,255,255,0.92)' : colors.textMuted }]}>
                        {t.analyzer.unlimited}
                      </Text>
                    </LinearGradient>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={styles.cardHeader}>
              <View>
                <Text style={[styles.cardTitle, { color: colors.text }]}>{t.analyzer.profileCardTitle}</Text>
                <Text style={[styles.cardSub, { color: colors.textMuted }]}>{profile.hint}</Text>
              </View>
              <Text style={styles.modePill}>{selectedMode.title}</Text>
            </View>

            <Metric label={t.analyzer.energyLabel} value={profile.energy} color={COLORS.duoGreen} />
            <Metric label={t.analyzer.moodLabel} value={profile.mood} color={COLORS.duoBlue} />
            <Metric label={t.analyzer.focusLabel} value={profile.focus} color={COLORS.duoOrange} />

            <View style={[styles.verdictBox, { backgroundColor: colors.surfaceAlt, borderColor: colors.border }]}>
              <Text style={styles.verdictLabel}>{t.analyzer.verdictLabel}</Text>
              <Text style={[styles.verdictText, { color: colors.text }]}>{profile.verdict}</Text>
            </View>
          </View>

          <TouchableOpacity onPress={handleAnalyze} activeOpacity={0.88}>
            <LinearGradient colors={selectedMode.colors} style={styles.cta}>
              <Text style={styles.ctaEmoji}>{selectedMode.emoji}</Text>
              <View style={styles.ctaCopy}>
                <Text style={styles.ctaTitle}>
                  {selectedPet ? t.analyzer.ctaRun(selectedPet.name) : t.analyzer.ctaAddPet}
                </Text>
                <Text style={styles.ctaSub}>
                  {selectedPet ? `${selectedMode.title} → ${t.analyzer.translatorWord}` : t.analyzer.ctaAddPetSub}
                </Text>
              </View>
              <Text style={styles.ctaArrow}>→</Text>
            </LinearGradient>
          </TouchableOpacity>

          <View style={styles.statStrip}>
            <MiniStat label={t.profile.statTranslations} value={stats.totalTranslations} />
            <MiniStat label={t.profile.statPhotos} value={stats.totalPhotos} />
            <MiniStat label={t.profile.statVideos} value={stats.totalVideos} />
            <MiniStat label={t.profile.statMemes} value={stats.totalMemes} />
          </View>
        </ScrollView>
      </TexturedBackground>
    </SafeAreaView>
  );
}

function Metric({ label, value, color }: { label: string; value: number; color: string }) {
  const { colors } = useTheme();

  return (
    <View style={styles.metric}>
      <View style={styles.metricTop}>
        <Text style={[styles.metricLabel, { color: colors.textSub }]}>{label}</Text>
        <Text style={[styles.metricValue, { color: colors.text }]}>{value}%</Text>
      </View>
      <View style={[styles.metricTrack, { backgroundColor: colors.surfaceAlt }]}>
        <View style={[styles.metricFill, { width: `${value}%`, backgroundColor: color }]} />
      </View>
    </View>
  );
}

function MiniStat({ label, value }: { label: string; value: number }) {
  const { colors } = useTheme();

  return (
    <View style={[styles.miniStat, { backgroundColor: colors.overlay, borderColor: colors.border }]}>
      <Text style={[styles.miniValue, { color: colors.text }]}>{value}</Text>
      <Text style={[styles.miniLabel, { color: colors.textMuted }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: COLORS.appleBg,
  },
  bg: {
    backgroundColor: COLORS.appleBg,
  },
  content: {
    padding: 16,
    paddingBottom: 96,
    gap: 16,
  },
  hero: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 14,
    paddingTop: 8,
  },
  heroCopy: {
    flex: 1,
    gap: 6,
  },
  kicker: {
    color: COLORS.duoGreenDark,
    fontSize: FONTS.sizes.sm,
    fontWeight: FONTS.weights.black,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  title: {
    color: COLORS.appleInk,
    fontSize: 30,
    fontWeight: FONTS.weights.black,
    lineHeight: 34,
  },
  subtitle: {
    color: COLORS.appleInkSoft,
    fontSize: FONTS.sizes.sm,
    lineHeight: 20,
  },
  heroBadge: {
    width: 88,
    height: 88,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  heroBadgeEmoji: {
    fontSize: 34,
  },
  heroBadgeText: {
    color: '#FFFFFF',
    fontSize: FONTS.sizes.xs,
    fontWeight: FONTS.weights.black,
  },
  card: {
    backgroundColor: COLORS.appleSurface,
    borderRadius: 28,
    padding: 16,
    gap: 14,
    borderWidth: 1,
    borderColor: COLORS.appleLine,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  cardTitle: {
    color: COLORS.appleInk,
    fontSize: FONTS.sizes.lg,
    fontWeight: FONTS.weights.black,
  },
  cardSub: {
    color: COLORS.appleMuted,
    fontSize: FONTS.sizes.sm,
    marginTop: 2,
  },
  smallButton: {
    backgroundColor: '#E7F8D8',
    borderRadius: RADIUS.full,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  smallButtonText: {
    color: COLORS.duoGreenDark,
    fontSize: FONTS.sizes.xs,
    fontWeight: FONTS.weights.black,
  },
  emptyPet: {
    alignItems: 'center',
    padding: 20,
    borderRadius: 22,
    backgroundColor: COLORS.appleSurfaceAlt,
    gap: 6,
  },
  emptyEmoji: {
    fontSize: 42,
  },
  emptyTitle: {
    color: COLORS.appleInk,
    fontSize: FONTS.sizes.lg,
    fontWeight: FONTS.weights.black,
  },
  emptyText: {
    color: COLORS.appleInkSoft,
    fontSize: FONTS.sizes.sm,
    textAlign: 'center',
    lineHeight: 20,
  },
  petRow: {
    gap: 10,
    paddingRight: 4,
  },
  petChip: {
    width: 92,
    minHeight: 100,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 10,
    borderRadius: 24,
    backgroundColor: COLORS.appleSurfaceAlt,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  petChipActive: {
    borderColor: COLORS.duoGreen,
    backgroundColor: '#F1FCE8',
  },
  petPhoto: {
    width: 48,
    height: 48,
    borderRadius: 18,
  },
  petEmoji: {
    fontSize: 40,
  },
  petName: {
    color: COLORS.appleInkSoft,
    fontSize: FONTS.sizes.sm,
    fontWeight: FONTS.weights.bold,
    textAlign: 'center',
  },
  petNameActive: {
    color: COLORS.appleInk,
  },
  modeGrid: {
    flexDirection: 'row',
    gap: 10,
  },
  modeCard: {
    flex: 1,
    borderRadius: 22,
    overflow: 'hidden',
  },
  modeCardActive: {
    transform: [{ translateY: -2 }],
  },
  modeGrad: {
    minHeight: 132,
    padding: 12,
    borderRadius: 22,
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.65)',
  },
  modeEmoji: {
    fontSize: 29,
  },
  modeTitle: {
    color: COLORS.appleInk,
    fontSize: FONTS.sizes.md,
    fontWeight: FONTS.weights.black,
  },
  modeTitleActive: {
    color: '#FFFFFF',
  },
  modeSub: {
    color: COLORS.appleInkSoft,
    fontSize: 11,
    lineHeight: 15,
  },
  modeSubActive: {
    color: 'rgba(255,255,255,0.86)',
  },
  modeSlots: {
    color: COLORS.appleMuted,
    fontSize: 10,
    fontWeight: FONTS.weights.bold,
    textTransform: 'uppercase',
  },
  modeSlotsActive: {
    color: 'rgba(255,255,255,0.92)',
  },
  modePill: {
    overflow: 'hidden',
    color: COLORS.duoBlueDark,
    backgroundColor: '#E7F5FF',
    borderRadius: RADIUS.full,
    paddingHorizontal: 10,
    paddingVertical: 6,
    fontSize: FONTS.sizes.xs,
    fontWeight: FONTS.weights.black,
  },
  metric: {
    gap: 7,
  },
  metricTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  metricLabel: {
    color: COLORS.appleInkSoft,
    fontSize: FONTS.sizes.sm,
    fontWeight: FONTS.weights.bold,
  },
  metricValue: {
    color: COLORS.appleInk,
    fontSize: FONTS.sizes.sm,
    fontWeight: FONTS.weights.black,
    fontVariant: ['tabular-nums'],
  },
  metricTrack: {
    height: 12,
    borderRadius: 999,
    backgroundColor: '#EDF1F7',
    overflow: 'hidden',
  },
  metricFill: {
    height: '100%',
    borderRadius: 999,
  },
  verdictBox: {
    backgroundColor: '#FFF8D8',
    borderRadius: 20,
    padding: 14,
    borderWidth: 1,
    borderColor: '#FFE58A',
    gap: 4,
  },
  verdictLabel: {
    color: COLORS.duoOrange,
    fontSize: FONTS.sizes.xs,
    fontWeight: FONTS.weights.black,
    textTransform: 'uppercase',
  },
  verdictText: {
    color: COLORS.appleInk,
    fontSize: FONTS.sizes.md,
    lineHeight: 22,
    fontWeight: FONTS.weights.semibold,
  },
  cta: {
    minHeight: 82,
    borderRadius: 28,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  ctaEmoji: {
    fontSize: 34,
  },
  ctaCopy: {
    flex: 1,
    gap: 2,
  },
  ctaTitle: {
    color: '#FFFFFF',
    fontSize: FONTS.sizes.lg,
    fontWeight: FONTS.weights.black,
  },
  ctaSub: {
    color: 'rgba(255,255,255,0.88)',
    fontSize: FONTS.sizes.sm,
  },
  ctaArrow: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: FONTS.weights.black,
  },
  statStrip: {
    flexDirection: 'row',
    gap: 8,
  },
  miniStat: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.82)',
    borderRadius: 20,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.appleLine,
  },
  miniValue: {
    color: COLORS.appleInk,
    fontSize: FONTS.sizes.xl,
    fontWeight: FONTS.weights.black,
    fontVariant: ['tabular-nums'],
  },
  miniLabel: {
    color: COLORS.appleMuted,
    fontSize: 10,
    fontWeight: FONTS.weights.bold,
    textAlign: 'center',
  },
});
