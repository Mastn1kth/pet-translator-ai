import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, FONTS, RADIUS } from '../../constants/theme';

interface Button3DProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'viral' | 'gold' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  emoji?: string;
}

const GRADIENTS = {
  primary: COLORS.gradientDuo,
  secondary: COLORS.gradientSun,
  viral: ['#FF6B8A', '#FF2D55', '#D4004A'],
  gold: ['#FFE066', '#FFD700', '#B8860B'],
  ghost: ['#FFFFFF', '#F8FBFF'],
  danger: ['#F87171', '#EF4444', '#B91C1C'],
};

export const Button3D: React.FC<Button3DProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  style,
  emoji,
}) => {
  const handlePress = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onPress();
  };

  const heights = { sm: 40, md: 52, lg: 60 };
  const fontSizes = { sm: FONTS.sizes.sm, md: FONTS.sizes.md, lg: FONTS.sizes.lg };

  return (
    <TouchableOpacity
      onPress={handlePress}
      disabled={disabled}
      activeOpacity={0.85}
      style={[styles.wrapper, { opacity: disabled ? 0.5 : 1 }, style]}
    >
      <LinearGradient
        colors={GRADIENTS[variant] as any}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.btn, { height: heights[size], borderRadius: heights[size] / 2 }]}
      >
        <Text style={[styles.text, { fontSize: fontSizes[size] }]}>
          {emoji ? `${emoji} ` : ''}{title}
        </Text>
      </LinearGradient>
      <LinearGradient
        colors={['rgba(0,0,0,0.4)', 'rgba(0,0,0,0.2)']}
        style={[styles.shadow, { height: 6, borderRadius: heights[size] / 2 }]}
      />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
  },
  btn: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  text: {
    color: '#FFFFFF',
    fontWeight: FONTS.weights.bold,
    letterSpacing: 0.3,
  },
  shadow: {
    width: '96%',
    alignSelf: 'center',
    marginTop: 2,
  },
});
