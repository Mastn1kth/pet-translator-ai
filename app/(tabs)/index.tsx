import React, { useEffect, useMemo } from 'react';
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  BookOpen,
  Camera,
  ChevronRight,
  Flame,
  Laugh,
  Mic,
  Plus,
  Search,
  Sparkles,
  Star,
  Video,
} from 'lucide-react-native';
import { useAppStore } from '../../src/store/appStore';
import { useTheme } from '../../src/hooks/useTheme';
import { useTranslation } from '../../src/hooks/useTranslation';
import { getDailyContent } from '../../src/engine/dailyEngine';
import { COLORS, FONTS, RADIUS, SHADOWS } from '../../src/constants/theme';
import TexturedBackground from '../../src/components/ui/TexturedBackground';
import { TranslationMode } from '../../src/types';

const APP_ICON = require('../../assets/icon.png');
const BookOpenIcon = BookOpen as any;
const CameraIcon = Camera as any;
const ChevronRightIcon = ChevronRight as any;
const FlameIcon = Flame as any;
const LaughIcon = Laugh as any;
const MicIcon = Mic as any;
const PlusIcon = Plus as any;
const SearchIcon = Search as any;
const SparklesIcon = Sparkles as any;
const StarIcon = Star as any;
const VideoIcon = Video as any;

function getQuickTranslateHref(mode: TranslationMode) {
  return `/translate/quick?mode=${mode}&quickType=cat`;
}

type MiniActionProps = {
  title: string;
  subtitle: string;
  colors: readonly [string, string];
  icon: React.ReactNode;
  onPress: () => void;
  accessibilityLabel: string;
};

function MiniAction({
  title,
  subtitle,
  colors,
  icon,
  onPress,
  accessibilityLabel,
}: MiniActionProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.86}
      style={styles.miniAction}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
    >
      <LinearGradient colors={colors} style={styles.miniActionGradient}>
        <View style={styles.miniActionIcon}>{icon}</View>
        <Text style={styles.miniActionTitle}>{title}</Text>
        <Text style={styles.miniActionSubtitle}>{subtitle}</Text>
      </LinearGradient>
    </TouchableOpacity>
  );
}

