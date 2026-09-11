import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../hooks/useTheme';
import { RADIUS, FONTS, SPACING } from '../../constants/theme';

interface IntensityBarProps {
  value: number;
  label?: string;
  showValue?: boolean;
}

export default function IntensityBar({ value, label = 'Интенсивность', showValue = true }: IntensityBarProps) {
  const { colors } = useTheme();
  const animWidth = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(animWidth, {
      toValue: value,
      tension: 60,
      friction: 8,
      useNativeDriver: false,
    }).start();
  }, [value]);

  const getColors = (): [string, string] => {
    if (value < 30) return ['#4ECDC4', '#26A69A'];
    if (value < 60) return ['#FFC800', '#FF8C00'];
    if (value < 80) return ['#FF6B35', '#E55A26'];
    return ['#FF4B4B', '#CC0000'];
  };

  const widthPercent = animWidth.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%'],
  });

  return (
    <View style={styles.container}>
      <View style={styles.labelRow}>
        <Text style={[styles.label, { color: colors.textSecondary }]}>{label}</Text>
        {showValue && (
          <Text style={[styles.value, { color: colors.text }]}>{value}%</Text>
        )}
      </View>
      <View style={[styles.track, { backgroundColor: colors.border }]}>
        <Animated.View style={[styles.fillContainer, { width: widthPercent }]}>
          <LinearGradient
            colors={getColors()}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.fill}
          />
        </Animated.View>
        {/* Texture marks */}
        {[25, 50, 75].map((mark) => (
          <View
            key={mark}
            style={[styles.mark, { left: `${mark}%` as any }]}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: SPACING.xs,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    fontSize: FONTS.sizes.sm,
    fontWeight: FONTS.weights.medium,
  },
  value: {
    fontSize: FONTS.sizes.sm,
    fontWeight: FONTS.weights.bold,
  },
  track: {
    height: 12,
    borderRadius: RADIUS.full,
    overflow: 'hidden',
    position: 'relative',
  },
  fillContainer: {
    height: '100%',
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: RADIUS.full,
  },
  mark: {
    position: 'absolute',
    top: 2,
    bottom: 2,
    width: 1,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
});