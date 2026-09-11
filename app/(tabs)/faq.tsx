import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { COLORS, FONTS, RADIUS, SHADOWS } from '../../src/constants/theme';
import { getAllArticles } from '../../src/constants/trafficContent';
import { PetPatternLayer } from '../../src/components/ui/TexturedBackground';
import { useTheme } from '../../src/hooks/useTheme';
import { useTranslation } from '../../src/hooks/useTranslation';

const FAQ_TOPICS_RU = [
  {
    id: 'cat_scratch',
    emoji: '🪑',
    title: 'Почему кот царапает мебель?',
    color: ['#FF2D55', '#D4004A'] as const,
    short: 'Так кот точит когти и оставляет свой запах',
    content: [
      {
        title: '💅 Точит когти',
        text: 'Так кот снимает старый слой с когтей.',
      },
      {
        title: '🗺️ Оставляет свой запах',
        text: 'На лапках есть места, которые оставляют знакомый запах.',
      },
      {
        title: '💪 Растяжка',
        text: 'Царапание — отличная утренняя гимнастика для мышц.',
      },
      {
        title: '✅ Что попробовать',
        text: 'Попроси взрослого поставить устойчивую когтеточку рядом с диваном. Хвали котика, когда он пользуется ей.',
      },
    ],
  },
  {
    id: 'dog_eats_grass',
    emoji: '🌿',
    title: 'Почему собака ест траву?',
    color: COLORS.gradientSky,
    short: 'Иногда это нормально, а иногда болит живот',
    content: [
      {
        title: '🌱 Это нормально',
        text: 'Большинство собак иногда едят траву. Это инстинктивное поведение.',
      },
      {
        title: '🤢 Может болеть живот',
        text: 'Причины бывают разными. Если собака часто ест траву, её тошнит или она выглядит больной — сразу скажи взрослому.',
      },
      {
        title: '🥣 Не меняй корм сам',
        text: 'Корм и угощения выбирает взрослый вместе с ветеринаром.',
      },
      {
        title: '⚠️ Осторожно',
        text: 'Не разрешай есть траву возле дорог или там, где могли распылять химикаты. Если сомневаешься — позови взрослого.',
      },
    ],
  },
];

const FAQ_TOPICS_EN: typeof FAQ_TOPICS_RU = [
  {
    id: 'cat_scratch',
    emoji: '🪑',
    title: 'Why does my cat scratch furniture?',
    color: ['#FF2D55', '#D4004A'] as const,
    short: 'Cats sharpen claws and leave their scent',
    content: [
      {
        title: '💅 Claw care',
        text: 'Scratching helps a cat remove the old outer layer of each claw.',
      },
      {
        title: '🗺️ A familiar scent',
        text: 'A cat’s paws can leave a familiar scent behind.',
      },
      {
        title: '💪 A good stretch',
        text: 'Scratching also stretches the cat’s body and legs.',
      },
      {
        title: '✅ What to try',
        text: 'Ask a grown-up to place a sturdy scratching post near the sofa. Praise your cat for using it.',
      },
    ],
  },
  {
    id: 'dog_eats_grass',
    emoji: '🌿',
    title: 'Why does my dog eat grass?',
    color: COLORS.gradientSky,
    short: 'Sometimes it is normal, and sometimes the tummy hurts',
    content: [
      {
        title: '🌱 It can be normal',
        text: 'Many dogs nibble grass sometimes and still feel fine.',
      },
      {
        title: '🤢 The tummy may hurt',
        text: 'There can be many reasons. If your dog often eats grass, vomits, or seems unwell, tell a grown-up right away.',
      },
      {
        title: '🥣 Do not change food yourself',
        text: 'A grown-up should choose food and treats with help from a veterinarian.',
      },
      {
        title: '⚠️ Be careful',
        text: 'Keep dogs away from grass near roads or where chemicals may have been sprayed. Ask a grown-up if you are unsure.',
      },
    ],
  },
];