export default function HomeScreen() {
  const router = useRouter();
  const { width: screenWidth } = useWindowDimensions();
  const { colors, isDark } = useTheme();
  const { t, language } = useTranslation();
  const pets = useAppStore((state) => state.pets);
  const selectedPetId = useAppStore((state) => state.selectedPetId);
  const setSelectedPetId = useAppStore((state) => state.setSelectedPetId);
  const stats = useAppStore((state) => state.stats);

  const selectedPet = pets.find((pet) => pet.id === selectedPetId) || pets[0];
  const dailyContent = getDailyContent(selectedPet?.type || 'cat', language);
  const petName = selectedPet?.name || t.home.quickModeHint;
  const isCompact = screenWidth < 360;

  const statItems = useMemo(
    () => [
      { icon: '💬', label: t.home.statTranslations, value: stats.totalTranslations },
      { icon: '🔥', label: t.home.statStreak, value: stats.currentStreak },
      { icon: '🎬', label: t.home.statMemes, value: stats.totalMemes },
    ],
    [stats.currentStreak, stats.totalMemes, stats.totalTranslations, t]
  );

  useEffect(() => {
    if (!selectedPetId && pets[0]) {
      setSelectedPetId(pets[0].id);
    } else if (selectedPetId && pets.length > 0 && !pets.some((pet) => pet.id === selectedPetId)) {
      setSelectedPetId(pets[0].id);
    }
  }, [pets, selectedPetId, setSelectedPetId]);

  const openTranslate = (mode: TranslationMode) => {
    if (selectedPet) {
      router.push(`/translate/${selectedPet.id}?mode=${mode}` as any);
      return;
    }

    router.push(getQuickTranslateHref(mode) as any);
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={['top']}>
      <TexturedBackground variant="paws" style={styles.background}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <View style={styles.page}>
            <View style={styles.topBar}>
              <View style={styles.brand}>
                <View style={styles.brandMark}>
                  <Text style={styles.brandEmoji}>🐾</Text>
                </View>
                <View>
                  <Text style={[styles.brandName, { color: colors.text }]}>{t.home.brand}</Text>
                  <Text style={[styles.brandTagline, { color: colors.textMuted }]}>{t.home.greeting}</Text>
                </View>
              </View>

              <View style={[styles.streakPill, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <FlameIcon size={18} color={COLORS.warning} fill={COLORS.warning} />
                <Text style={[styles.streakValue, { color: colors.text }]}>{stats.currentStreak}</Text>
              </View>
            </View>

            <LinearGradient
              colors={isDark ? ['#2D2252', '#5A3BDD'] : ['#332753', '#6647EE']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={[styles.hero, isCompact && styles.heroCompact]}
            >
              <View style={styles.heroBubbleOne} />
              <View style={styles.heroBubbleTwo} />

              <View style={[styles.heroCopy, isCompact && styles.heroCopyCompact]}>
                <View style={styles.heroEyebrow}>
                  <SparklesIcon size={14} color={COLORS.secondary} />
                  <Text style={styles.heroEyebrowText}>{petName}</Text>
                </View>
                <Text style={[styles.heroTitle, isCompact && styles.heroTitleCompact]}>
                  {t.home.startTranslation}
                </Text>
                <Text style={styles.heroSubtitle}>{t.home.aiSlogans[0]}</Text>
              </View>

              <View style={[styles.mascotWrap, isCompact && styles.mascotWrapCompact]}>
                <View style={styles.speechBubble}>
                  <Text style={styles.speechText}>
                    {selectedPet?.type === 'dog' ? t.home.dogSpeech : t.home.catSpeech}
                  </Text>
                  <View style={styles.speechTail} />
                </View>
                <Image source={APP_ICON} style={styles.mascot} />
              </View>
            </LinearGradient>

            <View style={styles.sectionHeader}>
              <View>
                <Text style={[styles.sectionKicker, { color: COLORS.primary }]}>{t.home.petSection}</Text>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>{t.home.chooseFriend}</Text>
              </View>
              <TouchableOpacity
                onPress={() => router.push('/add-pet')}
                activeOpacity={0.8}
                style={styles.addButton}
                accessibilityRole="button"
                accessibilityLabel={t.home.add}
              >
                <PlusIcon size={19} color="#FFFFFF" strokeWidth={3} />
              </TouchableOpacity>
            </View>

            {pets.length === 0 ? (
              <TouchableOpacity
                onPress={() => router.push('/add-pet')}
                activeOpacity={0.86}
                style={[styles.emptyPetCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
                accessibilityRole="button"
                accessibilityLabel={t.home.noPetTitle}
              >
                <View style={styles.emptyPetAvatar}>
                  <Text style={styles.emptyPetEmoji}>🐶</Text>
                </View>
                <View style={styles.emptyPetCopy}>
                  <Text style={[styles.emptyPetTitle, { color: colors.text }]}>{t.home.noPetTitle}</Text>
                  <Text style={[styles.emptyPetText, { color: colors.textSub }]}>{t.home.noPetSub}</Text>
                </View>
                <ChevronRightIcon size={24} color={COLORS.primary} strokeWidth={3} />
              </TouchableOpacity>
            ) : (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.petRow}
              >
                {pets.map((pet) => {
                  const active = pet.id === selectedPet?.id;

                  return (
                    <TouchableOpacity
                      key={pet.id}
                      onPress={() => setSelectedPetId(pet.id)}
                      activeOpacity={0.84}
                      accessibilityRole="button"
                      accessibilityState={{ selected: active }}
                      accessibilityLabel={pet.name}
                      style={[
                        styles.petChip,
                        {
                          backgroundColor: active ? COLORS.primary : colors.surface,
                          borderColor: active ? COLORS.primary : colors.border,
                        },
                      ]}
                    >
                      {pet.photo ? (
                        <Image source={{ uri: pet.photo }} style={styles.petPhoto} />
                      ) : (
                        <View style={[styles.petPhotoFallback, { backgroundColor: active ? '#FFFFFF' : colors.surfaceAlt }]}>
                          <Text style={styles.petEmoji}>{pet.type === 'cat' ? '🐱' : '🐶'}</Text>
                        </View>
                      )}
                      <Text
                        style={[styles.petChipText, { color: active ? '#FFFFFF' : colors.text }]}
                        numberOfLines={1}
                      >
                        {pet.name}
                      </Text>
                      {active && <StarIcon size={14} color={COLORS.secondary} fill={COLORS.secondary} />}
                    </TouchableOpacity>
                  );
                })}

                <TouchableOpacity
                  onPress={() => router.push('/add-pet')}
                  activeOpacity={0.84}
                  style={[styles.petChip, styles.petChipAdd, { borderColor: colors.border }]}
                  accessibilityRole="button"
                  accessibilityLabel={t.home.add}
                >
                  <PlusIcon size={24} color={COLORS.primary} strokeWidth={3} />
                  <Text style={[styles.petChipText, { color: COLORS.primary }]}>{t.home.add}</Text>
                </TouchableOpacity>
              </ScrollView>
            )}

            <View>
              <Text style={[styles.sectionKicker, { color: COLORS.primary }]}>{t.home.formatSection}</Text>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>{t.home.chooseAction}</Text>
            </View>

            <TouchableOpacity
              onPress={() => openTranslate('sound')}
              activeOpacity={0.9}
              accessibilityRole="button"
              accessibilityLabel={t.home.voiceTitle}
              accessibilityHint={t.home.voiceSub}
            >
              <LinearGradient
                colors={COLORS.gradientDuo}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.voiceAction}
              >
                <View style={styles.voiceDecorOne} />
                <View style={styles.voiceDecorTwo} />
                <View style={styles.voiceIconOuter}>
                  <View style={styles.voiceIconInner}>
                    <MicIcon size={34} color={COLORS.primary} strokeWidth={3} />
                  </View>
                </View>
                <View style={styles.voiceCopy}>
                  <Text style={styles.voiceLabel}>{t.home.mainActionLabel}</Text>
                  <Text style={styles.voiceTitle}>{t.home.voiceTitle}</Text>
                  <Text style={styles.voiceSubtitle}>{t.home.voiceSub}</Text>
                </View>
                <View style={styles.voiceArrow}>
                  <ChevronRightIcon size={28} color="#FFFFFF" strokeWidth={3} />
                </View>
              </LinearGradient>
            </TouchableOpacity>

            <View style={styles.miniActionsRow}>
              <MiniAction
                title={t.home.photoTitle}
                subtitle={t.home.photoSub}
                colors={COLORS.gradientSun}
                icon={<CameraIcon size={25} color="#FFFFFF" strokeWidth={2.8} />}
                onPress={() => openTranslate('photo')}
                accessibilityLabel={t.home.photoTitle}
              />
              <MiniAction
                title={t.home.videoTitle}
                subtitle={t.home.videoSub}
                colors={COLORS.gradientSky}
                icon={<VideoIcon size={25} color="#FFFFFF" strokeWidth={2.8} />}
                onPress={() => openTranslate('video')}
                accessibilityLabel={t.home.videoTitle}
              />
            </View>

            <View>
              <Text style={[styles.sectionKicker, { color: COLORS.primary }]}>{t.home.exploreKicker}</Text>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>{t.home.exploreTitle}</Text>
            </View>

            <View style={styles.exploreGrid}>
              <TouchableOpacity
                onPress={() => router.push('/(tabs)/analyzer' as any)}
                activeOpacity={0.86}
                style={[styles.exploreCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
                accessibilityRole="button"
                accessibilityLabel={t.home.analyzerTitle}
              >
                <View style={[styles.exploreIcon, { backgroundColor: '#F2ECFF' }]}>
                  <SearchIcon size={26} color={COLORS.primary} strokeWidth={2.7} />
                </View>
                <View style={styles.exploreCopy}>
                  <Text style={[styles.exploreTitle, { color: colors.text }]}>{t.home.analyzerTitle}</Text>
                  <Text style={[styles.exploreSubtitle, { color: colors.textSub }]}>{t.home.analyzerSub}</Text>
                </View>
                <ChevronRightIcon size={22} color={COLORS.primary} strokeWidth={3} />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => router.push('/(tabs)/memes' as any)}
                activeOpacity={0.86}
                style={[styles.exploreCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
                accessibilityRole="button"
                accessibilityLabel={t.home.memeTitle}
              >
                <View style={[styles.exploreIcon, { backgroundColor: '#FFF0ED' }]}>
                  <LaughIcon size={26} color={COLORS.coral} strokeWidth={2.7} />
                </View>
                <View style={styles.exploreCopy}>
                  <Text style={[styles.exploreTitle, { color: colors.text }]}>{t.home.memeTitle}</Text>
                  <Text style={[styles.exploreSubtitle, { color: colors.textSub }]}>{t.home.memeSub}</Text>
                </View>
                <ChevronRightIcon size={22} color={COLORS.coral} strokeWidth={3} />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => router.push('/(tabs)/faq' as any)}
                activeOpacity={0.86}
                style={[styles.exploreCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
                accessibilityRole="button"
                accessibilityLabel={t.home.faqTitle}
              >
                <View style={[styles.exploreIcon, { backgroundColor: '#E8FAFD' }]}>
                  <BookOpenIcon size={26} color={COLORS.duoBlueDark} strokeWidth={2.7} />
                </View>
                <View style={styles.exploreCopy}>
                  <Text style={[styles.exploreTitle, { color: colors.text }]}>{t.home.faqTitle}</Text>
                  <Text style={[styles.exploreSubtitle, { color: colors.textSub }]} numberOfLines={2}>
                    {t.home.faqSub}
                  </Text>
                </View>
                <ChevronRightIcon size={22} color={COLORS.duoBlueDark} strokeWidth={3} />
              </TouchableOpacity>
            </View>

            <LinearGradient
              colors={isDark ? ['#2A2146', '#332753'] : ['#FFF0D7', '#FFE3B7']}
              style={styles.dailyCard}
            >
              <View style={styles.dailyMoodWrap}>
                <Text style={styles.dailyMood}>{dailyContent.mood}</Text>
              </View>
              <View style={styles.dailyCopy}>
                <Text style={[styles.dailyLabel, { color: isDark ? COLORS.secondary : '#A65D15' }]}>
                  {t.home.dailyThoughtTitle}
                </Text>
                <Text style={[styles.dailyThought, { color: colors.text }]}>{dailyContent.thought}</Text>
                <Text style={[styles.dailyHoroscope, { color: colors.textSub }]} numberOfLines={2}>
                  {dailyContent.horoscope}
                </Text>
              </View>
            </LinearGradient>

            <View style={styles.statsRow}>
              {statItems.map((item) => (
                <View
                  key={item.label}
                  style={[styles.statCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
                >
                  <Text style={styles.statEmoji}>{item.icon}</Text>
                  <Text style={[styles.statValue, { color: colors.text }]}>{item.value}</Text>
                  <Text style={[styles.statLabel, { color: colors.textMuted }]} numberOfLines={2}>
                    {item.label}
                  </Text>
                </View>
              ))}
            </View>

            <Text style={[styles.disclaimer, { color: colors.textMuted }]}>
              {t.home.entertainmentNotice}
            </Text>
          </View>
        </ScrollView>
      </TexturedBackground>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  background: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 112,
  },
  page: {
    width: '100%',
    maxWidth: 720,
    alignSelf: 'center',
    paddingHorizontal: 16,
    paddingTop: 10,
    gap: 18,
  },
  topBar: {
    minHeight: 50,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  brand: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  brandMark: {
    width: 42,
    height: 42,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    transform: [{ rotate: '-5deg' }],
  },
  brandEmoji: {
    fontSize: 22,
  },
  brandName: {
    fontFamily: FONTS.family.display,
    fontSize: 17,
    fontWeight: FONTS.weights.black,
    letterSpacing: 0.1,
  },
  brandTagline: {
    fontSize: 11,
    fontWeight: FONTS.weights.semibold,
    marginTop: 1,
  },
  streakPill: {
    minWidth: 58,
    minHeight: 42,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
  },
  streakValue: {
    fontFamily: FONTS.family.display,
    fontSize: 16,
    fontWeight: FONTS.weights.black,
  },
  hero: {
    minHeight: 236,
    borderRadius: 34,
    padding: 22,
    overflow: 'hidden',
    flexDirection: 'row',
    alignItems: 'center',
    ...SHADOWS.lg,
  },
  heroCompact: {
    minHeight: 390,
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  heroBubbleOne: {
    position: 'absolute',
    width: 160,
    height: 160,
    borderRadius: 80,
    right: -40,
    bottom: -50,
    backgroundColor: 'rgba(255,255,255,0.10)',
  },
  heroBubbleTwo: {
    position: 'absolute',
    width: 74,
    height: 74,
    borderRadius: 37,
    left: -24,
    top: -18,
    backgroundColor: 'rgba(255,201,74,0.16)',
  },
  heroCopy: {
    width: '61%',
    zIndex: 2,
    gap: 9,
  },
  heroCopyCompact: {
    width: '100%',
  },
  heroEyebrow: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: RADIUS.full,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  heroEyebrowText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: FONTS.weights.black,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  heroTitle: {
    color: '#FFFFFF',
    fontFamily: FONTS.family.display,
    fontSize: 29,
    lineHeight: 32,
    fontWeight: FONTS.weights.black,
  },
  heroTitleCompact: {
    maxWidth: 240,
    fontSize: 27,
    lineHeight: 30,
  },
  heroSubtitle: {
    color: 'rgba(255,255,255,0.82)',
    fontSize: 14,
    lineHeight: 20,
    fontWeight: FONTS.weights.semibold,
  },
  mascotWrap: {
    position: 'absolute',
    right: 12,
    bottom: 14,
    width: 118,
    height: 154,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  mascotWrapCompact: {
    position: 'relative',
    right: 0,
    bottom: 0,
    alignSelf: 'center',
    marginTop: 10,
  },
  mascot: {
    width: 108,
    height: 108,
    borderRadius: 30,
    borderWidth: 4,
    borderColor: 'rgba(255,255,255,0.9)',
  },
  speechBubble: {
    position: 'absolute',
    top: 0,
    right: 4,
    zIndex: 3,
    backgroundColor: COLORS.secondary,
    borderRadius: 16,
    paddingHorizontal: 13,
    paddingVertical: 8,
    transform: [{ rotate: '4deg' }],
  },
  speechTail: {
    position: 'absolute',
    width: 12,
    height: 12,
    bottom: -5,
    left: 17,
    backgroundColor: COLORS.secondary,
    transform: [{ rotate: '45deg' }],
  },
  speechText: {
    color: COLORS.ink,
    fontFamily: FONTS.family.display,
    fontSize: 16,
    fontWeight: FONTS.weights.black,
    zIndex: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: 12,
  },
  sectionKicker: {
    fontFamily: FONTS.family.display,
    fontSize: 11,
    fontWeight: FONTS.weights.black,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 3,
  },
  sectionTitle: {
    fontFamily: FONTS.family.display,
    fontSize: 22,
    lineHeight: 27,
    fontWeight: FONTS.weights.black,
  },
  addButton: {
    width: 46,
    height: 46,
    borderRadius: 17,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.sm,
  },
  emptyPetCard: {
    minHeight: 98,
    borderRadius: 26,
    borderWidth: 1,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 13,
    ...SHADOWS.sm,
  },
  emptyPetAvatar: {
    width: 64,
    height: 64,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF0D7',
  },
  emptyPetEmoji: {
    fontSize: 34,
  },
  emptyPetCopy: {
    flex: 1,
    gap: 4,
  },
  emptyPetTitle: {
    fontFamily: FONTS.family.display,
    fontSize: 17,
    fontWeight: FONTS.weights.black,
  },
  emptyPetText: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: FONTS.weights.medium,
  },
  petRow: {
    gap: 10,
    paddingRight: 2,
  },
  petChip: {
    minWidth: 112,
    height: 62,
    borderRadius: 22,
    borderWidth: 1,
    paddingHorizontal: 9,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  petChipAdd: {
    backgroundColor: 'transparent',
    borderStyle: 'dashed',
    justifyContent: 'center',
  },
  petPhoto: {
    width: 42,
    height: 42,
    borderRadius: 15,
  },
  petPhotoFallback: {
    width: 42,
    height: 42,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  petEmoji: {
    fontSize: 24,
  },
  petChipText: {
    flexShrink: 1,
    fontFamily: FONTS.family.display,
    fontSize: 14,
    fontWeight: FONTS.weights.black,
  },
  voiceAction: {
    minHeight: 128,
    borderRadius: 30,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    overflow: 'hidden',
    ...SHADOWS.md,
  },
  voiceDecorOne: {
    position: 'absolute',
    width: 110,
    height: 110,
    borderRadius: 55,
    right: -28,
    top: -38,
    backgroundColor: 'rgba(255,255,255,0.10)',
  },
  voiceDecorTwo: {
    position: 'absolute',
    width: 58,
    height: 58,
    borderRadius: 29,
    left: 48,
    bottom: -30,
    backgroundColor: 'rgba(255,201,74,0.15)',
  },
  voiceIconOuter: {
    width: 82,
    height: 82,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.16)',
  },
  voiceIconInner: {
    width: 62,
    height: 62,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  voiceCopy: {
    flex: 1,
    gap: 2,
  },
  voiceLabel: {
    color: COLORS.secondary,
    fontSize: 10,
    fontWeight: FONTS.weights.black,
    textTransform: 'uppercase',
    letterSpacing: 0.7,
  },
  voiceTitle: {
    color: '#FFFFFF',
    fontFamily: FONTS.family.display,
    fontSize: 23,
    lineHeight: 27,
    fontWeight: FONTS.weights.black,
  },
  voiceSubtitle: {
    color: 'rgba(255,255,255,0.78)',
    fontSize: 13,
    lineHeight: 18,
    fontWeight: FONTS.weights.semibold,
  },
  voiceArrow: {
    width: 40,
    height: 40,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.14)',
  },
  miniActionsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  miniAction: {
    flex: 1,
    borderRadius: 28,
    overflow: 'hidden',
    ...SHADOWS.sm,
  },
  miniActionGradient: {
    minHeight: 150,
    padding: 15,
    justifyContent: 'flex-end',
    gap: 4,
  },
  miniActionIcon: {
    position: 'absolute',
    top: 15,
    left: 15,
    width: 48,
    height: 48,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.20)',
  },
  miniActionTitle: {
    color: '#FFFFFF',
    fontFamily: FONTS.family.display,
    fontSize: 19,
    fontWeight: FONTS.weights.black,
  },
  miniActionSubtitle: {
    color: 'rgba(255,255,255,0.84)',
    fontSize: 12,
    lineHeight: 17,
    fontWeight: FONTS.weights.semibold,
  },
  exploreGrid: {
    gap: 10,
  },
  exploreCard: {
    minHeight: 82,
    borderRadius: 24,
    borderWidth: 1,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  exploreIcon: {
    width: 54,
    height: 54,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  exploreCopy: {
    flex: 1,
    gap: 2,
  },
  exploreTitle: {
    fontFamily: FONTS.family.display,
    fontSize: 16,
    fontWeight: FONTS.weights.black,
  },
  exploreSubtitle: {
    fontSize: 12,
    lineHeight: 17,
    fontWeight: FONTS.weights.medium,
  },
  dailyCard: {
    minHeight: 132,
    borderRadius: 28,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  dailyMoodWrap: {
    width: 78,
    height: 90,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.55)',
  },
  dailyMood: {
    fontSize: 45,
  },
  dailyCopy: {
    flex: 1,
    gap: 4,
  },
  dailyLabel: {
    fontFamily: FONTS.family.display,
    fontSize: 11,
    fontWeight: FONTS.weights.black,
    textTransform: 'uppercase',
    letterSpacing: 0.7,
  },
  dailyThought: {
    fontFamily: FONTS.family.display,
    fontSize: 16,
    lineHeight: 21,
    fontWeight: FONTS.weights.black,
  },
  dailyHoroscope: {
    fontSize: 12,
    lineHeight: 17,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 9,
  },
  statCard: {
    flex: 1,
    minHeight: 112,
    borderRadius: 22,
    borderWidth: 1,
    padding: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statEmoji: {
    fontSize: 20,
  },
  statValue: {
    fontFamily: FONTS.family.display,
    fontSize: 22,
    lineHeight: 26,
    fontWeight: FONTS.weights.black,
    fontVariant: ['tabular-nums'],
  },
  statLabel: {
    fontSize: 10,
    lineHeight: 13,
    fontWeight: FONTS.weights.bold,
    textAlign: 'center',
  },
  disclaimer: {
    paddingHorizontal: 14,
    fontSize: 10,
    lineHeight: 15,
    textAlign: 'center',
  },
});
