import React, { useEffect, useMemo, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { COLORS } from '../../constants/theme';

interface WaveformVisualizerProps {
  isActive: boolean;
  levels?: number[];
  barCount?: number;
  color?: string;
}

function clamp(value: number, min = 0, max = 1): number {
  return Math.max(min, Math.min(max, value));
}

function fitLevelsToBars(levels: number[] | undefined, barCount: number): number[] {
  if (!levels?.length) {
    return Array.from({ length: barCount }, () => 0.08);
  }

  if (levels.length === barCount) {
    return levels.map((level) => clamp(level));
  }

  const bucketSize = levels.length / barCount;
  return Array.from({ length: barCount }, (_, index) => {
    const start = Math.floor(index * bucketSize);
    const end = Math.max(start + 1, Math.ceil((index + 1) * bucketSize));
    const bucket = levels.slice(start, end);
    const peak = bucket.length ? Math.max(...bucket) : 0.08;
    return clamp(peak);
  });
}

export const WaveformVisualizer: React.FC<WaveformVisualizerProps> = ({
  isActive,
  levels,
  barCount = 20,
  color = COLORS.primary,
}) => {
  const animationsRef = useRef<Animated.Value[]>([]);
  if (animationsRef.current.length !== barCount) {
    animationsRef.current = Array.from(
      { length: barCount },
      (_, index) => animationsRef.current[index] || new Animated.Value(0.08)
    );
  }

  const animations = animationsRef.current;
  const fittedLevels = useMemo(() => fitLevelsToBars(levels, barCount), [levels, barCount]);

  useEffect(() => {
    const nextLevels = isActive ? fittedLevels : Array.from({ length: barCount }, () => 0.08);
    const timings = animations.map((anim, index) =>
      Animated.timing(anim, {
        toValue: nextLevels[index] ?? 0.08,
        duration: 90,
        useNativeDriver: false,
      })
    );

    Animated.parallel(timings).start();
  }, [animations, barCount, fittedLevels, isActive]);

  return (
    <View style={styles.track}>
      <View style={styles.baseline} />
      <View style={styles.container}>
        {animations.map((anim, i) => (
          <Animated.View
            key={i}
            style={[
              styles.bar,
              {
                backgroundColor: color,
                height: anim.interpolate({ inputRange: [0, 1], outputRange: [4, 52] }),
                opacity: anim.interpolate({ inputRange: [0, 1], outputRange: [0.35, 1] }),
              },
            ]}
          />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  track: {
    width: '100%',
    maxWidth: 360,
    height: 68,
    borderRadius: 16,
    backgroundColor: 'rgba(88, 204, 2, 0.1)',
    overflow: 'hidden',
    justifyContent: 'center',
    paddingHorizontal: 10,
  },
  baseline: {
    position: 'absolute',
    left: 12,
    right: 12,
    top: 33,
    height: 2,
    borderRadius: 1,
    backgroundColor: 'rgba(88, 204, 2, 0.18)',
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 56,
    gap: 3,
    paddingHorizontal: 8,
  },
  bar: {
    flex: 1,
    borderRadius: 4,
    minHeight: 4,
  },
});
