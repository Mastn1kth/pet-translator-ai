import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Share, Alert
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useAppStore } from '../../src/store/appStore';
import { COLORS, FONTS, RADIUS, SHADOWS } from '../../src/constants/theme';
import { MoodBadge } from '../../src/components/ui/MoodBadge';
import { PetPatternLayer } from '../../src/components/ui/TexturedBackground';
import { shareTranslation, copyToClipboard, trackShare } from '../../src/services/shareService';
import { useTheme } from '../../src/hooks/useTheme';
import { useTranslation } from '../../src/hooks/useTranslation';
import { PetStateCategory, TranslationFeedback } from '../../src/types';

export default function ResultScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { colors } = useTheme();
  const { t, language } = useTranslation();
  const STATE_LABELS: Record<PetStateCategory, string> = t.stateLabels;
  const translations = useAppStore((s) => s.translations);
  const awardXP = useAppStore((s) => s.awardXP);
  const saveTranslationFeedback = useAppStore((s) => s.saveTranslationFeedback);
  const result = translations.find((item) => item.id === id);
  const [isSharing, setIsSharing] = useState(false);
  const isQuickResult = result?.petId.startsWith('quick-') ?? false;

  if (!result) {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
        <PetPatternLayer />
        <Text style={{ color: colors.text, padding: 24 }}>{t.result.notFound}</Text>
      </SafeAreaView>
    );
  }

  const handleShare = async (platform: 'tiktok' | 'instagram' | 'telegram' | 'whatsapp' | 'generic') => {
    if (isSharing) return;
    setIsSharing(true);
    
    try {
      const shareResult = await shareTranslation(result, { platform, includeAppLink: true, language });
      if (shareResult.success) {
        trackShare(result, platform);
        awardXP(5); // Награда за шеринг
        if (shareResult.copiedToClipboard) {
          const platformName = platform === 'tiktok' ? 'TikTok' : 'Instagram';
          Alert.alert(t.result.shareSuccess, t.result.copyOnlyNotice(platformName));
        } else {
          Alert.alert(t.result.shareSuccess, t.result.shareSuccessText);
        }
      }
    } catch (error) {
      console.error('Share error:', error);
    } finally {
      setIsSharing(false);
    }
  };

  const handleCopy = async () => {
    const success = await copyToClipboard(result, language);
    if (success) {
      Alert.alert(t.result.copySuccess, t.result.copySuccessText);
    }
  };

  const submitFeedback = (patch: Partial<TranslationFeedback>) => {
    const feedback: TranslationFeedback = {
      translationId: result.id,
      petId: result.petId,
      liked: patch.liked ?? result.feedback?.liked ?? false,
      accuracy: patch.accuracy ?? result.feedback?.accuracy ?? null,
      confirmedEmotion: patch.confirmedEmotion ?? result.feedback?.confirmedEmotion,
      createdAt: Date.now(),
    };
    saveTranslationFeedback(feedback);
    Alert.alert(t.result.feedbackSaved, t.result.feedbackSavedText);
  };

  const intensityColor = result.intensity > 0.8 ? COLORS.danger : result.intensity > 0.5 ? COLORS.warning : COLORS.accent;

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
      <PetPatternLayer />
      <ScrollView showsVerticalScrollIndicator={false}>
        <LinearGradient colors={colors.gradientApple} style={styles.header}>
          <TouchableOpacity onPress={() => router.push('/(tabs)')} style={styles.backBtn}>
            <Text style={styles.backText}>{t.result.home}</Text>
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>{t.result.title}</Text>
          <View style={{ width: 80 }} />
        </LinearGradient>

        {/* Pet & Mood */}
        <View style={styles.moodSection}>
          <Text style={styles.petEmoji}>{result.petType === 'cat' ? '🐱' : '🐶'}</Text>
          <Text style={[styles.petName, { color: colors.text }]}>{result.petName}</Text>
          <MoodBadge mood={result.mood} emoji={result.moodEmoji} intensity={result.intensity} />
          <View style={styles.intensityRow}>
            <Text style={[styles.intensityLabel, { color: colors.textMuted }]}>{t.result.intensityLabel}</Text>
            <Text style={[styles.intensityVal, { color: intensityColor }]}>
              {t.result.clueStrength(result.analysis?.confidence ?? result.intensity * 100)}
            </Text>
          </View>
        </View>

        {/* Translation */}
        <View style={styles.section}>
          <LinearGradient colors={colors.gradientApple} style={styles.translationCard}>
            <Text style={[styles.cardLabel, { color: colors.textSub }]}>{t.result.translationLabel}</Text>
            <Text style={[styles.translationText, { color: colors.text }]}>{result.translation}</Text>
          </LinearGradient>
        </View>

        {result.analysis?.recognition?.top && (
          <View style={styles.section}>
            <LinearGradient colors={COLORS.gradientSky} style={styles.recognitionCard}>
              <Text style={styles.recognitionLabel}>{t.result.recognizedSoundLabel}</Text>
              <Text style={styles.recognitionSound}>
                {t.soundLabels[result.analysis.recognition.top.label]}
              </Text>
              <Text style={styles.recognitionStrength}>
                {result.analysis.recognition.strength === 'clear'
                  ? t.result.recognitionClear
                  : t.result.recognitionTentative}
              </Text>
              <Text style={styles.recognitionDisclaimer}>{t.result.recognitionDisclaimer}</Text>
            </LinearGradient>
          </View>
        )}

        {result.analysis && (
          <View style={styles.section}>
            <LinearGradient colors={colors.gradientApple} style={styles.analysisCard}>
              <Text style={[styles.cardLabel, { color: colors.textSub }]}>{t.result.analysisLabel}</Text>
              <Text style={[styles.analysisMain, { color: colors.text }]}>
                {t.result.emotionLine(result.analysis.emotion, result.analysis.confidence)}
              </Text>
              <View style={styles.probGrid}>
                {Object.entries(result.analysis.probabilities)
                  .sort((a, b) => b[1] - a[1])
                  .slice(0, 4)
                  .map(([key], index) => (
                    <View key={key} style={styles.probItem}>
                      <Text style={[styles.probLabel, { color: colors.textSub }]}>
                        {STATE_LABELS[key as PetStateCategory] || key}
                      </Text>
                      <Text style={[styles.probValue, { color: colors.text }]}>
                        {index === 0 ? t.result.mainGuess : t.result.otherGuess}
                      </Text>
                    </View>
                  ))}
              </View>
              <View style={styles.reasonList}>
                {result.analysis.reasons.map((reason, index) => (
                  <Text key={`${reason}-${index}`} style={[styles.reasonText, { color: colors.textSub }]}>
                    • {reason}
                  </Text>
                ))}
              </View>
            </LinearGradient>
          </View>
        )}

        <View style={styles.section}>
          <LinearGradient colors={colors.gradientApple} style={styles.feedbackCard}>
            <Text style={[styles.cardLabel, { color: colors.textSub }]}>{t.result.feedbackLabel}</Text>
            <Text style={[styles.feedbackHint, { color: colors.textSub }]}>
              {t.result.feedbackHint}
            </Text>
            <View style={styles.feedbackRow}>
              <TouchableOpacity
                onPress={() => submitFeedback({ liked: !result.feedback?.liked })}
                style={[styles.feedbackBtn, result.feedback?.liked && styles.feedbackBtnActive]}
              >
                <Text style={[styles.feedbackBtnText, { color: colors.text }]}>
                  {result.feedback?.liked ? t.result.likeActive : t.result.like}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => submitFeedback({ accuracy: 'similar' })}
                style={[styles.feedbackBtn, result.feedback?.accuracy === 'similar' && styles.feedbackBtnActive]}
              >
                <Text style={[styles.feedbackBtnText, { color: colors.text }]}>{t.result.similar}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => submitFeedback({ accuracy: 'not_similar' })}
                style={[styles.feedbackBtn, result.feedback?.accuracy === 'not_similar' && styles.feedbackBtnDanger]}
              >
                <Text style={[styles.feedbackBtnText, { color: colors.text }]}>{t.result.notSimilar}</Text>
              </TouchableOpacity>
            </View>
            {result.analysis && (
              <View style={styles.emotionChips}>
                {Object.entries(result.analysis.probabilities)
                  .sort((a, b) => b[1] - a[1])
                  .slice(0, 3)
                  .map(([key]) => {
                    const emotion = key as PetStateCategory;
                    const active = result.feedback?.confirmedEmotion === emotion;
                    return (
                      <TouchableOpacity
                        key={key}
                        onPress={() => submitFeedback({ confirmedEmotion: emotion })}
                        style={[styles.emotionChip, { backgroundColor: colors.surface, borderColor: colors.border }, active && styles.emotionChipActive]}
                      >
                        <Text style={[styles.emotionChipText, { color: colors.text }]}>
                          {active ? '✓ ' : ''}{STATE_LABELS[emotion]}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
              </View>
            )}
          </LinearGradient>
        </View>

        {/* Thoughts */}
        <View style={styles.section}>
          <LinearGradient colors={colors.gradientApple} style={styles.thoughtCard}>
            <Text style={[styles.cardLabel, { color: colors.textSub }]}>{t.result.thoughtsLabel}</Text>
            <Text style={[styles.thoughtText, { color: colors.textSub }]}>{result.thoughts}</Text>
          </LinearGradient>
        </View>

        {/* Story */}
        <View style={styles.section}>
          <LinearGradient colors={colors.gradientApple} style={styles.storyCard}>
            <Text style={[styles.cardLabel, { color: colors.textSub }]}>{t.result.storyLabel}</Text>
            <Text style={[styles.storyText, { color: colors.textSub }]}>{result.story}</Text>
          </LinearGradient>
        </View>

        {/* Disclaimer */}
        <View style={styles.section}>
          <View style={styles.disclaimerBox}>
            <Text style={[styles.disclaimerText, { color: colors.textMuted }]}>
              {t.result.disclaimer}
            </Text>
          </View>
        </View>

        {isQuickResult && (
          <View style={styles.section}>
            <LinearGradient colors={colors.gradientApple} style={styles.savePetCard}>
              <Text style={[styles.cardLabel, { color: colors.textSub }]}>{t.result.quickSaveLabel}</Text>
              <Text style={[styles.savePetTitle, { color: colors.text }]}>{t.result.quickSaveTitle}</Text>
              <Text style={[styles.savePetText, { color: colors.textSub }]}>
                {t.result.quickSaveText}
              </Text>
              <TouchableOpacity onPress={() => router.push('/add-pet')} activeOpacity={0.88}>
                <LinearGradient colors={COLORS.gradientDuo} style={styles.savePetBtn}>
                  <Text style={styles.savePetBtnText}>{t.result.quickSaveBtn}</Text>
                </LinearGradient>
              </TouchableOpacity>
            </LinearGradient>
          </View>
        )}

        {/* Share Buttons */}
        <View style={styles.section}>
          <Text style={[styles.shareTitle, { color: colors.text }]}>{t.result.shareTitle}</Text>

          {/* TikTok */}
          <TouchableOpacity
            onPress={() => handleShare('tiktok')}
            style={styles.socialBtn}
            disabled={isSharing}
          >
            <LinearGradient colors={['#FF2D55', '#D4004A']} style={styles.socialGrad}>
              <Text style={styles.socialEmoji}>📹</Text>
              <View style={styles.socialContent}>
                <Text style={styles.socialText}>TikTok / Shorts</Text>
                <Text style={styles.socialSub}>{t.result.shareViral}</Text>
              </View>
            </LinearGradient>
          </TouchableOpacity>

          {/* Instagram */}
          <TouchableOpacity
            onPress={() => handleShare('instagram')}
            style={styles.socialBtn}
            disabled={isSharing}
          >
            <LinearGradient colors={['#E1306C', '#C13584']} style={styles.socialGrad}>
              <Text style={styles.socialEmoji}>📸</Text>
              <View style={styles.socialContent}>
                <Text style={styles.socialText}>Instagram</Text>
                <Text style={styles.socialSub}>{t.result.shareStories}</Text>
              </View>
            </LinearGradient>
          </TouchableOpacity>

          {/* Telegram */}
          <TouchableOpacity
            onPress={() => handleShare('telegram')}
            style={styles.socialBtn}
            disabled={isSharing}
          >
            <LinearGradient colors={['#0088CC', '#006699']} style={styles.socialGrad}>
              <Text style={styles.socialEmoji}>✈️</Text>
              <View style={styles.socialContent}>
                <Text style={styles.socialText}>Telegram</Text>
                <Text style={styles.socialSub}>{t.result.shareTelegramSub}</Text>
              </View>
            </LinearGradient>
          </TouchableOpacity>

          {/* WhatsApp */}
          <TouchableOpacity
            onPress={() => handleShare('whatsapp')}
            style={styles.socialBtn}
            disabled={isSharing}
          >
            <LinearGradient colors={['#25D366', '#128C7E']} style={styles.socialGrad}>
              <Text style={styles.socialEmoji}>💬</Text>
              <View style={styles.socialContent}>
                <Text style={styles.socialText}>WhatsApp</Text>
                <Text style={styles.socialSub}>{t.result.shareWhatsappSub}</Text>
              </View>
            </LinearGradient>
          </TouchableOpacity>

          {/* Copy */}
          <TouchableOpacity onPress={handleCopy} style={styles.copyBtn}>
            <Text style={styles.copyText}>{t.result.copyText}</Text>
          </TouchableOpacity>

          {/* Generic Share */}
          <TouchableOpacity
            onPress={() => handleShare('generic')}
            style={styles.genericShareBtn}
            disabled={isSharing}
          >
            <LinearGradient colors={COLORS.gradientDuo} style={styles.genericShareGrad}>
              <Text style={styles.genericShareText}>{t.result.otherWays}</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Translate Again */}
        <View style={styles.section}>
          <TouchableOpacity onPress={() => router.push(`/translate/${isQuickResult ? 'quick' : result.petId}?mode=${result.mode}&quickType=${result.petType}` as any)}>
            <LinearGradient colors={COLORS.gradientSun} style={styles.againBtn}>
              <Text style={styles.againBtnText}>{t.result.tryAgain}</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bgPrimary },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    paddingTop: 8,
  },
  backBtn: { padding: 8 },
  backText: { color: COLORS.primaryLight, fontSize: FONTS.sizes.sm },
  headerTitle: { color: COLORS.textPrimary, fontSize: FONTS.sizes.lg, fontWeight: FONTS.weights.bold },
  moodSection: { alignItems: 'center', padding: 24, gap: 10 },
  petEmoji: { fontSize: 72 },
  petName: { color: COLORS.textPrimary, fontSize: FONTS.sizes.xxl, fontWeight: FONTS.weights.black },
  intensityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: 8,
    width: '90%',
    marginTop: 4,
  },
  intensityLabel: { color: COLORS.textMuted, fontSize: FONTS.sizes.xs },
  intensityBar: { flex: 1, height: 6, backgroundColor: COLORS.appleLine, borderRadius: 3, overflow: 'hidden' },
  intensityFill: { height: '100%', borderRadius: 3 },
  intensityVal: { fontSize: FONTS.sizes.xs, fontWeight: FONTS.weights.bold },
  section: { paddingHorizontal: 16, marginTop: 12 },
  translationCard: { borderRadius: RADIUS.xl, padding: 20, gap: 10 },
  cardLabel: { color: COLORS.textSecondary, fontSize: FONTS.sizes.sm, fontWeight: FONTS.weights.semibold, textTransform: 'uppercase', letterSpacing: 0.5 },
  translationText: { color: COLORS.textPrimary, fontSize: FONTS.sizes.xl, fontWeight: FONTS.weights.bold, lineHeight: 30 },
  recognitionCard: {
    borderRadius: RADIUS.xl,
    padding: 20,
    gap: 8,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.62)',
  },
  recognitionLabel: {
    color: '#FFFFFF',
    fontSize: FONTS.sizes.sm,
    fontWeight: FONTS.weights.black,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  recognitionSound: {
    color: '#FFFFFF',
    fontFamily: FONTS.family.display,
    fontSize: FONTS.sizes.xxl,
    lineHeight: 34,
    fontWeight: FONTS.weights.black,
  },
  recognitionStrength: {
    color: '#FFFFFF',
    fontSize: FONTS.sizes.sm,
    lineHeight: 20,
    fontWeight: FONTS.weights.bold,
  },
  recognitionDisclaimer: {
    color: 'rgba(255,255,255,0.86)',
    fontSize: FONTS.sizes.xs,
    lineHeight: 18,
  },
  analysisCard: { borderRadius: RADIUS.xl, padding: 20, gap: 12 },
  analysisMain: { color: COLORS.textPrimary, fontSize: FONTS.sizes.md, fontWeight: FONTS.weights.black, lineHeight: 22 },
  probGrid: { gap: 9 },
  probItem: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  probLabel: { flex: 1, color: COLORS.textSecondary, fontSize: FONTS.sizes.xs, fontWeight: FONTS.weights.bold },
  probTrack: { flex: 1, height: 8, backgroundColor: COLORS.appleSurfaceAlt, borderRadius: 4, overflow: 'hidden' },
  probFill: { height: '100%', backgroundColor: COLORS.primary, borderRadius: 4 },
  probValue: { color: COLORS.textPrimary, fontSize: FONTS.sizes.xs, fontWeight: FONTS.weights.black, textAlign: 'right' },
  reasonList: { gap: 4 },
  reasonText: { color: COLORS.textSecondary, fontSize: FONTS.sizes.sm, lineHeight: 19 },
  feedbackCard: { borderRadius: RADIUS.xl, padding: 20, gap: 12 },
  feedbackHint: { color: COLORS.textSecondary, fontSize: FONTS.sizes.sm, lineHeight: 20 },
  feedbackRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  feedbackBtn: {
    flexGrow: 1,
    backgroundColor: 'rgba(28,176,246,0.13)',
    borderRadius: RADIUS.full,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: 'rgba(28,176,246,0.25)',
    alignItems: 'center',
  },
  feedbackBtnActive: { backgroundColor: 'rgba(88,204,2,0.22)', borderColor: COLORS.primary },
  feedbackBtnDanger: { backgroundColor: 'rgba(239,68,68,0.17)', borderColor: COLORS.danger },
  feedbackBtnText: { color: COLORS.textPrimary, fontSize: FONTS.sizes.sm, fontWeight: FONTS.weights.black },
  emotionChips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  emotionChip: {
    borderRadius: RADIUS.full,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: COLORS.appleSurface,
    borderWidth: 1,
    borderColor: COLORS.appleLine,
  },
  emotionChipActive: { backgroundColor: '#E7F8D8', borderColor: COLORS.primary },
  emotionChipText: { color: COLORS.textPrimary, fontSize: FONTS.sizes.xs, fontWeight: FONTS.weights.bold },
  thoughtCard: { borderRadius: RADIUS.xl, padding: 20, gap: 10 },
  thoughtText: { color: COLORS.textSecondary, fontSize: FONTS.sizes.md, lineHeight: 24, fontStyle: 'italic' },
  storyCard: { borderRadius: RADIUS.xl, padding: 20, gap: 10 },
  storyText: { color: COLORS.textSecondary, fontSize: FONTS.sizes.md, lineHeight: 24 },
  disclaimerBox: {
    backgroundColor: 'rgba(88,204,2,0.12)',
    borderRadius: RADIUS.lg,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(88,204,2,0.22)',
  },
  disclaimerText: { color: COLORS.textMuted, fontSize: FONTS.sizes.xs, textAlign: 'center', lineHeight: 18 },
  savePetCard: { borderRadius: RADIUS.xl, padding: 20, gap: 10 },
  savePetTitle: { color: COLORS.textPrimary, fontSize: FONTS.sizes.xl, fontWeight: FONTS.weights.black },
  savePetText: { color: COLORS.textSecondary, fontSize: FONTS.sizes.md, lineHeight: 22 },
  savePetBtn: { borderRadius: RADIUS.lg, padding: 14, alignItems: 'center', marginTop: 4 },
  savePetBtnText: { color: '#FFFFFF', fontSize: FONTS.sizes.md, fontWeight: FONTS.weights.black },
  shareTitle: { color: COLORS.textPrimary, fontSize: FONTS.sizes.lg, fontWeight: FONTS.weights.bold, marginBottom: 12 },
  socialBtn: { 
    borderRadius: RADIUS.lg, 
    overflow: 'hidden', 
    marginBottom: 10, 
    ...SHADOWS.md 
  },
  socialGrad: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    padding: 16, 
    gap: 12 
  },
  socialEmoji: { fontSize: 32 },
  socialContent: { flex: 1 },
  socialText: { 
    color: '#fff', 
    fontSize: FONTS.sizes.md, 
    fontWeight: FONTS.weights.bold 
  },
  socialSub: { 
    color: 'rgba(255,255,255,0.8)', 
    fontSize: FONTS.sizes.sm, 
    marginTop: 2 
  },
  copyBtn: {
    backgroundColor: 'rgba(88,204,2,0.16)',
    borderRadius: RADIUS.lg,
    padding: 14,
    alignItems: 'center',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  copyText: {
    color: COLORS.primaryLight,
    fontSize: FONTS.sizes.md,
    fontWeight: FONTS.weights.semibold,
  },
  genericShareBtn: { 
    borderRadius: RADIUS.lg, 
    overflow: 'hidden' 
  },
  genericShareGrad: { 
    padding: 14, 
    alignItems: 'center' 
  },
  genericShareText: { 
    color: '#fff', 
    fontSize: FONTS.sizes.md, 
    fontWeight: FONTS.weights.bold 
  },
  againBtn: { borderRadius: RADIUS.xl, padding: 16, alignItems: 'center' },
  againBtnText: { color: '#fff', fontSize: FONTS.sizes.lg, fontWeight: FONTS.weights.bold },
});
