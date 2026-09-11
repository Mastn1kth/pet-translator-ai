import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, Alert, KeyboardAvoidingView
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { useAppStore } from '../src/store/appStore';
import { COLORS, FONTS, RADIUS } from '../src/constants/theme';
import { PetPatternLayer } from '../src/components/ui/TexturedBackground';
import { Pet, PetPersonality } from '../src/types';
import { useTheme } from '../src/hooks/useTheme';
import { useTranslation } from '../src/hooks/useTranslation';

const DEFAULT_PERSONALITY: PetPersonality = {
  arrogance: 40,
  curiosity: 60,
  laziness: 40,
  friendliness: 80,
  intelligence: 60,
  drama: 40,
  gluttony: 60,
  energy: 60,
};

const BREEDS_CAT_RU = ['Британская', 'Персидская', 'Мейн-кун', 'Сибирская', 'Шотландская', 'Бенгальская', 'Другая'];
const BREEDS_DOG_RU = ['Лабрадор', 'Немецкая овчарка', 'Хаски', 'Такса', 'Чихуахуа', 'Шпиц', 'Другая'];
const BREEDS_CAT_EN = ['British Shorthair', 'Persian', 'Maine Coon', 'Siberian', 'Scottish Fold', 'Bengal', 'Other'];
const BREEDS_DOG_EN = ['Labrador', 'German Shepherd', 'Husky', 'Dachshund', 'Chihuahua', 'Pomeranian', 'Other'];

