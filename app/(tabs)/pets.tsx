import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Image
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAppStore } from '../../src/store/appStore';
import { COLORS, FONTS, RADIUS, SHADOWS } from '../../src/constants/theme';
import { PetPatternLayer } from '../../src/components/ui/TexturedBackground';
import { useTheme } from '../../src/hooks/useTheme';
import { useTranslation } from '../../src/hooks/useTranslation';

export default function PetsScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { t } = useTranslation();
  const pets = useAppStore((s) => s.pets);
  const removePet = useAppStore((s) => s.removePet);
  const [expandedPet, setExpandedPet] = useState<string | null>(null);

  const PERSONALITY_LABELS: Record<string, string> = t.addPet.traits;

  const handleDelete = (id: string, name: string) => {
    Alert.alert(
      t.pets.deleteConfirmTitle,
      t.pets.deleteConfirmText(name),
      [
        { text: t.common.cancel, style: 'cancel' },
        { text: t.common.delete, style: 'destructive', onPress: () => removePet(id) },
      ]
    );
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
      <PetPatternLayer />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>{t.pets.title}</Text>
          <TouchableOpacity onPress={() => router.push('/add-pet')} style={styles.addBtn}>
            <LinearGradient colors={COLORS.gradientDuo} style={styles.addGrad}>
              <Text style={styles.addText}>{t.pets.addBtn}</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {pets.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyEmoji}>🐾</Text>
            <Text style={[styles.emptyTitle, { color: colors.text }]}>{t.pets.emptyTitle}</Text>
            <Text style={[styles.emptyText, { color: colors.textSub }]}>{t.pets.emptyText}</Text>
            <TouchableOpacity onPress={() => router.push('/add-pet')} style={styles.emptyBtn}>
              <LinearGradient colors={COLORS.gradientDuo} style={styles.emptyBtnGrad}>
                <Text style={styles.emptyBtnText}>{t.pets.emptyBtn}</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        ) : (
          pets.map((pet) => (
            <View key={pet.id} style={styles.petCard}>
              <TouchableOpacity onPress={() => setExpandedPet(expandedPet === pet.id ? null : pet.id)}>
                <LinearGradient colors={colors.gradientApple} style={styles.petHeader}>
                  <View style={styles.petHeaderLeft}>
                    {pet.photo ? (
                      <Image source={{ uri: pet.photo }} style={styles.petPhoto} />
                    ) : (
                      <LinearGradient colors={COLORS.gradientDuo} style={styles.petPhotoPlaceholder}>
                        <Text style={{ fontSize: 28 }}>{pet.type === 'cat' ? '🐱' : '🐶'}</Text>
                      </LinearGradient>
                    )}
                    <View>
                      <Text style={[styles.petName, { color: colors.text }]}>{pet.name}</Text>
                      <Text style={[styles.petInfo, { color: colors.textSub }]}>
                        {pet.type === 'cat' ? `🐱 ${t.addPet.cat}` : `🐶 ${t.addPet.dog}`}
                        {pet.breed ? ` • ${pet.breed}` : ''}
                        {pet.age ? ` • ${t.pets.ageYears(pet.age)}` : ''}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.petActions}>
                    <TouchableOpacity
                      style={styles.translateBtn}
                      onPress={() => router.push(`/translate/${pet.id}?mode=sound` as any)}
                    >
                      <Text style={styles.translateBtnText}>{t.pets.translate}</Text>
                    </TouchableOpacity>
                    <Text style={[styles.chevron, { color: colors.textMuted }]}>{expandedPet === pet.id ? '▲' : '▼'}</Text>
                  </View>
                </LinearGradient>
              </TouchableOpacity>

              {expandedPet === pet.id && (
                <View style={[styles.petDetails, { backgroundColor: colors.surface, borderTopColor: colors.border }]}>
                  <Text style={[styles.detailsTitle, { color: colors.text }]}>{t.pets.charTitle}</Text>
                  {Object.entries(pet.personality).map(([key, value]) => (
                    <View key={key} style={styles.traitRow}>
                      <Text style={[styles.traitLabel, { color: colors.textSub }]}>{PERSONALITY_LABELS[key] || key}</Text>
                      <View style={styles.traitBarBg}>
                        <LinearGradient
                          colors={COLORS.gradientDuo}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 0 }}
                          style={[styles.traitBarFill, { width: `${value}%` }]}
                        />
                      </View>
                      <Text style={[styles.traitValue, { color: colors.textMuted }]}>{value}</Text>
                    </View>
                  ))}
                  <View style={styles.detailsActions}>
                    <TouchableOpacity
                      style={[styles.editBtn, { borderColor: colors.border }]}
                      onPress={() => router.push(`/add-pet?petId=${pet.id}` as any)}
                    >
                      <Text style={[styles.editBtnText, { color: colors.text }]}>{t.pets.editBtn}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.deleteBtn}
                      onPress={() => handleDelete(pet.id, pet.name)}
                    >
                      <Text style={styles.deleteBtnText}>{t.pets.deleteBtn}</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </View>
          ))
        )}

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
  addBtn: { borderRadius: RADIUS.full, overflow: 'hidden' },
  addGrad: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: RADIUS.full },
  addText: { color: '#fff', fontSize: FONTS.sizes.sm, fontWeight: FONTS.weights.bold },
  empty: {
    alignItems: 'center',
    padding: 40,
    marginTop: 40,
  },
  emptyEmoji: { fontSize: 80, marginBottom: 16 },
  emptyTitle: {
    color: COLORS.textPrimary,
    fontFamily: FONTS.family.display,
    fontSize: FONTS.sizes.xl,
    fontWeight: FONTS.weights.black,
  },
  emptyText: { color: COLORS.textSecondary, fontSize: FONTS.sizes.md, textAlign: 'center', marginTop: 8, lineHeight: 22 },
  emptyBtn: { marginTop: 24, borderRadius: RADIUS.xl, overflow: 'hidden' },
  emptyBtnGrad: { paddingHorizontal: 28, paddingVertical: 14, borderRadius: RADIUS.xl },
  emptyBtnText: { color: '#fff', fontSize: FONTS.sizes.lg, fontWeight: FONTS.weights.bold },
  petCard: { marginHorizontal: 16, marginBottom: 12, borderRadius: 28, overflow: 'hidden', ...SHADOWS.md },
  petHeader: { padding: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  petHeaderLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  petPhoto: { width: 56, height: 56, borderRadius: 28 },
  petPhotoPlaceholder: { width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center' },
  petName: {
    color: COLORS.textPrimary,
    fontFamily: FONTS.family.display,
    fontSize: FONTS.sizes.lg,
    fontWeight: FONTS.weights.black,
  },
  petInfo: { color: COLORS.textSecondary, fontSize: FONTS.sizes.sm, marginTop: 2 },
  petActions: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  translateBtn: {
    backgroundColor: 'rgba(88,204,2,0.24)',
    borderRadius: RADIUS.full,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  translateBtnText: { color: COLORS.primaryLight, fontSize: FONTS.sizes.xs, fontWeight: FONTS.weights.bold },
  chevron: { color: COLORS.textMuted, fontSize: 12 },
  petDetails: { backgroundColor: COLORS.bgCard, padding: 16, gap: 10, borderTopWidth: 1 },
  detailsTitle: { color: COLORS.textPrimary, fontSize: FONTS.sizes.md, fontWeight: FONTS.weights.bold, marginBottom: 4 },
  traitRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  traitLabel: { color: COLORS.textSecondary, fontSize: FONTS.sizes.sm, width: 110 },
  traitBarBg: { flex: 1, height: 8, backgroundColor: 'rgba(88,204,2,0.16)', borderRadius: 4, overflow: 'hidden' },
  traitBarFill: { height: '100%', borderRadius: 4 },
  traitValue: { color: COLORS.textMuted, fontSize: FONTS.sizes.xs, width: 30, textAlign: 'right' },
  detailsActions: { flexDirection: 'row', gap: 8, marginTop: 8 },
  editBtn: { flex: 1, padding: 12, alignItems: 'center', borderRadius: RADIUS.lg, borderWidth: 1 },
  editBtnText: { fontSize: FONTS.sizes.sm, fontWeight: FONTS.weights.bold },
  deleteBtn: { flex: 1, padding: 12, alignItems: 'center', backgroundColor: 'rgba(239,68,68,0.15)', borderRadius: RADIUS.lg, borderWidth: 1, borderColor: COLORS.danger },
  deleteBtnText: { color: COLORS.danger, fontSize: FONTS.sizes.sm, fontWeight: FONTS.weights.bold },
});
