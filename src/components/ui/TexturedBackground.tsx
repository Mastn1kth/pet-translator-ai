import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import Svg, { Circle, Rect, Path, Defs, Pattern } from 'react-native-svg';
import { useTheme } from '../../hooks/useTheme';

interface Props {
  children: React.ReactNode;
  style?: ViewStyle;
  variant?: 'dots' | 'grid' | 'noise' | 'waves' | 'hexagon' | 'paws' | 'confetti';
}

export function PetPatternLayer() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const pawColor = isDark ? 'rgba(155,132,255,0.16)' : 'rgba(109,74,255,0.10)';
  const catColor = isDark ? 'rgba(72,212,237,0.14)' : 'rgba(18,156,185,0.09)';
  const dogColor = isDark ? 'rgba(255,138,76,0.14)' : 'rgba(255,111,97,0.08)';

  return (
    <Svg
      pointerEvents="none"
      style={StyleSheet.absoluteFill}
      width="100%"
      height="100%"
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      <Defs>
        <Pattern id="pet-party" x="0" y="0" width="188" height="164" patternUnits="userSpaceOnUse">
          {/* След лапки */}
          <Path
            d="M24 36 C17 36 13 42 15 48 C17 55 24 58 31 54 C38 51 39 43 34 39 C31 37 28 36 24 36 Z"
            fill={pawColor}
            transform="rotate(-18 26 47)"
          />
          <Circle cx="13" cy="31" r="4.2" fill={pawColor} />
          <Circle cx="23" cy="26" r="4.4" fill={pawColor} />
          <Circle cx="34" cy="29" r="4.2" fill={pawColor} />

          {/* Мордочка котика */}
          <Path
            d="M75 48 L72 34 L84 41 C91 38 99 38 106 41 L118 34 L115 48 C119 53 119 63 114 69 C109 75 102 78 95 78 C87 78 80 75 76 69 C71 63 71 53 75 48 Z"
            fill="none"
            stroke={catColor}
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <Circle cx="87" cy="56" r="2.2" fill={catColor} />
          <Circle cx="104" cy="56" r="2.2" fill={catColor} />
          <Path
            d="M92 64 Q95 67 98 64 M95 63 L95 69 M81 63 L72 61 M81 67 L72 69 M109 63 L118 61 M109 67 L118 69"
            fill="none"
            stroke={catColor}
            strokeWidth="2.2"
            strokeLinecap="round"
          />

          {/* Мордочка собачки */}
          <Path
            d="M126 111 C126 98 135 90 148 90 C161 90 170 98 170 111 C170 125 161 134 148 134 C135 134 126 125 126 111 Z"
            fill="none"
            stroke={dogColor}
            strokeWidth="3"
          />
          <Path
            d="M130 99 C119 94 116 101 121 115 C123 121 127 120 130 115 M166 99 C177 94 180 101 175 115 C173 121 169 120 166 115"
            fill="none"
            stroke={dogColor}
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <Circle cx="140" cy="108" r="2.2" fill={dogColor} />
          <Circle cx="156" cy="108" r="2.2" fill={dogColor} />
          <Path
            d="M144 116 Q148 120 152 116 M148 119 L148 124"
            fill="none"
            stroke={dogColor}
            strokeWidth="2.2"
            strokeLinecap="round"
          />

          {/* Второй маленький след, чтобы узор шёл по диагонали */}
          <Path
            d="M54 135 C49 135 46 139 47 144 C49 149 54 151 59 148 C64 146 65 140 61 137 C59 136 57 135 54 135 Z"
            fill={pawColor}
            transform="rotate(20 55 143)"
          />
          <Circle cx="46" cy="131" r="3.1" fill={pawColor} />
          <Circle cx="54" cy="127" r="3.3" fill={pawColor} />
          <Circle cx="63" cy="130" r="3.1" fill={pawColor} />
        </Pattern>
      </Defs>
      <Rect width="100%" height="100%" fill="url(#pet-party)" />
    </Svg>
  );
}

