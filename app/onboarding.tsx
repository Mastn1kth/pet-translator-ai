import React, { useRef, useState } from 'react';
import {
  Animated,
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
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ArrowRight, PawPrint, Sparkles } from 'lucide-react-native';
import { COLORS, FONTS, RADIUS, SHADOWS } from '../src/constants/theme';
import { PetPatternLayer } from '../src/components/ui/TexturedBackground';
import { useTheme } from '../src/hooks/useTheme';
import { useTranslation } from '../src/hooks/useTranslation';

const ONBOARDING_KEY = 'onboarding_done_v1';
const APP_ICON = require('../assets/icon.png');
const ArrowRightIcon = ArrowRight as any;
const PawPrintIcon = PawPrint as any;
const SparklesIcon = Sparkles as any;

const SLIDE_EMOJIS = ['', '🎙️', '📸', '🎉'];
const SLIDE_GRADIENTS = [
  ['#F1EAFF', '#FFF4DE'],
  ['#FFE8EC', '#FFF3DE'],
  ['#E3F9FD', '#EBF1FF'],
  ['#FFF2CE', '#FFE3D7'],
] as const;

async function markOnboardingDone() {
  try {
    await AsyncStorage.setItem(ONBOARDING_KEY, '1');
  } catch {}
}

export default function OnboardingScreen() {
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const { t } = useTranslation();
  const [step, setStep] = useState(0);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const slide = t.onboarding.slides[step];
  const isLast = step === t.onboarding.slides.length - 1;

  const finish = async () => {
    await markOnboardingDone();
    router.replace('/(tabs)');
  };

  const goNext = async () => {
    if (isLast) {
      await finish();
      return;
    }

    Animated.sequence([
      Animated.timing(fadeAnim, { toValue: 0, duration: 130, useNativeDriver: true }),
      Animated.timing(fadeAnim, { toValue: 1, duration: 260, useNativeDriver: true }),
    ]).start();
    setStep((current) => current + 1);
  };

  const gradient = isDark
    ? (['#211B38', '#30264F'] as const)
    : SLIDE_GRADIENTS[step];

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
      <ScrollView
        style={styles.screenScroll}
        contentContainerStyle={styles.screenScrollContent}
        showsVerticalScrollIndicator={false}
      >
        <LinearGradient colors={gradient} style={styles.container}>
        <PetPatternLayer />
        <View style={styles.topBar}>
          <View style={styles.logo}>
            <View style={styles.logoMark}>
              <PawPrintIcon size={21} color="#FFFFFF" strokeWidth={3} />
            </View>
            <Text style={[styles.logoText, { color: colors.text }]}>{t.home.brand}</Text>
          </View>

          {!isLast ? (
            <TouchableOpacity
              onPress={finish}
              style={[styles.skipButton, { backgroundColor: colors.surface }]}
              accessibilityRole="button"
              accessibilityLabel={t.onboarding.skip}
            >
              <Text style={[styles.skipText, { color: colors.textSub }]}>{t.onboarding.skip}</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.skipPlaceholder} />
          )}
        </View>

        <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
          <View style={styles.illustrationStage}>
            <View style={styles.sparkleOne}>
              <SparklesIcon size={23} color={COLORS.secondary} />
            </View>
            <View style={styles.sparkleTwo}>
              <SparklesIcon size={18} color={COLORS.accent} />
            </View>

            {step === 0 ? (
              <Image source={APP_ICON} style={styles.appIcon} />
            ) : (
              <View style={[styles.emojiCard, { backgroundColor: colors.surface }]}>
                <Text style={styles.emoji}>{SLIDE_EMOJIS[step]}</Text>
              </View>
            )}
          </View>

          <View style={[styles.copyCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={styles.stepLabel}>
              {String(step + 1).padStart(2, '0')} / {String(t.onboarding.slides.length).padStart(2, '0')}
            </Text>
            <Text style={[styles.title, { color: colors.text }]}>{slide.title}</Text>
            <Text style={styles.subtitle}>{slide.subtitle}</Text>
            <Text style={[styles.description, { color: colors.textSub }]}>{slide.desc}</Text>
          </View>
        </Animated.View>

        <View style={styles.footer}>
          <View style={styles.dots}>
            {t.onboarding.slides.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.dot,
                  { backgroundColor: colors.border },
                  index === step && styles.dotActive,
                ]}
              />
            ))}
          </View>

          <TouchableOpacity
            onPress={goNext}
            activeOpacity={0.88}
            accessibilityRole="button"
            accessibilityLabel={isLast ? t.onboarding.start : t.onboarding.next}
          >
            <LinearGradient colors={COLORS.gradientDuo} style={styles.nextButton}>
              <Text style={styles.nextText}>{isLast ? t.onboarding.start : t.onboarding.next}</Text>
              <View style={styles.nextIcon}>
                <ArrowRightIcon size={23} color={COLORS.primary} strokeWidth={3} />
              </View>
            </LinearGradient>
          </TouchableOpacity>

          <Text style={[styles.disclaimer, { color: colors.textMuted }]}>{t.onboarding.disclaimer}</Text>
        </View>
        </LinearGradient>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  screenScroll: {
    flex: 1,
  },
  screenScrollContent: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
    minHeight: 660,
    paddingHorizontal: 18,
    paddingTop: 12,
    paddingBottom: 14,
  },
  topBar: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  logo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
  },
  logoMark: {
    width: 40,
    height: 40,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    transform: [{ rotate: '-6deg' }],
  },
  logoText: {
    flexShrink: 1,
    fontFamily: FONTS.family.display,
    fontSize: 16,
    fontWeight: FONTS.weights.black,
  },
  skipButton: {
    minWidth: 92,
    minHeight: 48,
    borderRadius: RADIUS.full,
    paddingHorizontal: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  skipText: {
    fontSize: 13,
    fontWeight: FONTS.weights.bold,
  },
  skipPlaceholder: {
    width: 92,
  },
  content: {
    flex: 1,
    width: '100%',
    maxWidth: 560,
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 18,
    paddingVertical: 14,
  },
  illustrationStage: {
    width: 210,
    height: 210,
    alignItems: 'center',
    justifyContent: 'center',
  },
  appIcon: {
    width: 176,
    height: 176,
    borderRadius: 48,
    borderWidth: 5,
    borderColor: '#FFFFFF',
    ...SHADOWS.lg,
  },
  emojiCard: {
    width: 176,
    height: 176,
    borderRadius: 52,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 5,
    borderColor: '#FFFFFF',
    transform: [{ rotate: '-3deg' }],
    ...SHADOWS.lg,
  },
  emoji: {
    fontSize: 88,
  },
  sparkleOne: {
    position: 'absolute',
    top: 10,
    right: 5,
    width: 42,
    height: 42,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    transform: [{ rotate: '9deg' }],
    zIndex: 2,
  },
  sparkleTwo: {
    position: 'absolute',
    bottom: 18,
    left: 4,
    width: 34,
    height: 34,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    transform: [{ rotate: '-8deg' }],
    zIndex: 2,
  },
  copyCard: {
    width: '100%',
    borderRadius: 32,
    borderWidth: 1,
    paddingHorizontal: 22,
    paddingVertical: 20,
    alignItems: 'center',
    gap: 8,
    ...SHADOWS.sm,
  },
  stepLabel: {
    color: COLORS.primary,
    fontSize: 11,
    fontWeight: FONTS.weights.black,
    letterSpacing: 1,
  },
  title: {
    fontFamily: FONTS.family.display,
    fontSize: 28,
    lineHeight: 32,
    fontWeight: FONTS.weights.black,
    textAlign: 'center',
  },
  subtitle: {
    color: COLORS.primary,
    fontFamily: FONTS.family.display,
    fontSize: 17,
    lineHeight: 22,
    fontWeight: FONTS.weights.black,
    textAlign: 'center',
  },
  description: {
    fontSize: 14,
    lineHeight: 21,
    fontWeight: FONTS.weights.medium,
    textAlign: 'center',
  },
  footer: {
    width: '100%',
    maxWidth: 560,
    alignSelf: 'center',
    gap: 12,
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 7,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  dotActive: {
    width: 28,
    backgroundColor: COLORS.primary,
  },
  nextButton: {
    minHeight: 66,
    borderRadius: 24,
    paddingLeft: 22,
    paddingRight: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    ...SHADOWS.md,
  },
  nextText: {
    flex: 1,
    color: '#FFFFFF',
    fontFamily: FONTS.family.display,
    fontSize: 18,
    fontWeight: FONTS.weights.black,
    textAlign: 'center',
  },
  nextIcon: {
    width: 46,
    height: 46,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  disclaimer: {
    fontSize: 10,
    lineHeight: 14,
    textAlign: 'center',
  },
});
