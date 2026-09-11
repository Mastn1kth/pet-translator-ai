import React from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { COLORS, FONTS, RADIUS } from '../../src/constants/theme';
import { getArticleById } from '../../src/constants/trafficContent';
import { PetPatternLayer } from '../../src/components/ui/TexturedBackground';
import { useTheme } from '../../src/hooks/useTheme';
import { useTranslation } from '../../src/hooks/useTranslation';

export default function ArticleScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { colors } = useTheme();
  const { t, language } = useTranslation();
  const article = getArticleById(id);

  if (!article || language !== 'ru') {
    const articleMissing = !article;
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
        <View style={[styles.container, { backgroundColor: colors.background }]}>
          <PetPatternLayer />
          <Text style={styles.fallbackEmoji}>{articleMissing ? '🔎' : '📚'}</Text>
          <Text style={[styles.errorText, { color: colors.text }]}>
            {articleMissing ? t.common.articleNotFound : t.common.articleUnavailableTitle}
          </Text>
          {!articleMissing && (
            <Text style={[styles.fallbackText, { color: colors.textSub }]}>
              {t.common.articleUnavailableText}
            </Text>
          )}
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.backText}>{t.common.back}</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
      <LinearGradient colors={colors.gradientApple} style={styles.container}>
        <PetPatternLayer />
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Text style={styles.backText}>← Назад</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Hero Section */}
          <View style={styles.hero}>
            <Text style={styles.heroEmoji}>{article.emoji}</Text>
            <Text style={[styles.heroTitle, { color: colors.text }]}>{article.title}</Text>
            <Text style={[styles.heroDescription, { color: colors.textSub }]}>{article.shortDescription}</Text>
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryText}>
                {article.category === 'cat' ? '🐱 Кошки' : '🐕 Собаки'}
              </Text>
            </View>
          </View>

          {/* Content Sections */}
          {article.content.map((section, index) => (
            <View key={index} style={[styles.section, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Text style={[styles.sectionHeading, { color: colors.text }]}>{section.heading}</Text>
              <Text style={[styles.sectionText, { color: colors.textSub }]}>{section.text}</Text>
              
              {section.tips && section.tips.length > 0 && (
                <View style={styles.tipsContainer}>
                  {section.tips.map((tip, tipIndex) => (
                    <View key={tipIndex} style={styles.tipRow}>
                      <Text style={styles.tipBullet}>•</Text>
                      <Text style={[styles.tipText, { color: colors.text }]}>{tip}</Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
          ))}

          {/* CTA Section */}
          <View style={[styles.ctaSection, { backgroundColor: colors.surfaceAlt }]}>
            <Text style={[styles.ctaTitle, { color: colors.text }]}>Хочешь послушать питомца и угадать его настроение?</Text>
            <TouchableOpacity onPress={() => router.push('/(tabs)')}>
              <LinearGradient
                colors={COLORS.gradientDuo}
                style={styles.ctaButton}
              >
                <Text style={styles.ctaButtonText}>Послушать питомца</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>

          <View style={{ height: 40 }} />
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  container: { flex: 1 },
  header: {
    padding: 16,
    paddingTop: 8,
  },
  backBtn: { padding: 8 },
  backText: {
    color: COLORS.primaryLight,
    fontSize: FONTS.sizes.md,
    fontWeight: FONTS.weights.semibold,
  },
  scrollView: { flex: 1 },
  scrollContent: { paddingHorizontal: 20 },
  hero: {
    alignItems: 'center',
    marginBottom: 32,
    paddingVertical: 20,
  },
  heroEmoji: { fontSize: 72, marginBottom: 16 },
  heroTitle: {
    color: COLORS.textPrimary,
    fontSize: FONTS.sizes.xxxl,
    fontWeight: FONTS.weights.black,
    textAlign: 'center',
    marginBottom: 12,
    lineHeight: 40,
  },
  heroDescription: {
    color: COLORS.textSecondary,
    fontSize: FONTS.sizes.md,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 16,
  },
  categoryBadge: {
    backgroundColor: 'rgba(88,204,2,0.16)',
    borderRadius: RADIUS.full,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  categoryText: {
    color: COLORS.primaryLight,
    fontSize: FONTS.sizes.sm,
    fontWeight: FONTS.weights.bold,
  },
  section: {
    marginBottom: 28,
    backgroundColor: 'rgba(88,204,2,0.08)',
    borderRadius: RADIUS.lg,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(88,204,2,0.12)',
  },
  sectionHeading: {
    color: COLORS.textPrimary,
    fontSize: FONTS.sizes.xl,
    fontWeight: FONTS.weights.bold,
    marginBottom: 12,
  },
  sectionText: {
    color: COLORS.textSecondary,
    fontSize: FONTS.sizes.md,
    lineHeight: 24,
    marginBottom: 12,
  },
  tipsContainer: {
    marginTop: 12,
    gap: 10,
  },
  tipRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  tipBullet: {
    color: COLORS.primary,
    fontSize: FONTS.sizes.lg,
    fontWeight: FONTS.weights.bold,
    marginTop: 2,
  },
  tipText: {
    flex: 1,
    color: COLORS.textPrimary,
    fontSize: FONTS.sizes.md,
    lineHeight: 22,
  },
  ctaSection: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 20,
    padding: 24,
    backgroundColor: 'rgba(88,204,2,0.12)',
    borderRadius: RADIUS.xl,
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  ctaTitle: {
    color: COLORS.textPrimary,
    fontSize: FONTS.sizes.lg,
    fontWeight: FONTS.weights.bold,
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 28,
  },
  ctaButton: {
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: RADIUS.lg,
  },
  ctaButtonText: {
    color: '#fff',
    fontSize: FONTS.sizes.md,
    fontWeight: FONTS.weights.bold,
  },
  errorText: {
    color: COLORS.textPrimary,
    fontSize: FONTS.sizes.lg,
    textAlign: 'center',
    fontWeight: FONTS.weights.bold,
    marginBottom: 12,
  },
  fallbackEmoji: {
    fontSize: 64,
    textAlign: 'center',
    marginTop: 80,
    marginBottom: 20,
  },
  fallbackText: {
    fontSize: FONTS.sizes.md,
    lineHeight: 24,
    textAlign: 'center',
    paddingHorizontal: 28,
    marginBottom: 20,
  },
});