export default function FAQScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { t, language } = useTranslation();
  const [expanded, setExpanded] = useState<string | null>(null);
  const articles = language === 'ru' ? getAllArticles() : [];
  const faqTopics = language === 'ru' ? FAQ_TOPICS_RU : FAQ_TOPICS_EN;

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
      <PetPatternLayer />
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>{t.faq.title}</Text>
          <Text style={[styles.subtitle, { color: colors.textSub }]}>{t.faq.subtitle}</Text>
        </View>

        {/* Новые трафиковые статьи */}
        {articles.length > 0 && (
          <View style={styles.articlesSection}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>{t.faq.articlesTitle}</Text>
            {articles.map((article) => (
              <TouchableOpacity
                key={article.id}
                onPress={() => router.push(`/article/${article.id}`)}
                style={styles.articleCard}
              >
                <LinearGradient
                  colors={article.category === 'cat' ? COLORS.gradientDuo : COLORS.gradientSun}
                  style={styles.articleGradient}
                >
                  <Text style={styles.articleEmoji}>{article.emoji}</Text>
                  <View style={styles.articleContent}>
                    <Text style={styles.articleTitle}>{article.title}</Text>
                    <Text style={styles.articleDescription}>{article.shortDescription}</Text>
                  </View>
                  <Text style={styles.articleArrow}>→</Text>
                </LinearGradient>
              </TouchableOpacity>
            ))}
          </View>
        )}

        <View style={styles.oldFaqSection}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>{t.faq.moreTitle}</Text>
        </View>

        {faqTopics.map((topic) => (
          <View key={topic.id} style={styles.topicContainer}>
            <TouchableOpacity
              onPress={() => setExpanded(expanded === topic.id ? null : topic.id)}
            >
              <LinearGradient colors={topic.color} style={styles.topicHeader}>
                <View style={styles.topicLeft}>
                  <Text style={styles.topicEmoji}>{topic.emoji}</Text>
                  <View>
                    <Text style={styles.topicTitle}>{topic.title}</Text>
                    <Text style={styles.topicShort}>{topic.short}</Text>
                  </View>
                </View>
                <Text style={styles.chevron}>{expanded === topic.id ? '▲' : '▼'}</Text>
              </LinearGradient>
            </TouchableOpacity>

            {expanded === topic.id && (
              <View style={[styles.topicContent, { backgroundColor: colors.surface }]}>
                {topic.content.map((item, idx) => (
                  <View key={idx} style={styles.contentItem}>
                    <Text style={[styles.contentTitle, { color: colors.text }]}>{item.title}</Text>
                    <Text style={[styles.contentText, { color: colors.textSub }]}>{item.text}</Text>
                  </View>
                ))}
                <TouchableOpacity
                  style={styles.faqAdBtn}
                  onPress={() => router.push('/(tabs)')}
                >
                  <LinearGradient colors={COLORS.gradientDuo} style={styles.faqAdGrad}>
                    <Text style={styles.faqAdText}>
                      {t.faq.adText}
                    </Text>
                    <Text style={styles.faqAdCta}>{t.faq.adCta}</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            )}
          </View>
        ))}

        <View style={{ height: 30 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bgPrimary },
  header: {
    padding: 20,
    paddingTop: 16,
  },
  title: {
    color: COLORS.textPrimary,
    fontSize: FONTS.sizes.xxl,
    fontWeight: FONTS.weights.black,
  },
  subtitle: {
    color: COLORS.textSecondary,
    fontSize: FONTS.sizes.md,
    marginTop: 4,
  },
  topicContainer: {
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: RADIUS.xl,
    overflow: 'hidden',
    ...SHADOWS.md,
  },
  topicHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  topicLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  topicEmoji: { fontSize: 32 },
  topicTitle: { color: '#fff', fontSize: FONTS.sizes.lg, fontWeight: FONTS.weights.bold },
  topicShort: { color: 'rgba(255,255,255,0.75)', fontSize: FONTS.sizes.sm, marginTop: 2 },
  chevron: { color: '#fff', fontSize: 14, fontWeight: FONTS.weights.bold },
  topicContent: {
    backgroundColor: COLORS.bgCard,
    padding: 16,
    gap: 16,
  },
  contentItem: {
    borderLeftWidth: 3,
    borderLeftColor: COLORS.primary,
    paddingLeft: 12,
  },
  contentTitle: {
    color: COLORS.textPrimary,
    fontSize: FONTS.sizes.md,
    fontWeight: FONTS.weights.bold,
    marginBottom: 4,
  },
  contentText: {
    color: COLORS.textSecondary,
    fontSize: FONTS.sizes.sm,
    lineHeight: 20,
  },
  faqAdBtn: { borderRadius: RADIUS.lg, overflow: 'hidden', marginTop: 4 },
  faqAdGrad: { padding: 16, borderRadius: RADIUS.lg, alignItems: 'center', gap: 4 },
  faqAdText: { color: '#fff', fontSize: FONTS.sizes.sm, textAlign: 'center', fontWeight: FONTS.weights.semibold },
  faqAdCta: { color: COLORS.secondaryLight, fontSize: FONTS.sizes.sm, fontWeight: FONTS.weights.bold },
  articlesSection: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  sectionTitle: {
    color: COLORS.textPrimary,
    fontSize: FONTS.sizes.xl,
    fontWeight: FONTS.weights.bold,
    marginBottom: 16,
  },
  articleCard: {
    marginBottom: 12,
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
    ...SHADOWS.md,
  },
  articleGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },
  articleEmoji: {
    fontSize: 40,
  },
  articleContent: {
    flex: 1,
  },
  articleTitle: {
    color: '#fff',
    fontSize: FONTS.sizes.md,
    fontWeight: FONTS.weights.bold,
    marginBottom: 4,
  },
  articleDescription: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: FONTS.sizes.sm,
    lineHeight: 18,
  },
  articleArrow: {
    color: '#fff',
    fontSize: 24,
    fontWeight: FONTS.weights.bold,
  },
  oldFaqSection: {
    paddingHorizontal: 16,
    marginBottom: 12,
  },
});
