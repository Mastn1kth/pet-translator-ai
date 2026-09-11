import { Link, Stack } from 'expo-router';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, FONTS } from '../src/constants/theme';
import { PetPatternLayer } from '../src/components/ui/TexturedBackground';
import { useTheme } from '../src/hooks/useTheme';
import { useTranslation } from '../src/hooks/useTranslation';

export default function NotFoundScreen() {
  const { colors } = useTheme();
  const { t } = useTranslation();

  return (
    <>
      <Stack.Screen options={{ title: t.common.pageNotFound }} />
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <PetPatternLayer />
        <Text style={styles.emoji}>🐾</Text>
        <Text style={[styles.title, { color: colors.text }]}>{t.common.pageNotFound}</Text>
        <Link href="/(tabs)" style={styles.link}>
          <Text style={styles.linkText}>{t.common.goHome}</Text>
        </Link>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bgPrimary, alignItems: 'center', justifyContent: 'center', gap: 16 },
  emoji: { fontSize: 64 },
  title: { color: COLORS.textPrimary, fontSize: FONTS.sizes.xl, fontWeight: FONTS.weights.bold },
  link: { marginTop: 8 },
  linkText: { color: COLORS.primaryLight, fontSize: FONTS.sizes.md },
});