export default function AddPetScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { t, language } = useTranslation();
  const { petId } = useLocalSearchParams<{ petId?: string }>();
  const pets = useAppStore((s) => s.pets);
  const addPet = useAppStore((s) => s.addPet);
  const updatePet = useAppStore((s) => s.updatePet);

  const existingPet = petId ? pets.find((p) => p.id === petId) : undefined;
  const isEditing = existingPet != null;

  const [type, setType] = useState<'cat' | 'dog'>(existingPet?.type || 'cat');
  const [name, setName] = useState(existingPet?.name || '');
  const [age, setAge] = useState(existingPet?.age ? String(existingPet.age) : '');
  const [gender, setGender] = useState<'male' | 'female'>(existingPet?.gender || 'male');
  const [breed, setBreed] = useState(existingPet?.breed || '');
  const [photo, setPhoto] = useState<string | undefined>(existingPet?.photo);
  const [personality, setPersonality] = useState<PetPersonality>(existingPet?.personality || DEFAULT_PERSONALITY);
  const [showPersonality, setShowPersonality] = useState(isEditing);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') { Alert.alert(t.addPet.needPhotoAccess); return; }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled) setPhoto(result.assets[0].uri);
  };

  const handleSave = () => {
    if (!name.trim()) { Alert.alert(t.addPet.needName); return; }
    const petFields = {
      name: name.trim(),
      type,
      age: age ? parseInt(age) : undefined,
      gender,
      breed: breed || undefined,
      photo,
      personality,
    };

    if (isEditing && existingPet) {
      updatePet(existingPet.id, petFields);
    } else {
      const newPet: Pet = {
        id: Date.now().toString(),
        ...petFields,
        createdAt: Date.now(),
      };
      addPet(newPet);
    }
    router.back();
  };

  const traitLabels = t.addPet.traits;

  const breeds = language === 'en'
    ? (type === 'cat' ? BREEDS_CAT_EN : BREEDS_DOG_EN)
    : (type === 'cat' ? BREEDS_CAT_RU : BREEDS_DOG_RU);

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
      <PetPatternLayer />
      <KeyboardAvoidingView
        style={styles.keyboard}
        behavior={process.env.EXPO_OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={12}
      >
      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={[styles.backBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
            accessibilityRole="button"
            accessibilityLabel={t.common.back}
          >
            <Text style={styles.backText}>‹</Text>
          </TouchableOpacity>
          <Text style={[styles.title, { color: colors.text }]}>{isEditing ? t.addPet.titleEdit : t.addPet.titleNew}</Text>
          <View style={styles.headerPaw}>
            <Text style={styles.headerPawEmoji}>🐾</Text>
          </View>
        </View>

        {/* Type selector */}
        <View style={styles.section}>
          <Text style={[styles.label, { color: colors.textSub }]}>{t.addPet.whoIsYourPet}</Text>
          <View style={styles.typeRow}>
            {(['cat', 'dog'] as const).map((petType) => (
              <TouchableOpacity key={petType} onPress={() => setType(petType)} style={styles.typeCard}>
                <LinearGradient
                  colors={type === petType ? COLORS.gradientDuo : colors.gradientApple}
                  style={styles.typeGrad}
                >
                  <Text style={styles.typeEmoji}>{petType === 'cat' ? '🐱' : '🐶'}</Text>
                  <Text style={[styles.typeLabel, { color: type === petType ? '#fff' : colors.textMuted }]}>
                    {petType === 'cat' ? t.addPet.cat : t.addPet.dog}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Photo */}
        <View style={styles.section}>
          <Text style={[styles.label, { color: colors.textSub }]}>{t.addPet.photoLabel}</Text>
          <TouchableOpacity onPress={pickImage} style={styles.photoBtn}>
            <LinearGradient colors={colors.gradientApple} style={styles.photoGrad}>
              <Text style={styles.photoEmoji}>{photo ? '✅' : '📷'}</Text>
              <Text style={[styles.photoText, { color: colors.textSub }]}>{photo ? t.addPet.photoAdded : t.addPet.photoAdd}</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Name */}
        <View style={styles.section}>
          <Text style={[styles.label, { color: colors.textSub }]}>{t.addPet.nameLabel}</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text }]}
            value={name}
            onChangeText={setName}
            placeholder={t.addPet.namePlaceholder}
            placeholderTextColor={colors.textMuted}
            selectionColor={COLORS.duoGreen}
            cursorColor={COLORS.duoGreen}
            autoCorrect={false}
            maxLength={20}
          />
        </View>

        {/* Age */}
        <View style={styles.section}>
          <Text style={[styles.label, { color: colors.textSub }]}>{t.addPet.ageLabel}</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text }]}
            value={age}
            onChangeText={setAge}
            placeholder={t.addPet.agePlaceholder}
            placeholderTextColor={colors.textMuted}
            selectionColor={COLORS.duoGreen}
            cursorColor={COLORS.duoGreen}
            keyboardType="numeric"
            maxLength={2}
          />
        </View>

        {/* Gender */}
        <View style={styles.section}>
          <Text style={[styles.label, { color: colors.textSub }]}>{t.addPet.genderLabel}</Text>
          <View style={styles.typeRow}>
            {(['male', 'female'] as const).map((g) => (
              <TouchableOpacity key={g} onPress={() => setGender(g)} style={styles.typeCard}>
                <LinearGradient
                  colors={gender === g ? COLORS.gradientDuo : colors.gradientApple}
                  style={styles.typeGrad}
                >
                  <Text style={styles.typeEmoji}>{g === 'male' ? '♂️' : '♀️'}</Text>
                  <Text style={[styles.typeLabel, { color: gender === g ? '#fff' : colors.textMuted }]}>
                    {g === 'male' ? t.addPet.male : t.addPet.female}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Breed */}
        <View style={styles.section}>
          <Text style={[styles.label, { color: colors.textSub }]}>{t.addPet.breedLabel}</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {breeds.map((b) => (
              <TouchableOpacity key={b} onPress={() => setBreed(breed === b ? '' : b)} style={styles.breedChip}>
                <LinearGradient
                  colors={breed === b ? COLORS.gradientDuo : colors.gradientApple}
                  style={styles.breedChipGrad}
                >
                  <Text style={[styles.breedChipText, { color: breed === b ? '#fff' : colors.textSub }]}>{b}</Text>
                </LinearGradient>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Personality is optional and collapsed for a simpler first-time flow. */}
        <View style={styles.section}>
          <TouchableOpacity
            onPress={() => setShowPersonality((shown) => !shown)}
            activeOpacity={0.84}
            style={[styles.personalityToggle, { backgroundColor: colors.surface, borderColor: colors.border }]}
            accessibilityRole="button"
            accessibilityState={{ expanded: showPersonality }}
          >
            <View style={styles.personalityIcon}>
              <Text style={styles.personalityEmoji}>🎨</Text>
            </View>
            <View style={styles.personalityCopy}>
              <Text style={[styles.personalityTitle, { color: colors.text }]}>{t.addPet.personalityLabel}</Text>
              <Text style={[styles.personalityHint, { color: colors.textSub }]}>{t.addPet.personalityHint}</Text>
            </View>
            <Text style={styles.personalityChevron}>{showPersonality ? '▲' : '▼'}</Text>
          </TouchableOpacity>

          {showPersonality && (
            <View style={[styles.traitsCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              {(Object.keys(personality) as (keyof PetPersonality)[]).map((key) => (
                <View key={key} style={styles.traitRow}>
                  <Text style={[styles.traitLabel, { color: colors.textSub }]}>{traitLabels[key]}</Text>
                  <View style={styles.traitSliderRow}>
                    {[20, 40, 60, 80, 100].map((val) => (
                      <TouchableOpacity
                        key={val}
                        onPress={() => setPersonality({ ...personality, [key]: val })}
                        style={[
                          styles.traitDot,
                          personality[key] >= val && styles.traitDotActive,
                        ]}
                        accessibilityRole="button"
                        accessibilityLabel={`${traitLabels[key]} ${val}`}
                      />
                    ))}
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Save */}
        <View style={styles.section}>
          <TouchableOpacity
            onPress={handleSave}
            activeOpacity={0.88}
            accessibilityRole="button"
            accessibilityLabel={isEditing ? t.addPet.saveEdit : t.addPet.saveNew}
          >
            <LinearGradient colors={COLORS.gradientDuo} style={styles.saveBtn}>
              <Text style={styles.saveBtnText}>{isEditing ? t.addPet.saveEdit : t.addPet.saveNew}</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bgPrimary },
  keyboard: { flex: 1 },
  scrollContent: { paddingBottom: 120 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 10,
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 17,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backText: {
    color: COLORS.primary,
    fontSize: 34,
    lineHeight: 36,
    fontWeight: FONTS.weights.medium,
    marginTop: -3,
  },
  title: {
    flex: 1,
    color: COLORS.textPrimary,
    fontFamily: FONTS.family.display,
    fontSize: FONTS.sizes.xl,
    fontWeight: FONTS.weights.black,
    textAlign: 'center',
  },
  headerPaw: {
    width: 44,
    height: 44,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F2ECFF',
  },
  headerPawEmoji: {
    fontSize: 22,
  },
  section: {
    width: '100%',
    maxWidth: 620,
    alignSelf: 'center',
    paddingHorizontal: 16,
    marginTop: 18,
  },
  label: {
    color: COLORS.textSecondary,
    fontFamily: FONTS.family.display,
    fontSize: FONTS.sizes.md,
    fontWeight: FONTS.weights.black,
    marginBottom: 10,
  },
  typeRow: { flexDirection: 'row', gap: 12 },
  typeCard: { flex: 1, borderRadius: RADIUS.xl, overflow: 'hidden' },
  typeGrad: {
    minHeight: 118,
    padding: 17,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    borderRadius: RADIUS.xl,
  },
  typeEmoji: { fontSize: 44 },
  typeLabel: {
    color: COLORS.textMuted,
    fontFamily: FONTS.family.display,
    fontSize: FONTS.sizes.md,
    fontWeight: FONTS.weights.black,
  },
  typeLabelActive: { color: '#fff' },
  photoBtn: { borderRadius: RADIUS.xl, overflow: 'hidden' },
  photoGrad: {
    minHeight: 112,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: RADIUS.xl,
    borderWidth: 2,
    borderColor: 'rgba(109,74,255,0.34)',
    borderStyle: 'dashed',
    gap: 8,
  },
  photoEmoji: { fontSize: 36 },
  photoText: {
    color: COLORS.textSecondary,
    fontFamily: FONTS.family.display,
    fontSize: FONTS.sizes.md,
    fontWeight: FONTS.weights.bold,
  },
  input: {
    backgroundColor: COLORS.appleSurface,
    minHeight: 58,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: COLORS.appleInk,
    fontFamily: FONTS.family.display,
    fontSize: FONTS.sizes.lg,
    fontWeight: FONTS.weights.bold,
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  breedChip: { marginRight: 8, borderRadius: RADIUS.full, overflow: 'hidden' },
  breedChipGrad: {
    minHeight: 44,
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: RADIUS.full,
    justifyContent: 'center',
  },
  breedChipText: {
    color: COLORS.textSecondary,
    fontSize: FONTS.sizes.sm,
    fontWeight: FONTS.weights.bold,
  },
  personalityToggle: {
    minHeight: 84,
    borderRadius: 24,
    borderWidth: 1,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  personalityIcon: {
    width: 54,
    height: 54,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF0D7',
  },
  personalityEmoji: {
    fontSize: 28,
  },
  personalityCopy: {
    flex: 1,
    gap: 3,
  },
  personalityTitle: {
    fontFamily: FONTS.family.display,
    fontSize: FONTS.sizes.md,
    fontWeight: FONTS.weights.black,
  },
  personalityHint: {
    fontSize: FONTS.sizes.xs,
    lineHeight: 17,
  },
  personalityChevron: {
    color: COLORS.primary,
    fontSize: 13,
    fontWeight: FONTS.weights.black,
  },
  traitsCard: {
    marginTop: 10,
    borderRadius: 24,
    borderWidth: 1,
    padding: 14,
  },
  traitRow: {
    marginBottom: 14,
    gap: 8,
  },
  traitLabel: {
    color: COLORS.textSecondary,
    fontSize: FONTS.sizes.sm,
    fontWeight: FONTS.weights.bold,
  },
  traitSliderRow: {
    flexDirection: 'row',
    gap: 7,
    alignItems: 'center',
  },
  traitDot: {
    flex: 1,
    height: 32,
    borderRadius: 13,
    backgroundColor: 'rgba(109,74,255,0.13)',
    borderWidth: 1,
    borderColor: 'rgba(109,74,255,0.22)',
  },
  traitDotActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primaryLight },
  traitVal: { color: COLORS.textMuted, fontSize: FONTS.sizes.xs, width: 28, textAlign: 'right' },
  saveBtn: {
    minHeight: 64,
    borderRadius: 23,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontFamily: FONTS.family.display,
    fontSize: FONTS.sizes.lg,
    fontWeight: FONTS.weights.black,
  },
});