export default function TexturedBackground({ children, style, variant = 'dots' }: Props) {
  const { theme, colors } = useTheme();
  const isDark = theme === 'dark';

  const patternColor = isDark ? 'rgba(255,255,255,0.07)' : 'rgba(29,29,31,0.05)';
  const accentColor = isDark ? 'rgba(88,204,2,0.16)' : 'rgba(88,204,2,0.16)';
  const blueColor = isDark ? 'rgba(28,176,246,0.16)' : 'rgba(28,176,246,0.14)';

  const renderPattern = () => {
    switch (variant) {
      case 'dots':
        return (
          <Svg style={StyleSheet.absoluteFill} width="100%" height="100%">
            <Defs>
              <Pattern id="dots" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
                <Circle cx="2" cy="2" r="1.5" fill={patternColor} />
              </Pattern>
            </Defs>
            <Rect width="100%" height="100%" fill="url(#dots)" />
          </Svg>
        );
      case 'grid':
        return (
          <Svg style={StyleSheet.absoluteFill} width="100%" height="100%">
            <Defs>
              <Pattern id="grid" x="0" y="0" width="24" height="24" patternUnits="userSpaceOnUse">
                <Path
                  d="M 24 0 L 0 0 0 24"
                  fill="none"
                  stroke={patternColor}
                  strokeWidth="0.8"
                />
              </Pattern>
            </Defs>
            <Rect width="100%" height="100%" fill="url(#grid)" />
          </Svg>
        );
      case 'hexagon':
        return (
          <Svg style={StyleSheet.absoluteFill} width="100%" height="100%">
            <Defs>
              <Pattern id="hex" x="0" y="0" width="28" height="32" patternUnits="userSpaceOnUse">
                <Path
                  d="M14 2 L26 9 L26 23 L14 30 L2 23 L2 9 Z"
                  fill="none"
                  stroke={patternColor}
                  strokeWidth="0.8"
                />
              </Pattern>
            </Defs>
            <Rect width="100%" height="100%" fill="url(#hex)" />
          </Svg>
        );
      case 'waves':
        return (
          <Svg style={StyleSheet.absoluteFill} width="100%" height="100%">
            <Defs>
              <Pattern id="waves" x="0" y="0" width="40" height="20" patternUnits="userSpaceOnUse">
                <Path
                  d="M0 10 Q10 0 20 10 Q30 20 40 10"
                  fill="none"
                  stroke={patternColor}
                  strokeWidth="1"
                />
              </Pattern>
            </Defs>
            <Rect width="100%" height="100%" fill="url(#waves)" />
          </Svg>
        );
      case 'noise':
        return (
          <Svg style={StyleSheet.absoluteFill} width="100%" height="100%">
            <Defs>
              <Pattern id="noise" x="0" y="0" width="32" height="32" patternUnits="userSpaceOnUse">
                <Circle cx="5" cy="6" r="1" fill={patternColor} />
                <Circle cx="18" cy="10" r="0.8" fill={blueColor} />
                <Circle cx="27" cy="24" r="1.1" fill={accentColor} />
                <Circle cx="10" cy="27" r="0.7" fill={patternColor} />
              </Pattern>
            </Defs>
            <Rect width="100%" height="100%" fill="url(#noise)" />
          </Svg>
        );
      case 'paws':
        return <PetPatternLayer />;
      case 'confetti':
        return (
          <Svg style={StyleSheet.absoluteFill} width="100%" height="100%">
            <Defs>
              <Pattern id="confetti" x="0" y="0" width="56" height="56" patternUnits="userSpaceOnUse">
                <Rect x="8" y="9" width="10" height="3" rx="1.5" fill={accentColor} transform="rotate(18 13 10.5)" />
                <Rect x="33" y="18" width="9" height="3" rx="1.5" fill={blueColor} transform="rotate(-22 37.5 19.5)" />
                <Circle cx="20" cy="40" r="2" fill="rgba(255,200,0,0.18)" />
                <Rect x="43" y="43" width="7" height="3" rx="1.5" fill="rgba(255,75,75,0.15)" transform="rotate(30 46.5 44.5)" />
              </Pattern>
            </Defs>
            <Rect width="100%" height="100%" fill="url(#confetti)" />
          </Svg>
        );
      default:
        return null;
    }
  };

  return (
    <View style={[styles.container, style, { backgroundColor: colors.background }]}>
      {renderPattern()}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
