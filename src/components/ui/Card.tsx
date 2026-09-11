import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Rect, Defs, Pattern, Circle } from 'react-native-svg';
import { useTheme } from '../../hooks/useTheme';
import { RADIUS, SHADOWS } from '../../constants/theme';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  gradient?: [string, string];
  textured?: boolean;
  variant?: 'filled' | 'outlined' | 'elevated';
}

export default function Card({
  children,
  style,
  gradient,
  textured = false,
  variant = 'elevated',
}: CardProps) {
  const { colors, theme } = useTheme();
  const isDark = theme === 'dark';
  const patternColor = isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)';

  if (gradient) {
    return (
      <LinearGradient
        colors={gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.card, style]}
      >
        {textured && (
          <Svg style={StyleSheet.absoluteFill}>
            <Defs>
              <Pattern id="cd" x="0" y="0" width="16" height="16" patternUnits="userSpaceOnUse">
                <Circle cx="2" cy="2" r="1" fill="rgba(255,255,255,0.08)" />
              </Pattern>
            </Defs>
            <Rect width="100%" height="100%" fill="url(#cd)" />
          </Svg>
        )}
        {children}
      </LinearGradient>
    );
  }

  return (
    <View
      style={[
        styles.card,
        { backgroundColor: colors.bgCard },
        variant === 'elevated' && SHADOWS.md,
        variant === 'outlined' && {
          borderWidth: 1,
          borderColor: colors.border,
        },
        style,
      ]}
    >
      {textured && (
        <Svg style={StyleSheet.absoluteFill}>
          <Defs>
            <Pattern id="ct" x="0" y="0" width="16" height="16" patternUnits="userSpaceOnUse">
              <Circle cx="2" cy="2" r="1" fill={patternColor} />
            </Pattern>
          </Defs>
          <Rect width="100%" height="100%" fill="url(#ct)" />
        </Svg>
      )}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: RADIUS.xl,
    overflow: 'hidden',
    padding: 16,
  },
});
