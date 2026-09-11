import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, FONTS, RADIUS } from '../../constants/theme';

interface MoodBadgeProps {
  mood: string;
  emoji: string;
  intensity?: number;
}

export const MoodBadge: React.FC<MoodBadgeProps> = ({ mood, emoji, intensity = 0.5 }) => {
  const color = intensity > 0.8 ? COLORS.danger : intensity > 0.5 ? COLORS.warning : COLORS.accent;
  return (
    <View style={[styles.badge, { borderColor: color, backgroundColor: `${color}22` }]}>
      <Text style={styles.emoji}>{emoji}</Text>
      <Text style={[styles.text, { color }]}>{mood}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    gap: 6,
  },
  emoji: { fontSize: 16 },
  text: { fontSize: FONTS.sizes.sm, fontWeight: FONTS.weights.bold },
});