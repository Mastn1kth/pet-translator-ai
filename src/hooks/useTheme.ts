import { useAppStore } from '../store/appStore';
import { COLORS } from '../constants/theme';

const lightColors = {
  ...COLORS,
  background: COLORS.bgPrimary,
  surface: COLORS.bgCard,
  surfaceAlt: COLORS.bgCardLight,
  text: COLORS.textPrimary,
  textSub: COLORS.textSecondary,
  textMuted: COLORS.textMuted,
  border: COLORS.appleLine,
  overlay: 'rgba(255,255,255,0.82)',
};

const darkColors = {
  ...COLORS,
  appleBg: '#171329',
  appleSurface: '#211B38',
  appleSurfaceAlt: '#30264F',
  appleLine: 'rgba(224,213,255,0.18)',
  appleInk: '#FFF9F0',
  appleInkSoft: '#DDD3EA',
  appleMuted: '#AFA4C2',
  bgPrimary: '#171329',
  bgSecondary: '#1D1831',
  bgCard: '#211B38',
  bgCardLight: '#30264F',
  textPrimary: '#FFF9F0',
  textSecondary: '#DDD3EA',
  textMuted: '#AFA4C2',
  textDark: '#171329',
  gradientApple: ['#211B38', '#2A2146'] as const,
  gradientDark: ['#171329', '#211B38'] as const,
  background: '#171329',
  surface: '#211B38',
  surfaceAlt: '#30264F',
  text: '#FFF9F0',
  textSub: '#DDD3EA',
  border: 'rgba(224,213,255,0.18)',
  overlay: 'rgba(33,27,56,0.9)',
};

export function useTheme() {
  const theme = useAppStore((s) => s.theme);
  const toggleTheme = useAppStore((s) => s.toggleTheme);

  const isDark = theme === 'dark';
  const colors = isDark ? darkColors : lightColors;

  return { isDark, colors, toggleTheme, theme };
}
